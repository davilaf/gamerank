import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { syncService } from '../db/syncService';
import { CashMovement, CashMovementType, StoreSettings } from '../types';
import { formatCurrency } from '../utils/currency';
import { CashMovementModal } from '../components/finance/CashMovementModal';
import { 
  DollarSign, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  Tag, 
  Filter,
  CheckCircle2,
  Edit2,
  Trash2
} from 'lucide-react';

interface CashFlowPageProps {
  store: StoreSettings;
}

export const CashFlowPage: React.FC<CashFlowPageProps> = ({ store }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [movementToEdit, setMovementToEdit] = useState<CashMovement | null>(null);

  // Cargar movimientos ordenados por fecha descendente
  const movements = useLiveQuery(async () => {
    return await db.cashMovements.orderBy('createdAt').reverse().toArray();
  }, []) || [];

  // Cálculos financieros de caja
  const metrics = useMemo(() => {
    let totalInflows = 0;
    let totalOutflows = 0;
    let totalFixedExpenses = 0;
    let totalVariableExpenses = 0;
    let totalSalesIncome = 0;

    movements.forEach((m) => {
      if (m.type === 'cash_in') {
        totalInflows += m.amount;
      } else if (m.type === 'sale_income') {
        totalSalesIncome += m.amount;
      } else if (m.type === 'cash_out') {
        totalOutflows += m.amount;
      } else if (m.type === 'expense_fixed') {
        totalFixedExpenses += m.amount;
      } else if (m.type === 'expense_variable') {
        totalVariableExpenses += m.amount;
      }
    });

    const netCashBalance = (totalInflows + totalSalesIncome) - (totalOutflows + totalFixedExpenses + totalVariableExpenses);

    return {
      netCashBalance,
      totalSalesIncome,
      totalInflows,
      totalOutflows,
      totalFixedExpenses,
      totalVariableExpenses,
      totalExpensesCombined: totalFixedExpenses + totalVariableExpenses
    };
  }, [movements]);

  // Filtrado de movimientos
  const filteredMovements = movements.filter((m) => {
    if (filterType === 'all') return true;
    return m.type === filterType;
  });

  const handleSaveMovement = async (data: {
    id?: string;
    type: CashMovementType;
    category: string;
    amount: number;
    description: string;
  }) => {
    if (data.id) {
      await db.cashMovements.update(data.id, {
        type: data.type,
        category: data.category,
        amount: data.amount,
        description: data.description,
      });
      await syncService.enqueueMutation('cash_movements', 'UPDATE', data.id, data);
    } else {
      const newMovement: CashMovement = {
        id: `cash-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        type: data.type,
        category: data.category,
        amount: data.amount,
        description: data.description,
        createdAt: new Date().toISOString(),
        syncStatus: 'pending'
      };

      await db.cashMovements.add(newMovement);
      await syncService.enqueueMutation('cash_movements', 'INSERT', newMovement.id, newMovement);
    }
  };

  const handleDeleteMovement = async (id: string, category: string) => {
    if (confirm(`¿Estás seguro de eliminar el movimiento "${category}"?`)) {
      await db.cashMovements.delete(id);
      await syncService.enqueueMutation('cash_movements', 'DELETE', id, { id });
    }
  };

  const getMovementBadge = (type: CashMovementType) => {
    switch (type) {
      case 'sale_income':
        return { label: 'Venta POS', bg: 'bg-emerald-50 text-emerald-700', isPositive: true };
      case 'cash_in':
        return { label: 'Entrada / Aporte', bg: 'bg-teal-50 text-teal-700', isPositive: true };
      case 'cash_out':
        return { label: 'Retiro', bg: 'bg-rose-50 text-rose-700', isPositive: false };
      case 'expense_fixed':
        return { label: 'Gasto Fijo', bg: 'bg-amber-50 text-amber-800', isPositive: false };
      case 'expense_variable':
        return { label: 'Gasto Variable', bg: 'bg-indigo-50 text-indigo-700', isPositive: false };
      default:
        return { label: 'Movimiento', bg: 'bg-gray-50 text-gray-700', isPositive: true };
    }
  };

  const filterTabs = [
    { id: 'all', label: 'Todos' },
    { id: 'cash_in', label: 'Entradas / Aportes' },
    { id: 'expense_fixed', label: 'Gastos Fijos' },
    { id: 'expense_variable', label: 'Gastos Variables' },
    { id: 'cash_out', label: 'Retiros' },
    { id: 'sale_income', label: 'Ventas' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 pb-24 md:pb-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Wallet className="w-7 h-7 text-indigo-600" />
            <span>Flujo de Caja y Gastos</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitorea entradas de dinero, retiros, compras y gastos fijos/variables
          </p>
        </div>

        <button
          onClick={() => {
            setMovementToEdit(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-100 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Movimiento</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Net Cash Balance */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold mb-1">
            <span>Saldo en Caja Actual</span>
            <Wallet className="w-4 h-4 text-indigo-600" />
          </div>
          <div className={`text-2xl font-black ${
            metrics.netCashBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            {formatCurrency(metrics.netCashBalance, store.currency)}
          </div>
          <span className="text-[11px] text-gray-400 mt-0.5 block">
            Efectivo neto disponible
          </span>
        </div>

        {/* Total Inflows (Aportes) */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold mb-1">
            <span>Entradas / Aportes</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700">
            {formatCurrency(metrics.totalInflows, store.currency)}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
            Inyecciones y apertura de caja
          </span>
        </div>

        {/* Total Sales (POS) */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold mb-1">
            <span>Ingresos Ventas POS</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-600">
            {formatCurrency(metrics.totalSalesIncome, store.currency)}
          </div>
          <span className="text-[11px] text-gray-400 mt-0.5 block">
            Cobros registrados en terminal
          </span>
        </div>

        {/* Total Outflows & Expenses */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold mb-1">
            <span>Total Gastos y Salidas</span>
            <ArrowDownLeft className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">
            {formatCurrency(metrics.totalExpensesCombined + metrics.totalOutflows, store.currency)}
          </div>
          <span className="text-[11px] text-rose-600 font-medium mt-0.5 block">
            Fijos ({formatCurrency(metrics.totalFixedExpenses, store.currency)}) + Var ({formatCurrency(metrics.totalVariableExpenses, store.currency)})
          </span>
        </div>

      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterType === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Fecha / Hora</th>
                <th className="py-3.5 px-4">Tipo</th>
                <th className="py-3.5 px-4">Concepto / Categoría</th>
                <th className="py-3.5 px-4">Descripción</th>
                <th className="py-3.5 px-4 text-right">Monto</th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No se encontraron movimientos registrados en esta categoría.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((movement) => {
                  const badge = getMovementBadge(movement.type);
                  const dateStr = new Date(movement.createdAt).toLocaleString('es-MX', {
                    dateStyle: 'short',
                    timeStyle: 'short'
                  });

                  return (
                    <tr key={movement.id} className="hover:bg-gray-50/70 transition-colors">
                      
                      {/* Date */}
                      <td className="py-3 px-4 text-gray-500 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{dateStr}</span>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 font-bold text-gray-900">
                        {movement.category}
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4 text-gray-600 max-w-sm">
                        {movement.description || '-'}
                      </td>

                      {/* Amount with color */}
                      <td className="py-3 px-4 text-right font-black text-sm whitespace-nowrap">
                        <span className={badge.isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                          {badge.isPositive ? '+' : '-'}
                          {formatCurrency(movement.amount, store.currency)}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => {
                              setMovementToEdit(movement);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Editar movimiento"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMovement(movement.id, movement.category)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Eliminar movimiento"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Movement Modal (Create or Edit) */}
      {isModalOpen && (
        <CashMovementModal
          currency={store.currency}
          movementToEdit={movementToEdit}
          onSave={handleSaveMovement}
          onClose={() => {
            setIsModalOpen(false);
            setMovementToEdit(null);
          }}
        />
      )}

    </div>
  );
};
