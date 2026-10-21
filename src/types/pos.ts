export type OrderType = 'dine_in' | 'take_away' | 'ojol';

export type PaymentMethod = 'cash' | 'qris' | 'debit' | 'credit' | 'transfer';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  image: string;
  barcode?: string;
  description?: string;
  isAvailable: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  type: OrderType;
  customerName: string;
  customerPhone?: string;
  tableNumber?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  serviceCharge: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  status: 'completed' | 'held' | 'cancelled';
  createdAt: string;
  cashierName: string;
}

export interface Table {
  id: string;
  name: string;
  capacity: number;
  area: 'Indoor' | 'Outdoor' | 'VIP' | 'Bar';
  status: 'available' | 'occupied' | 'reserved';
  currentOrderId?: string;
  customerName?: string;
}

export interface Shift {
  id: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  startCash: number;
  expectedCash: number;
  actualCash?: number;
  cashDifference?: number;
  totalSales: number;
  totalTransactions: number;
  cashSales: number;
  nonCashSales: number;
  status: 'open' | 'closed';
  notes?: string;
}

export interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  supplierName: string;
  quantity: number;
  costPerUnit: number;
  totalCost: number;
  date: string;
  notes?: string;
}

export interface StoreSettings {
  storeName: string;
  branchName: string;
  address: string;
  phone: string;
  taxRatePercent: number; // e.g. 11
  serviceChargePercent: number; // e.g. 0
  footerNote: string;
  wifiNote: string;
  printerPaperWidth: '58mm' | '80mm';
  autoPrintOnPayment: boolean;
  soundEnabled: boolean;
  currencySymbol: string;
}
