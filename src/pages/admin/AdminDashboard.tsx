import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AdminDashboardData } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Egg,
  TrendingUp,
  ArrowDownToLine,
  ShoppingCart,
  ShieldCheck,
  AlertCircle,
  Play,
  CheckCircle2,
  Clock,
  Settings,
  Sparkles,
  Calendar,
  Layers,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (view: string, params?: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { settings } = useAuth();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningProduction, setIsRunningProduction] = useState(false);
  const [productionMsg, setProductionMsg] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const currency = settings?.currencySymbol || 'Rs.';

  const loadData = async () => {
    try {
      const res = await api.getAdminDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load admin dashboard', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunProduction = async () => {
    setIsRunningProduction(true);
    setProductionMsg(null);
    try {
      const res = await api.runDailyEggProduction();
      setProductionMsg({
        type: 'success',
        message: `Daily Egg Production complete for ${res.cyclesProcessed} active cycles! Generated ${res.eggsProducedTotal} fresh eggs today (Day advanced by 1, automatically completed cycles reaching 120 days).`,
      });
      await loadData();
    } catch (err: any) {
      setProductionMsg({
        type: 'error',
        message: err.message || 'Failed to execute production cycle.',
      });
    } finally {
      setIsRunningProduction(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-purple-300 text-xs">
        <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span>Loading administrator control dashboard...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6 text-white pb-24 lg:pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#170838] via-[#240b54] to-[#170838] border border-purple-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_0_20px_rgba(168,85,247,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30 text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>AL JADEED META EGGS • MASTER CONTROL CENTER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Administrator Flock & Yield Console
          </h1>
          <p className="text-xs text-purple-300 mt-0.5">
            Operational overview of digital hen cycles, daily egg yields, and automated 120-day thresholds.
          </p>
        </div>

        <button
          onClick={handleRunProduction}
          disabled={isRunningProduction}
          className="py-3 px-5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-[0_0_25px_rgba(236,72,153,0.4)] disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 transition-all self-start sm:self-auto"
        >
          {isRunningProduction ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Simulating Day +1...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>RUN DAILY EGG PRODUCTION (DAY +1)</span>
            </>
          )}
        </button>
      </div>

      {/* Production Notification Banner */}
      {productionMsg && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 text-xs animate-fade-in ${
            productionMsg.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/80 border-red-500/40 text-red-300'
          }`}
        >
          {productionMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          )}
          <span>{productionMsg.message}</span>
        </div>
      )}

      {/* 8 CRITICAL ADMIN METRICS (Matching prompt specifications) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-black uppercase tracking-wider text-purple-300">
            System Vital Metrics
          </h2>
          <span className="text-[11px] text-purple-400 font-mono">Live Database Values</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* 1. TOTAL USERS */}
          <div
            onClick={() => onNavigate('admin-customers')}
            className="bg-[#14082e] border border-purple-500/25 hover:border-purple-500/60 rounded-2xl p-4 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                Total Users
              </span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">{data?.totalUsers || 0}</div>
            <span className="text-[10px] text-purple-300/80 block mt-1">Registered investors</span>
          </div>

          {/* 2. TOTAL HENS */}
          <div
            onClick={() => onNavigate('admin-hen-ownership')}
            className="bg-[#14082e] border border-purple-500/25 hover:border-purple-500/60 rounded-2xl p-4 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                Total Hens
              </span>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">{data?.totalHens || 0}</div>
            <span className="text-[10px] text-purple-300/80 block mt-1">Cumulated flock size</span>
          </div>

          {/* 3. ACTIVE HENS */}
          <div
            onClick={() => onNavigate('admin-hen-ownership')}
            className="bg-gradient-to-br from-[#1d083e] to-[#14082e] border border-pink-500/30 hover:border-pink-500/60 rounded-2xl p-4 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">
                Active Hens
              </span>
              <Egg className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-pink-300">{data?.activeHens || 0}</div>
            <span className="text-[10px] text-emerald-400 block mt-1">
              Currently producing daily eggs
            </span>
          </div>

          {/* 4. TOTAL EGGS PRODUCED */}
          <div
            onClick={() => onNavigate('admin-earnings')}
            className="bg-[#14082e] border border-purple-500/25 hover:border-purple-500/60 rounded-2xl p-4 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                Total Eggs Produced
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {data?.totalEggsProduced || 0}
            </div>
            <span className="text-[10px] text-emerald-400 block mt-1">All time ledger count</span>
          </div>

          {/* 5. TODAY'S EGGS */}
          <div className="bg-[#14082e] border border-amber-500/30 hover:border-amber-500/60 rounded-2xl p-4 transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Today's Eggs
              </span>
              <Egg className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400">
              +{data?.todayEggs || 0}
            </div>
            <span className="text-[10px] text-purple-300/80 block mt-1">Fresh daily production</span>
          </div>

          {/* 6. TOTAL WITHDRAWALS */}
          <div
            onClick={() => onNavigate('admin-withdrawals')}
            className="bg-[#14082e] border border-purple-500/25 hover:border-purple-500/60 rounded-2xl p-4 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                Total Withdrawals
              </span>
              <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white truncate">
              {currency} {(data?.totalWithdrawals || 0).toLocaleString()}
            </div>
            <span className="text-[10px] text-purple-300/80 block mt-1">Disbursed cash to users</span>
          </div>

          {/* 7. PENDING ORDERS */}
          <div
            onClick={() => onNavigate('admin-orders')}
            className={`border rounded-2xl p-4 cursor-pointer transition-all ${
              (data?.pendingOrders || 0) > 0
                ? 'bg-amber-950/40 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'bg-[#14082e] border-purple-500/25'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Pending Orders
              </span>
              <ShoppingCart className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300">
              {data?.pendingOrders || 0}
            </div>
            <span className="text-[10px] text-amber-300/80 block mt-1">Awaiting verification</span>
          </div>

          {/* 8. PENDING WITHDRAWALS */}
          <div
            onClick={() => onNavigate('admin-withdrawals')}
            className={`border rounded-2xl p-4 cursor-pointer transition-all ${
              (data?.pendingWithdrawals || 0) > 0
                ? 'bg-pink-950/40 border-pink-500/60 shadow-[0_0_15px_rgba(236,72,153,0.2)]'
                : 'bg-[#14082e] border-purple-500/25'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">
                Pending Payouts
              </span>
              <ArrowDownToLine className="w-4 h-4 text-pink-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-pink-300">
              {data?.pendingWithdrawals || 0}
            </div>
            <span className="text-[10px] text-pink-300/80 block mt-1">Awaiting approval</span>
          </div>
        </div>
      </div>

      {/* QUICK ADMIN ACTION TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Orders Card */}
        <div className="bg-[#14082e] border border-purple-500/30 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4" />
              Order Verification
            </span>
            <span className="text-xs font-mono font-bold text-white bg-purple-950 px-2 py-0.5 rounded-full">
              {data?.pendingOrders || 0} Pending
            </span>
          </div>
          <p className="text-xs text-purple-300">
            Verify payment transaction IDs (TRX) submitted by users for hen purchases. Approving activates the 120-day cycle automatically.
          </p>
          <button
            onClick={() => onNavigate('admin-orders')}
            className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs rounded-xl transition-all"
          >
            Manage Hen Orders →
          </button>
        </div>

        {/* Withdrawals Card */}
        <div className="bg-[#14082e] border border-purple-500/30 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
              <ArrowDownToLine className="w-4 h-4" />
              Cash Payout Approvals
            </span>
            <span className="text-xs font-mono font-bold text-white bg-purple-950 px-2 py-0.5 rounded-full">
              {data?.pendingWithdrawals || 0} Pending
            </span>
          </div>
          <p className="text-xs text-purple-300">
            Review and disburse funds to EasyPaisa, JazzCash, or Bank Alfalah IBFT accounts. Approving updates user status instantly.
          </p>
          <button
            onClick={() => onNavigate('admin-withdrawals')}
            className="w-full py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl transition-all"
          >
            Review Payout Requests →
          </button>
        </div>

        {/* Platform Settings Card */}
        <div className="bg-[#14082e] border border-purple-500/30 rounded-3xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Settings className="w-4 h-4" />
              Platform Configuration
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              Rs. {settings?.eggMonetaryValue || 15} / egg
            </span>
          </div>
          <p className="text-xs text-purple-300">
            Set default egg selling price, hen package price (Rs. 500), payment account numbers, and withdrawal settings.
          </p>
          <button
            onClick={() => onNavigate('admin-settings')}
            className="w-full py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs rounded-xl transition-all"
          >
            Configure Settings →
          </button>
        </div>
      </div>
    </div>
  );
};
