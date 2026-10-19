import React, { useState, useEffect } from 'react';
import { PaymentMethod, Customer } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { 
  Banknote, 
  CreditCard, 
  ArrowRightLeft, 
  FileText, 
  X, 
  CheckCircle2, 
  User, 
  Phone, 
  Delete,
  Calculator
} from 'lucide-react';

interface QuickPayModalProps {
  totalAmount: number;
  currency: string;
  defaultCustomer: { name: string; phone?: string };
  notes: string;
  onCompleteSale: (
    paymentMethod: PaymentMethod,
    amountReceived: number,
    changeAmount: number,
    customerData: { name: string; phone: string },
    notes: string
  ) => void;
  onClose: () => void;
}

export const QuickPayModal: React.FC<QuickPayModalProps> = ({
  totalAmount,
  currency,
  defaultCustomer,
  notes: initialNotes,
  onCompleteSale,
  onClose
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountReceivedStr, setAmountReceivedStr] = useState<string>(totalAmount.toString());
  const [customerName, setCustomerName] = useState(defaultCustomer.name || '');
  const [customerPhone, setCustomerPhone] = useState(defaultCustomer.phone || '');
  const [notes, setNotes] = useState(initialNotes || '');

  const amountReceived = parseFloat(amountReceivedStr) || 0;
  const changeAmount = Math.max(0, amountReceived - totalAmount);
  const isInsufficientCash = paymentMethod === 'cash' && amountReceived < totalAmount;

  // Shortcuts de billetes comunes
  const billPresets = [
    Math.ceil(totalAmount),
    Math.ceil(totalAmount / 50) * 50,
    Math.ceil(totalAmount / 100) * 100,
    200,
    500
  ].filter((v, i, a) => v >= totalAmount && a.indexOf(v) === i).slice(0, 4);

  // Manejo de teclado numérico
  const handleKeypadPress = (key: string) => {
    if (key === 'CLEAR') {
      setAmountReceivedStr('');
    } else if (key === 'BACKSPACE') {
      setAmountReceivedStr((prev) => prev.slice(0, -1));
    } else if (key === '.') {
      if (!amountReceivedStr.includes('.')) {
        setAmountReceivedStr((prev) => (prev ? `${prev}.` : '0.'));
      }
    } else {
      setAmountReceivedStr((prev) => {
        if (prev === '0') return key;
        return `${prev}${key}`;
      });
    }
  };

  const handleConfirm = () => {
    if (isInsufficientCash) {
      alert(`El monto recibido (${formatCurrency(amountReceived, currency)}) es menor al total a cobrar (${formatCurrency(totalAmount, currency)}).`);
      return;
    }

    onCompleteSale(
      paymentMethod,
      paymentMethod === 'cash' ? amountReceived : totalAmount,
      paymentMethod === 'cash' ? changeAmount : 0,
      { name: customerName.trim(), phone: customerPhone.trim() },
      notes.trim()
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-5 text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
              Finalizar Venta
            </span>
            <div className="text-3xl font-black tracking-tight">
              {formatCurrency(totalAmount, currency)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              Método de Pago
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'cash', label: 'Efectivo', icon: Banknote },
                { id: 'card', label: 'Tarjeta', icon: CreditCard },
                { id: 'transfer', label: 'Transferencia', icon: ArrowRightLeft },
                { id: 'credit', label: 'A Crédito', icon: FileText },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setPaymentMethod(m.id as PaymentMethod);
                      if (m.id !== 'cash') {
                        setAmountReceivedStr(totalAmount.toString());
                      }
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-bold shadow-xs'
                        : 'border-gray-100 bg-gray-50/50 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-indigo-600' : 'text-gray-500'}`} />
                    <span className="text-xs">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Payment Section: Keypad & Change Calculation */}
          {paymentMethod === 'cash' && (
            <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
              
              {/* Display & Change summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-gray-400 block uppercase">Recibido</span>
                  <div className="text-xl font-extrabold text-gray-900 truncate">
                    {formatCurrency(amountReceived, currency)}
                  </div>
                </div>

                <div className={`p-3 rounded-xl border shadow-2xs ${
                  isInsufficientCash
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                  <span className="text-[11px] font-bold block uppercase opacity-80">
                    {isInsufficientCash ? 'Falta cobrar' : 'Cambio / Vuelto'}
                  </span>
                  <div className="text-xl font-extrabold truncate">
                    {isInsufficientCash
                      ? `-${formatCurrency(totalAmount - amountReceived, currency)}`
                      : formatCurrency(changeAmount, currency)}
                  </div>
                </div>
              </div>

              {/* Quick bill shortcuts */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  onClick={() => setAmountReceivedStr(totalAmount.toString())}
                  className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  Exacto ({formatCurrency(totalAmount, currency)})
                </button>
                {billPresets.map((bill) => (
                  <button
                    key={bill}
                    onClick={() => setAmountReceivedStr(bill.toString())}
                    className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100"
                  >
                    {formatCurrency(bill, currency)}
                  </button>
                ))}
              </div>

              {/* Interactive Virtual Keypad */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'BACKSPACE'].map((key) => (
                  <button
                    key={key}
                    onClick={() => handleKeypadPress(key)}
                    className="h-11 bg-white hover:bg-indigo-50 hover:text-indigo-600 active:bg-indigo-100 font-bold text-gray-800 text-base rounded-xl border border-gray-200 shadow-2xs flex items-center justify-center transition-colors"
                  >
                    {key === 'BACKSPACE' ? <Delete className="w-5 h-5" /> : key}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customer & Ticket Info (Optional) */}
          <div className="space-y-2.5 pt-1 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
              Datos del Cliente (Opcional)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nombre del cliente"
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="WhatsApp (+52...)"
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nota adicional para este ticket..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

        </div>

        {/* Action Button */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-2xl text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Atrás
          </button>

          <button
            disabled={isInsufficientCash}
            onClick={handleConfirm}
            className={`flex-1 flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl font-bold text-sm text-white shadow-lg transition-all ${
              isInsufficientCash
                ? 'bg-gray-400 cursor-not-allowed shadow-none'
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] shadow-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Cobrar {formatCurrency(totalAmount, currency)}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
