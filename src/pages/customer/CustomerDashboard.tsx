import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { CustomerDashboardData } from '../../types';
import { SellEggsModal } from '../../components/common/SellEggsModal';
import { SellEggsCard } from '../../components/dashboard/SellEggsCard';
import { WhatsAppHelpSection } from '../../components/customer/WhatsAppHelpSection';
import { WhatsAppFloatingButton } from '../../components/customer/WhatsAppFloatingButton';
import henCardImg from '../../assets/images/hen_3d_card_1789624452383.jpg';
import eggsCardImg from '../../assets/images/eggs_3d_card_1789624468131.jpg';
import {
  Egg,
  TrendingUp,
  Wallet,
  Clock,
  ArrowDownToLine,
  Layers,
  ArrowRight,
  Sparkles,
  Share2,
  Copy,
  Check,
  CreditCard,
  History,
  ShoppingCart,
  Gift,
  Award,
  Zap,
} from 'lucide-react';

interface CustomerDashboardProps {
  onNavigate: (view: string, params?: any) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ onNavigate }) => {
  const { user, settings } = useAuth();
  const [data, setData] = useState<CustomerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  const currency = settings?.currencySymbol || 'Rs.';

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await api.getCustomerDashboard();
      setData(res);
      if (res.nextEarningTime) {
        const targetMs = new Date(res.nextEarningTime).getTime();
        const nowMs = Date.now();
        setRemainingSeconds(Math.max(0, Math.floor((targetMs - nowMs) / 1000)));
      } else {
        setRemainingSeconds(0);
      }
    } catch (err) {
      console.error('Failed to load customer dashboard', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Live timer tick for dashboard
  useEffect(() => {
    if (!data?.nextEarningTime || !data?.isEarningActive) return;

    const timer = setInterval(() => {
      const targetMs = new Date(data.nextEarningTime!).getTime();
      const nowMs = Date.now();
      const diffSec = Math.floor((targetMs - nowMs) / 1000);

      if (diffSec <= 0) {
        setRemainingSeconds(0);
        loadData(true);
      } else {
        setRemainingSeconds(diffSec);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [data?.nextEarningTime, data?.isEarningActive]);

  const formatCountdown = (totalSeconds: number) => {
    if (totalSeconds <= 0) return '00:00:00';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleCopyReferral = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleSellSuccess = (newBalance: number, newAvailableEggs: number) => {
    if (data) {
      setData({
        ...data,
        availableBalance: newBalance,
        availableEggs: newAvailableEggs,
        soldEggs: (data.soldEggs || 0) + (data.availableEggs - newAvailableEggs),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-purple-300 text-sm">
          <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin" />
          <span>Syncing Al Jadeed Meta Eggs dashboard...</span>
        </div>
      </div>
    );
  }

  const activeHens = data?.activeHens || 0;
  const dailyEggs = data?.dailyEggs || 0;
  const availableEggs = data?.availableEggs || 0;
  const totalEggsEarned = data?.totalEggsEarned || 0;
  const soldEggs = data?.soldEggs || 0;
  const eggPrice = data?.eggPrice || settings?.eggMonetaryValue || 15;
  const primaryCycle = data?.activeOwnerships && data.activeOwnerships.length > 0 ? data.activeOwnerships[0] : null;

  return (
    <div className="w-full max-w-4xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-5 text-white pb-24 lg:pb-12">
      
      {/* 1. USER PROFILE BAR */}
      <div className="bg-gradient-to-r from-[#170838] via-[#210c4f] to-[#170838] border border-purple-500/30 rounded-3xl p-4 sm:p-5 shadow-[0_0_20px_rgba(168,85,247,0.15)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 p-0.5 shadow-md shrink-0">
            <div className="w-full h-full bg-[#0d0522] rounded-2xl flex items-center justify-center text-white font-black text-lg">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                {user?.name || 'Investor'}
              </h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE INVESTOR
              </span>
            </div>
            <p className="text-xs text-purple-300/80 font-mono mt-0.5">
              {user?.phone || user?.email} • ID: #{user?.id?.slice(-6).toUpperCase() || 'AJME'}
            </p>
          </div>
        </div>

        {/* Referral Box */}
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2 bg-[#0e0424] border border-purple-500/25 rounded-2xl px-3.5 py-2">
          <div className="text-left">
            <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider block">
              Referral Code
            </span>
            <span className="text-xs font-black text-amber-300 font-mono tracking-wide">
              {user?.referralCode || 'AJME-PRO'}
            </span>
          </div>
          <button
            onClick={handleCopyReferral}
            className="p-1.5 rounded-xl bg-purple-900/50 hover:bg-purple-800 text-purple-200 hover:text-white transition-colors cursor-pointer"
            title="Copy Referral Code"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ====================================================
          2. MAIN DASHBOARD CARD: "AVAILABLE EGGS" CONCEPT
          Large number: 0 (or real available eggs) + "EGGS"
          ==================================================== */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#240a54] via-[#140632] to-[#380c59] border border-purple-500/35 shadow-[0_0_35px_rgba(168,85,247,0.22)]">
        {/* Ambient glow in background */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Card Top Pill */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300 flex items-center gap-1.5">
              <Egg className="w-4 h-4 text-amber-400 fill-amber-400" />
              DIGITAL FLOCK HARVEST
            </span>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-200">
              1 Egg / Hen Daily • 120 Days
            </span>
          </div>

          {/* AVAILABLE EGGS Display */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
            <div>
              <span className="text-xs text-purple-300/90 font-bold uppercase tracking-wider block">
                AVAILABLE EGGS
              </span>
              <div className="flex items-baseline gap-2.5 mt-1">
                <span className="text-5xl sm:text-6xl font-black tracking-tight text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.35)]">
                  {availableEggs.toLocaleString()}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-amber-300">
                  EGGS
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[11px] text-pink-300 bg-pink-950/60 border border-pink-500/30 px-2.5 py-0.5 rounded-lg font-bold">
                  Value: {currency} {(availableEggs * eggPrice).toLocaleString()} (@ {currency}{eggPrice}/egg)
                </span>
              </div>
            </div>

            {/* DASHBOARD SUMMARY: 4 Key Egg Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-[#0d0422]/95 p-3 sm:p-4 rounded-2xl border border-purple-500/30 w-full sm:w-auto shrink-0">
              <div className="text-center px-2 py-1">
                <span className="text-[10px] text-purple-300 block font-bold uppercase tracking-wider">My Hens</span>
                <span className="text-lg sm:text-xl font-black text-white">{activeHens}</span>
              </div>
              <div className="text-center px-2 py-1 border-l border-purple-500/20">
                <span className="text-[10px] text-pink-400 block font-bold uppercase tracking-wider">Available Eggs</span>
                <span className="text-lg sm:text-xl font-black text-pink-300">{availableEggs}</span>
              </div>
              <div className="text-center px-2 py-1 border-l border-purple-500/20">
                <span className="text-[10px] text-amber-400 block font-bold uppercase tracking-wider">Next Egg In</span>
                <span className="text-sm sm:text-base font-mono font-black text-amber-300 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]">
                  {data?.isEarningActive ? formatCountdown(remainingSeconds) : '--:--:--'}
                </span>
              </div>
              <div className="text-center px-2 py-1 border-l border-purple-500/20">
                <span className="text-[10px] text-emerald-400 block font-bold uppercase tracking-wider">Eggs Today</span>
                <span className="text-lg sm:text-xl font-black text-emerald-400">+{data?.todayEggs || 0}</span>
              </div>
            </div>
          </div>

          {/* Active Cycle Progress Bar */}
          {primaryCycle && (
            <div className="pt-2">
              <div className="flex items-center justify-between text-[11px] text-purple-300 mb-1.5">
                <span>{primaryCycle.ownershipId} ({primaryCycle.numberOfHens} Commercial Hens)</span>
                <span className="font-mono font-bold text-amber-300">
                  Day {primaryCycle.daysCompleted} / 120 ({Math.round((primaryCycle.daysCompleted / 120) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-purple-950/80 rounded-full overflow-hidden border border-purple-500/30">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (primaryCycle.daysCompleted / 120) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ====================================================
          3. TWO LARGE ACTION CARDS: "BUY HENS" & "SELL EGGS"
          - BUY HENS: Purple/Violet gradient + 3D Hen Illustration
          - SELL EGGS: Pink/Magenta gradient + 3D Egg Illustration
          - Transparent-looking integration, no flat stickers
          ==================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* CARD 1: BUY HENS (PURPLE / VIOLET GRADIENT) */}
        <div
          id="dashboard-buy-hens-card"
          onClick={() => onNavigate('customer-hen-details')}
          className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#2c0e64] via-[#1c0842] to-[#3f0f69] border border-purple-500/40 shadow-[0_10px_35px_rgba(168,85,247,0.25),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:border-purple-400 hover:shadow-[0_12px_45px_rgba(168,85,247,0.4)] transition-all duration-200 cursor-pointer group flex flex-col justify-between"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-purple-500/25 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-300/90 bg-purple-950/70 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                DIGITAL COMMERCIAL FLOCK
              </span>
              <span className="text-xs font-bold text-amber-300">
                Rs. 500 / Hen
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 my-1">
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
                  BUY HENS
                </h3>
                <p className="text-xs text-purple-200/90 mt-1 max-w-[210px] sm:max-w-none leading-relaxed">
                  Earn 1 egg daily per hen for 120 consecutive days with full aviary management.
                </p>
              </div>

              {/* 3D Hen Illustration with seamless transparent-looking edge blending */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
                <div className="absolute inset-0 rounded-2xl bg-purple-500/30 blur-xl scale-95" />
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-purple-400/30 group-hover:scale-105 transition-transform duration-200">
                  <img
                    src={henCardImg}
                    alt="Al Jadeed Commercial Hen"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  {/* Subtle gradient vignette to blend edges seamlessly into card */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1c0842]/70 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4">
            <button
              type="button"
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 group-hover:from-purple-500 group-hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-[0_0_20px_rgba(168,85,247,0.35)] flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>BUY HENS NOW</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* CARD 2: SELL YOUR EGGS (PAKISTANI CURRENCY ENHANCED SECTION) */}
        <SellEggsCard
          availableEggs={availableEggs}
          eggPrice={eggPrice}
          currencySymbol={currency}
          onSellClick={() => setIsSellModalOpen(true)}
        />

      </div>

      {/* WHATSAPP SUPPORT & OFFICIAL COMMUNITY DESK */}
      <WhatsAppHelpSection whatsappSettings={settings?.whatsapp} />

      {/* 4. FLOCK ANALYTICS GRID (6 Compact Cards) */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-purple-300">
            Flock Analytics & Holdings
          </h3>
          <span className="text-[11px] text-purple-400 font-mono">120-Day Yield</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* 1. TOTAL HENS */}
          <div className="bg-[#14082e] border border-purple-500/25 hover:border-purple-500/50 rounded-2xl p-3.5 transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                Total Hens
              </span>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white">{data?.totalHens || 0}</div>
            <span className="text-[10px] text-purple-300/80 block mt-0.5">
              {activeHens} Active laying
            </span>
          </div>

          {/* 2. DAILY EGGS */}
          <div className="bg-[#14082e] border border-purple-500/25 hover:border-amber-500/40 rounded-2xl p-3.5 transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                Daily Eggs
              </span>
              <Egg className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">+{dailyEggs}</div>
            <span className="text-[10px] text-purple-300/80 block mt-0.5">
              1 Egg / hen daily
            </span>
          </div>

          {/* 3. EGGS EARNED */}
          <div className="bg-[#14082e] border border-purple-500/25 hover:border-purple-500/50 rounded-2xl p-3.5 transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                Eggs Earned
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">{totalEggsEarned}</div>
            <span className="text-[10px] text-emerald-400 block mt-0.5">
              Cumulative production
            </span>
          </div>

          {/* 4. EGGS AVAILABLE */}
          <div className="bg-[#14082e] border border-pink-500/30 hover:border-pink-500/60 rounded-2xl p-3.5 transition-all shadow-[0_0_15px_rgba(236,72,153,0.12)]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">
                Eggs Available
              </span>
              <button
                onClick={() => setIsSellModalOpen(true)}
                className="text-[10px] font-bold text-pink-300 bg-pink-950 px-1.5 py-0.5 rounded border border-pink-500/40 hover:bg-pink-900 cursor-pointer"
              >
                Sell
              </button>
            </div>
            <div className="text-2xl font-black text-pink-300">{availableEggs}</div>
            <span className="text-[10px] text-purple-300/80 block mt-0.5">
              Value: {currency} {(availableEggs * eggPrice).toLocaleString()}
            </span>
          </div>

          {/* 5. TOTAL PURCHASES */}
          <div className="bg-[#14082e] border border-purple-500/25 hover:border-purple-500/50 rounded-2xl p-3.5 transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                Total Purchases
              </span>
              <Wallet className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white truncate">
              {currency} {(data?.totalPurchases || 0).toLocaleString()}
            </div>
            <span className="text-[10px] text-purple-300/80 block mt-0.5">
              Commercial hen orders
            </span>
          </div>

          {/* 6. ACTIVE CYCLES */}
          <div className="bg-[#14082e] border border-purple-500/25 hover:border-purple-500/50 rounded-2xl p-3.5 transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                Active Cycles
              </span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">{data?.activeCycles || 0}</div>
            <span className="text-[10px] text-purple-300/80 block mt-0.5">
              120 Days duration
            </span>
          </div>
        </div>
      </div>

      {/* 5. REWARDS SECTION (4 Cards) */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-pink-400" />
            Rewards & Incentives
          </h3>
          <span className="text-[11px] text-purple-400">Bonus Pool</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-[#150930] border border-purple-500/20 rounded-2xl p-3 text-center">
            <span className="text-[10px] text-purple-400 font-bold block mb-1">
              DAILY EGGS
            </span>
            <span className="text-lg font-black text-amber-400">
              +{dailyEggs} <span className="text-xs text-purple-300">Eggs</span>
            </span>
          </div>

          <div className="bg-[#150930] border border-purple-500/20 rounded-2xl p-3 text-center">
            <span className="text-[10px] text-purple-400 font-bold block mb-1">
              REFERRAL REWARDS
            </span>
            <span className="text-lg font-black text-pink-400">
              {currency} {data?.rewards?.referralRewards?.toLocaleString() || '0'}
            </span>
          </div>

          <div className="bg-[#150930] border border-purple-500/20 rounded-2xl p-3 text-center">
            <span className="text-[10px] text-purple-400 font-bold block mb-1">
              BONUS
            </span>
            <span className="text-lg font-black text-white">
              {currency} {data?.rewards?.bonus || '0'}
            </span>
          </div>

          <div className="bg-[#150930] border border-purple-500/20 rounded-2xl p-3 text-center">
            <span className="text-[10px] text-purple-400 font-bold block mb-1">
              SPECIAL REWARDS
            </span>
            <span className="text-lg font-black text-white">
              {currency} {data?.rewards?.specialRewards || '0'}
            </span>
          </div>
        </div>
      </div>

      {/* 6. QUICK OPERATIONS GRID */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-purple-300">
            Quick Operations
          </h3>
          <span className="text-[11px] text-purple-400">Portal Services</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          <button
            onClick={() => onNavigate('customer-transactions')}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-[#14082e] border border-purple-500/20 hover:border-purple-500/60 hover:bg-[#1d0a42] transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-900/50 flex items-center justify-center text-purple-300 group-hover:text-white group-hover:scale-110 transition-transform">
              <History className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-purple-200">Transactions</span>
          </button>

          <button
            onClick={() => onNavigate('customer-orders')}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-[#14082e] border border-purple-500/20 hover:border-purple-500/60 hover:bg-[#1d0a42] transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-900/50 flex items-center justify-center text-indigo-300 group-hover:text-white group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-purple-200">Purchases</span>
          </button>

          <button
            onClick={() => setIsSellModalOpen(true)}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-b from-[#220c4a] to-[#14082e] border border-pink-500/30 hover:border-pink-500 hover:bg-[#280e56] transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-amber-400 flex items-center justify-center text-slate-950 font-bold group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(236,72,153,0.4)]">
              <Egg className="w-5 h-5 fill-slate-950" />
            </div>
            <span className="text-[11px] font-bold text-pink-300">Sell Eggs</span>
          </button>

          <button
            onClick={() => onNavigate('customer-my-hens')}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-[#14082e] border border-purple-500/20 hover:border-purple-500/60 hover:bg-[#1d0a42] transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-900/50 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-purple-200">My Hens</span>
          </button>

          <button
            onClick={() => onNavigate('customer-profile')}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-[#14082e] border border-purple-500/20 hover:border-purple-500/60 hover:bg-[#1d0a42] transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-900/50 flex items-center justify-center text-pink-300 group-hover:text-white group-hover:scale-110 transition-transform">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-purple-200">Referrals</span>
          </button>

          <button
            onClick={() => onNavigate('customer-withdrawals')}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-[#14082e] border border-purple-500/20 hover:border-purple-500/60 hover:bg-[#1d0a42] transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-900/50 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <ArrowDownToLine className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-purple-200">Withdraw</span>
          </button>
        </div>
      </div>

      {/* 7. WALLET CASH LIQUIDATION BANNER */}
      <div className="bg-[#14082e] border border-purple-500/30 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-purple-300 font-medium block">AVAILABLE CASH WALLET</span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">
            {currency} {(data?.availableBalance || 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-400 mt-1 block">
            Instant payout via EasyPaisa, JazzCash & Bank Transfer (IBFT)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('customer-withdrawals')}
            className="flex-1 sm:flex-none py-2.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>Withdraw Cash</span>
          </button>
          <button
            onClick={() => setIsSellModalOpen(true)}
            className="flex-1 sm:flex-none py-2.5 px-4 bg-[#210c4d] hover:bg-[#2e1069] border border-purple-500/40 text-purple-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Sell Available Eggs
          </button>
        </div>
      </div>

      {/* SELL EGGS MODAL COMPONENT */}
      <SellEggsModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        availableEggs={availableEggs}
        eggPrice={eggPrice}
        currencySymbol={currency}
        onSuccess={handleSellSuccess}
      />

      {/* FLOATING WHATSAPP SUPPORT BUTTON (TOGGLEABLE VIA ADMIN SETTINGS) */}
      <WhatsAppFloatingButton whatsappSettings={settings?.whatsapp} />
    </div>
  );
};
