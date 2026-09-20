import React, { useState, useEffect } from 'react';
import { HenOwnership } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Egg,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  PlusCircle,
  Clock,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  ShoppingCart,
} from 'lucide-react';

interface MyHensPageProps {
  onNavigate: (view: string, params?: any) => void;
}

export const MyHensPage: React.FC<MyHensPageProps> = ({ onNavigate }) => {
  const { settings } = useAuth();
  const [ownerships, setOwnerships] = useState<HenOwnership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const currency = settings?.currencySymbol || 'Rs.';

  const loadData = async () => {
    try {
      const res = await api.getMyHens();
      setOwnerships(res.activeOwnerships || []);
    } catch (err) {
      console.error('Failed to load owned hens', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredOwnerships =
    filter === 'all'
      ? ownerships
      : ownerships.filter(o => o.status === filter);

  const totalHens = ownerships.reduce((sum, o) => sum + o.numberOfHens, 0);
  const activeHens = ownerships.filter(o => o.status === 'active').reduce((sum, o) => sum + o.numberOfHens, 0);
  const totalDailyEggs = activeHens * 1;
  const totalEggsEarned = ownerships.reduce((sum, o) => sum + o.eggsEarned, 0);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-5 space-y-6 text-white pb-24 lg:pb-12">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#170838] via-[#210c4f] to-[#170838] border border-purple-500/30 rounded-3xl p-5 shadow-[0_0_20px_rgba(168,85,247,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-amber-400">
              <Egg className="w-6 h-6 fill-amber-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                My Hen Cycles
              </h1>
              <p className="text-xs text-purple-300">
                1 Hen = Rs. 500 • 1 Egg / Day • 120 Days Active Production
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('customer-hen-details')}
          className="py-2.5 px-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs rounded-2xl shadow-[0_0_15px_rgba(236,72,153,0.35)] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Purchase More Hens</span>
        </button>
      </div>

      {/* Summary Stat Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#14082e] border border-purple-500/25 rounded-2xl p-3.5">
          <span className="text-[10px] text-purple-400 font-bold uppercase block">Active Hens</span>
          <span className="text-2xl font-black text-white">{activeHens}</span>
        </div>

        <div className="bg-[#14082e] border border-purple-500/25 rounded-2xl p-3.5">
          <span className="text-[10px] text-purple-400 font-bold uppercase block">Daily Yield</span>
          <span className="text-2xl font-black text-amber-400">+{totalDailyEggs} Eggs</span>
        </div>

        <div className="bg-[#14082e] border border-purple-500/25 rounded-2xl p-3.5">
          <span className="text-[10px] text-purple-400 font-bold uppercase block">Eggs Earned</span>
          <span className="text-2xl font-black text-emerald-400">{totalEggsEarned}</span>
        </div>

        <div className="bg-[#14082e] border border-purple-500/25 rounded-2xl p-3.5">
          <span className="text-[10px] text-purple-400 font-bold uppercase block">Active Cycles</span>
          <span className="text-2xl font-black text-pink-400">
            {ownerships.filter(o => o.status === 'active').length}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-purple-500/20 pb-3">
        {(['all', 'active', 'completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
              filter === tab
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.3)]'
                : 'text-purple-300 hover:text-white bg-[#14082e] border border-purple-500/20'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Hen Cycles List */}
      {isLoading ? (
        <div className="p-12 text-center text-purple-300">
          <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Loading your hen ownership records...</span>
        </div>
      ) : filteredOwnerships.length === 0 ? (
        <div className="p-8 bg-[#14082e] border border-purple-500/30 rounded-3xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-950 flex items-center justify-center text-purple-400 mx-auto">
            <Egg className="w-8 h-8 opacity-60" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Hen Ownership Records Found</h3>
            <p className="text-xs text-purple-300 mt-1 max-w-sm mx-auto">
              Start your automated 120-day production cycle today. Every hen costs {currency} 500 and lays 1 egg daily.
            </p>
          </div>
          <button
            onClick={() => onNavigate('packages')}
            className="py-2.5 px-6 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-xs rounded-xl shadow-lg hover:scale-105 transition-transform inline-flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Buy Your First Hen</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOwnerships.map(cycle => {
            const percent = Math.min(100, Math.round((cycle.daysCompleted / 120) * 100));
            const isCompleted = cycle.status === 'completed' || cycle.daysCompleted >= 120;

            return (
              <div
                key={cycle.id}
                className="bg-gradient-to-br from-[#19093b] via-[#14082e] to-[#250d4d] border border-purple-500/30 hover:border-purple-500/60 rounded-3xl p-5 shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all"
              >
                {/* Header Row: Cycle ID & Status */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-amber-300 tracking-wide">
                      {cycle.ownershipId}
                    </span>
                    <span className="text-xs text-purple-300">
                      • {cycle.breed || 'Al Jadeed Layer'}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      isCompleted
                        ? 'bg-purple-950 text-purple-300 border-purple-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse'
                    }`}
                  >
                    {isCompleted ? 'CYCLE COMPLETED' : 'ACTIVE PRODUCING'}
                  </span>
                </div>

                {/* 4 Key Metrics matching prompt specification:
                    10 Hens | Daily: 10 Eggs | Day: 35 / 120 | Eggs Earned: 350 | Remaining: 850 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0d0422]/90 p-3.5 rounded-2xl border border-purple-500/25 mb-4">
                  <div>
                    <span className="text-[10px] text-purple-400 font-bold block">FLOCK SIZE</span>
                    <span className="text-lg font-black text-white">{cycle.numberOfHens} Hens</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-purple-400 font-bold block">DAILY PRODUCTION</span>
                    <span className="text-lg font-black text-amber-400">
                      {cycle.dailyEggs || cycle.numberOfHens} Eggs / day
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-purple-400 font-bold block">EGGS EARNED</span>
                    <span className="text-lg font-black text-emerald-400">
                      {cycle.eggsEarned} <span className="text-xs text-purple-300">Eggs</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-purple-400 font-bold block">REMAINING EGGS</span>
                    <span className="text-lg font-black text-pink-300">
                      {cycle.remainingEggs} <span className="text-xs text-purple-300">Eggs</span>
                    </span>
                  </div>
                </div>

                {/* Progress Bar: Day X / 120 Days */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-purple-300">Cycle Progress</span>
                    <span className="font-mono font-bold text-amber-300">
                      Day {cycle.daysCompleted} / 120 Days ({percent}%)
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-purple-950 rounded-full overflow-hidden border border-purple-500/30">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-purple-400 pt-1">
                    <span>Activated: {new Date(cycle.purchaseDate).toLocaleDateString()}</span>
                    <span>
                      {isCompleted
                        ? '120-Day Limit Reached'
                        : `${cycle.daysRemaining} days remaining in cycle`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Production Guarantee & 120-Day Cycle Rule Info */}
      <div className="bg-[#12072b] border border-purple-500/20 rounded-3xl p-4 text-xs text-purple-300/90 space-y-2">
        <div className="flex items-center gap-2 font-bold text-white">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Al Jadeed Production Cycle Security</span>
        </div>
        <p>
          Each commercial hen produces 1 egg daily for exactly 120 calendar days (120 eggs total per hen). Egg generation stops automatically when the 120-day cycle is concluded. You can sell available eggs at market price or request cash withdrawals to your EasyPaisa, JazzCash, or Bank account anytime.
        </p>
      </div>
    </div>
  );
};
