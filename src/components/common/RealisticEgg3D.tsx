import React from 'react';

interface RealisticEgg3DProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  pulse?: boolean;
  className?: string;
}

export const RealisticEgg3D: React.FC<RealisticEgg3DProps> = ({
  size = 'md',
  pulse = true,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-16 h-20',
    md: 'w-24 h-32 sm:w-28 sm:h-36',
    lg: 'w-36 h-48 sm:w-44 sm:h-56',
    xl: 'w-48 h-64 sm:w-56 sm:h-72',
  };

  return (
    <div
      id="realistic-3d-egg-container"
      className={`relative flex items-center justify-center select-none ${className}`}
    >
      {/* Ambient background bloom & glow */}
      <div
        className="absolute w-40 h-40 sm:w-56 sm:h-56 rounded-full blur-3xl pointer-events-none transition-all duration-700"
        style={{
          background: 'radial-gradient(circle, rgba(234, 179, 8, 0.35) 0%, rgba(168, 85, 247, 0.3) 50%, rgba(20, 8, 46, 0) 80%)',
        }}
      />

      {/* Floating 3D Egg Body */}
      <div
        className={`relative ${sizeMap[size]} transition-transform duration-500 ${
          pulse ? 'animate-[eggFloat_4s_ease-in-out_infinite]' : ''
        }`}
        style={{
          filter: 'drop-shadow(0 15px 25px rgba(0, 0, 0, 0.6)) drop-shadow(0 0 20px rgba(234, 179, 8, 0.35))',
        }}
      >
        <svg
          viewBox="0 0 200 260"
          className="w-full h-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Primary 3D Egg Base Gradient (Warm Pearlescent Gold / Ivory) */}
            <radialGradient id="egg3dBody" cx="38%" cy="32%" r="65%" fx="30%" fy="25%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="15%" stopColor="#fff9e6" />
              <stop offset="45%" stopColor="#f7dfa5" />
              <stop offset="75%" stopColor="#eab308" />
              <stop offset="92%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#581c87" />
            </radialGradient>

            {/* Specular Highlight Gloss (Top-left spotlight) */}
            <radialGradient id="eggGloss" cx="32%" cy="26%" r="28%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#ffffff" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>

            {/* Rim light / Purple bounce reflection on right & bottom edge */}
            <linearGradient id="eggRim" x1="100%" y1="100%" x2="40%" y2="40%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#a855f7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Soft ground shadow beneath floating egg */}
            <radialGradient id="eggFloorShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.6" />
              <stop offset="70%" stopColor="#1e0b4b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Organic 3D Egg Geometry */}
          {/* Standard egg mathematical cubic curves: top is narrower, bottom is wider */}
          <path
            d="M 100,12 
               C 152,12 188,72 188,146 
               C 188,212 152,248 100,248 
               C 48,248 12,212 12,146 
               C 12,72 48,12 100,12 Z"
            fill="url(#egg3dBody)"
          />

          {/* Purple/Violet rim bounce glow along the shaded side */}
          <path
            d="M 100,12 
               C 152,12 188,72 188,146 
               C 188,212 152,248 100,248 
               C 48,248 12,212 12,146 
               C 12,72 48,12 100,12 Z"
            fill="url(#eggRim)"
            style={{ mixBlendMode: 'screen' }}
          />

          {/* Primary High-Gloss Glaze Reflection */}
          <ellipse
            cx="75"
            cy="70"
            rx="38"
            ry="55"
            transform="rotate(-20 75 70)"
            fill="url(#eggGloss)"
          />

          {/* Secondary micro-highlight glint */}
          <ellipse
            cx="64"
            cy="52"
            rx="12"
            ry="18"
            transform="rotate(-25 64 52)"
            fill="#ffffff"
            opacity="0.85"
          />

          {/* Soft Gold Micro Embellishment line around equator */}
          <path
            d="M 28,155 Q 100,185 172,155"
            stroke="url(#eggRim)"
            strokeWidth="1.5"
            fill="none"
            opacity="0.4"
            strokeDasharray="4 6"
          />
        </svg>

        {/* Floating Sparkle Stars */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-300 rounded-full blur-[1px] animate-ping opacity-75" />
        <div className="absolute top-1/4 -left-2 w-2 h-2 bg-purple-300 rounded-full blur-[0.5px] animate-pulse" />
        <div className="absolute bottom-6 right-2 w-2.5 h-2.5 bg-yellow-200 rounded-full blur-[1px] animate-pulse delay-300" />
      </div>

      {/* Floating Floor Shadow */}
      <div
        className="absolute -bottom-4 w-28 sm:w-36 h-4 rounded-full blur-md"
        style={{
          background: 'radial-gradient(ellipse, rgba(0, 0, 0, 0.7) 0%, rgba(88, 28, 135, 0.4) 60%, transparent 100%)',
        }}
      />

      <style>{`
        @keyframes eggFloat {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-8px) rotate(1.5deg);
          }
        }
      `}</style>
    </div>
  );
};
