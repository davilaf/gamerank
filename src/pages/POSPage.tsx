import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { syncService } from '../db/syncService';
import { Product, ProductVariant, Order, OrderItem, PaymentMethod, StoreSettings } from '../types';
import { usePOSCart } from '../hooks/usePOSCart';
import { ProductGrid } from '../components/pos/ProductGrid';
import { CartDrawer } from '../components/pos/CartDrawer';
import { VariantPickerModal } from '../components/pos/VariantPickerModal';
import { DiscountModal } from '../components/pos/DiscountModal';
import { QuickPayModal } from '../components/pos/QuickPayModal';
import { ReceiptSuccessModal } from '../components/receipts/ReceiptSuccessModal';
import { ShoppingBag } from 'lucide-react';

interface POSPageProps {
  store: StoreSettings;
}

export const POSPage: React.FC<POSPageProps> = ({ store }) => {
  // Queries reactivas desde IndexedDB
  const products = useLiveQuery(async () => {
    const prods = await db.products.toArray();
    // Cargar variantes asociadas
    const withVariants = await Promise.all(
      prods.map(async (p) => {
        if (p.hasVariants) {
          const variants = await db.variants.where('productId').equals(p.id).toArray();
          return { ...p, variants };
        }
        return p;
      })
    );
    return withVariants;
  }, []) || [];

  const categories = useLiveQuery(() => db.categories.toArray(), []) || [];

  // Hook del carrito de venta
  const cart = usePOSCart(store.taxRate);

  // Estados de modales
  const [selectedProductForVariants, setSelectedProductForVariants] = useState<Product | null>(null);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isQuickPayModalOpen, setIsQuickPayModalOpen] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Manejo de clic en producto
  const handleSelectProduct = (product: Product, variant?: ProductVariant) => {
    if (product.hasVariants && !variant) {
      setSelectedProductForVariants(product);
    } else {
      cart.addItem(product, variant);
    }
  };

  // Finalizar venta de forma atómica y offline-first
  const handleCompleteSale = async (
    paymentMethod: PaymentMethod,
    amountReceived: number,
    changeAmount: number,
    customerData: { name: string; phone: string },
    notes: string
  ) => {
    try {
      const orderCount = (await db.orders.count()) + 1;
      const orderNumber = `#${orderCount.toString().padStart(4, '0')}`;
      const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const createdAt = new Date().toISOString();

      // Construir items de la orden
      const orderItems: OrderItem[] = cart.items.map((item) => {
        const itemSubtotal = item.unitPrice * item.quantity;
        return {
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          orderId,
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          variantName: item.variantName,
          unitPrice: item.unitPrice,
          unitCost: item.unitCost,
          quantity: item.quantity,
          subtotal: itemSubtotal,
          discountAmount: 0,
          total: itemSubtotal
        };
      });

      const order: Order = {
        id: orderId,
        orderNumber,
        storeId: store.id,
        customerName: customerData.name || cart.customer.name || undefined,
        customerPhone: customerData.phone || cart.customer.phone || undefined,
        subtotal: cart.subtotal,
        discountType: cart.discountType,
        discountValue: cart.discountValue,
        discountAmount: cart.discountAmount,
        taxRate: store.taxRate,
        taxAmount: cart.taxAmount,
        totalAmount: cart.totalAmount,
        paymentMethod,
        paymentStatus: 'paid',
        amountReceived,
        changeAmount,
        items: orderItems,
        notes: notes || cart.notes || undefined,
        createdAt,
        syncStatus: 'pending'
      };

      // Procesar venta en IndexedDB y descontar inventario
      await syncService.processSaleOffline(order, orderItems);

      // Limpiar carrito y mostrar modal de éxito
      cart.clearCart();
      setIsQuickPayModalOpen(false);
      setIsMobileCartOpen(false);
      setCompletedOrder(order);
    } catch (error) {
      console.error('Error al procesar la venta:', error);
      alert('Ocurrió un error al registrar la venta. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden bg-gray-100">
      
      {/* Main Column: Products Catalog & Search */}
      <div className="flex-1 flex flex-col p-3 sm:p-4 overflow-hidden">
        <ProductGrid
          products={products}
          categories={categories}
          currency={store.currency}
          onSelectProduct={handleSelectProduct}
        />
      </div>

      {/* Cart Sidebar (Desktop) / Sliding Sheet (Mobile) */}
      <CartDrawer
        items={cart.items}
        subtotal={cart.subtotal}
        discountType={cart.discountType}
        discountValue={cart.discountValue}
        discountAmount={cart.discountAmount}
        taxRate={store.taxRate}
        taxAmount={cart.taxAmount}
        totalAmount={cart.totalAmount}
        totalItemsCount={cart.totalItemsCount}
        currency={store.currency}
        customer={cart.customer}
        onUpdateQuantity={cart.updateQuantity}
        onRemoveItem={cart.removeItem}
        onClearCart={cart.clearCart}
        onOpenDiscountModal={() => setIsDiscountModalOpen(true)}
        onOpenQuickPay={() => setIsQuickPayModalOpen(true)}
        isMobileOpen={isMobileCartOpen}
        onCloseMobile={() => setIsMobileCartOpen(false)}
      />

      {/* Floating Action Button on Mobile to view cart when items > 0 */}
      {cart.totalItemsCount > 0 && !isMobileCartOpen && (
        <div className="md:hidden fixed bottom-20 right-4 z-20">
          <button
            onClick={() => setIsMobileCartOpen(true)}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3.5 rounded-full shadow-xl shadow-indigo-300 active:scale-95 transition-all"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cart.totalItemsCount}
              </span>
            </div>
            <span className="text-sm font-extrabold">{cart.totalAmount > 0 ? `${store.currency}${cart.totalAmount.toFixed(2)}` : 'Ver Ticket'}</span>
          </button>
        </div>
      )}

      {/* Modal: Selector de Variantes */}
      {selectedProductForVariants && (
        <VariantPickerModal
          product={selectedProductForVariants}
          currency={store.currency}
          onSelectVariant={handleSelectProduct}
          onClose={() => setSelectedProductForVariants(null)}
        />
      )}

      {/* Modal: Descuento */}
      {isDiscountModalOpen && (
        <DiscountModal
          subtotal={cart.subtotal}
          currentType={cart.discountType}
          currentValue={cart.discountValue}
          currency={store.currency}
          onApply={cart.setDiscount}
          onClose={() => setIsDiscountModalOpen(false)}
        />
      )}

      {/* Modal: Cobro Rápido */}
      {isQuickPayModalOpen && (
        <QuickPayModal
          totalAmount={cart.totalAmount}
          currency={store.currency}
          defaultCustomer={cart.customer}
          notes={cart.notes}
          onCompleteSale={handleCompleteSale}
          onClose={() => setIsQuickPayModalOpen(false)}
        />
      )}

      {/* Modal: Venta Exitosa y Generación de Ticket Térmico / WhatsApp */}
      {completedOrder && (
        <ReceiptSuccessModal
          order={completedOrder}
          store={store}
          onNewSale={() => setCompletedOrder(null)}
          onClose={() => setCompletedOrder(null)}
        />
      )}

    </div>
  );
};
