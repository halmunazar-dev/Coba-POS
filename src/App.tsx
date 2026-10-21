import React, { useState, useEffect, useCallback } from 'react';
import {
  INITIAL_PRODUCTS,
  INITIAL_TABLES,
  INITIAL_SETTINGS,
  INITIAL_SHIFT,
} from './data/initialData';
import {
  Product,
  Table,
  CartItem,
  Order,
  OrderType,
  PaymentMethod,
  StoreSettings,
  Shift,
} from './types/pos';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { MenuCatalogView } from './components/MenuCatalogView';
import { OrderDetailPanel } from './components/OrderDetailPanel';
import { TableView } from './components/TableView';
import { CatalogManagementView } from './components/CatalogManagementView';
import { PurchaseManagementView } from './components/PurchaseManagementView';
import { OrderHistoryView } from './components/OrderHistoryView';
import { ShiftManagementView } from './components/ShiftManagementView';
import { SettingsView } from './components/SettingsView';
import { PaymentModal } from './components/PaymentModal';
import { ThermalReceiptModal } from './components/ThermalReceiptModal';
import { ThermalReceiptPrintable } from './components/ThermalReceiptPrintable';
import { HeldOrdersModal } from './components/HeldOrdersModal';
import { posSound } from './utils/sound';

export default function App() {
  // Master states
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('dialoogi_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [tables, setTables] = useState<Table[]>(() => {
    const saved = localStorage.getItem('dialoogi_tables');
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('dialoogi_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [shift, setShift] = useState<Shift>(() => {
    const saved = localStorage.getItem('dialoogi_shift');
    return saved ? JSON.parse(saved) : INITIAL_SHIFT;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('dialoogi_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [heldOrders, setHeldOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('dialoogi_held_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Active cashier cart state
  const [orderNumber, setOrderNumber] = useState<string>('73246');
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [customerName, setCustomerName] = useState<string>('Pelanggan');
  const [tableNumber, setTableNumber] = useState<string>('Meja 04');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [cart, setCart] = useState<CartItem[]>([
    {
      product: INITIAL_PRODUCTS[4], // Chicken Spicy Korean
      quantity: 1,
    },
    {
      product: INITIAL_PRODUCTS[1], // Fried rice & Chicken
      quantity: 1,
    },
    {
      product: INITIAL_PRODUCTS[5], // Es Kopi Susu Aren Dialoogi
      quantity: 1,
    },
  ]);

  // Navigation
  const [activeTab, setActiveTab] = useState<NavTab>('menu');

  // Modals & receipt states
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isHeldOrdersOpen, setIsHeldOrdersOpen] = useState(false);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);
  const [autoPrinted, setAutoPrinted] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('dialoogi_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('dialoogi_tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('dialoogi_settings', JSON.stringify(settings));
    posSound.enabled = settings.soundEnabled;
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('dialoogi_shift', JSON.stringify(shift));
  }, [shift]);

  useEffect(() => {
    localStorage.setItem('dialoogi_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('dialoogi_held_orders', JSON.stringify(heldOrders));
  }, [heldOrders]);

  // Cart operations
  const handleAddToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const handleUpdateCartItemQty = useCallback((productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  }, []);

  const handleRemoveCartItem = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const handleUpdateCartItemNotes = useCallback((productId: string, notes: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, notes } : item
      )
    );
  }, []);

  const handleClearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Summary calculations for active cart
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const tax = Math.round((taxableSubtotal * settings.taxRatePercent) / 100);
  const serviceCharge = Math.round((taxableSubtotal * settings.serviceChargePercent) / 100);
  const total = taxableSubtotal + tax + serviceCharge;

  // Hold order (Pending bill)
  const handleHoldOrder = () => {
    if (cart.length === 0) return;

    const heldOrder: Order = {
      id: `hold-${Date.now()}`,
      orderNumber,
      type: orderType,
      customerName,
      tableNumber,
      items: [...cart],
      subtotal,
      discount: discountAmount,
      tax,
      serviceCharge,
      total,
      paymentMethod: 'cash',
      amountPaid: 0,
      change: 0,
      status: 'held',
      createdAt: new Date().toISOString(),
      cashierName: shift.cashierName,
    };

    setHeldOrders((prev) => [heldOrder, ...prev]);
    setCart([]);
    setOrderNumber(String(Math.floor(10000 + Math.random() * 90000)));
  };

  const handleRestoreHeldOrder = (order: Order) => {
    setCart(order.items);
    setOrderType(order.type);
    setCustomerName(order.customerName);
    setTableNumber(order.tableNumber || '');
    setOrderNumber(order.orderNumber);
    setHeldOrders((prev) => prev.filter((o) => o.id !== order.id));
    setIsHeldOrdersOpen(false);
    setActiveTab('menu');
  };

  const handleDeleteHeldOrder = (orderId: string) => {
    setHeldOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  // Complete Payment and Automatic Thermal Printing!
  const handleCompletePayment = (
    paymentMethod: PaymentMethod,
    amountPaid: number,
    change: number,
    autoPrint: boolean
  ) => {
    const completedOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      type: orderType,
      customerName,
      tableNumber,
      items: [...cart],
      subtotal,
      discount: discountAmount,
      tax,
      serviceCharge,
      total,
      paymentMethod,
      amountPaid,
      change,
      status: 'completed',
      createdAt: new Date().toISOString(),
      cashierName: shift.cashierName,
    };

    // Save order
    setOrders((prev) => [completedOrder, ...prev]);

    // Update shift metrics
    setShift((prev) => ({
      ...prev,
      totalSales: prev.totalSales + total,
      totalTransactions: prev.totalTransactions + 1,
      cashSales: paymentMethod === 'cash' ? prev.cashSales + total : prev.cashSales,
      nonCashSales: paymentMethod !== 'cash' ? prev.nonCashSales + total : prev.nonCashSales,
      expectedCash: paymentMethod === 'cash' ? prev.expectedCash + total : prev.expectedCash,
    }));

    // Deduct stock for sold items
    setProducts((prev) =>
      prev.map((prod) => {
        const itemSold = cart.find((i) => i.product.id === prod.id);
        if (itemSold) {
          const nextStock = Math.max(0, prod.stock - itemSold.quantity);
          return { ...prod, stock: nextStock, isAvailable: nextStock > 0 };
        }
        return prod;
      })
    );

    // If dine in, update table status
    if (orderType === 'dine_in' && tableNumber) {
      setTables((prev) =>
        prev.map((t) =>
          t.name.toLowerCase() === tableNumber.toLowerCase()
            ? { ...t, status: 'occupied', currentOrderId: `#${orderNumber}`, customerName }
            : t
        )
      );
    }

    // Prepare active receipt
    setActiveReceiptOrder(completedOrder);
    setIsPaymentOpen(false);

    // Reset current active cart and generate new order number
    setCart([]);
    setDiscountPercent(0);
    setOrderNumber(String(Math.floor(10000 + Math.random() * 90000)));

    // AUTOMATIC THERMAL PRINTING LOGIC:
    if (autoPrint) {
      setAutoPrinted(true);
      setIsReceiptOpen(true);
      // Automatically trigger browser thermal print dialog!
      setTimeout(() => {
        window.print();
      }, 350);
    } else {
      setAutoPrinted(false);
      setIsReceiptOpen(true);
    }
  };

  // Preview current active cart receipt
  const handleOpenReceiptPreview = () => {
    const previewOrder: Order = {
      id: `prev-${Date.now()}`,
      orderNumber,
      type: orderType,
      customerName,
      tableNumber,
      items: [...cart],
      subtotal,
      discount: discountAmount,
      tax,
      serviceCharge,
      total,
      paymentMethod: 'cash',
      amountPaid: total,
      change: 0,
      status: 'completed',
      createdAt: new Date().toISOString(),
      cashierName: shift.cashierName,
    };
    setActiveReceiptOrder(previewOrder);
    setAutoPrinted(false);
    setIsReceiptOpen(true);
  };

  // Reprint from history
  const handleReprintReceipt = (order: Order) => {
    setActiveReceiptOrder(order);
    setAutoPrinted(false);
    setIsReceiptOpen(true);
  };

  // Direct print test
  const handleQuickPrinterTest = () => {
    const testOrder: Order = {
      id: `test-${Date.now()}`,
      orderNumber: 'TEST-01',
      type: 'dine_in',
      customerName: 'Uji Coba Printer Thermal',
      tableNumber: 'Meja Test',
      items: [
        { product: INITIAL_PRODUCTS[0], quantity: 1 },
        { product: INITIAL_PRODUCTS[5], quantity: 2 },
      ],
      subtotal: 53000,
      discount: 0,
      tax: 5830,
      serviceCharge: 0,
      total: 58830,
      paymentMethod: 'cash',
      amountPaid: 60000,
      change: 1170,
      status: 'completed',
      createdAt: new Date().toISOString(),
      cashierName: shift.cashierName,
    };
    setActiveReceiptOrder(testOrder);
    setAutoPrinted(false);
    setIsReceiptOpen(true);
  };

  // Catalog CRUD
  const handleAddProduct = (newProd: Omit<Product, 'id'>) => {
    const id = `prod-${Date.now()}`;
    setProducts((prev) => [ { id, ...newProd }, ...prev]);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Purchase restock
  const handleRestock = (productId: string, quantityAdded: number, costPerUnit: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              stock: p.stock + quantityAdded,
              costPrice: costPerUnit || p.costPrice,
              isAvailable: true,
            }
          : p
      )
    );
  };

  // Keyboard shortcut listener for fast cashier ergonomics
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setActiveTab('menu');
      } else if (e.key === 'F2') {
        e.preventDefault();
        if (cart.length > 0) setIsPaymentOpen(true);
      } else if (e.key === 'F3') {
        e.preventDefault();
        setActiveTab('table');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setIsHeldOrdersOpen(true);
      } else if (e.key === 'Escape') {
        setIsPaymentOpen(false);
        setIsReceiptOpen(false);
        setIsHeldOrdersOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart]);

  return (
    <div className="flex h-screen w-screen bg-[#11141f] text-slate-100 overflow-hidden select-none font-sans">
      
      {/* 1. Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onEndCashierClick={() => setActiveTab('shift')}
      />

      {/* 2. Center & Right Main Application Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Top Header Bar */}
        <Header
          settings={settings}
          cashierName={shift.cashierName}
          heldOrdersCount={heldOrders.length}
          onOpenHeldOrders={() => setIsHeldOrdersOpen(true)}
          onToggleSound={() => setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))}
          soundEnabled={settings.soundEnabled}
          onQuickPrinterTest={handleQuickPrinterTest}
        />

        {/* Dynamic Main Workspace Container */}
        <div className="flex-1 flex flex-row overflow-hidden">
          
          {/* Main View Area */}
          <main className="flex-1 flex flex-col h-full overflow-hidden">
            {activeTab === 'menu' && (
              <MenuCatalogView
                products={products}
                onAddToCart={handleAddToCart}
              />
            )}

            {activeTab === 'table' && (
              <TableView
                tables={tables}
                onSelectTable={(tName) => {
                  setTableNumber(tName);
                  setOrderType('dine_in');
                  setActiveTab('menu');
                }}
                onUpdateTableStatus={(tId, st) => {
                  setTables((prev) =>
                    prev.map((t) => (t.id === tId ? { ...t, status: st } : t))
                  );
                }}
              />
            )}

            {activeTab === 'catalog' && (
              <CatalogManagementView
                products={products}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            )}

            {activeTab === 'purchase' && (
              <PurchaseManagementView
                products={products}
                onRestock={handleRestock}
              />
            )}

            {activeTab === 'history' && (
              <OrderHistoryView
                orders={orders}
                settings={settings}
                onReprintReceipt={handleReprintReceipt}
              />
            )}

            {activeTab === 'shift' && (
              <ShiftManagementView
                shift={shift}
                orders={orders}
                settings={settings}
                onCloseShift={(actualCash, notes) => {
                  setShift((prev) => ({
                    ...prev,
                    status: 'closed',
                    actualCash,
                    cashDifference: actualCash - prev.expectedCash,
                    closedAt: new Date().toISOString(),
                    notes,
                  }));
                }}
                onOpenNewShift={(startCash, cashierName) => {
                  setShift({
                    id: `shift-${Date.now().toString().slice(-4)}`,
                    cashierName,
                    openedAt: new Date().toISOString(),
                    startCash,
                    expectedCash: startCash,
                    totalSales: 0,
                    totalTransactions: 0,
                    cashSales: 0,
                    nonCashSales: 0,
                    status: 'open',
                  });
                }}
              />
            )}

            {activeTab === 'setting' && (
              <SettingsView
                settings={settings}
                onSaveSettings={setSettings}
                onTestPrint={handleQuickPrinterTest}
              />
            )}
          </main>

          {/* Right Order Detail Panel (Always visible on menu, or toggleable) */}
          {activeTab === 'menu' && (
            <OrderDetailPanel
              orderNumber={orderNumber}
              cart={cart}
              orderType={orderType}
              customerName={customerName}
              tableNumber={tableNumber}
              discount={discountAmount}
              discountPercent={discountPercent}
              settings={settings}
              onUpdateCartItemQty={handleUpdateCartItemQty}
              onRemoveCartItem={handleRemoveCartItem}
              onUpdateCartItemNotes={handleUpdateCartItemNotes}
              onClearCart={handleClearCart}
              onChangeOrderType={setOrderType}
              onChangeCustomerName={setCustomerName}
              onChangeTableNumber={setTableNumber}
              onApplyDiscount={(pct) => setDiscountPercent(pct)}
              onHoldOrder={handleHoldOrder}
              onOpenReceiptPreview={handleOpenReceiptPreview}
              onOpenPaymentModal={() => setIsPaymentOpen(true)}
            />
          )}
        </div>
      </div>

      {/* 3. Rapid Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        orderNumber={orderNumber}
        total={total}
        subtotal={subtotal}
        tax={tax}
        discount={discountAmount}
        serviceCharge={serviceCharge}
        customerName={customerName}
        tableNumber={tableNumber}
        settings={settings}
        onCompletePayment={handleCompletePayment}
      />

      {/* 4. Thermal Receipt Interactive Preview & Print Modal */}
      {activeReceiptOrder && (
        <ThermalReceiptModal
          isOpen={isReceiptOpen}
          onClose={() => {
            setIsReceiptOpen(false);
            setAutoPrinted(false);
          }}
          order={activeReceiptOrder}
          settings={settings}
          autoPrinted={autoPrinted}
          onDirectPrint={() => window.print()}
        />
      )}

      {/* 5. Held Orders Drawer Modal */}
      <HeldOrdersModal
        isOpen={isHeldOrdersOpen}
        onClose={() => setIsHeldOrdersOpen(false)}
        heldOrders={heldOrders}
        onRestoreOrder={handleRestoreHeldOrder}
        onDeleteHeldOrder={handleDeleteHeldOrder}
      />

      {/* 6. Pure Monospaced Node for window.print() (@media print only) */}
      {activeReceiptOrder && (
        <ThermalReceiptPrintable
          order={activeReceiptOrder}
          settings={settings}
        />
      )}
    </div>
  );
}
