import React, { useState } from 'react';
import { Settings, Printer, Volume2, Store, Percent, Save, Check, RotateCcw } from 'lucide-react';
import { StoreSettings } from '../types/pos';
import { posSound } from '../utils/sound';

interface SettingsViewProps {
  settings: StoreSettings;
  onSaveSettings: (newSettings: StoreSettings) => void;
  onTestPrint: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onTestPrint,
}) => {
  const [form, setForm] = useState<StoreSettings>({ ...settings });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    posSound.enabled = form.soundEnabled;
    posSound.playCashChime();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#11131f] overflow-y-auto p-4 md:p-6 no-print">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <span>Pengaturan POS & Printer Thermal</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Konfigurasi ukuran kertas struk, cetak otomatis, identitas kafe, dan pajak
          </p>
        </div>

        {saved && (
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 animate-fade-in">
            <Check className="w-4 h-4" />
            <span>Pengaturan Berhasil Disimpan!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        
        {/* Thermal Printer Settings Block */}
        <div className="bg-[#1a1d2e] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Konfigurasi Printer Thermal Kasir</h3>
                <p className="text-xs text-slate-400">Pengaturan hardware printer struk (ESC/POS compatible)</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onTestPrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tes Cetak Struk</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Paper Width */}
            <div>
              <label className="block text-slate-300 font-semibold mb-2">
                Ukuran Lebar Kertas Thermal Roll:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, printerPaperWidth: '58mm' })}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    form.printerPaperWidth === '58mm'
                      ? 'bg-amber-400/15 border-amber-400 text-amber-300 shadow-md'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="font-bold block text-sm">58 mm</span>
                  <span className="text-[11px] opacity-75">32 Karakter (Standar Mini POS)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, printerPaperWidth: '80mm' })}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    form.printerPaperWidth === '80mm'
                      ? 'bg-amber-400/15 border-amber-400 text-amber-300 shadow-md'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="font-bold block text-sm">80 mm</span>
                  <span className="text-[11px] opacity-75">42 Karakter (Standar Desktop Kasir)</span>
                </button>
              </div>
            </div>

            {/* Auto Print Toggle */}
            <div className="flex flex-col justify-center">
              <label className="block text-slate-300 font-semibold mb-2">
                Otomasi Pencetakan:
              </label>
              <div className="p-3 bg-[#141624] rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">Cetak Struk Otomatis</span>
                  <span className="text-[11px] text-slate-400">
                    Buka perintah print otomatis tepat saat kasir menekan tombol Bayar
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={form.autoPrintOnPayment}
                  onChange={(e) => setForm({ ...form, autoPrintOnPayment: e.target.checked })}
                  className="w-5 h-5 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Footer Message */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Catatan Kaki Struk (Footer Message):
              </label>
              <input
                type="text"
                value={form.footerNote}
                onChange={(e) => setForm({ ...form, footerNote: e.target.value })}
                placeholder="Terima kasih atas kunjungan Anda!"
                className="w-full px-3 py-2 bg-[#141624] border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* WiFi note */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Informasi Wi-Fi di Struk:
              </label>
              <input
                type="text"
                value={form.wifiNote}
                onChange={(e) => setForm({ ...form, wifiNote: e.target.value })}
                placeholder="WiFi: Kafe_Guest | Pass: kopi123"
                className="w-full px-3 py-2 bg-[#141624] border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Cafe Identity Block */}
        <div className="bg-[#1a1d2e] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 mb-4">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Identitas Kafe / Resto</h3>
              <p className="text-xs text-slate-400">Dicetak di kop paling atas struk thermal</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Nama Usaha / Toko:</label>
              <input
                type="text"
                required
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="w-full px-3 py-2 bg-[#141624] border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Nama Cabang:</label>
              <input
                type="text"
                required
                value={form.branchName}
                onChange={(e) => setForm({ ...form, branchName: e.target.value })}
                className="w-full px-3 py-2 bg-[#141624] border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Alamat Lengkap:</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 bg-[#141624] border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Nomor Telepon:</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 bg-[#141624] border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Taxes & Sound FX Block */}
        <div className="bg-[#1a1d2e] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 mb-4">
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Tarif Pajak & Audio Kasir</h3>
              <p className="text-xs text-slate-400">Kalkulasi tagihan dan efek suara kasir</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">PPN (%):</label>
              <input
                type="number"
                min="0"
                max="30"
                value={form.taxRatePercent}
                onChange={(e) => setForm({ ...form, taxRatePercent: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-[#141624] border border-slate-700 rounded-xl text-white font-mono text-sm font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Service Charge (%):</label>
              <input
                type="number"
                min="0"
                max="30"
                value={form.serviceChargePercent}
                onChange={(e) => setForm({ ...form, serviceChargePercent: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-[#141624] border border-slate-700 rounded-xl text-white font-mono text-sm font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="p-2.5 bg-[#141624] border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer">
                <span className="text-slate-300 font-semibold">Suara Kasir (Audio FX)</span>
                <input
                  type="checkbox"
                  checked={form.soundEnabled}
                  onChange={(e) => setForm({ ...form, soundEnabled: e.target.checked })}
                  className="w-4 h-4 accent-amber-400 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-3 bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-400/20 flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Semua Perubahan</span>
          </button>
        </div>
      </form>
    </div>
  );
};
