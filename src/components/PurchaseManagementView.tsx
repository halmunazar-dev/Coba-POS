import React, { useState } from 'react';
import { ShoppingBag, Plus, Search, Calendar, Building, PackageCheck, TrendingDown } from 'lucide-react';
import { Product, PurchaseItem } from '../types/pos';
import { formatRupiah, formatDateTime } from '../utils/format';
import { posSound } from '../utils/sound';

interface PurchaseManagementViewProps {
  products: Product[];
  onRestock: (productId: string, quantityAdded: number, costPerUnit: number, supplier: string) => void;
}

export const PurchaseManagementView: React.FC<PurchaseManagementViewProps> = ({
  products,
  onRestock,
}) => {
  const [purchases, setPurchases] = useState<PurchaseItem[]>([
    {
      id: 'po-01',
      productId: 'prod-1',
      productName: 'Owha & Starch (Daging Pilihan)',
      supplierName: 'PT Sumber Daging Segar Malang',
      quantity: 50,
      costPerUnit: 8500,
      totalCost: 425000,
      date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      notes: 'Pengiriman batch pagi - suhu beku standar',
    },
    {
      id: 'po-02',
      productId: 'prod-6',
      productName: 'Biji Kopi Dialoogi Espresso Blend',
      supplierName: 'Koperasi Kopi Dampit Mandiri',
      quantity: 30,
      costPerUnit: 5500,
      totalCost: 165000,
      date: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      notes: 'Roast date: 3 hari lalu',
    },
    {
      id: 'po-03',
      productId: 'prod-9',
      productName: 'Matcha Powder Ceremonial Uji',
      supplierName: 'CV Kyoto Supply Pratama',
      quantity: 20,
      costPerUnit: 7800,
      totalCost: 156000,
      date: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
      notes: 'Kemasan kaleng vacuum 1kg',
    },
  ]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(20);
  const [costPerUnit, setCostPerUnit] = useState(8000);
  const [supplierName, setSupplierName] = useState('');
  const [notes, setNotes] = useState('');

  const totalSpent = purchases.reduce((sum, p) => sum + p.totalCost, 0);

  const handleOpenRestock = () => {
    const prod = products.find((p) => p.id === selectedProductId) || products[0];
    if (prod) {
      setCostPerUnit(prod.costPrice);
    }
    setIsAddOpen(true);
  };

  const handleProductSelect = (id: string) => {
    setSelectedProductId(id);
    const prod = products.find((p) => p.id === id);
    if (prod) {
      setCostPerUnit(prod.costPrice);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod || quantity <= 0) return;

    const newPO: PurchaseItem = {
      id: `po-${Date.now().toString().slice(-4)}`,
      productId: prod.id,
      productName: prod.name,
      supplierName: supplierName || 'Supplier Gudang Utama',
      quantity,
      costPerUnit,
      totalCost: quantity * costPerUnit,
      date: new Date().toISOString(),
      notes,
    };

    setPurchases([newPO, ...purchases]);
    onRestock(prod.id, quantity, costPerUnit, supplierName);
    posSound.playClick();
    setIsAddOpen(false);
    setSupplierName('');
    setNotes('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#11131f] overflow-y-auto p-4 md:p-6 no-print">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <span>Manajemen Pembelian & Warehouse Restock</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pencatatan barang masuk dari supplier & sinkronisasi otomatis ke inventaris dapur
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenRestock}
          className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-400/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Input Restock Gudang</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1a1d2e] border border-slate-800 p-4 rounded-2xl">
          <span className="text-slate-400 text-xs block font-medium">Total Biaya Pembelian</span>
          <span className="text-xl font-extrabold text-amber-400 font-mono mt-1 block">
            {formatRupiah(totalSpent)}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Pengeluaran bahan baku</span>
        </div>

        <div className="bg-[#1a1d2e] border border-slate-800 p-4 rounded-2xl">
          <span className="text-slate-400 text-xs block font-medium">Jumlah Transaksi Masuk</span>
          <span className="text-xl font-extrabold text-white font-mono mt-1 block">
            {purchases.length} Purchase Orders
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Tercatat di sistem backoffice</span>
        </div>

        <div className="bg-[#1a1d2e] border border-slate-800 p-4 rounded-2xl">
          <span className="text-slate-400 text-xs block font-medium">Status Gudang Kafe</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-sm font-bold text-emerald-300">Tersinkronisasi 100%</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Realtime terhubung ke kasir</span>
        </div>
      </div>

      {/* Purchase Table */}
      <div className="bg-[#1a1d2e] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200">Riwayat Pengadaan Bahan (Purchase History)</h3>
          <span className="text-xs text-slate-500 font-mono">{purchases.length} Dokumen</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141624] text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5 pl-4">No. PO</th>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">Nama Bahan / Menu</th>
                <th className="p-3.5">Supplier</th>
                <th className="p-3.5">Jumlah Masuk</th>
                <th className="p-3.5">Harga Beli (Satuan)</th>
                <th className="p-3.5 text-right pr-4">Total Biaya</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {purchases.map((p) => (
                <tr key={p.id} className="hover:bg-slate-850/50 transition">
                  <td className="p-3.5 pl-4 font-mono font-bold text-slate-200">
                    #{p.id}
                  </td>
                  <td className="p-3.5 text-slate-400">
                    {formatDateTime(p.date)}
                  </td>
                  <td className="p-3.5 font-semibold text-slate-100">
                    {p.productName}
                    {p.notes && <span className="block text-[10px] text-slate-500 font-normal">{p.notes}</span>}
                  </td>
                  <td className="p-3.5 text-slate-300">
                    {p.supplierName}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-emerald-400">
                    +{p.quantity} porsi
                  </td>
                  <td className="p-3.5 font-mono text-slate-300">
                    {formatRupiah(p.costPerUnit)}
                  </td>
                  <td className="p-3.5 text-right pr-4 font-mono font-bold text-amber-400">
                    {formatRupiah(p.totalCost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Dialog */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#1c2033] border border-slate-700 rounded-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-white text-base mb-1">Input Penerimaan Barang (Restock)</h3>
            <p className="text-xs text-slate-400 mb-4">Stok menu akan otomatis bertambah di kasir</p>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Pilih Menu / Produk:</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121422] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stok sekarang: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Nama Supplier / Vendor:</label>
                <input
                  type="text"
                  required
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="Contoh: PT Sumber Pangan Nusantara"
                  className="w-full px-3 py-2 bg-[#121422] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Jumlah Masuk:</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#121422] border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Biaya per Satuan (HPP):</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#121422] border border-slate-700 rounded-xl text-white font-mono text-amber-400 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#121422] rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Total Tagihan Restock:</span>
                <span className="text-sm font-bold text-amber-400 font-mono">
                  {formatRupiah(quantity * costPerUnit)}
                </span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Catatan / No. Surat Jalan:</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Surat Jalan #SJ-291, diterima dalam kondisi baik"
                  className="w-full px-3 py-2 bg-[#121422] border border-slate-700 rounded-xl text-white text-xs resize-none focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-400 text-slate-950 font-bold rounded-xl shadow cursor-pointer"
                >
                  Simpan & Tambah Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
