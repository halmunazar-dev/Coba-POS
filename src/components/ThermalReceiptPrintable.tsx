import React from 'react';
import { Order, StoreSettings } from '../types/pos';
import { formatRupiah, formatDateTime } from '../utils/format';

interface ThermalReceiptPrintableProps {
  order: Order;
  settings: StoreSettings;
}

export const ThermalReceiptPrintable: React.FC<ThermalReceiptPrintableProps> = ({ order, settings }) => {
  const paperClass = settings.printerPaperWidth === '80mm' ? 'paper-80mm' : 'paper-58mm';

  return (
    <div id="thermal-receipt-printable" className={paperClass}>
      <div className="text-center font-bold text-sm tracking-wider uppercase mb-1">
        {settings.storeName}
      </div>
      <div className="text-center text-xs font-semibold mb-0.5">
        {settings.branchName}
      </div>
      <div className="text-center text-[10px] leading-tight mb-1 text-gray-700">
        {settings.address}
      </div>
      {settings.phone && (
        <div className="text-center text-[10px] mb-1 text-gray-700">
          Telp: {settings.phone}
        </div>
      )}

      {/* Double line divider */}
      <div className="border-b-2 border-dashed border-black my-1.5" />

      {/* Order Info */}
      <div className="flex justify-between text-[11px] font-mono">
        <span>Order: #{order.orderNumber}</span>
        <span className="font-bold uppercase">{order.type.replace('_', ' ')}</span>
      </div>
      <div className="flex justify-between text-[10px] font-mono text-gray-800">
        <span>Waktu:</span>
        <span>{formatDateTime(order.createdAt)}</span>
      </div>
      <div className="flex justify-between text-[10px] font-mono text-gray-800">
        <span>Kasir: {order.cashierName}</span>
        {order.tableNumber && <span className="font-bold">Meja: {order.tableNumber}</span>}
      </div>
      <div className="text-[10px] font-mono text-gray-800">
        <span>Pelanggan: {order.customerName}</span>
      </div>

      {/* Single line divider */}
      <div className="border-b border-dashed border-black my-1.5" />

      {/* Item List */}
      <div className="space-y-1 my-1">
        {order.items.map((item, idx) => (
          <div key={idx} className="text-[11px] font-mono">
            <div className="font-medium text-black truncate">{item.product.name}</div>
            <div className="flex justify-between text-[10px] pl-2 text-gray-900">
              <span>{item.quantity} x {formatRupiah(item.product.price)}</span>
              <span className="font-semibold">{formatRupiah(item.quantity * item.product.price)}</span>
            </div>
            {item.notes && (
              <div className="text-[9px] italic pl-2 text-gray-600">
                *{item.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Single line divider */}
      <div className="border-b border-dashed border-black my-1.5" />

      {/* Calculations */}
      <div className="space-y-0.5 text-[10px] font-mono">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatRupiah(order.subtotal)}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between">
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

        <div className="border-b border-black my-1" />

        <div className="flex justify-between font-bold text-xs pt-0.5">
          <span>TOTAL</span>
          <span>{formatRupiah(order.total)}</span>
        </div>
      </div>

      <div className="border-b-2 border-dashed border-black my-1.5" />

      {/* Payment details */}
      <div className="text-[10px] font-mono space-y-0.5">
        <div className="flex justify-between">
          <span className="uppercase">Bayar ({order.paymentMethod})</span>
          <span>{formatRupiah(order.amountPaid)}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Kembali</span>
          <span>{formatRupiah(order.change)}</span>
        </div>
      </div>

      {/* Footer Notes */}
      <div className="mt-3 pt-1 border-t border-dashed border-black text-center text-[10px] font-mono space-y-0.5">
        <p className="font-medium">{settings.footerNote || 'Terima Kasih atas Kunjungan Anda'}</p>
        {settings.wifiNote && <p className="text-[9px]">{settings.wifiNote}</p>}
        <p className="text-[8px] text-gray-600 mt-1">Layanan Kasir Cepat Dialoogi POS</p>
      </div>

      {/* Simulated Barcode */}
      <div className="mt-2 flex flex-col items-center justify-center">
        <div className="flex items-center gap-[1px] h-7">
          {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 3, 1, 2, 3, 1, 4, 2, 3, 1, 2].map((w, i) => (
            <div
              key={i}
              className="bg-black h-full"
              style={{ width: `${w}px` }}
            />
          ))}
        </div>
        <span className="text-[8px] tracking-widest font-mono mt-0.5">*{order.orderNumber}*</span>
      </div>

      {/* Cut mark */}
      <div className="text-center text-[8px] text-gray-400 mt-2 font-mono">
        - - - - - - - - - - gunting disini - - - - - - - - - -
      </div>
    </div>
  );
};
