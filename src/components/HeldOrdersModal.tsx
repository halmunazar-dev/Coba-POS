import React from 'react';
import { ShoppingBag, ArrowUpRight, Trash2, X, Clock, Coffee } from 'lucide-react';
import { Order } from '../types/pos';
import { formatRupiah, formatDateTime } from '../utils/format';
import { posSound } from '../utils/sound';

interface HeldOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  heldOrders: Order[];
  onRestoreOrder: (order: Order) => void;
  onDeleteHeldOrder: (orderId: string) => void;
}

export const HeldOrdersModal: React.FC<HeldOrdersModalProps> = ({
  isOpen,
  onClose,
  heldOrders,
  onRestoreOrder,
  onDeleteHeldOrder,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in no-print">
      <div className="relative w-full max-w-xl bg-[#1c2033] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#161928]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Tagihan Tertahan (Held Orders)</h3>
              <p className="text-xs text-slate-400">{heldOrders.length} antrean pesanan tersimpan</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Held Orders */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {heldOrders.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-center text-slate-500">
              <Coffee className="w-8 h-8 mb-2 text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">Tidak ada tagihan tertahan</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Gunakan tombol simpan (biru) di samping tombol Bayar untuk menahan pesanan pelanggan
              </p>
            </div>
          ) : (
            heldOrders.map((order) => (
              <div
                key={order.id}
                className="bg-[#141624] border border-slate-800 hover:border-slate-700 p-4 rounded-xl flex items-center justify-between transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      #{order.orderNumber}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase font-semibold">
                      {order.type.replace('_', ' ')}
                    </span>
                    {order.tableNumber && (
                      <span className="text-xs text-slate-400 font-medium">Meja: {order.tableNumber}</span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white mt-1">
                    {order.customerName}
                  </h4>

                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>{order.items.reduce((s, i) => s + i.quantity, 0)} item menu</span>
                    <span>·</span>
                    <span className="font-mono text-amber-300 font-bold">{formatRupiah(order.total)}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(order.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      posSound.playClick();
                      onRestoreOrder(order);
                    }}
                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 shadow cursor-pointer"
                  >
                    <span>Lanjutkan</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      posSound.playClick();
                      onDeleteHeldOrder(order.id);
                    }}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                    title="Batalkan Pesanan Ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
