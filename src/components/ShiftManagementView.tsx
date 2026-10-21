import React, { useState } from 'react';
import { Users, Lock, Unlock, Printer, DollarSign, CreditCard, ArrowDownRight, Clock } from 'lucide-react';
import { Shift, StoreSettings, Order } from '../types/pos';
import { formatRupiah, formatDateTime } from '../utils/format';
import { posSound } from '../utils/sound';

interface ShiftManagementViewProps {
  shift: Shift;
  orders: Order[];
  settings: StoreSettings;
  onCloseShift: (actualCash: number, notes: string) => void;
  onOpenNewShift: (startCash: number, cashierName: string) => void;
}

export const ShiftManagementView: React.FC<ShiftManagementViewProps> = ({
  shift,
  orders,
  settings,
  onCloseShift,
  onOpenNewShift,
}) => {
  const [actualCashInput, setActualCashInput] = useState<number>(shift.expectedCash);
  const [shiftNotes, setShiftNotes] = useState('');
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [newCashierName, setNewCashierName] = useState('Putri Melati');
  const [newStartCash, setNewStartCash] = useState(300000);

  // Shift financial calculations
  const shiftOrders = orders.filter((o) => new Date(o.createdAt) >= new Date(shift.openedAt));
  const cashSales = shiftOrders
    .filter((o) => o.paymentMethod === 'cash')
    .reduce((sum, o) => sum + o.total, 0);
  const nonCashSales = shiftOrders
    .filter((o) => o.paymentMethod !== 'cash')
    .reduce((sum, o) => sum + o.total, 0);
  const totalSales = cashSales + nonCashSales;
  const expectedCashInDrawer = shift.startCash + cashSales;
  const diff = actualCashInput - expectedCashInDrawer;

  const handlePrintShiftReport = () => {
    posSound.playClick();
    // Print window
    window.print();
  };

  const handleConfirmClose = () => {
    posSound.playCashChime();
    onCloseShift(actualCashInput, shiftNotes);
    setShowCloseModal(false);
  };

  const handleConfirmOpen = () => {
    posSound.playClick();
    onOpenNewShift(newStartCash, newCashierName);
    setShowOpenModal(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#11131f] overflow-y-auto p-4 md:p-6 no-print">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>Manajemen Shift & Rekap Kasir</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitoring kas laci kasir, serah terima modal, dan rekapitulasi penjualan per shift
          </p>
        </div>

        <div className="flex items-center gap-2">
          {shift.status === 'open' ? (
            <button
              onClick={() => {
                setActualCashInput(expectedCashInDrawer);
                setShowCloseModal(true);
              }}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Tutup Shift Kasir (End Cashier)</span>
            </button>
          ) : (
            <button
              onClick={() => setShowOpenModal(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Unlock className="w-4 h-4" />
              <span>Buka Shift Baru</span>
            </button>
          )}

          <button
            onClick={handlePrintShiftReport}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            title="Cetak Ringkasan Shift ke Printer Thermal"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Cetak Rekap Shift</span>
          </button>
        </div>
      </div>

      {/* Shift Status Banner */}
      <div className="bg-[#1a1d2e] border border-slate-800 p-5 rounded-2xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-400 text-slate-950">
              Shift ID: #{shift.id}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
              shift.status === 'open' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
            }`}>
              {shift.status === 'open' ? '● Sedang Berjalan' : 'Telah Ditutup'}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white">Kasir: {shift.cashierName}</h3>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Dibuka sejak: {formatDateTime(shift.openedAt)}</span>
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#141624] p-3 rounded-xl border border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Modal Awal Kas</span>
            <span className="text-base font-extrabold text-white font-mono">{formatRupiah(shift.startCash)}</span>
          </div>
          <div className="w-[1px] h-8 bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Transaksi</span>
            <span className="text-base font-extrabold text-amber-400 font-mono">{shiftOrders.length} Order</span>
          </div>
        </div>
      </div>

      {/* Financial Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1a1d2e] border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Penjualan Tunai (Cash)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            {formatRupiah(cashSales)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Uang fisik yang masuk ke kasir</p>
        </div>

        <div className="bg-[#1a1d2e] border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Non-Tunai (QRIS/Debit)</span>
            <CreditCard className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-400 font-mono">
            {formatRupiah(nonCashSales)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Masuk langsung ke rekening resto</p>
        </div>

        <div className="bg-[#1a1d2e] border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Ekspektasi Uang Fisik di Laci</span>
            <ArrowDownRight className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            {formatRupiah(expectedCashInDrawer)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Modal awal + penjualan tunai</p>
        </div>
      </div>

      {/* Close Shift Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#1c2033] border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Tutup Shift Kasir (End Cashier)</h3>
            <p className="text-xs text-slate-400">
              Hitung uang fisik yang ada di laci kasir sekarang dan masukkan nominalnya untuk verifikasi
            </p>

            <div className="p-3 bg-[#121422] rounded-xl border border-slate-800 text-xs space-y-1 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Modal Awal Kas:</span>
                <span>{formatRupiah(shift.startCash)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Penjualan Tunai:</span>
                <span className="text-emerald-400">+{formatRupiah(cashSales)}</span>
              </div>
              <div className="flex justify-between text-slate-200 font-bold border-t border-slate-800 pt-1">
                <span>Ekspektasi Uang di Laci:</span>
                <span className="text-amber-400">{formatRupiah(expectedCashInDrawer)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">
                Uang Fisik Aktual di Laci (Rp):
              </label>
              <input
                type="number"
                value={actualCashInput}
                onChange={(e) => setActualCashInput(Number(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-[#121422] border border-slate-700 rounded-xl text-white font-mono text-base font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className={`p-3 rounded-xl border text-xs flex justify-between items-center ${
              diff === 0
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : diff > 0
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}>
              <span className="font-semibold">Selisih Kas:</span>
              <span className="font-mono font-bold text-sm">
                {diff === 0 ? 'Cocok (Rp0)' : diff > 0 ? `Lebih: +${formatRupiah(diff)}` : `Kurang: ${formatRupiah(diff)}`}
              </span>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Catatan Serah Terima / Shift:</label>
              <textarea
                rows={2}
                value={shiftNotes}
                onChange={(e) => setShiftNotes(e.target.value)}
                placeholder="Catatan untuk shift selanjutnya..."
                className="w-full p-2 bg-[#121422] border border-slate-700 rounded-xl text-white text-xs resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowCloseModal(false)}
                className="px-3.5 py-2 text-xs text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmClose}
                className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
              >
                Tutup Shift & Kunci Kasir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Open New Shift Modal */}
      {showOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#1c2033] border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Buka Shift Kasir Baru</h3>
            <p className="text-xs text-slate-400">Masukkan nama kasir yang bertugas dan modal awal uang kembalian</p>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Nama Kasir Bertugas:</label>
              <input
                type="text"
                value={newCashierName}
                onChange={(e) => setNewCashierName(e.target.value)}
                className="w-full px-3 py-2 bg-[#121422] border border-slate-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Modal Awal Kas (Kembalian):</label>
              <input
                type="number"
                value={newStartCash}
                onChange={(e) => setNewStartCash(Number(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-[#121422] border border-slate-700 rounded-xl text-white font-mono text-base font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowOpenModal(false)}
                className="px-3.5 py-2 text-xs text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmOpen}
                className="px-5 py-2.5 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer"
              >
                Mulai Shift Kasir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
