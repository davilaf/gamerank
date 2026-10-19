export function formatCurrency(amount: number, currency: string = '$'): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  return `${currency}${safeAmount.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
