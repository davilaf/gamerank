import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { StoreSettings } from '../types';
import { formatCurrency } from '../utils/currency';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  CreditCard, 
  Calendar, 
  Award, 
  PieChart,
  ArrowUpRight,
  Receipt,
  Percent
} from 'lucide-react';

interface DashboardPageProps {
  store: StoreSettings;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ store }) => {
  const orders = useLiveQuery(() => db.orders.toArray(), []) || [];
  const orderItems = useLiveQuery(() => db.orderItems.toArray(), []) || [];
  const cashMovements = useLiveQuery(() => db.cashMovements.toArray(), []) || [];
  const products = useLiveQuery(() => db.products.toArray(), []) || [];
  const variants = useLiveQuery(() => db.variants.toArray(), []) || [];

  // Cálculos de métricas globales
  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const prodMap = new Map<string, any>();
    products.forEach((p) => prodMap.set(p.id, p));

    const varMap = new Map<string, any>();
    variants.forEach((v) => varMap.set(v.id, v));

    // Ventas de hoy
    const todayOrders = orders.filter((o) => o.createdAt.startsWith(todayStr));
    const todaySales = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Ventas totales
    const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrdersCount = orders.length;
    const averageTicket = totalOrdersCount > 0 ? totalSales / totalOrdersCount : 0;

    // Costo de productos vendidos (COGS)
    // Busca primero en el item de la orden, si no en la variante o en el producto base
    const totalCostOfGoods = orderItems.reduce((sum, item) => {
      const itemCost = Number(
        item.costPrice ||
        item.unitCost ||
        (item.variantId ? varMap.get(item.variantId)?.costPrice : undefined) ||
        (item.productId ? prodMap.get(item.productId)?.costPrice : undefined) ||
        0
      );
      return sum + itemCost * (item.quantity || 1);
    }, 0);

    // Total de gastos operativos registrados en Caja (fijos, variables y retiros)
    const totalFixedExpenses = cashMovements
      .filter((m) => m.type === 'expense_fixed')
      .reduce((sum, m) => sum + m.amount, 0);

    const totalVariableExpenses = cashMovements
      .filter((m) => m.type === 'expense_variable')
      .reduce((sum, m) => sum + m.amount, 0);

    const totalCashOut = cashMovements
      .filter((m) => m.type === 'cash_out')
      .reduce((sum, m) => sum + m.amount, 0);

    const totalExpenses = totalFixedExpenses + totalVariableExpenses + totalCashOut;

    // Entradas de dinero a caja (aportes de capital / apertura)
    const totalInflows = cashMovements
      .filter((m) => m.type === 'cash_in')
      .reduce((sum, m) => sum + m.amount, 0);

    // Cobros POS registrados en caja
    const totalSalesIncomeCash = cashMovements
      .filter((m) => m.type === 'sale_income')
      .reduce((sum, m) => sum + m.amount, 0);

    // Saldo neto real en caja
    const netCashBalance = (totalInflows + totalSalesIncomeCash) - totalExpenses;

    // Ganancia Neta = Ventas Totales - Costo Mercancía - Gastos de Caja
    const netProfit = totalSales - totalCostOfGoods - totalExpenses;
    const netMarginPercent = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

    // Métodos de pago
    const paymentBreakdown: Record<string, { count: number; total: number }> = {
      cash: { count: 0, total: 0 },
      card: { count: 0, total: 0 },
      transfer: { count: 0, total: 0 },
      credit: { count: 0, total: 0 }
    };

    orders.forEach((o) => {
      const method = o.paymentMethod || 'cash';
      if (!paymentBreakdown[method]) {
        paymentBreakdown[method] = { count: 0, total: 0 };
      }
      paymentBreakdown[method].count += 1;
      paymentBreakdown[method].total += o.totalAmount;
    });

    // Top 5 Productos más vendidos
    const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};

    orderItems.forEach((item) => {
      const key = item.productId;
      if (!productSalesMap[key]) {
        productSalesMap[key] = {
          name: item.productName,
          quantity: 0,
          revenue: 0
        };
      }
      productSalesMap[key].quantity += (item.quantity || 1);
      productSalesMap[key].revenue += Number(item.totalPrice || (item.unitPrice * (item.quantity || 1)) || 0);
    });

    const top5Products = Object.values(productSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const maxTopProductQty = top5Products.length > 0 ? top5Products[0].quantity : 1;

    return {
      todaySales,
      todayOrdersCount: todayOrders.length,
      totalSales,
      totalOrdersCount,
      averageTicket,
      totalCostOfGoods,
      totalExpenses,
      totalFixedExpenses,
      totalVariableExpenses,
      totalCashOut,
      netCashBalance,
      netProfit,
      netMarginPercent,
      paymentBreakdown,
      top5Products,
      maxTopProductQty
    };
  }, [orders, orderItems, cashMovements]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 pb-24 md:pb-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-indigo-600" />
          <span>Dashboard & Métricas Financieras</span>
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Resumen de ventas en tiempo real, rentabilidad y productos estrella
        </p>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Ventas Hoy */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold mb-1">
            <span>Ventas de Hoy</span>
            <Calendar className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 truncate">
            {formatCurrency(stats.todaySales, store.currency)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            {stats.todayOrdersCount} {stats.todayOrdersCount === 1 ? 'ticket' : 'tickets'} hoy
          </div>
        </div>

        {/* Ventas Totales */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold mb-1">
            <span>Ventas Totales</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 truncate">
            {formatCurrency(stats.totalSales, store.currency)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">{stats.totalOrdersCount} órdenes acumuladas</div>
        </div>

        {/* Ganancia Neta */}
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 p-4 rounded-2xl text-white shadow-md">
          <div className="flex items-center justify-between text-indigo-200 text-xs font-semibold mb-1">
            <span>Ganancia Neta Real</span>
            <Award className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-2xl font-black truncate text-amber-300">
            {formatCurrency(stats.netProfit, store.currency)}
          </div>
          <div className="text-[11px] text-indigo-200 mt-1">
            Margen neto: {stats.netMarginPercent.toFixed(1)}%
          </div>
        </div>

        {/* Ticket Promedio */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold mb-1">
            <span>Ticket Promedio</span>
            <Receipt className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 truncate">
            {formatCurrency(stats.averageTicket, store.currency)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">Por cada transacción</div>
        </div>

      </div>

      {/* Grid: Financial Breakdown & Top 5 Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top 5 Best Selling Products */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Top 5 Productos Más Vendidos</span>
            </h3>
            <span className="text-xs text-gray-400">Por unidades vendidas</span>
          </div>

          {stats.top5Products.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              Aún no hay ventas registradas para generar el ranking.
            </div>
          ) : (
            <div className="space-y-3.5">
              {stats.top5Products.map((p, idx) => {
                const percent = Math.round((p.quantity / stats.maxTopProductQty) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          idx === 0 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-gray-900">{p.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-indigo-600">
                          {formatCurrency(p.revenue, store.currency)}
                        </span>
                        <span className="text-gray-400 text-[11px]">({p.quantity} uds)</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Profit & Loss Waterfall Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-4">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-600" />
            <span>Desglose de Rentabilidad (Ventas vs Costos)</span>
          </h3>

          <div className="space-y-3 pt-1 text-sm">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="font-semibold text-emerald-900">(+) Ventas Brutas Totales</span>
              <span className="font-extrabold text-emerald-700">
                {formatCurrency(stats.totalSales, store.currency)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-rose-50 rounded-xl border border-rose-100">
              <div>
                <span className="font-semibold text-rose-900 block">(-) Costo de Mercancía Vendida (COGS)</span>
                {stats.totalCostOfGoods === 0 && (
                  <span className="text-[10px] text-rose-500 font-medium">Asigna el costo de tus juegos en la pestaña Inventario</span>
                )}
              </div>
              <span className="font-extrabold text-rose-700">
                -{formatCurrency(stats.totalCostOfGoods, store.currency)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
              <span className="font-semibold text-amber-900">(-) Gastos Operativos & Retiros</span>
              <span className="font-extrabold text-amber-800">
                -{formatCurrency(stats.totalExpenses, store.currency)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-gray-900 text-white rounded-xl shadow-xs">
              <div>
                <div className="font-black text-base">(=) Ganancia Neta Final</div>
                <div className="text-[11px] text-gray-400">Ventas - Costos - Gastos</div>
              </div>
              <span className="font-black text-xl text-amber-300">
                {formatCurrency(stats.netProfit, store.currency)}
              </span>
            </div>
          </div>

          {/* Payment Methods Distribution */}
          <div className="pt-2 border-t border-gray-100">
            <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Distribución por Método de Pago
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(stats.paymentBreakdown).map(([method, data]) => (
                <div key={method} className="bg-gray-50 p-2.5 rounded-xl border border-gray-200/70 text-center">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">{method}</span>
                  <div className="font-bold text-gray-900 text-xs mt-0.5">
                    {formatCurrency(data.total, store.currency)}
                  </div>
                  <span className="text-[10px] text-gray-400">{data.count} ventas</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
