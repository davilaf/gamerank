import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface StockAlertBadgeProps {
  stockQuantity: number;
  minStockAlert: number;
  trackStock: boolean;
}

export const StockAlertBadge: React.FC<StockAlertBadgeProps> = ({
  stockQuantity,
  minStockAlert,
  trackStock
}) => {
  if (!trackStock) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
        Ilimitado
      </span>
    );
  }

  if (stockQuantity <= 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
        <XCircle className="w-3 h-3" />
        Agotado (0)
      </span>
    );
  }

  if (stockQuantity <= minStockAlert) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 animate-pulse">
        <AlertTriangle className="w-3 h-3" />
        Bajo ({stockQuantity})
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
      <CheckCircle className="w-3 h-3" />
      {stockQuantity} en stock
    </span>
  );
};
