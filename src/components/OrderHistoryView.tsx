import React, { useState } from 'react';
import { History, Search, Printer, Eye, Calendar, ArrowUpDown, CheckCircle, Tag } from 'lucide-react';
import { Order, StoreSettings } from '../types/pos';
import { formatRupiah, formatDateTime } from '../utils/format';
import { posSound } from '../utils/sound';

interface OrderHistoryViewProps {
  orders: Order[];
  settings: StoreSettings;
  onReprintReceipt: (order: Order) => void;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({
  orders,
  settings,
  onReprintReceipt,
}) => {
  const [search, setSearch] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      !search ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (o.tableNumber && o.tableNumber.toLowerCase().includes(search.toLowerCase()));

    const matchMethod = filterMethod === 'all' || o.paymentMethod === filterMethod;
    return matchSearch && matchMethod;
  });

  const totalRevenue = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);

  const handlePrintClick = (order: Order) => {
    posSound.playClick();
    onReprintReceipt(order);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#11131f] overflow-y-auto p-4 md:p-6 no-print">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <span>Riwayat Transaksi Kasir</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftar penjualan, detail struk belanja, dan cetak ulang thermal receipt
          </p>
        </div>

        <div className="bg-[#1a1d2e] border border-slate-800 px-4 py-2.5 rounded-xl flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">Total Omzet:</span>
          <span className="text-base font-extrabold text-amber-400 font-mono">
            {formatRupiah(totalRevenue)}
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['all', 'cash', 'qris', 'debit', 'transfer'].map((m) => (
            <button
              key={m}
              onClick={() => {
                posSound.playClick();
                setFilterMethod(m);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                filterMethod === m
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {m === 'all' ? 'Semua Metode' : m.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari No. Order / Pelanggan..."
            className="w-full pl-9 pr-3 py-2 bg-[#1a1d2e] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#1a1d2e] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141624] text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5 pl-4">No. Order</th>
                <th className="p-3.5">Waktu</th>
                <th className="p-3.5">Tipe / Meja</th>
                <th className="p-3.5">Pelanggan</th>
                <th className="p-3.5">Menu Dipesan</th>
                <th className="p-3.5">Metode</th>
                <th className="p-3.5">Total Bayar</th>
                <th className="p-3.5 text-right pr-4">Aksi Struk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Belum ada riwayat transaksi yang cocok
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-850/50 transition">
                    <td className="p-3.5 pl-4 font-mono font-bold text-amber-300">
                      #{order.orderNumber}
                    </td>
                    <td className="p-3.5 text-slate-400 whitespace-nowrap">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-200 uppercase text-[11px] block">
                        {order.type.replace('_', ' ')}
                      </span>
                      {order.tableNumber && (
                        <span className="text-[10px] text-slate-400">Meja: {order.tableNumber}</span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-200 font-medium">
                      {order.customerName}
                    </td>
                    <td className="p-3.5 text-slate-300">
                      <span className="font-semibold">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} item
                      </span>
                      <span className="block text-[10px] text-slate-500 truncate max-w-[200px]">
                        {order.items.map((i) => `${i.product.name} (${i.quantity})`).join(', ')}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-[10px] font-bold uppercase font-mono">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-extrabold text-amber-400">
                      {formatRupiah(order.total)}
                    </td>
                    <td className="p-3.5 text-right pr-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          title="Lihat Detail Pesanan"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handlePrintClick(order)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-xs border border-emerald-500/40 flex items-center gap-1.5 transition cursor-pointer"
                          title="Cetak Ulang Struk Thermal"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Cetak Struk</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail View Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#1c2033] border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Detail Pesanan #{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-slate-400">{formatDateTime(selectedOrder.createdAt)} · Kasir: {selectedOrder.cashierName}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Pelanggan:</span>
                <span className="font-bold text-white">{selectedOrder.customerName}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Tipe Pesanan:</span>
                <span className="uppercase font-semibold">{selectedOrder.type.replace('_', ' ')}</span>
              </div>
              {selectedOrder.tableNumber && (
                <div className="flex justify-between text-slate-300">
                  <span>Nomor Meja:</span>
                  <span>{selectedOrder.tableNumber}</span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="bg-[#141624] p-3 rounded-xl border border-slate-800 space-y-2 max-h-48 overflow-y-auto">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs py-1 border-b border-slate-800/60 last:border-0">
                  <div>
                    <span className="font-semibold text-white">{item.product.name}</span>
                    <span className="text-slate-400 text-[11px] block">{item.quantity} x {formatRupiah(item.product.price)}</span>
                    {item.notes && <span className="text-[10px] text-amber-300/80 italic">*{item.notes}</span>}
                  </div>
                  <span className="font-mono text-amber-300 font-bold">
                    {formatRupiah(item.quantity * item.product.price)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-1 text-xs border-t border-slate-800 pt-2 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span>{formatRupiah(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-red-400">
                  <span>Diskon:</span>
                  <span>-{formatRupiah(selectedOrder.discount)}</span>
                </div>
              )}
              {selectedOrder.tax > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>PPN ({settings.taxRatePercent}%):</span>
                  <span>{formatRupiah(selectedOrder.tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-amber-400 pt-1 border-t border-slate-800">
                <span>Total:</span>
                <span>{formatRupiah(selectedOrder.total)}</span>
              </div>
              <div className="flex justify-between text-slate-300 pt-1">
                <span>Bayar ({selectedOrder.paymentMethod.toUpperCase()}):</span>
                <span>{formatRupiah(selectedOrder.amountPaid)}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Kembali:</span>
                <span>{formatRupiah(selectedOrder.change)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  handlePrintClick(selectedOrder);
                }}
                className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Struk Thermal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
