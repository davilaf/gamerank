import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Order, StoreSettings } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { printThermalReceipt, ThermalPaperWidth } from '../../utils/thermalPrinter';
import { generateOrderWhatsAppLink } from '../../utils/whatsapp';
import { 
  CheckCircle, 
  Printer, 
  Share2, 
  PlusCircle, 
  MessageSquare, 
  Phone, 
  FileText,
  X
} from 'lucide-react';

interface ReceiptSuccessModalProps {
  order: Order | null;
  store: StoreSettings;
  onNewSale: () => void;
  onClose: () => void;
}

export const ReceiptSuccessModal: React.FC<ReceiptSuccessModalProps> = ({
  order,
  store,
  onNewSale,
  onClose
}) => {
  const [customPhone, setCustomPhone] = useState<string>('');
  const [paperWidth, setPaperWidth] = useState<ThermalPaperWidth>('80mm');

  useEffect(() => {
    if (order) {
      setCustomPhone(order.customerPhone || '');
      // Lanzar confeti al completar la venta
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [order]);

  if (!order) return null;

  const handlePrint = (width: ThermalPaperWidth) => {
    printThermalReceipt(order, store, width);
  };

  const handleWhatsAppSend = () => {
    const link = generateOrderWhatsAppLink(order, store, customPhone);
    window.open(link, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Top Success Banner */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>

          <h3 className="text-xl font-black">¡Venta Exitosa!</h3>
          <p className="text-xs text-emerald-100 mt-0.5">Orden {order.orderNumber}</p>
          
          <div className="text-3xl font-black mt-2 tracking-tight">
            {formatCurrency(order.totalAmount, store.currency)}
          </div>
          <span className="inline-block bg-white/25 px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 uppercase">
            {order.paymentMethod}
          </span>
        </div>

        {/* Action Options: Thermal Print & WhatsApp Dispatch */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          
          {/* WhatsApp Direct Dispatch Card */}
          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 space-y-2.5">
            <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Enviar Recibo por WhatsApp</span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-emerald-700">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <input
                  type="tel"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="Número de WhatsApp (+52...)"
                  className="w-full pl-8 pr-2.5 py-2 bg-white border border-emerald-200 rounded-xl text-xs text-gray-800 placeholder-emerald-700/50 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={handleWhatsAppSend}
                className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Enviar</span>
              </button>
            </div>
            <p className="text-[11px] text-emerald-700">
              Genera el ticket formateado con emojis listo para enviar por WhatsApp.
            </p>
          </div>

          {/* Thermal Print Card (58mm / 80mm) */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-gray-800 font-bold text-xs uppercase tracking-wider">
                <Printer className="w-4 h-4 text-indigo-600" />
                <span>Imprimir Ticket Térmico</span>
              </div>
              
              <div className="flex bg-gray-200 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  onClick={() => setPaperWidth('58mm')}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    paperWidth === '58mm' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-gray-600'
                  }`}
                >
                  58mm
                </button>
                <button
                  onClick={() => setPaperWidth('80mm')}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    paperWidth === '80mm' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-gray-600'
                  }`}
                >
                  80mm
                </button>
              </div>
            </div>

            <button
              onClick={() => handlePrint(paperWidth)}
              className="w-full bg-white hover:bg-gray-100 active:bg-gray-200 border border-gray-300 text-gray-800 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-2xs transition-all"
            >
              <Printer className="w-4 h-4 text-indigo-600" />
              <span>Imprimir Formato {paperWidth}</span>
            </button>
          </div>

          {/* Quick Ticket Breakdown Summary */}
          <div className="p-3 bg-gray-50 rounded-2xl text-xs space-y-1.5 text-gray-600 border border-gray-100">
            <div className="font-semibold text-gray-800 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-gray-500" />
              <span>Detalle de Artículos:</span>
            </div>
            {order.items.map((it) => (
              <div key={it.id} className="flex justify-between pl-4">
                <span>{it.quantity}x {it.productName} {it.variantName ? `(${it.variantName})` : ''}</span>
                <span className="font-medium text-gray-900">{formatCurrency(it.total, store.currency)}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Footer: Start New Sale */}
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onNewSale}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-indigo-100 transition-all active:scale-[0.99]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nueva Venta (POS)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
