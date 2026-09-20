import React from 'react';
import { Home, Layers, Plus, Egg, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const isAdmin = user?.role === 'admin';

  if (isAdmin) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d0522]/95 backdrop-blur-md border-t border-purple-500/25 px-2 py-2 flex items-center justify-around lg:hidden text-white">
        <button
          onClick={() => onNavigate('admin-dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
            currentView === 'admin-dashboard' ? 'text-pink-400 font-bold' : 'text-purple-300/70 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px]">Overview</span>
        </button>

        <button
          onClick={() => onNavigate('admin-orders')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
            currentView === 'admin-orders' ? 'text-pink-400 font-bold' : 'text-purple-300/70 hover:text-white'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px]">Orders</span>
        </button>

        <button
          onClick={() => onNavigate('admin-hen-ownership')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
            currentView === 'admin-hen-ownership' ? 'text-pink-400 font-bold' : 'text-purple-300/70 hover:text-white'
          }`}
        >
          <Egg className="w-5 h-5" />
          <span className="text-[10px]">Hens & Cycles</span>
        </button>

        <button
          onClick={() => onNavigate('admin-withdrawals')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
            currentView === 'admin-withdrawals' ? 'text-pink-400 font-bold' : 'text-purple-300/70 hover:text-white'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Payouts</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d0522]/95 backdrop-blur-md border-t border-purple-500/25 px-3 py-1.5 flex items-center justify-around lg:hidden text-white shadow-[0_-5px_20px_rgba(10,5,25,0.8)]">
      {/* 1. Home / Dashboard */}
      <button
        onClick={() => onNavigate('customer-dashboard')}
        className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
          currentView === 'customer-dashboard'
            ? 'text-pink-400 font-bold scale-105'
            : 'text-purple-300/70 hover:text-white'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] tracking-tight">Home</span>
      </button>

      {/* 2. My Hens */}
      <button
        onClick={() => onNavigate('customer-my-hens')}
        className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
          currentView === 'customer-my-hens'
            ? 'text-pink-400 font-bold scale-105'
            : 'text-purple-300/70 hover:text-white'
        }`}
      >
        <Layers className="w-5 h-5" />
        <span className="text-[10px] tracking-tight">My Hens</span>
      </button>

      {/* 3. Center Elevated BUY Button */}
      <div className="-mt-6 flex flex-col items-center">
        <button
          onClick={() => onNavigate('customer-hen-details')}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-500 p-0.5 shadow-[0_0_22px_rgba(236,72,153,0.55)] active:scale-95 transition-transform flex items-center justify-center text-white border-2 border-purple-300/40"
        >
          <div className="w-full h-full rounded-full flex flex-col items-center justify-center bg-gradient-to-b from-transparent to-black/20">
            <Plus className="w-6 h-6 stroke-[3]" />
            <span className="text-[9px] font-black tracking-wider uppercase -mt-0.5">BUY</span>
          </div>
        </button>
      </div>

      {/* 4. My Eggs */}
      <button
        onClick={() => onNavigate('customer-my-eggs')}
        className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
          currentView === 'customer-my-eggs' || currentView === 'customer-earnings'
            ? 'text-amber-400 font-bold scale-105'
            : 'text-purple-300/70 hover:text-white'
        }`}
      >
        <Egg className="w-5 h-5" />
        <span className="text-[10px] tracking-tight">My Eggs</span>
      </button>

      {/* 5. Profile */}
      <button
        onClick={() => onNavigate('customer-profile')}
        className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
          currentView === 'customer-profile'
            ? 'text-pink-400 font-bold scale-105'
            : 'text-purple-300/70 hover:text-white'
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] tracking-tight">Profile</span>
      </button>
    </div>
  );
};
