import React from 'react';
import { CartItem, DiscountType } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Percent, 
  User, 
  ArrowRight, 
  X,
  Tag
} from 'lucide-react';

interface CartDrawerProps {
  items: CartItem[];
  subtotal: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  totalItemsCount: number;
  currency: string;
  customer: { name: string; phone?: string };
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onOpenDiscountModal: () => void;
  onOpenQuickPay: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  items,
  subtotal,
  discountType,
  discountValue,
  discountAmount,
  taxRate,
  taxAmount,
  totalAmount,
  totalItemsCount,
  currency,
  customer,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenDiscountModal,
  onOpenQuickPay,
  isMobileOpen,
  onCloseMobile
}) => {
  const content = (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-base leading-tight">Ticket Actual</h2>
            <p className="text-xs text-gray-500">{totalItemsCount} {totalItemsCount === 1 ? 'artículo' : 'artículos'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {items.length > 0 && (
            <button
              onClick={onClearCart}
              className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Vaciar Carrito"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-2 text-gray-400 hover:text-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-300 flex items-center justify-center mb-3">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <p className="font-semibold text-gray-700 text-sm">El carrito está vacío</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              Toca o haz clic en cualquier producto del catálogo para agregarlo a la venta.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-white p-3 rounded-xl border border-gray-200/80 shadow-2xs hover:border-gray-300 transition-all flex flex-col justify-between space-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-2">
                  <h4 className="font-bold text-gray-900 text-xs leading-snug">{item.productName}</h4>
                  {item.variantName && (
                    <span className="inline-block text-[11px] font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded mt-0.5">
                      {item.variantName}
                    </span>
                  )}
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {formatCurrency(item.unitPrice, currency)} c/u
                  </div>
                </div>

                <div className="text-right font-extrabold text-sm text-gray-900">
                  {formatCurrency(item.unitPrice * item.quantity, currency)}
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                <div className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg p-0.5">
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    className="w-6 h-6 rounded flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-2xs active:bg-gray-200"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-gray-800 w-5 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    className="w-6 h-6 rounded flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-2xs active:bg-gray-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="text-gray-400 hover:text-rose-600 text-xs p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Cart Summary & Actions */}
      {items.length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
          
          {/* Quick buttons: Discount & Customer */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenDiscountModal}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                discountAmount > 0
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Percent className="w-3.5 h-3.5 text-amber-600" />
              <span>
                {discountAmount > 0
                  ? `Desc: -${formatCurrency(discountAmount, currency)}`
                  : 'Descuento'}
              </span>
            </button>

            {customer.name && (
              <div className="flex items-center space-x-1 px-2.5 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-medium border border-indigo-200 truncate max-w-[130px]">
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{customer.name}</span>
              </div>
            )}
          </div>

          {/* Breakdown calculation */}
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(subtotal, currency)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-amber-700 font-medium">
                <span>Descuento {discountType === 'percentage' ? `(${discountValue}%)` : ''}:</span>
                <span>-{formatCurrency(discountAmount, currency)}</span>
              </div>
            )}

            {taxAmount > 0 && (
              <div className="flex justify-between">
                <span>Impuesto ({taxRate}%):</span>
                <span className="font-semibold text-gray-900">+{formatCurrency(taxAmount, currency)}</span>
              </div>
            )}

            <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-200">
              <span>Total a pagar:</span>
              <span className="text-indigo-600 text-lg">{formatCurrency(totalAmount, currency)}</span>
            </div>
          </div>

          {/* Primary Checkout Button */}
          <button
            onClick={onOpenQuickPay}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-between transition-all active:scale-[0.99]"
          >
            <div className="text-left">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-100">Cobrar</div>
              <div className="text-base font-black">{formatCurrency(totalAmount, currency)}</div>
            </div>
            <div className="flex items-center space-x-1 font-bold text-sm bg-white/20 px-3 py-1 rounded-xl">
              <span>Pagar</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

        </div>
      )}

    </div>
  );

  // Desktop inline view
  return (
    <>
      <div className="hidden md:block w-80 lg:w-96 h-full shrink-0">
        {content}
      </div>

      {/* Mobile Drawer view */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-sm h-full bg-white animate-in slide-in-from-right duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
