import { Order, StoreSettings } from '../types';
import { formatCurrency } from './currency';

export type ThermalPaperWidth = '58mm' | '80mm';

export function printThermalReceipt(order: Order, store: StoreSettings, paperWidth: ThermalPaperWidth = '80mm'): void {
  const printWindow = window.open('', '_blank', 'width=450,height=650');
  if (!printWindow) {
    alert('Por favor permita las ventanas emergentes para imprimir el ticket.');
    return;
  }

  const dateStr = new Date(order.createdAt).toLocaleString('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short'
  });

  const widthStyle = paperWidth === '58mm' ? 'max-width: 58mm; font-size: 11px;' : 'max-width: 80mm; font-size: 12px;';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Ticket ${order.orderNumber}</title>
      <style>
        @page {
          margin: 0;
          size: auto;
        }
        body {
          margin: 0;
          padding: 8px;
          font-family: 'Courier New', Courier, monospace;
          color: #000;
          background: #fff;
          ${widthStyle}
          margin: 0 auto;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .bold { font-weight: bold; }
        .divider {
          border-top: 1px dashed #000;
          margin: 6px 0;
        }
        .double-divider {
          border-top: 2px solid #000;
          margin: 8px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 2px 0;
        }
        .store-title {
          font-size: 1.2em;
          font-weight: bold;
          text-transform: uppercase;
        }
        .total-row {
          font-size: 1.15em;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="text-center">
        ${store.logoUrl ? `<img src="${store.logoUrl}" style="max-height: 48px; max-width: 120px; object-fit: contain; margin-bottom: 4px; filter: grayscale(100%);" /><br/>` : ''}
        <div class="store-title">${store.name}</div>
        ${store.address ? `<div>${store.address}</div>` : ''}
        ${store.phoneWhatsApp ? `<div>Tel/WA: ${store.phoneWhatsApp}</div>` : ''}
        ${store.receiptHeader ? `<div style="font-size:0.9em; margin-top:4px;">${store.receiptHeader.replace(/\n/g, '<br/>')}</div>` : ''}
      </div>

      <div class="divider"></div>

      <div>
        <div><strong>FOLIO:</strong> ${order.orderNumber}</div>
        <div><strong>FECHA:</strong> ${dateStr}</div>
        ${order.customerName ? `<div><strong>CLIENTE:</strong> ${order.customerName}</div>` : ''}
      </div>

      <div class="divider"></div>

      <table>
        <thead>
          <tr>
            <th class="text-left">CANT/PROD</th>
            <th class="text-right">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${order.items
            .map((item) => {
              const name = item.variantName ? `${item.productName} (${item.variantName})` : item.productName;
              return `
                <tr>
                  <td class="text-left" colspan="2"><strong>${name}</strong></td>
                </tr>
                <tr>
                  <td class="text-left">${item.quantity} x ${formatCurrency(item.unitPrice, store.currency)}</td>
                  <td class="text-right">${formatCurrency(item.total, store.currency)}</td>
                </tr>
              `;
            })
            .join('')}
        </tbody>
      </table>

      <div class="divider"></div>

      <table>
        <tr>
          <td>Subtotal:</td>
          <td class="text-right">${formatCurrency(order.subtotal, store.currency)}</td>
        </tr>
        ${
          order.discountAmount > 0
            ? `
          <tr>
            <td>Descuento ${order.discountType === 'percentage' ? `(${order.discountValue}%)` : ''}:</td>
            <td class="text-right">-${formatCurrency(order.discountAmount, store.currency)}</td>
          </tr>
        `
            : ''
        }
        ${
          order.taxAmount > 0
            ? `
          <tr>
            <td>Impuestos (${order.taxRate}%):</td>
            <td class="text-right">+${formatCurrency(order.taxAmount, store.currency)}</td>
          </tr>
        `
            : ''
        }
        <tr class="total-row">
          <td>TOTAL:</td>
          <td class="text-right">${formatCurrency(order.totalAmount, store.currency)}</td>
        </tr>
      </table>

      <div class="divider"></div>

      <div>
        <div><strong>Pago:</strong> ${order.paymentMethod.toUpperCase()}</div>
        ${
          order.amountReceived
            ? `
          <div><strong>Recibido:</strong> ${formatCurrency(order.amountReceived, store.currency)}</div>
          <div><strong>Cambio:</strong> ${formatCurrency(order.changeAmount || 0, store.currency)}</div>
        `
            : ''
        }
      </div>

      ${
        store.receiptFooter
          ? `
        <div class="divider"></div>
        <div class="text-center" style="font-size:0.85em;">
          ${store.receiptFooter.replace(/\n/g, '<br/>')}
        </div>
      `
          : ''
      }

      <div class="double-divider"></div>
      <div class="text-center" style="font-size:0.8em; margin-top: 8px;">
        *** Sistema FD POS Offline-First ***
      </div>

      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() { window.close(); }, 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
