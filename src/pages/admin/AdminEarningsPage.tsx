import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  TrendingUp,
  Play,
  CheckCircle2,
  AlertCircle,
  Egg,
  Calendar,
  Layers,
  ShieldCheck,
} from 'lucide-react';

export const AdminEarningsPage: React.FC = () => {
  const { settings } = useAuth();
  const [isDistributing, setIsDistributing] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currency = settings?.currencySymbol || 'Rs.';

  const handleTriggerEarnings = async () => {
    setIsDistributing(true);
    setResultMsg(null);
    try {
      const res = await api.runDailyEggProduction();
      setResultMsg({
        type: 'success',
        text: `Daily Egg Production Engine Executed! Processed ${res.cyclesProcessed} active cycles, generated ${res.eggsProducedTotal} eggs, advanced day counters (+1), and auto-completed ${res.completedCyclesCount} cycles reaching 120 days.`,
      });
    } catch (err: any) {
      setResultMsg({
        type: 'error',
        text: err.message || 'Failed to trigger egg production cycle.',
      });
    } finally {
      setIsDistributing(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6 text-white pb-24 lg:pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#170838] via-[#240b54] to-[#170838] border border-purple-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_0_20px_rgba(168,85,247,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30 text-xs font-bold mb-2">
            <Egg className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>AL JADEED PRODUCTION ENGINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Daily Egg Yield Engine
          </h1>
          <p className="text-xs text-purple-300 mt-1">
            Server-side batch execution: 1 Egg / Day per Hen • 120-Day max lifespan limit
          </p>
        </div>

        <button
          type="button"
          disabled={isDistributing}
          onClick={handleTriggerEarnings}
          className="py-3 px-5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-[0_0_25px_rgba(236,72,153,0.4)] disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>{isDistributing ? 'Processing Daily Batch...' : 'EXECUTE DAILY HARVEST (DAY +1)'}</span>
        </button>
      </div>

      {resultMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-medium flex items-center gap-3 animate-fade-in ${
            resultMsg.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/80 border-red-500/40 text-red-300'
          }`}
        >
          {resultMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{resultMsg.text}</span>
        </div>
      )}

      {/* Engine Architecture & How It Operates */}
      <div className="bg-[#14082e] text-white p-6 sm:p-8 rounded-3xl border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)] space-y-6">
        <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-pink-400" />
            Core Business Model & Strict Verification Rules
          </h3>
          <span className="px-3 py-1 bg-pink-500/20 text-pink-300 text-xs font-mono font-bold rounded-full border border-pink-500/30">
            Rule-Governed Server Engine
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-[#0d0422] rounded-2xl border border-purple-500/20 space-y-2">
            <span className="w-6 h-6 rounded-lg bg-pink-600 text-white font-bold flex items-center justify-center text-xs">
              1
            </span>
            <h4 className="font-bold text-white text-sm">Active Cycle Scan</h4>
            <p className="text-purple-300 leading-relaxed">
              Finds active ownership lots with <code className="text-pink-400 font-mono">daysCompleted &lt; 120</code>. Suspended or completed flocks produce 0 eggs.
            </p>
          </div>

          <div className="p-4 bg-[#0d0422] rounded-2xl border border-purple-500/20 space-y-2">
            <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
              2
            </span>
            <h4 className="font-bold text-white text-sm">1 Hen = 1 Egg</h4>
            <p className="text-purple-300 leading-relaxed">
              Yields exactly <code className="text-amber-400 font-mono">1 egg per hen</code> per day. Credits eggs directly to the user's available Egg Inventory.
            </p>
          </div>

          <div className="p-4 bg-[#0d0422] rounded-2xl border border-purple-500/20 space-y-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
              3
            </span>
            <h4 className="font-bold text-white text-sm">Automated 120-Day Expiry</h4>
            <p className="text-purple-300 leading-relaxed">
              When a lot reaches Day 120, status transitions to <code className="text-purple-400 font-mono">'completed'</code>. Never generates eggs after Day 120.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
