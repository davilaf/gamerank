import React from 'react';
import { Product, ProductVariant } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { X, Layers } from 'lucide-react';

interface VariantPickerModalProps {
  product: Product | null;
  currency: string;
  onSelectVariant: (product: Product, variant: ProductVariant) => void;
  onClose: () => void;
}

export const VariantPickerModal: React.FC<VariantPickerModalProps> = ({
  product,
  currency,
  onSelectVariant,
  onClose
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center space-x-3">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-12 h-12 rounded-xl object-cover border border-gray-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-gray-900 leading-tight">{product.name}</h3>
              <p className="text-xs text-gray-500">Selecciona una variante o atributo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Variants List */}
        <div className="p-4 max-h-80 overflow-y-auto space-y-2.5">
          {product.variants && product.variants.length > 0 ? (
            product.variants.map((variant) => {
              const isOutOfStock = product.trackStock && variant.stockQuantity <= 0;
              return (
                <button
                  key={variant.id}
                  disabled={isOutOfStock}
                  onClick={() => {
                    onSelectVariant(product, variant);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                    isOutOfStock
                      ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                      : 'border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/40 hover:shadow-xs active:scale-[0.99]'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{variant.name}</div>
                    {variant.sku && (
                      <div className="text-[11px] text-gray-400">SKU: {variant.sku}</div>
                    )}
                    {product.trackStock && (
                      <div
                        className={`text-xs mt-0.5 font-medium ${
                          isOutOfStock
                            ? 'text-rose-600'
                            : variant.stockQuantity <= 5
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {isOutOfStock ? 'Agotado' : `${variant.stockQuantity} disponibles`}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-base text-indigo-600">
                      {formatCurrency(variant.price, currency)}
                    </span>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-center py-6 text-sm text-gray-500">
              No hay variantes configuradas para este producto.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
};
