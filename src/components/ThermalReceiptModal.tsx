import React, { useState } from 'react';
import { Printer, Copy, Check, Share2, X, Download, Sliders } from 'lucide-react';
import { Order, StoreSettings } from '../types/pos';
import { formatRupiah, formatDateTime, generateEscPosText } from '../utils/format';

interface ThermalReceiptModalProps {
  order: Order;
  settings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
  onDirectPrint?: () => void;
  autoPrinted?: boolean;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  order,
  settings,
  isOpen,
  onClose,
  onDirectPrint,
  autoPrinted = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedWidth, setSelectedWidth] = useState<'58mm' | '80mm'>(settings.printerPaperWidth);

  if (!isOpen) return null;

  const handleCopyEscPos = () => {
    const text = generateEscPosText(order, { ...settings, printerPaperWidth: selectedWidth });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (onDirectPrint) {
      onDirectPrint();
    } else {
      window.print();
    }
  };

  const handleWhatsAppShare = () => {
    const text = `*${settings.storeName} - ${settings.branchName}*\n` +
      `No. Order: #${order.orderNumber}\n` +
      `Tanggal: ${formatDateTime(order.createdAt)}\n` +
      `Tipe: ${order.type.toUpperCase()}\n` +
      `Pelanggan: ${order.customerName}\n` +
      (order.tableNumber ? `Meja: ${order.tableNumber}\n` : '') +
      `------------------------\n` +
      order.items.map(it => `${it.product.name} (${it.quantity}x) = ${formatRupiah(it.quantity * it.product.price)}`).join('\n') +
      `\n------------------------\n` +
      `*Total: ${formatRupiah(order.total)}*\n` +
      `Metode Bayar: ${order.paymentMethod.toUpperCase()}\n` +
      `\n${settings.footerNote || 'Terima kasih atas kunjungan Anda!'}`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in no-print">
      <div className="relative flex flex-col md:flex-row max-h-[92vh] w-full max-w-3xl bg-[#1e2337] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Left Side: Receipt Control & Printer Actions */}
        <div className="flex-1 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800/80">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-lg">Struk Belanja Kasir</h3>
                  <p className="text-xs text-slate-400">Order #{order.orderNumber} · {formatDateTime(order.createdAt)}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Auto Print feedback badge */}
            {autoPrinted && (
              <div className="mb-4 px-3 py-2 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Struk otomatis dikirim ke printer thermal! Dialog print telah dibuka.</span>
              </div>
            )}

            {/* Paper Width Selector */}
            <div className="mb-5 bg-[#171a29] p-3 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" /> Ukuran Roll Thermal
                </span>
                <span className="text-[11px] text-slate-400">Standard POS Printer</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedWidth('58mm')}
                  className={`py-2 px-3 text-xs font-medium rounded-lg transition-all border ${
                    selectedWidth === '58mm'
                      ? 'bg-amber-400/15 border-amber-400 text-amber-300 shadow-sm'
                      : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="block font-bold">58 mm (2 Inchi)</span>
                  <span className="text-[10px] opacity-75">Mobile / Mini POS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedWidth('80mm')}
                  className={`py-2 px-3 text-xs font-medium rounded-lg transition-all border ${
                    selectedWidth === '80mm'
                      ? 'bg-amber-400/15 border-amber-400 text-amber-300 shadow-sm'
                      : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="block font-bold">80 mm (3 Inchi)</span>
                  <span className="text-[10px] opacity-75">Desktop / Kasir Kas</span>
                </button>
              </div>
            </div>

            {/* Quick summary specs */}
            <div className="space-y-2 text-xs text-slate-400 bg-[#171a29]/60 p-3.5 rounded-xl border border-slate-800/60 mb-5">
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span className="text-slate-200 font-medium">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode Pembayaran:</span>
                <span className="text-slate-200 font-semibold uppercase">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Belanja:</span>
                <span className="text-amber-400 font-bold">{formatRupiah(order.total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kembalian:</span>
                <span className="text-emerald-400 font-medium">{formatRupiah(order.change)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Printer className="w-5 h-5" />
              <span>Cetak ke Printer Thermal (Print)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopyEscPos}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition cursor-pointer"
                title="Salin format raw text untuk aplikasi Bluetooth printer seperti RawBT"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                <span>{copied ? 'Tersalin!' : 'Salin ESC/POS'}</span>
              </button>

              <button
                onClick={handleWhatsAppShare}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] font-medium text-xs rounded-xl border border-[#25D366]/40 transition cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Kirim WhatsApp</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 text-center text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-xl transition cursor-pointer"
            >
              Selesai & Tutup Jendela
            </button>
          </div>
        </div>

        {/* Right Side: Realistic Thermal Paper Physical Preview */}
        <div className="flex-1 bg-[#0f111a] p-6 flex flex-col items-center justify-start overflow-y-auto">
          <div className="flex items-center justify-between w-full mb-3 px-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Pratinjau Kertas Thermal ({selectedWidth})
            </span>
            <button
              onClick={onClose}
              className="hidden md:flex p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Physical Thermal Paper Simulation */}
          <div
            className={`bg-[#fdfcf7] text-black shadow-2xl rounded-xs p-5 transition-all duration-300 font-mono text-[11px] leading-snug border-t-8 border-slate-300 relative select-text ${
              selectedWidth === '58mm' ? 'w-[280px]' : 'w-[360px]'
            }`}
            style={{
              boxShadow: '0 10px 30px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.2)',
            }}
          >
            {/* Top jagged cut marks visual */}
            <div className="text-center font-bold text-sm tracking-wider uppercase mb-1">
              {settings.storeName}
            </div>
            <div className="text-center text-xs font-semibold mb-0.5">
              {settings.branchName}
            </div>
            <div className="text-center text-[10px] text-gray-700 leading-tight">
              {settings.address}
            </div>
            {settings.phone && (
              <div className="text-center text-[10px] text-gray-700 mb-1">
                Telp: {settings.phone}
              </div>
            )}

            <div className="border-b border-dashed border-gray-800 my-2" />

            <div className="flex justify-between text-[10px]">
              <span>No: #{order.orderNumber}</span>
              <span className="font-bold uppercase">{order.type.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between text-[10px] text-gray-800">
              <span>Waktu:</span>
              <span>{formatDateTime(order.createdAt)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-gray-800">
              <span>Kasir: {order.cashierName}</span>
              {order.tableNumber && <span className="font-bold">Meja: {order.tableNumber}</span>}
            </div>
            <div className="text-[10px] text-gray-800">
              <span>Pelanggan: {order.customerName}</span>
            </div>

            <div className="border-b border-dashed border-gray-800 my-2" />

            {/* Items */}
            <div className="space-y-1.5">
              {order.items.map((item, idx) => (
                <div key={idx}>
                  <div className="font-medium text-black">{item.product.name}</div>
                  <div className="flex justify-between text-[10px] text-gray-700">
                    <span>{item.quantity} x {formatRupiah(item.product.price)}</span>
                    <span className="font-semibold text-black">{formatRupiah(item.quantity * item.product.price)}</span>
                  </div>
                  {item.notes && (
                    <div className="text-[9px] text-gray-500 italic">
                      *{item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-b border-dashed border-gray-800 my-2" />

            {/* Subtotal & Calculations */}
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatRupiah(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Diskon</span>
                  <span>-{formatRupiah(order.discount)}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between">
                  <span>PPN ({settings.taxRatePercent}%)</span>
                  <span>{formatRupiah(order.tax)}</span>
                </div>
              )}
              {order.serviceCharge > 0 && (
                <div className="flex justify-between">
                  <span>Service ({settings.serviceChargePercent}%)</span>
                  <span>{formatRupiah(order.serviceCharge)}</span>
                </div>
              )}

              <div className="border-t border-gray-800 my-1 pt-1 flex justify-between font-bold text-xs">
                <span>TOTAL</span>
                <span>{formatRupiah(order.total)}</span>
              </div>
            </div>

            <div className="border-b border-dashed border-gray-800 my-2" />

            {/* Payment & Change */}
            <div className="text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span className="uppercase">Bayar ({order.paymentMethod})</span>
                <span>{formatRupiah(order.amountPaid)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Kembali</span>
                <span>{formatRupiah(order.change)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-2 border-t border-dashed border-gray-800 text-center text-[10px] space-y-0.5">
              <p className="font-semibold">{settings.footerNote || 'Terima Kasih atas Kunjungan Anda'}</p>
              {settings.wifiNote && <p className="text-[9px] text-gray-600">{settings.wifiNote}</p>}
            </div>

            {/* Barcode representation */}
            <div className="mt-3 flex flex-col items-center justify-center">
              <div className="flex items-center gap-[1px] h-7">
                {[2, 1, 3, 4, 1, 2, 3, 1, 4, 1, 2, 3, 2, 4, 1, 3, 1, 2, 4, 1, 3, 2, 1].map((w, i) => (
                  <div key={i} className="bg-black h-full" style={{ width: `${w}px` }} />
                ))}
              </div>
              <span className="text-[8px] tracking-widest mt-0.5">*{order.orderNumber}*</span>
            </div>

            {/* Realistic paper serrated edge effect at bottom */}
            <div
              className="absolute -bottom-2 left-0 right-0 h-2 bg-repeat-x"
              style={{
                backgroundImage: 'radial-gradient(circle, transparent 50%, #fdfcf7 50%)',
                backgroundSize: '10px 10px',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
