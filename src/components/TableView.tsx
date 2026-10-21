import React, { useState } from 'react';
import { LayoutGrid, Users, CheckCircle2, Clock, Coffee, Plus } from 'lucide-react';
import { Table } from '../types/pos';
import { posSound } from '../utils/sound';

interface TableViewProps {
  tables: Table[];
  onSelectTable: (tableName: string) => void;
  onUpdateTableStatus: (tableId: string, status: 'available' | 'occupied' | 'reserved') => void;
}

export const TableView: React.FC<TableViewProps> = ({
  tables,
  onSelectTable,
  onUpdateTableStatus,
}) => {
  const [selectedArea, setSelectedArea] = useState<string>('Semua');

  const areas = ['Semua', 'Indoor', 'Outdoor', 'VIP', 'Bar'];

  const filteredTables = selectedArea === 'Semua'
    ? tables
    : tables.filter((t) => t.area === selectedArea);

  const availableCount = tables.filter((t) => t.status === 'available').length;
  const occupiedCount = tables.filter((t) => t.status === 'occupied').length;
  const reservedCount = tables.filter((t) => t.status === 'reserved').length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#11131f] overflow-y-auto p-4 md:p-6 no-print">
      
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-amber-400" />
            <span>Manajemen Meja Kafe (Table Layout)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola meja aktif, reservasi pelanggan, dan assign pesanan langsung ke meja
          </p>
        </div>

        {/* Status count pills */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Kosong ({availableCount})</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Terisi ({occupiedCount})</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Reservasi ({reservedCount})</span>
          </div>
        </div>
      </div>

      {/* Area Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {areas.map((area) => (
          <button
            key={area}
            onClick={() => {
              posSound.playClick();
              setSelectedArea(area);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              selectedArea === area
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
            }`}
          >
            {area}
          </button>
        ))}
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
        {filteredTables.map((t) => {
          const isOccupied = t.status === 'occupied';
          const isReserved = t.status === 'reserved';
          const isAvailable = t.status === 'available';

          return (
            <div
              key={t.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                isOccupied
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                  : isReserved
                  ? 'bg-purple-500/10 border-purple-500/40 text-purple-200'
                  : 'bg-[#1a1d2e] border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-black/40 text-slate-400">
                    {t.area}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{t.capacity}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-1">{t.name}</h3>

                <div className="text-xs mb-3">
                  {isOccupied && (
                    <div className="text-amber-300 font-medium">
                      <span>Order: {t.currentOrderId || '#Aktif'}</span>
                      {t.customerName && <div className="text-[10px] text-amber-400/80">({t.customerName})</div>}
                    </div>
                  )}
                  {isReserved && (
                    <div className="text-purple-300 text-[11px] font-medium">
                      <span>{t.customerName || 'Dipesan'}</span>
                    </div>
                  )}
                  {isAvailable && (
                    <span className="text-emerald-400 font-medium text-[11px]">Siap Digunakan</span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => {
                    posSound.playClick();
                    onSelectTable(t.name);
                  }}
                  className="w-full py-1.5 px-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition"
                >
                  Pilih Meja Ini
                </button>

                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  {isAvailable ? (
                    <button
                      onClick={() => onUpdateTableStatus(t.id, 'occupied')}
                      className="py-1 px-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300"
                    >
                      Tandai Terisi
                    </button>
                  ) : (
                    <button
                      onClick={() => onUpdateTableStatus(t.id, 'available')}
                      className="py-1 px-1.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                    >
                      Kosongkan
                    </button>
                  )}

                  <button
                    onClick={() => onUpdateTableStatus(t.id, isReserved ? 'available' : 'reserved')}
                    className="py-1 px-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300"
                  >
                    {isReserved ? 'Batal Resv' : 'Reservasi'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
