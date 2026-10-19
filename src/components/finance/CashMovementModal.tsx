import React, { useState, useEffect } from 'react';
import { CashMovement, CashMovementType } from '../../types';
import { X, DollarSign, TrendingUp, TrendingDown, Check, Edit2 } from 'lucide-react';

interface CashMovementModalProps {
  currency: string;
  movementToEdit?: CashMovement | null;
  onSave: (data: {
    id?: string;
    type: CashMovementType;
    category: string;
    amount: number;
    description: string;
  }) => Promise<void>;
  onClose: () => void;
}

export const CashMovementModal: React.FC<CashMovementModalProps> = ({
  currency,
  movementToEdit,
  onSave,
  onClose
}) => {
  const [type, setType] = useState<CashMovementType>('cash_in');
  const [category, setCategory] = useState('Apertura de Caja');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const movementTypes: { id: CashMovementType; label: string; icon: any; color: string }[] = [
    { id: 'cash_in', label: 'Entrada / Aporte', icon: TrendingUp, color: 'text-emerald-600' },
    { id: 'cash_out', label: 'Retiro de Efectivo', icon: TrendingDown, color: 'text-rose-600' },
    { id: 'expense_fixed', label: 'Gasto Fijo', icon: DollarSign, color: 'text-amber-600' },
    { id: 'expense_variable', label: 'Gasto Variable', icon: DollarSign, color: 'text-indigo-600' },
  ];

  const categoryPresets: Record<CashMovementType, string[]> = {
    cash_in: ['Apertura de Caja', 'Inyección de Capital', 'Préstamo', 'Otro Ingreso'],
    cash_out: ['Retiro de Ganancias', 'Cierre de Caja', 'Depósito Bancario', 'Otro Retiro'],
    expense_fixed: ['Servicios', 'Alquiler / Renta', 'Luz / Electricidad', 'Internet / Teléfono', 'Sueldos', 'Seguros'],
    expense_variable: ['Compra de Mercancía / Stock', 'Insumos de Limpieza', 'Mantenimiento', 'Publicidad', 'Transporte / Flete'],
    sale_income: ['Venta POS']
  };

  useEffect(() => {
    if (movementToEdit) {
      setType(movementToEdit.type);
      setCategory(movementToEdit.category);
      setAmount(movementToEdit.amount.toString());
      setDescription(movementToEdit.description || '');
    } else {
      setType('cash_in');
      setCategory('Apertura de Caja');
      setAmount('');
      setDescription('');
    }
  }, [movementToEdit]);

  const handleTypeChange = (newType: CashMovementType) => {
    setType(newType);
    setCategory(categoryPresets[newType][0] || 'General');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      alert('Ingresa un monto válido mayor a 0');
      return;
    }

    await onSave({
      id: movementToEdit?.id,
      type,
      category,
      amount: parsedAmount,
      description: description.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center space-x-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              movementToEdit ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {movementToEdit ? <Edit2 className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                {movementToEdit ? 'Editar Movimiento de Caja' : 'Registrar Movimiento de Caja'}
              </h3>
              <p className="text-xs text-gray-500">Control de entradas, salidas y gastos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Movement Type Grid */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Tipo de Movimiento
            </label>
            <div className="grid grid-cols-2 gap-2">
              {movementTypes.map((m) => {
                const Icon = m.icon;
                const isSelected = type === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleTypeChange(m.id)}
                    className={`flex items-center space-x-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-2xs'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${m.color}`} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Monto ({currency}) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full text-2xl font-black px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                {currency}
              </span>
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Concepto / Categoría
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              {(categoryPresets[type] || ['General']).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description text area */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Descripción o Justificación (Opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej. Pago de internet de fibra óptica del local..."
              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{movementToEdit ? 'Guardar Cambios' : 'Registrar Movimiento'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
