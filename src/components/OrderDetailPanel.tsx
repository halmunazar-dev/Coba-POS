import React, { useState } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  Printer,
  Bookmark,
  ChevronRight,
  User,
  Coffee,
  Percent,
  FileEdit,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { CartItem, OrderType, StoreSettings } from '../types/pos';
import { formatRupiah } from '../utils/format';
import { posSound } from '../utils/sound';

interface OrderDetailPanelProps {
  orderNumber: string;
  cart: CartItem[];
  orderType: OrderType;
  customerName: string;
  tableNumber: string;
  discount: number;
  discountPercent: number;
  settings: StoreSettings;
  onUpdateCartItemQty: (productId: string, delta: number) => void;
  onRemoveCartItem: (productId: string) => void;
  onUpdateCartItemNotes: (productId: string, notes: string) => void;
  onClearCart: () => void;
  onChangeOrderType: (type: OrderType) => void;
  onChangeCustomerName: (name: string) => void;
  onChangeTableNumber: (table: string) => void;
  onApplyDiscount: (percent: number, nominal: number) => void;
  onHoldOrder: () => void;
  onOpenReceiptPreview: () => void;
  onOpenPaymentModal: () => void;
}

export const OrderDetailPanel: React.FC<OrderDetailPanelProps> = ({
  orderNumber,
  cart,
  orderType,
  customerName,
  tableNumber,
  discount,
  discountPercent,
  settings,
  onUpdateCartItemQty,
  onRemoveCartItem,
  onUpdateCartItemNotes,
  onClearCart,
  onChangeOrderType,
  onChangeCustomerName,
  onChangeTableNumber,
  onApplyDiscount,
  onHoldOrder,
  onOpenReceiptPreview,
  onOpenPaymentModal,
}) => {
  const [editingItemNotes, setEditingItemNotes] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [tempCustomerName, setTempCustomerName] = useState(customerName);
  const [tempTable, setTempTable] = useState(tableNumber);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [tempDiscountPercent, setTempDiscountPercent] = useState(discountPercent);

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = discount > 0 ? discount : (subtotal * discountPercent) / 100;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const tax = Math.round((taxableSubtotal * settings.taxRatePercent) / 100);
  const serviceCharge = Math.round((taxableSubtotal * settings.serviceChargePercent) / 100);
  const total = taxableSubtotal + tax + serviceCharge;

  const handleNotesSave = (productId: string) => {
    onUpdateCartItemNotes(productId, tempNotes);
    setEditingItemNotes(null);
    setTempNotes('');
  };

  const handleSaveCustomerInfo = () => {
    onChangeCustomerName(tempCustomerName || 'Pelanggan');
    onChangeTableNumber(tempTable);
    setShowCustomerModal(false);
  };

  const handleSaveDiscount = () => {
    onApplyDiscount(tempDiscountPercent, 0);
    setShowDiscountModal(false);
  };

  return (
    <aside className="w-full lg:w-[380px] xl:w-[420px] bg-[#1a1d2e] border-l border-slate-800/80 flex flex-col h-full shrink-0 select-none no-print">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-800/70 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>Order Detail</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">
            #{orderNumber}
          </span>
        </div>

        {cart.length > 0 && (
          <button
            type="button"
            onClick={() => {
              posSound.playClick();
              onClearCart();
            }}
            className="px-3 py-1 bg-red-500/15 hover:bg-red-500/25 text-red-400 hover:text-red-300 text-xs font-semibold rounded-lg transition-all border border-red-500/30 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Order Type Toggle (Dine In | Take Away | Ojol) */}
      <div className="p-3 border-b border-slate-800/60 bg-[#161826]">
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#10121d] rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              posSound.playClick();
              onChangeOrderType('dine_in');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
              orderType === 'dine_in'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dine In
          </button>
          <button
            type="button"
            onClick={() => {
              posSound.playClick();
              onChangeOrderType('take_away');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
              orderType === 'take_away'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Take Away
          </button>
          <button
            type="button"
            onClick={() => {
              posSound.playClick();
              onChangeOrderType('ojol');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
              orderType === 'ojol'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ojol
          </button>
        </div>

        {/* Customer & Table Selector Bar */}
        <div className="grid grid-cols-2 gap-2 mt-2.5">
          <button
            type="button"
            onClick={() => {
              setTempCustomerName(customerName);
              setTempTable(tableNumber);
              setShowCustomerModal(true);
            }}
            className="flex items-center justify-between p-2.5 bg-[#1c2033] hover:bg-[#22273d] border border-slate-800 rounded-xl text-left transition cursor-pointer"
          >
            <div className="truncate pr-1">
              <span className="block text-[10px] text-slate-400 uppercase font-medium">Pelanggan</span>
              <span className="text-xs font-semibold text-slate-200 truncate block">
                {customerName || 'Umum'}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => {
              setTempCustomerName(customerName);
              setTempTable(tableNumber);
              setShowCustomerModal(true);
            }}
            className="flex items-center justify-between p-2.5 bg-[#1c2033] hover:bg-[#22273d] border border-slate-800 rounded-xl text-left transition cursor-pointer"
          >
            <div className="truncate pr-1">
              <span className="block text-[10px] text-slate-400 uppercase font-medium">Meja / Tag</span>
              <span className="text-xs font-semibold text-slate-200 truncate block">
                {tableNumber || (orderType === 'dine_in' ? 'Pilih Meja' : 'Buzzer/Tag')}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
          </button>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[160px]">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
          List Order ({cart.reduce((c, i) => c + i.quantity, 0)})
        </div>

        {cart.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center p-4 text-slate-500 border border-dashed border-slate-800/80 rounded-2xl">
            <Coffee className="w-8 h-8 mb-2 text-slate-600" />
            <p className="text-xs font-medium text-slate-400">Belum ada pesanan</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Pilih menu dari katalog untuk menambahkan item</p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.product.id}
              className="bg-[#151724] border border-slate-800/80 rounded-xl p-3 hover:border-slate-700/80 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-slate-100 truncate">
                    {item.product.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-amber-400 font-mono">
                      {formatRupiah(item.product.price)}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Total: {formatRupiah(item.product.price * item.quantity)}
                    </span>
                  </div>

                  {item.notes ? (
                    <div className="mt-1 text-[10px] text-amber-300/80 bg-amber-400/10 px-2 py-0.5 rounded flex items-center justify-between">
                      <span className="truncate italic">Catatan: {item.notes}</span>
                      <button
                        onClick={() => {
                          setEditingItemNotes(item.product.id);
                          setTempNotes(item.notes || '');
                        }}
                        className="text-amber-400 hover:underline shrink-0 ml-1"
                      >
                        Ubah
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingItemNotes(item.product.id);
                        setTempNotes('');
                      }}
                      className="mt-1 text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                    >
                      <FileEdit className="w-2.5 h-2.5" />
                      <span>+ Tambah catatan</span>
                    </button>
                  )}
                </div>

                {/* Stepper with Emerald (+) button matching Dialoogi POS reference */}
                <div className="flex items-center gap-1.5 shrink-0 bg-[#0f111c] p-1 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      posSound.playClick();
                      onUpdateCartItemQty(item.product.id, -1);
                    }}
                    className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-6 text-center text-xs font-bold text-white font-mono">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      posSound.playBeep();
                      onUpdateCartItemQty(item.product.id, 1);
                    }}
                    className="w-6 h-6 rounded-md bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 flex items-center justify-center transition shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Section */}
      <div className="border-t border-slate-800 bg-[#161826] p-3.5 space-y-2">
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal</span>
            <span className="font-mono text-slate-200">{formatRupiah(subtotal)}</span>
          </div>

          <div className="flex justify-between text-slate-400 items-center">
            <button
              onClick={() => setShowDiscountModal(true)}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1"
            >
              <Tag className="w-3 h-3" />
              <span>Discount {discountPercent > 0 ? `(${discountPercent}%)` : ''}</span>
            </button>
            <span className="font-mono text-red-400">
              {discountAmount > 0 ? `-${formatRupiah(discountAmount)}` : 'Rp0'}
            </span>
          </div>

          <div className="flex justify-between text-slate-400">
            <span>PPN ({settings.taxRatePercent}%)</span>
            <span className="font-mono text-slate-200">{formatRupiah(tax)}</span>
          </div>

          {settings.serviceChargePercent > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Service Charge ({settings.serviceChargePercent}%)</span>
              <span className="font-mono text-slate-200">{formatRupiah(serviceCharge)}</span>
            </div>
          )}
        </div>

        {/* Total Grand */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Total</span>
          <span className="text-xl xl:text-2xl font-extrabold text-amber-400 font-mono tracking-tight">
            {formatRupiah(total)}
          </span>
        </div>

        {/* Action Buttons: Green Print, Blue Hold, Yellow Pay */}
        <div className="grid grid-cols-12 gap-2 pt-1">
          {/* Green Thermal Receipt button */}
          <button
            type="button"
            title="Pratinjau / Cetak Struk Belanja Thermal"
            disabled={cart.length === 0}
            onClick={() => {
              posSound.playClick();
              onOpenReceiptPreview();
            }}
            className="col-span-3 py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Printer className="w-5 h-5" />
          </button>

          {/* Blue Hold / Save Order button */}
          <button
            type="button"
            title="Simpan Bill / Tahan Pesanan (Hold Order)"
            disabled={cart.length === 0}
            onClick={() => {
              posSound.playClick();
              onHoldOrder();
            }}
            className="col-span-3 py-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/40 flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Bookmark className="w-5 h-5" />
          </button>

          {/* Yellow Bayar Primary Button */}
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={() => {
              posSound.playClick();
              onOpenPaymentModal();
            }}
            className="col-span-6 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-slate-950 font-extrabold text-sm tracking-wide shadow-lg shadow-amber-400/20 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Bayar</span>
          </button>
        </div>
      </div>

      {/* Item Notes Modal */}
      {editingItemNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#1c2033] border border-slate-700 rounded-2xl p-5 w-full max-w-sm">
            <h3 className="text-sm font-bold text-white mb-2">Catatan Pesanan</h3>
            <p className="text-xs text-slate-400 mb-3">Tambahkan instruksi khusus untuk dapur atau barista</p>
            <textarea
              value={tempNotes}
              onChange={(e) => setTempNotes(e.target.value)}
              placeholder="Contoh: Kurang manis, tanpa es, saus dipisah..."
              rows={3}
              className="w-full p-2.5 bg-[#121422] border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400 resize-none"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditingItemNotes(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={() => handleNotesSave(editingItemNotes)}
                className="px-4 py-1.5 bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer & Table Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#1c2033] border border-slate-700 rounded-2xl p-5 w-full max-w-sm space-y-4">
            <h3 className="text-sm font-bold text-white">Informasi Pelanggan & Meja</h3>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Nama Pelanggan:</label>
              <input
                type="text"
                value={tempCustomerName}
                onChange={(e) => setTempCustomerName(e.target.value)}
                placeholder="Contoh: Rian / Pelanggan Umum"
                className="w-full px-3 py-2 bg-[#121422] border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Nomor Meja / Buzzer Tag:</label>
              <input
                type="text"
                value={tempTable}
                onChange={(e) => setTempTable(e.target.value)}
                placeholder="Contoh: Meja 04 atau Tag #08"
                className="w-full px-3 py-2 bg-[#121422] border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCustomerModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleSaveCustomerInfo}
                className="px-4 py-1.5 bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discount Voucher Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#1c2033] border border-slate-700 rounded-2xl p-5 w-full max-w-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-amber-400" />
              <span>Pemberian Diskon / Promo</span>
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {[0, 5, 10, 15, 20, 25, 30, 50].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setTempDiscountPercent(p)}
                  className={`py-2 text-xs font-bold rounded-lg border transition ${
                    tempDiscountPercent === p
                      ? 'bg-amber-400 text-slate-950 border-amber-300'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {p === 0 ? 'Tanpa Diskon' : `${p}%`}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Persen Diskon Kustom (%):</label>
              <input
                type="number"
                min="0"
                max="100"
                value={tempDiscountPercent}
                onChange={(e) => setTempDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                className="w-full px-3 py-2 bg-[#121422] border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDiscountModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleSaveDiscount}
                className="px-4 py-1.5 bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
              >
                Terapkan Diskon
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
