import React from 'react';
import {
  UtensilsCrossed,
  LayoutGrid,
  BookOpen,
  ShoppingBag,
  History,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';
import { posSound } from '../utils/sound';

export type NavTab = 'menu' | 'table' | 'catalog' | 'purchase' | 'history' | 'shift' | 'setting';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onEndCashierClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onEndCashierClick,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
    { id: 'table', label: 'Table', icon: LayoutGrid },
    { id: 'catalog', label: 'Catalog', icon: BookOpen },
    { id: 'purchase', label: 'Purchase', icon: ShoppingBag },
    { id: 'history', label: 'Order History', icon: History },
    { id: 'shift', label: 'Shift', icon: Users },
    { id: 'setting', label: 'Setting', icon: Settings },
  ];

  return (
    <aside className="w-20 md:w-24 bg-[#141624] border-r border-slate-800/80 flex flex-col items-center py-4 justify-between shrink-0 select-none no-print">
      
      {/* Top Branding Logo */}
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/20 cursor-pointer transition hover:scale-105">
          <span className="font-extrabold text-2xl text-slate-950 font-sans tracking-tighter">
            Q
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col items-center gap-1.5 w-full px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  posSound.playClick();
                  onSelectTab(item.id);
                }}
                className={`w-full py-2.5 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span className="text-[10px] text-center leading-tight truncate max-w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom End Cashier Action */}
      <div className="w-full px-2 pt-2 border-t border-slate-800/60">
        <button
          type="button"
          onClick={() => {
            posSound.playClick();
            onEndCashierClick();
          }}
          className="w-full py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition cursor-pointer group"
          title="Tutup Kasir / Akhiri Shift Kasir"
        >
          <LogOut className="w-5 h-5 stroke-[2] group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-semibold text-center leading-tight text-red-400">
            End Cashier
          </span>
        </button>
      </div>
    </aside>
  );
};
