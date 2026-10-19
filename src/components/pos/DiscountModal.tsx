import React, { useState } from 'react';
import { DiscountType } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { Percent, DollarSign, X, Check } from 'lucide-react';

interface DiscountModalProps {
  subtotal: number;
  currentType: DiscountType;
  currentValue: number;
  currency: string;
  onApply: (type: DiscountType, value: number) => void;
  onClose: () => void;
}

export const DiscountModal: React.FC<DiscountModalProps> = ({
  subtotal,
  currentType,
  currentValue,
  currency,
  onApply,
  onClose
}) => {
  const [type, setType] = useState<DiscountType>(currentType === 'none' ? 'percentage' : currentType);
  const [val, setVal] = useState<string>(currentValue > 0 ? currentValue.toString() : '');

  const numVal = parseFloat(val) || 0;

  const calculatedDiscount =
    type === 'percentage'
      ? (subtotal * numVal) / 100
      : Math.min(subtotal, numVal);

  const percentagePresets = [5, 10, 15, 20, 50];
  const fixedPresets = [5, 10, 20, 50, 100];

  const handleSave = () => {
    if (numVal <= 0) {
      onApply('none', 0);
    } else {
      onApply(type, numVal);
    }
    onClose();
  };

  const handleClear = () => {
    onApply('none', 0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Aplicar Descuento</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Discount Type Selector */}
          <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setType('percentage')}
              className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'percentage'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              <span>Porcentaje (%)</span>
            </button>

            <button
              onClick={() => setType('fixed')}
              className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'fixed'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Monto Fijo ({currency})</span>
            </button>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {type === 'percentage' ? 'Porcentaje de descuento:' : `Monto a descontar (${currency}):`}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max={type === 'percentage' ? '100' : subtotal.toString()}
                step={type === 'percentage' ? '1' : '0.5'}
                value={val}
                onChange={(e) => setVal(e.target.value)}
                placeholder="0"
                className="w-full text-2xl font-black py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white text-center"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                {type === 'percentage' ? '%' : currency}
              </span>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Atajos Rápidos
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {(type === 'percentage' ? percentagePresets : fixedPresets).map((preset) => (
                <button
                  key={preset}
                  onClick={() => setVal(preset.toString())}
                  className="py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:border-indigo-500 hover:bg-indigo-50/50 hover:text-indigo-600 transition-colors"
                >
                  {type === 'percentage' ? `${preset}%` : `${currency}${preset}`}
                </button>
              ))}
            </div>
          </div>

          {/* Preview Box */}
          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
            <span className="text-gray-600 font-medium">Ahorro para el cliente:</span>
            <span className="font-extrabold text-indigo-700 text-sm">
              -{formatCurrency(calculatedDiscount, currency)}
            </span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={handleClear}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
          >
            Quitar Descuento
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              Aplicar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
