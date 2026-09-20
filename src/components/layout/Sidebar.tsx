import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Egg,
  PackageCheck,
  History,
  TrendingUp,
  ArrowDownToLine,
  Bell,
  User,
  LogOut,
  Users,
  ShieldCheck,
  CreditCard,
  Settings,
  ShoppingCart,
  Share2,
  Sparkles,
  ClipboardList,
  FileText,
  MapPin,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isAdminMode?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isAdminMode = false }) => {
  const { user, logout } = useAuth();

  const customerNav = [
    { label: 'Dashboard', icon: LayoutDashboard, view: 'customer-dashboard' },
    { label: 'My Hens', icon: Egg, view: 'customer-my-hens' },
    { label: 'Buy Hens (Rs. 500)', icon: ShoppingCart, view: 'customer-hen-details' },
    { label: 'Egg Production', icon: TrendingUp, view: 'customer-my-eggs' },
    { label: 'Orders', icon: PackageCheck, view: 'customer-orders' },
    { label: 'Payments', icon: History, view: 'customer-transactions' },
    { label: 'Withdraw', icon: ArrowDownToLine, view: 'customer-withdrawals' },
    { label: 'Refer & Earn', icon: Share2, view: 'customer-referrals' },
    { label: 'Profile', icon: User, view: 'customer-profile' },
  ];

  const adminNav = [
    { label: 'Overview', icon: LayoutDashboard, view: 'admin-dashboard' },
    { label: 'Order Verification', icon: ShoppingCart, view: 'admin-orders' },
    { label: 'Hen Cycles & Flock', icon: Egg, view: 'admin-hen-ownership' },
    { label: 'Egg Production', icon: TrendingUp, view: 'admin-earnings' },
    { label: 'Customer Directory', icon: Users, view: 'admin-customers' },
    { label: 'Withdrawal Approvals', icon: ArrowDownToLine, view: 'admin-withdrawals' },
    { label: 'Farm Locations', icon: MapPin, view: 'admin-locations' },
    { label: 'Audit Trail Ledger', icon: FileText, view: 'admin-audit-logs' },
    { label: 'Package Pricing', icon: PackageCheck, view: 'admin-packages' },
    { label: 'Platform Settings', icon: Settings, view: 'admin-settings' },
  ];

  const items = isAdminMode ? adminNav : customerNav;

  return (
    <aside className="w-64 bg-[#0d0522] text-purple-200 min-h-[calc(100vh-4rem)] flex flex-col justify-between border-r border-purple-500/20 py-4">
      <div className="px-3 space-y-4">
        {/* User Card */}
        <div className="p-3 bg-[#170938] border border-purple-500/25 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-white truncate">{user?.name}</h4>
            <p className="text-[10px] text-purple-300 font-mono truncate">
              {isAdminMode ? 'System Admin' : user?.referralCode || 'Customer'}
            </p>
          </div>
        </div>

        {/* Section title */}
        <div className="px-2 pt-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">
            {isAdminMode ? 'Admin Management' : 'Customer Portal'}
          </span>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {items.map(item => {
            const Icon = item.icon;
            const isActive =
              currentView === item.view ||
              (item.view === 'customer-hen-details' && currentView === 'packages') ||
              (item.view === 'customer-my-eggs' && currentView === 'customer-earnings');

            return (
              <button
                key={item.view}
                onClick={() => onNavigate(item.view)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-600/90 to-purple-600/90 text-white shadow-[0_0_15px_rgba(236,72,153,0.35)]'
                    : 'text-purple-300 hover:text-white hover:bg-purple-900/30'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-purple-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="px-3 pt-4 border-t border-purple-500/20 space-y-2">
        {isAdminMode ? (
          <button
            onClick={() => onNavigate('customer-dashboard')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-amber-400 hover:bg-purple-900/30 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Switch to Customer View</span>
          </button>
        ) : (
          user?.role === 'admin' && (
            <button
              onClick={() => onNavigate('admin-dashboard')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-pink-400 hover:bg-purple-900/30 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Switch to Admin Panel</span>
            </button>
          )
        )}

        <button
          onClick={() => {
            logout();
            onNavigate('landing');
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
