import React, { useState } from 'react';
import { Package } from '../../types';
import { Egg, ArrowRight, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';

interface InvestmentCalculatorProps {
  packages: Package[];
  currencySymbol?: string;
  onSelectPackage?: (pkg: Package, quantity: number) => void;
}

export const InvestmentCalculator: React.FC<InvestmentCalculatorProps> = ({
  packages,
  currencySymbol = 'Rs.',
  onSelectPackage,
}) => {
  const [selectedPkgId, setSelectedPkgId] = useState<string>(packages[0]?.id || 'pkg-golden-comet');
  const [quantity, setQuantity] = useState<number>(5);

  const selectedPkg = packages.find(p => p.id === selectedPkgId) || packages[0];
  if (!selectedPkg) return null;

  const totalInvestment = selectedPkg.pricePerHen * quantity;
  const dailyReturn = selectedPkg.dailyReturnPerHen * quantity;
  const weeklyReturn = dailyReturn * 7;
  const monthlyReturn = dailyReturn * 30;
  const totalTermReturn = dailyReturn * selectedPkg.durationDays;
  const netProfit = totalTermReturn - totalInvestment;
  const roiPercent = Math.round((netProfit / totalInvestment) * 100);

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
      {/* Ambient background blur */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Yield Forecaster</span>
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight text-white font-display">
              Hen Flock Investment Calculator
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select your breed tier and flock size to estimate automated daily egg harvest payouts.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block uppercase tracking-wider font-semibold">
              Projected Net ROI
            </span>
            <span className="text-3xl font-black text-emerald-400">+{roiPercent}%</span>
          </div>
        </div>

        {/* Breed Selector Tabs */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            1. Select Hen Breed Tier
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {packages.map(p => {
              const isSelected = p.id === selectedPkgId;
              return (
                <button
                  key={p.id}
                  type="button"
                  id={`calc-pkg-${p.id}`}
                  onClick={() => {
                    setSelectedPkgId(p.id);
                    setQuantity(Math.max(p.minQuantity, Math.min(p.maxQuantity, quantity)));
                  }}
                  className={`p-3 rounded-2xl border text-left transition ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-white ring-2 ring-amber-500/30'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  <p className={`text-xs font-bold ${isSelected ? 'text-amber-400' : 'text-slate-200'}`}>
                    {p.name.split(' ')[0]} {p.name.split(' ')[1] || ''}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {currencySymbol} {p.pricePerHen.toLocaleString()} / hen
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantity Slider & Buttons */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              2. Choose Digital Flock Size (Hens)
            </label>
            <span className="text-sm font-extrabold text-amber-400 font-mono">
              {quantity} {quantity === 1 ? 'Hen' : 'Hens'}
            </span>
          </div>

          <div className="space-y-3">
            <input
              type="range"
              id="calc-slider"
              min={selectedPkg.minQuantity}
              max={Math.min(50, selectedPkg.maxQuantity)}
              value={quantity}
              onChange={e => setQuantity(parseInt(e.target.value, 10))}
              className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />

            <div className="flex flex-wrap gap-2">
              {[1, 2, 5, 10, 20, 50].map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setQuantity(preset)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    quantity === preset
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {preset} {preset === 1 ? 'Hen' : 'Hens'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Matrix */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-5 bg-slate-950/70 border border-slate-800 rounded-2xl">
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Investment</span>
            <span className="text-lg font-black text-white">
              {currencySymbol} {totalInvestment.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 block">{quantity} × {currencySymbol} {selectedPkg.pricePerHen}</span>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">Daily Egg Payout</span>
            <span className="text-lg font-black text-emerald-400">
              {currencySymbol} {dailyReturn.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 block">Credited daily to wallet</span>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-amber-400 block">30-Day Monthly Yield</span>
            <span className="text-lg font-black text-amber-400">
              {currencySymbol} {monthlyReturn.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 block">~{(roiPercent / (selectedPkg.durationDays / 30)).toFixed(1)}% / month</span>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-indigo-400 block">Total Lifecycle Yield</span>
            <span className="text-lg font-black text-indigo-300">
              {currencySymbol} {totalTermReturn.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 block">Over {selectedPkg.durationDays} days</span>
          </div>
        </div>

        {/* Guarantee Badge & Action CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Automated biosecurity care, vaccination & replacement insurance included.</span>
          </div>

          {onSelectPackage && (
            <button
              type="button"
              id="calc-invest-btn"
              onClick={() => onSelectPackage(selectedPkg, quantity)}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Invest in {quantity} {selectedPkg.name.split(' ')[0]} Hens</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
