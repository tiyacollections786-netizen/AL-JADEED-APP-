import React, { useState, useEffect } from 'react';
import { Package } from '../../types';
import { api } from '../../services/api';
import { PurchaseModal } from '../../components/packages/PurchaseModal';
import { useAuth } from '../../context/AuthContext';
import {
  Egg,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  ShoppingCart,
  Clock,
  Zap,
} from 'lucide-react';

interface PackagesPageProps {
  onNavigate: (view: string, params?: any) => void;
  initialQuantity?: number;
}

export const PackagesPage: React.FC<PackagesPageProps> = ({ onNavigate, initialQuantity = 10 }) => {
  const { settings, isAuthenticated } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedQty, setSelectedQty] = useState<number>(initialQuantity);
  const [selectedPkgForModal, setSelectedPkgForModal] = useState<Package | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const currency = settings?.currencySymbol || 'Rs.';

  useEffect(() => {
    api.getPackages().then(data => {
      setPackages(data);
      setIsLoading(false);
    }).catch(err => {
      console.error('Failed to load packages', err);
      setIsLoading(false);
    });
  }, []);

  const handleOpenPurchase = (pkg: Package) => {
    onNavigate('customer-hen-details', { quantity: selectedQty, pkg });
  };

  const primaryPackage = packages[0] || {
    id: 'ajme-layer-primary',
    name: 'Al Jadeed Layer Hen',
    breed: 'Al Jadeed Commercial Layer',
    pricePerHen: 500,
    minQuantity: 1,
    maxQuantity: 100,
    dailyReturnPerHen: 15,
    cycleDays: 120,
    riskRating: 'Low Risk',
    status: 'active',
  };

  const totalCost = selectedQty * 500;
  const dailyEggs = selectedQty * 1;
  const totalCycleEggs = selectedQty * 120;
  const estimatedEggValue = totalCycleEggs * (settings?.eggMonetaryValue || 15);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6 text-white pb-24 lg:pb-12">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#170838] via-[#210c4f] to-[#170838] border border-purple-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_0_20px_rgba(168,85,247,0.15)] text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-500/30 text-amber-300 text-xs font-bold mb-2">
            <Egg className="w-3.5 h-3.5 fill-amber-300" />
            <span>Official Hen Allocation Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Buy Al Jadeed Hens
          </h1>
          <p className="text-xs text-purple-300 mt-1 max-w-lg">
            Every hen is Rs. 500. Automatically produces 1 farm egg daily for exactly 120 active production days.
          </p>
        </div>

        <div className="bg-[#0e0424] border border-purple-500/25 p-3 rounded-2xl text-right sm:text-right">
          <span className="text-[10px] text-purple-400 font-bold uppercase block">Fixed Hen Price</span>
          <span className="text-xl font-black text-amber-300">Rs. 500</span>
          <span className="text-[10px] text-purple-300 block">per hen / 120 days</span>
        </div>
      </div>

      {/* Primary Hen Selection Card */}
      <div className="bg-gradient-to-br from-[#240a50] via-[#14062c] to-[#3b0d5c] border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_35px_rgba(168,85,247,0.25)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-pink-400 block mb-1">
              COMMERCIAL LAYER FLOCK
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {primaryPackage.name}
            </h2>
            <p className="text-xs text-purple-300/90 mt-1">
              Breed: {primaryPackage.breed} • Automated climate aviary housing included
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#0e0424] border border-purple-500/30 px-3 py-1.5 rounded-full self-start">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-300">100% Replacement Guarantee</span>
          </div>
        </div>

        {/* 4 Feature Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-[#0d0422]/90 border border-purple-500/20 p-3 rounded-2xl text-center">
            <span className="text-[10px] text-purple-400 font-bold block">COST / HEN</span>
            <span className="text-base font-black text-white">Rs. 500</span>
          </div>
          <div className="bg-[#0d0422]/90 border border-purple-500/20 p-3 rounded-2xl text-center">
            <span className="text-[10px] text-purple-400 font-bold block">DAILY YIELD</span>
            <span className="text-base font-black text-amber-400">1 Egg / Day</span>
          </div>
          <div className="bg-[#0d0422]/90 border border-purple-500/20 p-3 rounded-2xl text-center">
            <span className="text-[10px] text-purple-400 font-bold block">CYCLE DURATION</span>
            <span className="text-base font-black text-white">120 Days</span>
          </div>
          <div className="bg-[#0d0422]/90 border border-purple-500/20 p-3 rounded-2xl text-center">
            <span className="text-[10px] text-purple-400 font-bold block">TOTAL EGGS</span>
            <span className="text-base font-black text-emerald-400">120 Eggs / Hen</span>
          </div>
        </div>

        {/* Interactive Quantity Selector */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-purple-200 uppercase tracking-wider">
              Select Quantity to Own:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="100"
                value={selectedQty}
                onChange={e => setSelectedQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-20 bg-[#0d0422] border border-purple-500/40 rounded-xl px-3 py-1 text-center font-black text-white text-base focus:border-pink-500 outline-none"
              />
              <span className="text-xs text-purple-300 font-bold">Hens</span>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 5, 10, 20].map(q => (
              <button
                key={q}
                onClick={() => setSelectedQty(q)}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedQty === q
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.35)] scale-102'
                    : 'bg-[#150736] border border-purple-500/25 text-purple-300 hover:bg-[#200c50] hover:text-white'
                }`}
              >
                {q} {q === 1 ? 'Hen' : 'Hens'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[30, 50, 100].map(q => (
              <button
                key={q}
                onClick={() => setSelectedQty(q)}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedQty === q
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.35)] scale-102'
                    : 'bg-[#150736] border border-purple-500/25 text-purple-300 hover:bg-[#200c50] hover:text-white'
                }`}
              >
                {q} Commercial Flock
              </button>
            ))}
          </div>
        </div>

        {/* Calculated Financial & Production Overview */}
        <div className="bg-[#0e0424] border border-purple-500/30 rounded-2xl p-4 sm:p-5 space-y-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 block">
            Order Financial Calculation
          </span>

          <div className="flex items-center justify-between text-xs pb-2 border-b border-purple-500/20">
            <span className="text-purple-300">Total Purchase Price ({selectedQty} × Rs. 500)</span>
            <span className="font-bold text-white text-sm">Rs. {totalCost.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between text-xs pb-2 border-b border-purple-500/20">
            <span className="text-purple-300">Daily Egg Harvest</span>
            <span className="font-bold text-amber-400 text-sm">+{dailyEggs} Eggs / day</span>
          </div>

          <div className="flex items-center justify-between text-xs pb-2 border-b border-purple-500/20">
            <span className="text-purple-300">Total Eggs across 120-Day Cycle</span>
            <span className="font-bold text-emerald-400 text-sm">{totalCycleEggs} Eggs</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <div>
              <span className="text-white font-bold block">Estimated Egg Value</span>
              <span className="text-[10px] text-purple-400">Calculated @ Rs. 15 / egg</span>
            </div>
            <span className="font-black text-pink-400 text-base sm:text-lg">
              Rs. {estimatedEggValue.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => handleOpenPurchase(primaryPackage)}
          className="w-full py-4 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 font-bold text-sm sm:text-base text-white rounded-2xl shadow-[0_0_30px_rgba(236,72,153,0.4)] flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>BUY {selectedQty} HENS FOR Rs. {totalCost.toLocaleString()}</span>
          <ArrowRight className="w-5 h-5 ml-1" />
        </button>

        <p className="text-center text-[11px] text-purple-400">
          Payment via Bank Alfalah Islamic (IBFT), EasyPaisa, JazzCash, or USDT stablecoin.
        </p>
      </div>

      {/* Production & Cycle Guarantee Notice */}
      <div className="bg-[#14082e] border border-purple-500/20 rounded-3xl p-5 space-y-2 text-xs text-purple-300 leading-relaxed">
        <h3 className="font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Strict 120-Day Cycle Rule
        </h3>
        <p>
          Each hen cycle is guaranteed to generate exactly 1 egg every 24 hours for 120 consecutive calendar days. After day 120, the production cycle concludes automatically with exactly 120 eggs recorded per hen. All calculations and egg disbursements are validated server-side.
        </p>
      </div>

      {/* PURCHASE MODAL COMPONENT */}
      {selectedPkgForModal && (
        <PurchaseModal
          pkg={selectedPkgForModal}
          initialQuantity={selectedQty}
          onClose={() => setSelectedPkgForModal(null)}
          onSuccess={(orderId) => {
            setSelectedPkgForModal(null);
            onNavigate('customer-orders');
          }}
          onNavigateLogin={() => onNavigate('login')}
        />
      )}
    </div>
  );
};
