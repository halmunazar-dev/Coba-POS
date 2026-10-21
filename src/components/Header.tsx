import React from 'react';
import {
  Bell,
  Volume2,
  VolumeX,
  Maximize2,
  ShoppingBag,
  Clock,
  Printer,
} from 'lucide-react';
import { StoreSettings } from '../types/pos';
import { posSound } from '../utils/sound';

interface HeaderProps {
  settings: StoreSettings;
  cashierName: string;
  heldOrdersCount: number;
  onOpenHeldOrders: () => void;
  onToggleSound: () => void;
  soundEnabled: boolean;
  onQuickPrinterTest: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  cashierName,
  heldOrdersCount,
  onOpenHeldOrders,
  onToggleSound,
  soundEnabled,
  onQuickPrinterTest,
}) => {
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const cashierInitials = cashierName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-16 bg-[#161826] border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between shrink-0 select-none no-print">
      
      {/* Brand Title and Branch */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-base md:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>{settings.storeName}</span>
          </h1>
          <p className="text-[11px] text-amber-400 font-medium tracking-wide">
            {settings.branchName}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Thermal Printer Quick Status & Test */}
        <button
          type="button"
          onClick={() => {
            posSound.playClick();
            onQuickPrinterTest();
          }}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 text-xs border border-slate-700/60 transition cursor-pointer"
          title="Status Printer Thermal & Tes Cetak"
        >
          <Printer className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono text-[11px] text-slate-300">
            {settings.printerPaperWidth} Ready
          </span>
        </button>

        {/* Held Orders (Pending Bills) */}
        <button
          type="button"
          onClick={() => {
            posSound.playClick();
            onOpenHeldOrders();
          }}
          className="relative p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
          title="Daftar Tagihan Tertahan (Held Orders)"
        >
          <ShoppingBag className="w-4 h-4" />
          {heldOrdersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center justify-center shadow">
              {heldOrdersCount}
            </span>
          )}
        </button>

        {/* Sound Toggle */}
        <button
          type="button"
          onClick={onToggleSound}
          className={`p-2 rounded-xl border transition cursor-pointer ${
            soundEnabled
              ? 'bg-slate-800/60 border-slate-700/60 text-amber-400 hover:text-amber-300'
              : 'bg-slate-850 border-slate-800 text-slate-500 hover:text-slate-400'
          }`}
          title={soundEnabled ? 'Suara Kasir Aktif' : 'Suara Kasir Hening'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Fullscreen toggle for POS kiosks */}
        <button
          type="button"
          onClick={toggleFullScreen}
          className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer hidden md:flex"
          title="Layar Penuh (Kiosk Mode)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Cashier Avatar Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center shadow-md shadow-amber-400/20">
            {cashierInitials}
          </div>
          <div className="hidden lg:block text-left">
            <span className="text-xs font-semibold text-slate-200 block leading-tight">
              {cashierName}
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Kasir Aktif
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
