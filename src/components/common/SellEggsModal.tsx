import React, { useState } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { fireSubtleWithdrawalConfetti } from '../../utils/confetti';
import { Egg, CheckCircle2, AlertCircle, X, Sparkles, ArrowRight } from 'lucide-react';

interface SellEggsModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableEggs: number;
  eggPrice: number;
  currencySymbol?: string;
  onSuccess: (newBalance: number, newAvailableEggs: number) => void;
}

export const SellEggsModal: React.FC<SellEggsModalProps> = ({
  isOpen,
  onClose,
  availableEggs,
  eggPrice,
  currencySymbol = 'Rs.',
  onSuccess,
}) => {
  const { showSuccess } = useToast();
  const [quantity, setQuantity] = useState<number>(availableEggs > 0 ? Math.min(10, availableEggs) : 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalAmount = quantity * eggPrice;

  const handleSell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      setError('Please select at least 1 egg to sell');
      return;
    }
    if (quantity > availableEggs) {
      setError(`You only have ${availableEggs} eggs available`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.sellEggs(quantity);
      setSuccessMsg(`Successfully sold ${quantity} eggs for ${currencySymbol} ${totalAmount.toLocaleString()}!`);
      fireSubtleWithdrawalConfetti();
      showSuccess(
        'Eggs Converted to Cash!',
        `Successfully sold ${quantity} eggs for ${currencySymbol} ${totalAmount.toLocaleString()} credited to your balance.`
      );
      onSuccess(res.newBalance, res.newAvailableEggs);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to sell eggs');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickPercent = (pct: number) => {
    const qty = Math.floor((availableEggs * pct) / 100);
    setQuantity(qty);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#13092b] border border-purple-500/30 rounded-3xl p-6 shadow-[0_0_40px_rgba(168,85,247,0.25)] text-white">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-purple-300 hover:text-white rounded-full hover:bg-purple-900/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)]">
            <Egg className="w-7 h-7 fill-slate-950" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Sell Eggs for Cash
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-purple-300">
              Direct liquidation to wallet balance @ {currencySymbol} {eggPrice} / egg
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSell} className="space-y-4">
          {/* Available balance indicator */}
          <div className="bg-[#1b0c3d] border border-purple-500/20 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-purple-300 block">Available In Inventory</span>
              <span className="text-2xl font-black text-amber-400 flex items-center gap-1.5">
                <Egg className="w-5 h-5 fill-amber-400" />
                {availableEggs.toLocaleString()} <span className="text-sm font-semibold text-purple-300">Eggs</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-purple-300 block">Current Market Rate</span>
              <span className="text-lg font-bold text-white">
                {currencySymbol} {eggPrice} <span className="text-xs text-purple-400">/ egg</span>
              </span>
            </div>
          </div>

          {/* Quantity selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-purple-200">Quantity to Sell</label>
              <span className="text-xs text-purple-400">
                Max: {availableEggs}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(prev => Math.max(1, prev - 10))}
                disabled={quantity <= 1}
                className="w-11 h-11 rounded-xl bg-[#23104e] border border-purple-500/30 text-white font-bold hover:bg-purple-800/40 disabled:opacity-40 transition-colors flex items-center justify-center text-lg"
              >
                -10
              </button>
              <input
                type="number"
                min="1"
                max={availableEggs}
                value={quantity}
                onChange={e => {
                  const val = parseInt(e.target.value, 10);
                  setQuantity(isNaN(val) ? 0 : val);
                  setError(null);
                }}
                className="flex-1 bg-[#180937] border border-purple-500/40 focus:border-pink-500 rounded-xl px-4 py-2.5 text-center text-xl font-extrabold text-white outline-none"
              />
              <button
                type="button"
                onClick={() => setQuantity(prev => Math.min(availableEggs, prev + 10))}
                disabled={quantity >= availableEggs}
                className="w-11 h-11 rounded-xl bg-[#23104e] border border-purple-500/30 text-white font-bold hover:bg-purple-800/40 disabled:opacity-40 transition-colors flex items-center justify-center text-lg"
              >
                +10
              </button>
            </div>
          </div>

          {/* Quick percentage buttons */}
          <div className="grid grid-cols-4 gap-2">
            {[25, 50, 75, 100].map(pct => (
              <button
                key={pct}
                type="button"
                onClick={() => handleQuickPercent(pct)}
                className="py-1.5 text-xs font-bold rounded-lg bg-[#200e47] border border-purple-500/25 hover:bg-purple-700/40 text-purple-200 transition-colors"
              >
                {pct === 100 ? 'ALL' : `${pct}%`}
              </button>
            ))}
          </div>

          {/* Payout Calculation Card */}
          <div className="bg-gradient-to-r from-purple-950/80 via-[#270b4a] to-pink-950/60 border border-purple-500/40 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-purple-300">Estimated Cash Yield</span>
              <span className="text-xs font-semibold text-emerald-400">Instant Wallet Credit</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-purple-400 font-mono">
                {quantity} Eggs × {currencySymbol} {eggPrice}
              </span>
              <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-amber-300">
                {currencySymbol} {totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || quantity <= 0 || quantity > availableEggs}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 text-white font-bold text-sm rounded-2xl shadow-[0_0_25px_rgba(236,72,153,0.35)] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Confirm & Sell for {currencySymbol} {totalAmount.toLocaleString()}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
