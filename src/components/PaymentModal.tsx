import React, { useState, useEffect } from 'react';
import {
  Banknote,
  QrCode,
  CreditCard,
  Building2,
  CheckCircle2,
  Printer,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { PaymentMethod, StoreSettings } from '../types/pos';
import { formatRupiah } from '../utils/format';
import { posSound } from '../utils/sound';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  serviceCharge: number;
  customerName: string;
  tableNumber?: string;
  settings: StoreSettings;
  onCompletePayment: (paymentMethod: PaymentMethod, amountPaid: number, change: number, autoPrint: boolean) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  orderNumber,
  total,
  subtotal,
  tax,
  discount,
  serviceCharge,
  customerName,
  tableNumber,
  settings,
  onCompletePayment,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [amountPaid, setAmountPaid] = useState<number>(total);
  const [autoPrint, setAutoPrint] = useState<boolean>(settings.autoPrintOnPayment);
  const [qrisSimulatedDone, setQrisSimulatedDone] = useState(false);
  const [cardRef, setCardRef] = useState('');

  // Update amount paid whenever total changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setAmountPaid(total);
      setQrisSimulatedDone(false);
      setCardRef('');
    }
  }, [isOpen, total]);

  if (!isOpen) return null;

  const change = Math.max(0, amountPaid - total);
  const isCashSufficient = amountPaid >= total;

  // Preset quick cash denominations
  const presets = [
    { label: 'Uang Pas', value: total },
    { label: 'Rp 20.000', value: 20000 },
    { label: 'Rp 50.000', value: 50000 },
    { label: 'Rp 100.000', value: 100000 },
    { label: 'Rp 150.000', value: 150000 },
    { label: 'Rp 200.000', value: 200000 },
  ].filter(p => p.value >= total || p.label === 'Uang Pas');

  const handleSelectMethod = (m: PaymentMethod) => {
    posSound.playClick();
    setMethod(m);
    if (m !== 'cash') {
      setAmountPaid(total);
    }
  };

  const handlePresetClick = (val: number) => {
    posSound.playClick();
    setAmountPaid(val);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (method === 'cash' && !isCashSufficient) {
      return;
    }
    posSound.playCashChime();
    onCompletePayment(method, amountPaid, change, autoPrint);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in no-print">
      <div className="relative w-full max-w-2xl bg-[#1c2033] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#161928]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
              Rp
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Pembayaran Kasir</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-mono">
                  #{orderNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {customerName} {tableNumber ? `· Meja ${tableNumber}` : '· Take Away'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Total Hero Display */}
          <div className="bg-gradient-to-br from-[#121422] to-[#181b2e] p-5 rounded-2xl border border-slate-800 text-center relative overflow-hidden">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-1">
              Total Tagihan
            </div>
            <div className="text-3xl md:text-4xl font-extrabold text-amber-400 tracking-tight font-mono">
              {formatRupiah(total)}
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-slate-400 mt-2">
              <span>Subtotal: {formatRupiah(subtotal)}</span>
              {discount > 0 && <span className="text-red-400">Diskon: -{formatRupiah(discount)}</span>}
              {tax > 0 && <span>PPN: {formatRupiah(tax)}</span>}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Pilih Metode Pembayaran
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => handleSelectMethod('cash')}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition cursor-pointer ${
                  method === 'cash'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Banknote className="w-5 h-5 mb-1" />
                <span className="text-xs font-bold">Tunai</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMethod('qris')}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition cursor-pointer ${
                  method === 'qris'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <QrCode className="w-5 h-5 mb-1" />
                <span className="text-xs font-bold">QRIS</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMethod('debit')}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition cursor-pointer ${
                  method === 'debit'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-5 h-5 mb-1" />
                <span className="text-xs font-bold">Debit / EDC</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMethod('transfer')}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition cursor-pointer ${
                  method === 'transfer'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-5 h-5 mb-1" />
                <span className="text-xs font-bold">Transfer</span>
              </button>
            </div>
          </div>

          {/* Method Content */}
          {method === 'cash' && (
            <div className="space-y-4 bg-[#141726] p-4 rounded-xl border border-slate-800">
              {/* Presets */}
              <div>
                <span className="text-xs text-slate-400 mb-2 block font-medium">Uang Diterima Cepat:</span>
                <div className="grid grid-cols-3 gap-2">
                  {presets.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handlePresetClick(p.value)}
                      className={`py-2 px-3 text-xs font-bold rounded-lg border transition ${
                        amountPaid === p.value
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                          : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Cash Input */}
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Jumlah Uang Tunai Diterima:</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    value={amountPaid || ''}
                    onChange={(e) => setAmountPaid(Number(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0f111c] border border-slate-700 rounded-xl text-white font-mono text-lg font-bold focus:outline-none focus:border-amber-400"
                    placeholder="Masukkan nominal uang"
                  />
                </div>
              </div>

              {/* Kembalian Display */}
              <div className="flex items-center justify-between p-3 bg-[#1e2337] rounded-xl border border-slate-700/80">
                <span className="text-xs font-bold text-slate-300 uppercase">Kembalian:</span>
                <span className={`text-xl font-extrabold font-mono ${change > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {formatRupiah(change)}
                </span>
              </div>

              {!isCashSufficient && (
                <div className="text-xs text-red-400 flex items-center gap-1.5">
                  <span>Uang yang diterima kurang sebesar {formatRupiah(total - amountPaid)}</span>
                </div>
              )}
            </div>
          )}

          {method === 'qris' && (
            <div className="bg-[#141726] p-5 rounded-xl border border-slate-800 flex flex-col items-center text-center">
              <div className="bg-white p-3.5 rounded-2xl shadow-lg mb-3">
                {/* Crisp SVG QR Code representation */}
                <svg width="170" height="170" viewBox="0 0 200 200" className="w-40 h-40">
                  <rect width="200" height="200" fill="#ffffff" />
                  {/* Top-left marker */}
                  <rect x="20" y="20" width="46" height="46" fill="#000000" />
                  <rect x="26" y="26" width="34" height="34" fill="#ffffff" />
                  <rect x="33" y="33" width="20" height="20" fill="#000000" />
                  {/* Top-right marker */}
                  <rect x="134" y="20" width="46" height="46" fill="#000000" />
                  <rect x="140" y="26" width="34" height="34" fill="#ffffff" />
                  <rect x="147" y="33" width="20" height="20" fill="#000000" />
                  {/* Bottom-left marker */}
                  <rect x="20" y="134" width="46" height="46" fill="#000000" />
                  <rect x="26" y="140" width="34" height="34" fill="#ffffff" />
                  <rect x="33" y="147" width="20" height="20" fill="#000000" />
                  {/* Dense pattern dots */}
                  <rect x="80" y="25" width="10" height="20" fill="#000000" />
                  <rect x="100" y="25" width="20" height="10" fill="#000000" />
                  <rect x="75" y="55" width="15" height="15" fill="#000000" />
                  <rect x="105" y="45" width="15" height="15" fill="#000000" />
                  <rect x="30" y="80" width="20" height="10" fill="#000000" />
                  <rect x="60" y="80" width="15" height="20" fill="#000000" />
                  <rect x="85" y="80" width="30" height="10" fill="#000000" />
                  <rect x="125" y="80" width="20" height="20" fill="#000000" />
                  <rect x="155" y="80" width="25" height="10" fill="#000000" />
                  <rect x="25" y="105" width="25" height="15" fill="#000000" />
                  <rect x="65" y="110" width="15" height="15" fill="#000000" />
                  <rect x="90" y="100" width="20" height="25" fill="#000000" />
                  <rect x="120" y="110" width="25" height="15" fill="#000000" />
                  <rect x="155" y="105" width="20" height="20" fill="#000000" />
                  <rect x="80" y="135" width="20" height="15" fill="#000000" />
                  <rect x="110" y="135" width="15" height="20" fill="#000000" />
                  <rect x="135" y="135" width="25" height="10" fill="#000000" />
                  <rect x="170" y="135" width="10" height="25" fill="#000000" />
                  <rect x="80" y="160" width="30" height="15" fill="#000000" />
                  <rect x="120" y="155" width="20" height="20" fill="#000000" />
                  <rect x="150" y="165" width="25" height="10" fill="#000000" />
                </svg>
              </div>
              <p className="font-bold text-sm text-slate-100 mb-1">
                Scan QRIS Standar Bank Indonesia
              </p>
              <p className="text-xs text-slate-400 max-w-sm mb-3">
                Mendukung GoPay, OVO, DANA, ShopeePay, BCA, Livin' Mandiri, BRImo & semua dompet digital.
              </p>
              <button
                type="button"
                onClick={() => setQrisSimulatedDone(true)}
                className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 border transition ${
                  qrisSimulatedDone
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{qrisSimulatedDone ? 'Pembayaran QRIS Terverifikasi!' : 'Simulasikan QRIS Terbayar'}</span>
              </button>
            </div>
          )}

          {method === 'debit' && (
            <div className="bg-[#141726] p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-medium">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>Gesek / Tap Kartu di Mesin EDC (BCA / Mandiri / BRI / BNI)</span>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nomor Approval / Ref EDC (Opsional):</label>
                <input
                  type="text"
                  value={cardRef}
                  onChange={(e) => setCardRef(e.target.value)}
                  placeholder="Contoh: APPR-992143"
                  className="w-full px-3 py-2 bg-[#0f111c] border border-slate-700 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {method === 'transfer' && (
            <div className="bg-[#141726] p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <span className="text-slate-400 block font-medium">Rekening Resmi Dialoogi Cafee:</span>
              <div className="p-3 bg-[#0f111c] rounded-lg border border-slate-700/80 font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Bank:</span>
                  <span className="text-white font-bold">BCA (Malang Soehat)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">No. Rekening:</span>
                  <span className="text-amber-400 font-bold">816-092-4411</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Atas Nama:</span>
                  <span className="text-white">PT DIALOOGI KREASI</span>
                </div>
              </div>
            </div>
          )}

          {/* Automatic Thermal Print Checkbox */}
          <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/20 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Cetak Struk Otomatis</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-normal">
                    {settings.printerPaperWidth}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Kirim perintah cetak langsung ke printer thermal setelah transaksi selesai
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoPrint}
                onChange={(e) => setAutoPrint(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>

        {/* Footer Confirmation */}
        <div className="p-4 px-6 border-t border-slate-800 bg-[#161928] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition cursor-pointer"
          >
            Batal (Esc)
          </button>

          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={method === 'cash' && !isCashSufficient}
            className={`flex-1 py-3.5 px-6 font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
              method === 'cash' && !isCashSufficient
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                : 'bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-slate-950 shadow-amber-500/20'
            }`}
          >
            <span>Selesaikan & Bayar {formatRupiah(total)}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
