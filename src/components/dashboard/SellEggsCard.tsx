import React, { useState } from 'react';
import { Egg, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import currency500Img from '../../assets/images/currency_500.jpg';
import currency5000Img from '../../assets/images/currency_5000.jpg';
import currencyBackdropImg from '../../assets/images/currency_backdrop.jpg';
import eggsCardImg from '../../assets/images/eggs_3d_card_1789624468131.jpg';

interface SellEggsCardProps {
  availableEggs: number;
  eggPrice: number;
  currencySymbol?: string;
  onSellClick: () => void;
  className?: string;
}

export const SellEggsCard: React.FC<SellEggsCardProps> = ({
  availableEggs,
  eggPrice,
  currencySymbol = 'Rs.',
  onSellClick,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Exact calculations preserving all business logic
  const totalValue = availableEggs * eggPrice;
  const hasEggsToSell = availableEggs > 0;

  return (
    <div
      id="dashboard-sell-eggs-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSellClick}
      className={`relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#270742] via-[#140429] to-[#36094a] border border-purple-500/40 shadow-[0_12px_45px_rgba(168,85,247,0.24),inset_0_1px_2px_rgba(255,255,255,0.14)] hover:border-pink-400/80 hover:shadow-[0_18px_55px_rgba(236,72,153,0.38),0_0_35px_rgba(245,158,11,0.22)] transition-all duration-300 cursor-pointer group flex flex-col justify-between select-none ${className}`}
      role="region"
      aria-label="Sell Your Eggs dashboard section"
    >
      {/* Scoped CSS Keyframe Animations for Natural, Non-Aggressive Floating Currency Layers */}
      <style>{`
        @keyframes ajme-float-1 {
          0%, 100% { transform: translateY(0px) rotate(12deg); }
          50% { transform: translateY(-7px) rotate(14deg); }
        }
        @keyframes ajme-float-2 {
          0%, 100% { transform: translateY(0px) rotate(-14deg); }
          50% { transform: translateY(6px) rotate(-12deg); }
        }
        @keyframes ajme-float-3 {
          0%, 100% { transform: translateY(0px) rotate(15deg); }
          50% { transform: translateY(-6px) rotate(13deg); }
        }
        @keyframes ajme-float-4 {
          0%, 100% { transform: translateY(0px) rotate(-13deg); }
          50% { transform: translateY(7px) rotate(-15deg); }
        }
        @keyframes ajme-float-center-1 {
          0%, 100% { transform: translate(-50%, 0px) rotate(4deg); }
          50% { transform: translate(-50%, -6px) rotate(2deg); }
        }
        @keyframes ajme-float-center-2 {
          0%, 100% { transform: translate(-50%, 0px) rotate(-5deg); }
          50% { transform: translate(-50%, 5px) rotate(-7deg); }
        }
        @keyframes ajme-float-edge-right {
          0%, 100% { transform: translateY(0px) rotate(25deg); }
          50% { transform: translateY(-8px) rotate(27deg); }
        }
        @keyframes ajme-float-edge-left {
          0%, 100% { transform: translateY(0px) rotate(-23deg); }
          50% { transform: translateY(7px) rotate(-21deg); }
        }
        @keyframes ajme-coin-pulse {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.38; }
          50% { transform: translateY(-5px) scale(1.08); opacity: 0.52; }
        }
      `}</style>

      {/* =========================================================
          BACKGROUND DECORATIVE CURRENCY LAYER (STRICTLY BEHIND CONTENT)
          - 8 to 10 natural Pakistani currency elements (Rs. 500 & Rs. 5000)
          - Layered depth (foreground, mid, background, fanned backdrop)
          - Soft golden and purple blooms
          - Completely hidden from screen readers, pointer-events-none
          ========================================================= */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        {/* Soft Diffused Ambient Bloom Orbs */}
        <div className="absolute -top-14 -right-14 w-60 h-60 bg-amber-500/18 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-115" />
        <div className="absolute -bottom-14 -left-14 w-60 h-60 bg-purple-600/22 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-pink-500/15 rounded-full blur-2xl" />

        {/* 0. DEEP BACKGROUND: Fanned Currency Silhouette Backdrop */}
        <div
          className="absolute inset-0 mix-blend-screen opacity-[0.09] transition-opacity duration-500 group-hover:opacity-[0.14]"
          style={{
            backgroundImage: `url(${currencyBackdropImg})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            filter: 'contrast(1.2) brightness(0.9)',
          }}
        />

        {/* 1. TOP-RIGHT NOTE (Rs. 5000 Note - Mustard Gold, Foreground) */}
        <div
          className="absolute -top-7 -right-8 sm:-right-6 w-40 sm:w-52 md:w-56 transition-all duration-500 ease-out origin-top-right"
          style={{
            animation: 'ajme-float-1 8s ease-in-out infinite',
            opacity: isHovered ? 0.44 : 0.35,
            filter: 'contrast(1.18) brightness(0.96)',
          }}
        >
          <div className="relative rounded-xl overflow-hidden shadow-[0_0_26px_rgba(245,158,11,0.34)] border border-amber-300/45">
            <img
              src={currency5000Img}
              alt=""
              role="presentation"
              className="w-full h-auto object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#140429] via-transparent to-[#270742]/40 mix-blend-multiply" />
          </div>
        </div>

        {/* 2. TOP-LEFT NOTE (Rs. 500 Note - Emerald Green, Mid-Foreground) */}
        <div
          className="absolute -top-6 -left-8 sm:-left-6 w-38 sm:w-48 md:w-52 transition-all duration-500 ease-out origin-top-left"
          style={{
            animation: 'ajme-float-2 9.5s ease-in-out infinite',
            opacity: isHovered ? 0.40 : 0.32,
            filter: 'contrast(1.16) brightness(0.96)',
          }}
        >
          <div className="relative rounded-xl overflow-hidden shadow-[0_0_24px_rgba(168,85,247,0.35)] border border-emerald-400/40">
            <img
              src={currency500Img}
              alt=""
              role="presentation"
              className="w-full h-auto object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#140429] via-transparent to-[#36094a]/40 mix-blend-multiply" />
          </div>
        </div>

        {/* 3. BOTTOM-LEFT NOTE (Rs. 5000 Note - Mustard Gold, Foreground) */}
        <div
          className="absolute -bottom-8 -left-8 sm:-left-6 w-40 sm:w-50 md:w-54 transition-all duration-500 ease-out origin-bottom-left"
          style={{
            animation: 'ajme-float-3 8.5s ease-in-out infinite',
            opacity: isHovered ? 0.42 : 0.34,
            filter: 'contrast(1.18) brightness(0.96)',
          }}
        >
          <div className="relative rounded-xl overflow-hidden shadow-[0_0_24px_rgba(245,158,11,0.32)] border border-amber-300/40">
            <img
              src={currency5000Img}
              alt=""
              role="presentation"
              className="w-full h-auto object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#140429] via-transparent to-[#36094a]/40 mix-blend-multiply" />
          </div>
        </div>

        {/* 4. BOTTOM-RIGHT NOTE (Rs. 500 Note - Emerald Green, Mid-Foreground) */}
        <div
          className="absolute -bottom-10 -right-8 sm:-right-6 w-38 sm:w-48 md:w-52 transition-all duration-500 ease-out origin-bottom-right"
          style={{
            animation: 'ajme-float-4 10.5s ease-in-out infinite',
            opacity: isHovered ? 0.38 : 0.30,
            filter: 'contrast(1.16) brightness(0.96)',
          }}
        >
          <div className="relative rounded-xl overflow-hidden shadow-[0_0_24px_rgba(168,85,247,0.35)] border border-emerald-400/35">
            <img
              src={currency500Img}
              alt=""
              role="presentation"
              className="w-full h-auto object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#140429] via-transparent to-[#270742]/40 mix-blend-multiply" />
          </div>
        </div>

        {/* 5. BEHIND MAIN CARD: CENTER-TOP NOTE (Rs. 5000 Note - Layered Depth) */}
        <div
          className="absolute top-2 left-1/3 w-44 sm:w-60 transition-all duration-700 ease-out pointer-events-none"
          style={{
            animation: 'ajme-float-center-1 12s ease-in-out infinite',
            opacity: isHovered ? 0.26 : 0.18,
            filter: 'blur(0.5px) contrast(1.12) brightness(0.92)',
          }}
        >
          <div className="relative rounded-xl overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.24)] border border-amber-300/25">
            <img
              src={currency5000Img}
              alt=""
              role="presentation"
              className="w-full h-auto object-cover rounded-xl"
            />
          </div>
        </div>

        {/* 6. BEHIND MAIN CARD: CENTER-LOWER NOTE (Rs. 500 Note - Deeper Layer) */}
        <div
          className="absolute bottom-14 left-1/2 w-42 sm:w-56 transition-all duration-700 ease-out pointer-events-none"
          style={{
            animation: 'ajme-float-center-2 11.5s ease-in-out infinite',
            opacity: isHovered ? 0.24 : 0.17,
            filter: 'blur(1px) contrast(1.1) brightness(0.90)',
          }}
        >
          <div className="relative rounded-xl overflow-hidden shadow-[0_0_18px_rgba(168,85,247,0.22)] border border-emerald-400/22">
            <img
              src={currency500Img}
              alt=""
              role="presentation"
              className="w-full h-auto object-cover rounded-xl"
            />
          </div>
        </div>

        {/* 7. RIGHT EDGE NOTE (Rs. 500 Note - Edge Angle Peeking In) */}
        <div
          className="absolute top-1/3 -right-12 sm:-right-8 w-36 sm:w-44 transition-all duration-700 ease-out"
          style={{
            animation: 'ajme-float-edge-right 9s ease-in-out infinite',
            opacity: isHovered ? 0.34 : 0.25,
            filter: 'contrast(1.14) brightness(0.95)',
          }}
        >
          <div className="relative rounded-xl overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.28)] border border-emerald-400/30">
            <img
              src={currency500Img}
              alt=""
              role="presentation"
              className="w-full h-auto object-cover rounded-xl"
            />
          </div>
        </div>

        {/* 8. LEFT EDGE NOTE (Rs. 5000 Note - Edge Angle Peeking In) */}
        <div
          className="absolute top-1/2 -left-12 sm:-left-8 -translate-y-1/2 w-36 sm:w-44 transition-all duration-700 ease-out"
          style={{
            animation: 'ajme-float-edge-left 10s ease-in-out infinite',
            opacity: isHovered ? 0.32 : 0.24,
            filter: 'contrast(1.14) brightness(0.95)',
          }}
        >
          <div className="relative rounded-xl overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.26)] border border-amber-300/30">
            <img
              src={currency5000Img}
              alt=""
              role="presentation"
              className="w-full h-auto object-cover rounded-xl"
            />
          </div>
        </div>

        {/* 9. FLOATING GOLD COIN (Top Left-Center) */}
        <div
          className="absolute top-3 left-[28%] transition-all duration-700 ease-out"
          style={{ animation: 'ajme-coin-pulse 6s ease-in-out infinite' }}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 border border-yellow-200/70 shadow-[0_0_16px_rgba(250,204,21,0.5)] flex items-center justify-center text-[10px] font-black text-amber-950">
            ₨
          </div>
        </div>

        {/* 10. FLOATING GOLD COIN (Bottom Right-Center) */}
        <div
          className="absolute bottom-5 right-[28%] transition-all duration-700 ease-out"
          style={{ animation: 'ajme-coin-pulse 7.5s ease-in-out infinite 1s' }}
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-700 via-amber-400 to-yellow-200 border border-yellow-200/60 shadow-[0_0_14px_rgba(250,204,21,0.4)] flex items-center justify-center text-[8px] font-black text-amber-950">
            ₨
          </div>
        </div>

        {/* Delicate Glassmorphism Surface Glaze */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] via-transparent to-black/[0.15] pointer-events-none" />
      </div>

      {/* =========================================================
          FOREGROUND CONTENT LAYER (STRICTLY ABOVE CURRENCY)
          - Relative z-10 ensures absolute high contrast & tapability
          - Solid/backdrop-blurred backgrounds for all interactive cards
          ========================================================= */}
      <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
        
        {/* Top Header Badge & Rate */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-pink-300 bg-pink-950/80 border border-pink-500/40 px-2.5 py-0.5 rounded-full shadow-sm backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>CASH LIQUIDITY</span>
            </span>

            <span className="text-xs font-bold text-amber-300 bg-[#120426]/90 px-2.5 py-0.5 rounded-full border border-amber-400/30 shadow-sm backdrop-blur-md">
              {currencySymbol} {eggPrice} / Egg
            </span>
          </div>

          {/* Title, Subtitle, & Clean Egg Illustration */}
          <div className="flex items-start justify-between gap-3 mt-1">
            <div className="flex-1">
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md flex items-center gap-2">
                <span>Sell Your Eggs</span>
              </h3>
              <p className="text-xs text-pink-200 mt-1 max-w-[280px] sm:max-w-none leading-relaxed font-medium drop-shadow-sm">
                Turn your available eggs into account value.
              </p>
            </div>

            {/* Clean Egg Illustration with seamless rounded edge blending */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 rounded-2xl bg-pink-500/25 blur-xl scale-95" />
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-[0_4px_22px_rgba(0,0,0,0.6)] border border-pink-400/40 group-hover:scale-105 transition-transform duration-300 bg-[#1e0738]">
                <img
                  src={eggsCardImg}
                  alt="Al Jadeed Fresh Farm Eggs"
                  className="w-full h-full object-cover rounded-2xl"
                />
                {/* Gradient vignette for seamless visual integration */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#140429]/85 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* 3 Metrics Badges: Available Eggs | Egg Price | Total Value */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-1">
          {/* 1. Available Eggs */}
          <div className="p-2.5 rounded-2xl bg-[#100322]/90 backdrop-blur-md border border-purple-500/35 text-center transition-colors group-hover:border-purple-400/60 shadow-md">
            <span className="text-[9px] sm:text-[10px] text-purple-300 font-bold uppercase tracking-wider block truncate">
              Available Eggs
            </span>
            <div className="text-lg sm:text-xl font-black text-white mt-0.5 flex items-center justify-center gap-1">
              <Egg className="w-3.5 h-3.5 text-pink-400 fill-pink-400/50 shrink-0" />
              <span>{availableEggs}</span>
            </div>
          </div>

          {/* 2. Egg Price */}
          <div className="p-2.5 rounded-2xl bg-[#100322]/90 backdrop-blur-md border border-purple-500/35 text-center transition-colors group-hover:border-amber-400/50 shadow-md">
            <span className="text-[9px] sm:text-[10px] text-purple-300 font-bold uppercase tracking-wider block truncate">
              Egg Price
            </span>
            <div className="text-lg sm:text-xl font-black text-amber-300 mt-0.5">
              {currencySymbol} {eggPrice}
            </div>
          </div>

          {/* 3. Total Value */}
          <div className="p-2.5 rounded-2xl bg-[#100322]/90 backdrop-blur-md border border-emerald-500/35 text-center transition-colors group-hover:border-emerald-400/60 shadow-md">
            <span className="text-[9px] sm:text-[10px] text-emerald-400 font-bold uppercase tracking-wider block truncate">
              Total Value
            </span>
            <div className="text-lg sm:text-xl font-black text-emerald-300 mt-0.5">
              {currencySymbol} {totalValue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Primary CTA & Secondary Information */}
        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSellClick();
            }}
            className={`w-full min-h-[46px] py-3 px-4 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer shadow-md ${
              hasEggsToSell
                ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 group-hover:from-pink-500 group-hover:to-purple-500 text-white shadow-[0_0_25px_rgba(236,72,153,0.4)]'
                : 'bg-purple-900/60 text-purple-200/90 border border-purple-500/35 hover:bg-purple-900/80'
            }`}
          >
            <Egg className="w-4 h-4 fill-current" />
            <span>Sell Eggs {hasEggsToSell ? `(${availableEggs})` : ''}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Secondary Information */}
          <p className="text-[11px] text-purple-300/85 text-center flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-pink-400 shrink-0" />
            <span>Review your eggs and confirm your sale.</span>
          </p>
        </div>

      </div>
    </div>
  );
};
