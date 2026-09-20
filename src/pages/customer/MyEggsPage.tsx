import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { EggBalance, EggProductionRecord } from '../../types';
import { SellEggsModal } from '../../components/common/SellEggsModal';
import { RealisticEgg3D } from '../../components/common/RealisticEgg3D';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Egg,
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
  Zap,
  Activity,
  AlertCircle,
  RefreshCw,
  Coins,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface MyEggsPageProps {
  onNavigate?: (view: string, params?: any) => void;
}

export const MyEggsPage: React.FC<MyEggsPageProps> = ({ onNavigate }) => {
  const { settings } = useAuth();
  const [balance, setBalance] = useState<EggBalance | null>(null);
  const [productions, setProductions] = useState<EggProductionRecord[]>([]);
  const [eggPrice, setEggPrice] = useState<number>(15);
  const [isLoading, setIsLoading] = useState(true);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Authoritative server-driven scheduling state
  const [isEarningActive, setIsEarningActive] = useState<boolean>(false);
  const [nextEarningTime, setNextEarningTime] = useState<string | null>(null);
  const [nextEggBatchCount, setNextEggBatchCount] = useState<number>(10);
  const [activeHens, setActiveHens] = useState<number>(0);
  const [dailyEggs, setDailyEggs] = useState<number>(0);
  const [totalCycleEggsMax, setTotalCycleEggsMax] = useState<number>(1200);
  const [totalEarnedActiveFlock, setTotalEarnedActiveFlock] = useState<number>(0);

  // Live countdown state
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [cycleProgressPercent, setCycleProgressPercent] = useState<number>(0);

  // Live alert banner for newly earned eggs
  const [earnedAlert, setEarnedAlert] = useState<{
    show: boolean;
    eggs: number;
    message: string;
  }>({
    show: false,
    eggs: 0,
    message: '',
  });

  const currency = settings?.currencySymbol || 'Rs.';
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Authoritative data loading from backend
  const loadData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await api.getMyEggs();
      const prevAvailable = balance?.availableEggs;

      setBalance(res.balance);
      setProductions(res.productions || []);
      setEggPrice(res.eggPrice || 15);
      setIsEarningActive(Boolean(res.isEarningActive));
      setNextEarningTime(res.nextEarningTime || null);
      setNextEggBatchCount(res.nextEggBatchCount || res.dailyEggs || 10);
      setActiveHens(res.activeHens || 0);
      setDailyEggs(res.dailyEggs || 0);
      setTotalCycleEggsMax(res.totalCycleEggsMax || (res.activeHens || 0) * 120 || 1200);
      setTotalEarnedActiveFlock(res.totalEarnedActiveFlock || res.balance?.totalEarnedEggs || 0);

      // Compute remaining seconds from server timestamp
      if (res.nextEarningTime) {
        const targetMs = new Date(res.nextEarningTime).getTime();
        const nowMs = Date.now();
        const diffSec = Math.max(0, Math.floor((targetMs - nowMs) / 1000));
        setRemainingSeconds(diffSec);

        const elapsedSec = Math.max(0, 86400 - diffSec);
        const pct = Math.min(100, Math.max(0, Math.round((elapsedSec / 86400) * 100)));
        setCycleProgressPercent(pct);
      } else {
        setRemainingSeconds(0);
        setCycleProgressPercent(0);
      }

      // Check if newly earned eggs arrived during silent revalidation
      if (silent && prevAvailable !== undefined && res.balance.availableEggs > prevAvailable) {
        const diff = res.balance.availableEggs - prevAvailable;
        setEarnedAlert({
          show: true,
          eggs: diff,
          message: `+${diff} Fresh Egg${diff > 1 ? 's' : ''} Collected & Credited!`,
        });
        setTimeout(() => {
          setEarnedAlert(prev => ({ ...prev, show: false }));
        }, 6000);
      }
    } catch (err) {
      console.error('Failed to load egg data', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [balance?.availableEggs]);

  // Initial fetch
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Synchronize with server when countdown hits 0
  const triggerBackendSync = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const res = await api.syncEggEarnings();
      if (res.newlyEarned > 0) {
        setEarnedAlert({
          show: true,
          eggs: res.newlyEarned,
          message: `+${res.newlyEarned} Eggs Earned! Credited to your available inventory.`,
        });
        setTimeout(() => {
          setEarnedAlert(prev => ({ ...prev, show: false }));
        }, 6000);
      }
      await loadData(true);
    } catch (err) {
      console.error('Egg sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, loadData]);

  // Live timer tick (1 second intervals)
  useEffect(() => {
    if (!isEarningActive || !nextEarningTime) return;

    const timer = setInterval(() => {
      const targetMs = new Date(nextEarningTime).getTime();
      const nowMs = Date.now();
      const diffSec = Math.floor((targetMs - nowMs) / 1000);

      if (diffSec <= 0) {
        setRemainingSeconds(0);
        setCycleProgressPercent(100);
        // Trigger authoritative backend sync
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(() => {
          triggerBackendSync();
        }, 1000);
      } else {
        setRemainingSeconds(diffSec);
        const elapsedSec = Math.max(0, 86400 - diffSec);
        const pct = Math.min(100, Math.max(0, Math.round((elapsedSec / 86400) * 100)));
        setCycleProgressPercent(pct);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [isEarningActive, nextEarningTime, triggerBackendSync]);

  // Background polling every 20 seconds for multi-tab/background sync
  useEffect(() => {
    const pollTimer = setInterval(() => {
      loadData(true);
    }, 20000);
    return () => clearInterval(pollTimer);
  }, [loadData]);

  // Format seconds into HH:MM:SS
  const formatCountdown = (totalSeconds: number) => {
    if (totalSeconds <= 0) return '00:00:00';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Format next egg date/time string (e.g. "Today • 3:15 PM" or "Tomorrow • 3:15 PM")
  const formatNextEggSchedule = (isoString: string | null) => {
    if (!isoString) return 'Pending Active Hen Cycle';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

      const tomorrow = new Date(now.getTime() + 86400000);
      const isTomorrow =
        date.getDate() === tomorrow.getDate() &&
        date.getMonth() === tomorrow.getMonth() &&
        date.getFullYear() === tomorrow.getFullYear();

      const timeStr = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      if (isToday) return `Today • ${timeStr}`;
      if (isTomorrow) return `Tomorrow • ${timeStr}`;
      return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • ${timeStr}`;
    } catch {
      return isoString;
    }
  };

  const handleSellSuccess = (newBalance: number, newAvailableEggs: number) => {
    if (balance) {
      setBalance({
        ...balance,
        availableEggs: newAvailableEggs,
        soldEggs: (balance.soldEggs || 0) + (balance.availableEggs - newAvailableEggs),
      });
    }
    loadData(true);
  };

  // Prepare chart data (Eggs Produced vs Date)
  const chartData = [...productions]
    .reverse()
    .slice(-14)
    .map(p => ({
      date: p.date.slice(5),
      eggs: p.eggs,
      hens: p.hens,
    }));

  const displayChartData =
    chartData.length > 0
      ? chartData
      : [
          { date: 'Day 1', eggs: 10, hens: 10 },
          { date: 'Day 2', eggs: 10, hens: 10 },
          { date: 'Day 3', eggs: 10, hens: 10 },
          { date: 'Day 4', eggs: 10, hens: 10 },
          { date: 'Day 5', eggs: 10, hens: 10 },
        ];

  const availableEggs = balance?.availableEggs || 0;
  const estimatedValue = availableEggs * eggPrice;

  return (
    <div
      id="my-eggs-page-container"
      className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-5 space-y-6 text-white pb-28 lg:pb-14"
    >
      {/* REAL-TIME NOTIFICATION ALERT TOAST */}
      {earnedAlert.show && (
        <div
          id="egg-earned-toast-banner"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black p-4 rounded-2xl shadow-[0_0_35px_rgba(234,179,8,0.7)] flex items-center justify-between gap-3 animate-bounce border-2 border-white/40"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">🥚</span>
            <div>
              <div className="text-xs uppercase tracking-wider font-extrabold text-amber-950">
                Fresh Harvest Credited!
              </div>
              <div className="text-sm font-black">{earnedAlert.message}</div>
            </div>
          </div>
          <button
            onClick={() => setEarnedAlert(prev => ({ ...prev, show: false }))}
            className="text-xs px-2.5 py-1 rounded-lg bg-black/20 hover:bg-black/30 font-bold"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* ====================================================
          1. PAGE HEADER WITH EARNING STATUS
          ==================================================== */}
      <div
        id="egg-page-header"
        className="bg-gradient-to-r from-[#170838] via-[#210c4f] to-[#170838] border border-purple-500/30 rounded-3xl p-5 shadow-[0_0_25px_rgba(168,85,247,0.18)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 to-purple-600/30 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(234,179,8,0.2)] shrink-0">
            <Egg className="w-7 h-7 fill-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Egg Production Inventory
              </h1>
              {/* STATUS INDICATOR PILL */}
              {isEarningActive ? (
                <span
                  id="earning-status-pill-active"
                  className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-extrabold tracking-wide bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.25)]"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>● Earning Active • Hens Producing</span>
                </span>
              ) : activeHens > 0 ? (
                <span
                  id="earning-status-pill-running"
                  className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-extrabold tracking-wide bg-amber-500/15 border border-amber-500/40 text-amber-400"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Cycle In Progress</span>
                </span>
              ) : (
                <span
                  id="earning-status-pill-idle"
                  className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wide bg-purple-900/30 border border-purple-500/30 text-purple-300"
                >
                  <AlertCircle className="w-3 h-3 text-purple-400" />
                  <span>No Active Hens</span>
                </span>
              )}
            </div>
            <p className="text-xs text-purple-300 mt-0.5">
              1 Active Hen = 1 Egg per 24 Hours • Authoritative Real-Time Earning Engine
            </p>
          </div>
        </div>

        {/* Header Right Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            id="refresh-eggs-button"
            onClick={() => triggerBackendSync()}
            disabled={isSyncing}
            className="p-2.5 rounded-2xl bg-purple-950/80 hover:bg-purple-900/80 border border-purple-500/30 text-purple-300 hover:text-white transition-all disabled:opacity-50"
            title="Sync Egg Production"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
          </button>
          <button
            id="header-sell-eggs-cta"
            onClick={() => setIsSellModalOpen(true)}
            disabled={availableEggs <= 0}
            className="py-2.5 px-4 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-2xl shadow-[0_0_20px_rgba(236,72,153,0.35)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 active:scale-98 transition-all"
          >
            <Coins className="w-4 h-4 text-amber-300" />
            <span>SELL EGGS</span>
          </button>
        </div>
      </div>

      {/* ====================================================
          2. PROMINENT MAIN EGG CARD WITH 3D EGG & LIVE COUNTDOWN
          ==================================================== */}
      <div
        id="main-prominent-egg-card"
        className="relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-[#1c0840] via-[#100427] to-[#2b0852] border border-purple-500/40 shadow-[0_0_35px_rgba(168,85,247,0.25)]"
      >
        {/* Subtle decorative purple / gold ambient background blobs */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Column: Available Eggs & Main Controls */}
          <div className="flex-1 w-full space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-xs font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-400 to-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                YOUR EGGS INVENTORY
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300">
                Rate: {currency} {eggPrice} / egg
              </span>
            </div>

            {/* BIG STAT: Available Eggs */}
            <div>
              <div className="text-4xl sm:text-6xl font-black text-white tracking-tight drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]">
                {availableEggs.toLocaleString()}{' '}
                <span className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-amber-300">
                  Eggs Available
                </span>
              </div>
              <div className="mt-2 flex items-center justify-center md:justify-start gap-2">
                <span className="text-xs text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-xl font-bold">
                  Cash Value: {currency} {estimatedValue.toLocaleString()}
                </span>
                <span className="text-xs text-purple-300/80">
                  • Ready for immediate cash payout
                </span>
              </div>
            </div>

            {/* MAIN CTA BUTTON: SELL EGGS */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
              <button
                id="main-card-sell-eggs-button"
                onClick={() => setIsSellModalOpen(true)}
                disabled={availableEggs <= 0}
                className="w-full sm:w-auto py-3.5 px-7 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-[0_0_25px_rgba(236,72,153,0.4)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>SELL EGGS FOR CASH</span>
                <ChevronRight className="w-4 h-4 text-pink-200" />
              </button>

              {activeHens === 0 && (
                <button
                  onClick={() => onNavigate && onNavigate('buy-hens')}
                  className="w-full sm:w-auto py-3 px-5 bg-purple-950/70 hover:bg-purple-900/80 border border-purple-500/40 text-purple-200 font-bold text-xs rounded-2xl transition-all"
                >
                  Buy Digital Hens
                </button>
              )}
            </div>
          </div>

          {/* Center/Right Column: 3D Egg Visual Representation */}
          <div className="shrink-0 flex items-center justify-center py-2">
            <RealisticEgg3D size="lg" pulse={isEarningActive} />
          </div>
        </div>

        {/* ====================================================
            LIVE 24-HOUR COUNTDOWN & CYCLE PROGRESS SECTION
            ==================================================== */}
        <div
          id="next-egg-live-countdown-section"
          className="mt-6 pt-5 border-t border-purple-500/25 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
        >
          {/* Countdown Clock Display */}
          <div className="md:col-span-4 bg-[#0e0422] border border-purple-500/30 rounded-2xl p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-300 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Next Egg In</span>
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-black text-amber-400 tracking-tight drop-shadow-[0_0_12px_rgba(234,179,8,0.4)]">
                {isEarningActive ? formatCountdown(remainingSeconds) : '--:--:--'}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-purple-400 block font-medium">Batch Yield</span>
              <span className="text-sm font-black text-white">
                +{nextEggBatchCount} Egg{nextEggBatchCount > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Visual 24-Hour Cycle Progress Bar */}
          <div className="md:col-span-8 bg-[#0e0422] border border-purple-500/30 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Egg Cycle (24 Hours)
              </span>
              <span className="font-mono font-black text-pink-400">
                {isEarningActive ? `${cycleProgressPercent}% Complete` : 'Awaiting Hens'}
              </span>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-3 bg-purple-950/80 rounded-full overflow-hidden border border-purple-500/30 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-amber-400 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                style={{ width: `${isEarningActive ? cycleProgressPercent : 0}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-purple-300/80 pt-0.5">
              <span>Next Egg: {formatNextEggSchedule(nextEarningTime)}</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Server Synchronized
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================
          3. HEN-BASED EARNING SUMMARY CARD (4 Key Metrics)
          ==================================================== */}
      <div
        id="hen-earning-summary-card"
        className="bg-[#14082e] border border-purple-500/30 rounded-3xl p-5 shadow-[0_0_20px_rgba(168,85,247,0.12)] space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            Hen-Based Earning Summary
          </h3>
          <span className="text-xs text-purple-400 font-mono">
            Commercial Production Model
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Metric 1: Active Hens */}
          <div className="bg-[#0e0422] border border-purple-500/25 rounded-2xl p-4 text-center sm:text-left">
            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">
              ACTIVE HENS
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {activeHens}
            </div>
            <span className="text-[10px] text-purple-300/80 block mt-0.5">Commercial Layers</span>
          </div>

          {/* Metric 2: Eggs Per 24 Hours */}
          <div className="bg-[#0e0422] border border-amber-500/30 rounded-2xl p-4 text-center sm:text-left">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
              EGGS PER 24 HOURS
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
              +{dailyEggs}
            </div>
            <span className="text-[10px] text-purple-300/80 block mt-0.5">1 Egg per Hen daily</span>
          </div>

          {/* Metric 3: Production Period */}
          <div className="bg-[#0e0422] border border-purple-500/25 rounded-2xl p-4 text-center sm:text-left">
            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">
              PRODUCTION PERIOD
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              120 Days
            </div>
            <span className="text-[10px] text-purple-300/80 block mt-0.5">Official Life Cycle</span>
          </div>

          {/* Metric 4: Eggs Earned out of Cycle Cap */}
          <div className="bg-[#0e0422] border border-pink-500/30 rounded-2xl p-4 text-center sm:text-left">
            <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider block">
              EGGS EARNED
            </span>
            <div className="text-2xl sm:text-3xl font-black text-pink-300 mt-1">
              {totalEarnedActiveFlock} / {totalCycleEggsMax}
            </div>
            <span className="text-[10px] text-purple-300/80 block mt-0.5">
              {Math.min(100, Math.round((totalEarnedActiveFlock / Math.max(1, totalCycleEggsMax)) * 100))}% of Active Cap
            </span>
          </div>
        </div>
      </div>

      {/* ====================================================
          4. RECENT EGG ACTIVITY
          ==================================================== */}
      <div
        id="recent-egg-activity-card"
        className="bg-[#14082e] border border-purple-500/30 rounded-3xl p-5 shadow-[0_0_20px_rgba(168,85,247,0.12)] space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              Recent Egg Activity
            </h3>
            <p className="text-xs text-purple-300">
              Direct log of automatic and immediate egg earning events from the backend
            </p>
          </div>
          <span className="text-xs text-purple-400 font-mono">
            {productions.length} Recorded Events
          </span>
        </div>

        {productions.length === 0 ? (
          <div className="p-8 text-center bg-[#0e0422] border border-purple-500/20 rounded-2xl text-xs text-purple-300">
            No egg earning events recorded yet. Once your hen ownership is activated by admin, your first egg batch is credited immediately.
          </div>
        ) : (
          <div className="space-y-2.5">
            {productions.slice(0, 6).map((item, idx) => {
              const isFirstBatch = item.dayNumber === 1 && item.source?.includes('Immediate');
              return (
                <div
                  key={item.id || idx}
                  className="bg-[#0e0422] hover:bg-[#160738] border border-purple-500/25 hover:border-purple-500/45 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Egg className="w-5 h-5 fill-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-white">
                          +{item.eggs} Eggs Credited
                        </span>
                        {isFirstBatch ? (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                            Immediate First Egg
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-300 border border-purple-500/20">
                            Automatic 24h Production
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-purple-300/80 font-mono mt-0.5">
                        {item.date} • {item.cycleRef || 'Active Hen Cycle'} • Day {item.dayNumber} of 120
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span className="text-xs font-bold text-amber-400 font-mono">
                      +{item.eggs} Eggs
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> Credited
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ====================================================
          5. PRODUCTION PERFORMANCE CHART
          ==================================================== */}
      <div
        id="production-chart-card"
        className="bg-[#14082e] border border-purple-500/30 rounded-3xl p-5 shadow-[0_0_20px_rgba(168,85,247,0.12)] space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-pink-400" />
              Egg Harvest Trend (Daily Output vs Date)
            </h3>
            <p className="text-xs text-purple-300">
              Yield history generated from server-side production records
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-300 bg-purple-950 px-2.5 py-1 rounded-full border border-purple-500/30">
            {eggPrice} {currency} / egg
          </span>
        </div>

        <div className="h-52 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="eggPageGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(168,85,247,0.15)" vertical={false} />
              <XAxis dataKey="date" stroke="#9333ea" tick={{ fontSize: 10, fill: '#c084fc' }} />
              <YAxis stroke="#9333ea" tick={{ fontSize: 10, fill: '#c084fc' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#13082e',
                  borderColor: '#a855f7',
                  borderRadius: '16px',
                  color: '#fff',
                  fontSize: '11px',
                }}
                formatter={(val: any) => [`${val} Eggs Harvested`, 'Daily Production']}
              />
              <Area
                type="monotone"
                dataKey="eggs"
                stroke="#ec4899"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#eggPageGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ====================================================
          6. SELL EGGS MODAL WITH PAKISTANI BANKNOTE ART
          ==================================================== */}
      <SellEggsModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        availableEggs={availableEggs}
        eggPrice={eggPrice}
        currencySymbol={currency}
        onSuccess={handleSellSuccess}
      />
    </div>
  );
};
