import { Order, CartItem, StoreSettings } from '../types';
import { formatCurrency } from './currency';

/**
 * Genera el enlace de WhatsApp para enviar un ticket de venta formateado
 */
export function generateOrderWhatsAppLink(order: Order, store: StoreSettings, customPhone?: string): string {
  const phone = (customPhone || order.customerPhone || store.phoneWhatsApp || '').replace(/[^\d+]/g, '');
  
  const dateStr = new Date(order.createdAt).toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const lines: string[] = [
    `🧾 *TICKET DE VENTA DIGITAL*`,
    `🏪 *${store.name.toUpperCase()}*`,
    `📅 ${dateStr}`,
    `🔖 *Folio:* ${order.orderNumber}`,
    `----------------------------------------`
  ];

  if (order.customerName) {
    lines.push(`👤 *Cliente:* ${order.customerName}`);
    lines.push(`----------------------------------------`);
  }

  lines.push(`*PRODUCTOS:*`);
  order.items.forEach((item) => {
    const itemDesc = item.variantName ? `${item.productName} (${item.variantName})` : item.productName;
    lines.push(`▫️ ${item.quantity}x ${itemDesc} - ${formatCurrency(item.total, store.currency)}`);
  });

  lines.push(`----------------------------------------`);
  lines.push(`*Subtotal:* ${formatCurrency(order.subtotal, store.currency)}`);

  if (order.discountAmount > 0) {
    const descType = order.discountType === 'percentage' ? `(${order.discountValue}%)` : '';
    lines.push(`🏷️ *Descuento ${descType}:* -${formatCurrency(order.discountAmount, store.currency)}`);
  }

  if (order.taxAmount > 0) {
    lines.push(`🏛️ *Impuestos (${order.taxRate}%):* +${formatCurrency(order.taxAmount, store.currency)}`);
  }

  lines.push(`💰 *TOTAL PAGADO:* ${formatCurrency(order.totalAmount, store.currency)}`);
  lines.push(`💳 *Método de pago:* ${order.paymentMethod.toUpperCase()}`);

  if (order.amountReceived && order.changeAmount && order.changeAmount > 0) {
    lines.push(`💵 *Recibido:* ${formatCurrency(order.amountReceived, store.currency)} | *Cambio:* ${formatCurrency(order.changeAmount, store.currency)}`);
  }

  if (store.receiptFooter) {
    lines.push(`\n_${store.receiptFooter}_`);
  }

  const encodedText = encodeURIComponent(lines.join('\n'));
  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`;
}

/**
 * Genera el enlace de WhatsApp para pedidos generados desde el catálogo web público
 */
export function generateCatalogOrderWhatsAppLink(
  items: CartItem[],
  totalAmount: number,
  store: StoreSettings,
  customerData: { name: string; phone: string; address?: string; notes?: string }
): string {
  const storePhone = store.phoneWhatsApp.replace(/[^\d+]/g, '');

  const lines: string[] = [
    `🛍️ *NUEVO PEDIDO DESDE EL CATÁLOGO WEB*`,
    `🏪 *Para:* ${store.name}`,
    `----------------------------------------`,
    `👤 *Cliente:* ${customerData.name}`,
    `📱 *Teléfono:* ${customerData.phone}`
  ];

  if (customerData.address) {
    lines.push(`📍 *Dirección de entrega:* ${customerData.address}`);
  }

  lines.push(`----------------------------------------`);
  lines.push(`*RESUMEN DEL PEDIDO:*`);

  items.forEach((item) => {
    const desc = item.variantName ? `${item.productName} (${item.variantName})` : item.productName;
    lines.push(`▫️ ${item.quantity}x ${desc} = ${formatCurrency(item.unitPrice * item.quantity, store.currency)}`);
  });

  lines.push(`----------------------------------------`);
  lines.push(`💰 *TOTAL ESTIMADO:* ${formatCurrency(totalAmount, store.currency)}`);

  if (customerData.notes) {
    lines.push(`\n📝 *Instrucciones especiales:* ${customerData.notes}`);
  }

  lines.push(`\n_Por favor confírmenme la recepción del pedido y tiempo de entrega. ¡Gracias!_`);

  const encodedText = encodeURIComponent(lines.join('\n'));
  return `https://api.whatsapp.com/send?phone=${storePhone}&text=${encodedText}`;
}
