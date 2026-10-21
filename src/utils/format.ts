import { Order, StoreSettings } from '../types/pos';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace(/\s+/g, '');
}

export function formatDateTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatDateShort(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Generate monospaced formatted plain text for Bluetooth Thermal Printer (ESC/POS raw text export)
export function generateEscPosText(order: Order, settings: StoreSettings): string {
  const width = settings.printerPaperWidth === '58mm' ? 32 : 42;
  const line = '-'.repeat(width);
  const dline = '='.repeat(width);

  const center = (str: string) => {
    if (str.length >= width) return str.slice(0, width);
    const pad = Math.floor((width - str.length) / 2);
    return ' '.repeat(pad) + str;
  };

  const justify = (left: string, right: string) => {
    const spaceCount = width - (left.length + right.length);
    if (spaceCount <= 0) return `${left} ${right}`;
    return left + ' '.repeat(spaceCount) + right;
  };

  const padRight = (str: string, len: number) => {
    return str.length >= len ? str.slice(0, len) : str + ' '.repeat(len - str.length);
  };

  const lines: string[] = [];

  // Header
  lines.push(center(settings.storeName.toUpperCase()));
  lines.push(center(settings.branchName));
  lines.push(center(settings.address));
  if (settings.phone) lines.push(center(`Telp: ${settings.phone}`));
  lines.push(dline);

  // Meta
  lines.push(justify(`No: ${order.orderNumber}`, order.type.toUpperCase().replace('_', ' ')));
  lines.push(justify(`Kasir: ${order.cashierName}`, formatDateTime(order.createdAt)));
  if (order.tableNumber) lines.push(justify(`Meja: ${order.tableNumber}`, `Cust: ${order.customerName}`));
  else lines.push(justify(`Cust: ${order.customerName}`, ''));
  lines.push(line);

  // Items
  order.items.forEach((item) => {
    const itemTotal = formatRupiah(item.product.price * item.quantity);
    lines.push(item.product.name);
    const qtyPrice = `  ${item.quantity}x @${formatRupiah(item.product.price)}`;
    lines.push(justify(qtyPrice, itemTotal));
    if (item.notes) {
      lines.push(`  * ${item.notes}`);
    }
  });

  lines.push(line);

  // Totals
  lines.push(justify('Subtotal', formatRupiah(order.subtotal)));
  if (order.discount > 0) {
    lines.push(justify('Diskon', `-${formatRupiah(order.discount)}`));
  }
  if (order.tax > 0) {
    lines.push(justify(`PPN (${settings.taxRatePercent}%)`, formatRupiah(order.tax)));
  }
  if (order.serviceCharge > 0) {
    lines.push(justify(`Service (${settings.serviceChargePercent}%)`, formatRupiah(order.serviceCharge)));
  }
  lines.push(dline);
  lines.push(justify('TOTAL', formatRupiah(order.total)));
  lines.push(line);

  // Payment
  lines.push(justify(`Bayar (${order.paymentMethod.toUpperCase()})`, formatRupiah(order.amountPaid)));
  lines.push(justify('Kembali', formatRupiah(order.change)));
  lines.push(dline);

  // Footer
  lines.push(center(settings.footerNote || 'Terima Kasih atas Kunjungan Anda'));
  if (settings.wifiNote) {
    lines.push(center(settings.wifiNote));
  }
  lines.push(center(`Dicetak: ${new Date().toLocaleTimeString('id-ID')}`));
  lines.push('\n\n\n'); // Feed space for tear

  return lines.join('\n');
}
