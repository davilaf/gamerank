import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { syncService } from '../db/syncService';
import { getSupabaseClient } from '../db/supabaseClient';
import { Order, StoreSettings } from '../types';
import { formatCurrency } from '../utils/currency';
import { ReceiptSuccessModal } from '../components/receipts/ReceiptSuccessModal';
import { 
  History, 
  Search, 
  Printer, 
  Share2, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  DollarSign, 
  CreditCard,
  Banknote,
  ArrowRightLeft,
  FileText,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface SalesHistoryPageProps {
  store: StoreSettings;
}

export const SalesHistoryPage: React.FC<SalesHistoryPageProps> = ({ store }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);

  // Cargar órdenes ordenadas por fecha descendente con sus items
  const orders = useLiveQuery(async () => {
    const list = await db.orders.orderBy('createdAt').reverse().toArray();
    return await Promise.all(
      list.map(async (ord) => {
        const items = await db.orderItems.where('orderId').equals(ord.id).toArray();
        return {
          ...ord,
          items: items || []
        };
      })
    );
  }, []) || [];

  const filteredOrders = orders.filter((o) => {
    const matchesPayment = paymentFilter === 'all' || o.paymentMethod === paymentFilter;
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (o.orderNumber && o.orderNumber.toLowerCase().includes(query)) ||
      (o.customerName && o.customerName.toLowerCase().includes(query)) ||
      (o.customerPhone && o.customerPhone.includes(query)) ||
      (o.items && o.items.some((i) => i.productName && i.productName.toLowerCase().includes(query)));

    return matchesPayment && matchesSearch;
  });

  const totalSalesRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Anular y eliminar venta con reversión inmediata de inventario y caja
  const handleDeleteOrder = async (order: Order) => {
    const confirmMsg = confirm(
      `¿Deseas anular y eliminar la orden ${order.orderNumber} por ${formatCurrency(order.totalAmount, store.currency)}?\n\n` +
      `• Se eliminará del Historial y de las Métricas.\n` +
      `• Se eliminará el ingreso de Caja y Gastos.\n` +
      `• El stock de los productos vendidos se devolverá al inventario automáticamente.`
    );
    if (!confirmMsg) return;

    try {
      const supabase = getSupabaseClient();

      // 1. Obtener los items de la orden (con múltiples capas de respaldo)
      let items: any[] = order.items && order.items.length > 0 ? order.items : [];
      if (items.length === 0) {
        items = await db.orderItems.where('orderId').equals(order.id).toArray();
      }
      if (items.length === 0) {
        const allItms = await db.orderItems.toArray();
        items = allItms.filter((it) => it.orderId === order.id);
      }
      if (items.length === 0 && supabase && navigator.onLine) {
        const { data: cloudItms } = await supabase.from('order_items').select('*').eq('order_id', order.id);
        if (cloudItms && cloudItms.length > 0) {
          items = cloudItms.map((ci) => ({
            id: ci.id,
            orderId: ci.order_id,
            productId: ci.product_id,
            variantId: ci.variant_id,
            productName: ci.product_name,
            quantity: Number(ci.quantity || 1),
            unitPrice: Number(ci.unit_price || 0),
            totalPrice: Number(ci.total_price || 0),
            costPrice: Number(ci.cost_price || 0)
          }));
        }
      }

      // 2. Restaurar stock de cada producto y variante en Dexie y en Supabase
      for (const item of items) {
        const qty = Number(item.quantity || 1);

        if (item.variantId) {
          const v = await db.variants.get(item.variantId);
          if (v) {
            const restoredVarStock = Number(v.stockQuantity || 0) + qty;
            await db.variants.update(item.variantId, { stockQuantity: restoredVarStock });
            if (supabase && navigator.onLine) {
              await supabase.from('variants').update({ stock_quantity: restoredVarStock }).eq('id', item.variantId);
            }
            await syncService.enqueueMutation('variants', 'UPDATE', item.variantId, { stockQuantity: restoredVarStock });
          }
        }

        const p = await db.products.get(item.productId);
        if (p && p.trackStock) {
          const restoredStock = Number(p.stockQuantity || 0) + qty;
          await db.products.update(item.productId, {
            stockQuantity: restoredStock,
            updatedAt: new Date().toISOString()
          });
          if (supabase && navigator.onLine) {
            await supabase.from('products').update({
              stock_quantity: restoredStock,
              updated_at: new Date().toISOString()
            }).eq('id', item.productId);
          }
          await syncService.enqueueMutation('products', 'UPDATE', item.productId, { stockQuantity: restoredStock });
        }
      }

      // 3. Eliminar movimientos de caja vinculados de forma segura
      const allCash = await db.cashMovements.toArray();
      const linkedCash = allCash.filter(
        (cm) => cm.referenceOrderId === order.id || cm.id === `cash-sale-${order.id}`
      );
      for (const cm of linkedCash) {
        await db.cashMovements.delete(cm.id);
        await syncService.enqueueMutation('cash_movements', 'DELETE', cm.id, { id: cm.id });
      }

      // 4. Eliminar items de la orden
      const allItems = await db.orderItems.toArray();
      const linkedItems = allItems.filter((it) => it.orderId === order.id);
      for (const it of linkedItems) {
        await db.orderItems.delete(it.id);
      }

      // 5. Eliminar la orden
      await db.orders.delete(order.id);
      await syncService.enqueueMutation('orders', 'DELETE', order.id, { id: order.id });

      // 6. Supabase eliminación directa
      if (supabase && navigator.onLine) {
        await supabase.from('order_items').delete().eq('order_id', order.id);
        await supabase.from('orders').delete().eq('id', order.id);
        await supabase.from('cash_movements').delete().eq('reference_order_id', order.id);
        await supabase.from('cash_movements').delete().eq('id', `cash-sale-${order.id}`);
        syncService.processQueue();
      }

      alert(`¡Orden ${order.orderNumber} anulada con éxito! El inventario ha sido restaurado.`);
    } catch (err: any) {
      console.error('Error al anular orden:', err);
      alert(`Error al anular orden: ${err?.message || 'Error desconocido'}`);
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash': return <Banknote className="w-3.5 h-3.5 text-emerald-600" />;
      case 'card': return <CreditCard className="w-3.5 h-3.5 text-blue-600" />;
      case 'transfer': return <ArrowRightLeft className="w-3.5 h-3.5 text-purple-600" />;
      default: return <FileText className="w-3.5 h-3.5 text-gray-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 pb-24 md:pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <History className="w-7 h-7 text-indigo-600" />
            <span>Historial de Ventas</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Consulta órdenes, reimprime recibos térmicos y reenvía por WhatsApp
          </p>
        </div>

        <div className="bg-white px-4 py-2 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="text-xs text-gray-500">Ventas Registradas:</div>
          <div className="font-extrabold text-base text-gray-900">{orders.length} órdenes</div>
          <div className="w-px h-6 bg-gray-200"></div>
          <div className="font-black text-base text-emerald-600">
            {formatCurrency(totalSalesRevenue, store.currency)}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por folio (#0001), cliente o producto..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-700 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
        >
          <option value="all">Todos los Métodos de Pago</option>
          <option value="cash">Efectivo</option>
          <option value="card">Tarjeta</option>
          <option value="transfer">Transferencia</option>
          <option value="credit">A Crédito</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Folio / Fecha</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Artículos</th>
                <th className="py-3.5 px-4">Pago</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Sincronización</th>
                <th className="py-3.5 px-4 text-right">Recibo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No se encontraron órdenes registradas.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const dateFormatted = new Date(order.createdAt).toLocaleString('es-MX', {
                    dateStyle: 'short',
                    timeStyle: 'short'
                  });

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
                      
                      {/* Folio & Date */}
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-indigo-700 text-sm">
                          {order.orderNumber}
                        </div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{dateFormatted}</span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900">
                          {order.customerName || 'Venta de Mostrador'}
                        </div>
                        {order.customerPhone && (
                          <div className="text-[11px] text-gray-400">{order.customerPhone}</div>
                        )}
                      </td>

                      {/* Items preview */}
                      <td className="py-3 px-4">
                        <div className="text-gray-700 max-w-xs truncate">
                          {(order.items || []).map((it) => `${it.quantity}x ${it.productName}`).join(', ') || 'Sin productos'}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {(order.items || []).reduce((s, i) => s + (i.quantity || 1), 0)} piezas
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-800 uppercase">
                          {getPaymentIcon(order.paymentMethod)}
                          {order.paymentMethod}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="py-3 px-4 font-black text-gray-900 text-sm">
                        {formatCurrency(order.totalAmount, store.currency)}
                      </td>

                      {/* Sync Status */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          order.syncStatus === 'synced'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          <CheckCircle2 className="w-3 h-3" />
                          {order.syncStatus === 'synced' ? 'Sincronizado' : 'Pendiente'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setSelectedOrderForReceipt(order)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors"
                            title="Ver o reimprimir ticket"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Ver Ticket</span>
                          </button>

                          <button
                            onClick={() => handleDeleteOrder(order)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors border border-rose-200"
                            title="Anular y eliminar venta"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span className="hidden sm:inline">Anular</span>
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Modal */}
      {selectedOrderForReceipt && (
        <ReceiptSuccessModal
          order={selectedOrderForReceipt}
          store={store}
          onNewSale={() => setSelectedOrderForReceipt(null)}
          onClose={() => setSelectedOrderForReceipt(null)}
        />
      )}

    </div>
  );
};
