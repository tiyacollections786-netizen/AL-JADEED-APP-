import React, { useState, useEffect } from 'react';
import { Package } from '../../types';
import { api } from '../../services/api';
import {
  Egg,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
  ChevronRight,
  HelpCircle,
  Clock,
  Layers,
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
  ShoppingCart,
  Calendar,
  Zap,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: string, params?: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [calculatorQty, setCalculatorQty] = useState<number>(10);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    api.getPackages().then(setPackages).catch(console.error);
  }, []);

  const steps = [
    {
      step: '01',
      title: 'Choose Hens',
      description: 'Select your preferred quantity of commercial layer hens (1, 2, 10, or up to 100 hens) at Rs. 500 per hen.',
      icon: Egg,
    },
    {
      step: '02',
      title: 'Complete Purchase',
      description: 'Transfer funds securely via EasyPaisa, JazzCash, or Bank Alfalah IBFT and submit your payment transaction ID.',
      icon: Layers,
    },
    {
      step: '03',
      title: 'Track Daily Eggs',
      description: 'Each active hen generates 1 farm-fresh egg daily into your inventory. Watch your eggs accumulate in real-time.',
      icon: TrendingUp,
    },
    {
      step: '04',
      title: 'Complete 120-Day Cycle',
      description: 'Collect 120 eggs total per hen over the 120-day production period. Sell eggs directly for cash or withdraw anytime.',
      icon: Clock,
    },
  ];

  const businessModelPillars = [
    {
      label: 'AFFORDABLE CAPITAL',
      value: 'Rs. 500',
      sub: 'Per Hen Ownership',
      desc: 'Accessible entry with zero feed, veterinary or maintenance deductions.',
      color: 'from-pink-500 to-rose-500',
    },
    {
      label: 'DAILY YIELD',
      value: '1 Egg',
      sub: 'Per Day / Hen',
      desc: 'Guaranteed 1 grade-A farm egg produced daily by each active hen.',
      color: 'from-amber-400 to-amber-600',
    },
    {
      label: 'CYCLE DURATION',
      value: '120 Days',
      sub: 'Production Cycle',
      desc: 'Transparent automated cycle with live day-by-day progress tracking.',
      color: 'from-purple-500 to-indigo-500',
    },
    {
      label: 'MAXIMUM CAP',
      value: '120 Eggs',
      sub: 'Maximum Per Hen',
      desc: 'Strict production boundary enforced by server-authoritative logic.',
      color: 'from-emerald-400 to-teal-500',
    },
  ];

  const faqs = [
    {
      q: 'How does digital hen ownership work?',
      a: 'When you purchase hens on Al Jadeed Meta Eggs (Rs. 500 per hen), real commercial layers are allocated to your account in our biosecure climate-controlled aviary farm in Punjab. Each hen produces 1 egg daily for 120 consecutive days.',
    },
    {
      q: 'Can I sell my eggs for cash?',
      a: 'Yes! You can liquidate available eggs in your inventory directly on the platform at the admin-configured market rate (e.g. Rs. 15 per egg). The cash is credited instantly to your wallet, and you can withdraw to EasyPaisa, JazzCash, or Bank Account.',
    },
    {
      q: 'What happens after 120 days?',
      a: 'Each hen completes its commercial laying cycle at exactly Day 120 (having produced 120 eggs total). The system automatically completes the cycle, ensuring complete transparency and sustainability.',
    },
    {
      q: 'Are there feed or maintenance fees?',
      a: 'None. Your Rs. 500 purchase covers the hen, automated housing, high-nutrition feed, veterinary vaccinations, and digital monitoring for the entire 120 days.',
    },
    {
      q: 'What payment methods are supported in Pakistan?',
      a: 'We accept Bank Alfalah Islamic (IBFT / Online Banking), EasyPaisa, JazzCash, and USDT (TRC-20) stablecoin for overseas Pakistanis.',
    },
  ];

  const calcTotalCost = calculatorQty * 500;
  const calcDailyEggs = calculatorQty * 1;
  const calcCycleEggs = calculatorQty * 120;
  const calcEstimatedEggValue = calcCycleEggs * 15; // Rs. 15 per egg

  return (
    <div className="space-y-16 text-white pb-24">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6">
        {/* Glow ambient background elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-pink-500/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1b0a3d] border border-purple-500/30 text-purple-200 text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Pakistan's Digital Poultry Ownership Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Own Hens.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-amber-300">
              Track Your Eggs.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-purple-200/90 max-w-2xl mx-auto leading-relaxed">
            Purchase digital hen ownership starting at Rs. 500 and track guaranteed daily egg production from your mobile account. 1 Egg per day for 120 active production days.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => onNavigate('packages')}
              className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 font-bold text-sm text-white shadow-[0_0_30px_rgba(236,72,153,0.4)] flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>BUY HENS (Rs. 500)</span>
            </button>

            <button
              onClick={() => onNavigate('how-it-works')}
              className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-[#170838] hover:bg-[#230c54] border border-purple-500/40 text-purple-200 font-bold text-sm shadow-[0_0_15px_rgba(168,85,247,0.15)] flex items-center justify-center gap-2 transition-colors"
            >
              <span>HOW IT WORKS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Live Platform Badge */}
          <div className="pt-2 flex items-center justify-center gap-4 text-xs text-purple-300 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              No Hidden Fees
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              100% Mortality Replacement
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              EasyPaisa / JazzCash
            </span>
          </div>
        </div>
      </section>

      {/* 2. THE CORE BUSINESS MODEL (4 Highlight Pillars) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h2 className="text-xs font-black uppercase tracking-widest text-pink-400 mb-1">
            CORE MATHEMATICAL MODEL
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            Transparent Poultry Production Rules
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {businessModelPillars.map((pillar, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-[#19093b] to-[#12062c] border border-purple-500/30 hover:border-purple-500/60 rounded-3xl p-5 shadow-[0_0_20px_rgba(168,85,247,0.12)] transition-all flex flex-col justify-between group"
            >
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 block mb-2">
                  {pillar.label}
                </span>
                <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-pink-300">
                  {pillar.value}
                </div>
                <div className="text-xs font-bold text-amber-300 mt-1">
                  {pillar.sub}
                </div>
              </div>
              <p className="text-xs text-purple-300/80 mt-4 leading-relaxed">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. INTERACTIVE PURCHASE CALCULATOR */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-[#270b54] via-[#160633] to-[#360d50] border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_35px_rgba(168,85,247,0.25)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-pink-400 block mb-1">
                INSTANT FLOCK ESTIMATOR
              </span>
              <h3 className="text-2xl font-black text-white">
                Calculate Your Egg Production
              </h3>
            </div>
            <div className="text-right sm:text-right">
              <span className="text-xs text-purple-300">Fixed Rate</span>
              <div className="text-lg font-bold text-amber-300">Rs. 500 / Hen</div>
            </div>
          </div>

          {/* Slider & Quantity Selector */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-200">Selected Quantity:</span>
              <span className="text-xl font-black text-white">{calculatorQty} Hens</span>
            </div>

            <input
              type="range"
              min="1"
              max="50"
              value={calculatorQty}
              onChange={e => setCalculatorQty(parseInt(e.target.value, 10))}
              className="w-full h-2.5 bg-purple-950 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />

            <div className="flex items-center gap-2">
              {[1, 5, 10, 20, 50].map(val => (
                <button
                  key={val}
                  onClick={() => setCalculatorQty(val)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    calculatorQty === val
                      ? 'bg-pink-600 text-white shadow-sm'
                      : 'bg-[#1b0a3d] text-purple-300 hover:bg-purple-900/40 border border-purple-500/25'
                  }`}
                >
                  {val} Hens
                </button>
              ))}
            </div>
          </div>

          {/* Computation Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0d0422]/90 p-4 rounded-2xl border border-purple-500/30 mb-6">
            <div>
              <span className="text-[10px] text-purple-400 font-bold block">PURCHASE COST</span>
              <span className="text-lg font-black text-white">Rs. {calcTotalCost.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-purple-400 font-bold block">DAILY EGGS</span>
              <span className="text-lg font-black text-amber-400">+{calcDailyEggs} Eggs / d</span>
            </div>
            <div>
              <span className="text-[10px] text-purple-400 font-bold block">120-DAY EGGS</span>
              <span className="text-lg font-black text-emerald-400">{calcCycleEggs} Eggs</span>
            </div>
            <div>
              <span className="text-[10px] text-purple-400 font-bold block">ESTIMATED EGG VALUE</span>
              <span className="text-lg font-black text-pink-400">Rs. {calcEstimatedEggValue.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('packages', { quantity: calculatorQty })}
            className="w-full py-3.5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 font-bold text-sm text-white rounded-2xl shadow-[0_0_25px_rgba(236,72,153,0.35)] flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <span>Proceed with {calculatorQty} Hens (Rs. {calcTotalCost.toLocaleString()})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 4. HOW IT WORKS (4-Step Visual Section) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-xs font-black uppercase tracking-widest text-pink-400 mb-1">
            STEP-BY-STEP PROCESS
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            How Al Jadeed Meta Eggs Works
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map(s => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="bg-[#14082e] border border-purple-500/25 hover:border-purple-500/50 rounded-3xl p-5 relative overflow-hidden transition-all group"
              >
                <span className="text-3xl font-black text-purple-700/40 absolute top-4 right-4 font-mono group-hover:text-purple-600/60 transition-colors">
                  {s.step}
                </span>

                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600/30 to-purple-600/30 border border-purple-500/40 flex items-center justify-center text-pink-400 mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
                <p className="text-xs text-purple-300/80 leading-relaxed">
                  {s.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. LOCATIONS IN PUNJAB & DIRECT WHATSAPP SUPPORT */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-[#14082e] border border-purple-500/30 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-pink-400 block mb-1">
                PHYSICAL INFRASTRUCTURE
              </span>
              <h3 className="text-2xl font-black text-white">
                Farm & Distribution Hubs in Punjab
              </h3>
            </div>
            <a
              href="https://wa.me/923008476546"
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-colors self-start sm:self-auto"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Support (+92 300 8476546)</span>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-[#1b0a3d] border border-purple-500/20 rounded-2xl">
              <div className="flex items-center gap-2 text-pink-400 mb-1">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold text-white">Digital Poultry Farm</span>
              </div>
              <p className="text-xs text-purple-300">
                Near Motorway Interchange, Sheikhupura Road, Punjab, Pakistan
              </p>
              <span className="text-[10px] text-purple-400 block mt-2">Aviary Unit #1-4</span>
            </div>

            <div className="p-4 bg-[#1b0a3d] border border-purple-500/20 rounded-2xl">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold text-white">Egg Grading Center</span>
              </div>
              <p className="text-xs text-purple-300">
                Wholesale Poultry Mandi, Badami Bagh, Lahore, Punjab
              </p>
              <span className="text-[10px] text-purple-400 block mt-2">Daily Wholesale Dispatch</span>
            </div>

            <div className="p-4 bg-[#1b0a3d] border border-purple-500/20 rounded-2xl">
              <div className="flex items-center gap-2 text-purple-400 mb-1">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold text-white">Agri-Fintech Hub</span>
              </div>
              <p className="text-xs text-purple-300">
                Commercial Zone, Gulberg III, Lahore, Pakistan
              </p>
              <span className="text-[10px] text-purple-400 block mt-2">Corporate Management</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h2 className="text-xs font-black uppercase tracking-widest text-pink-400 mb-1">
            CLEAR ANSWERS
          </h2>
          <p className="text-2xl font-black text-white">
            Frequently Asked Questions
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="bg-[#14082e] border border-purple-500/25 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-white hover:text-pink-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 text-purple-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-90 text-pink-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-purple-200/80 leading-relaxed border-t border-purple-500/10 pt-2 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
