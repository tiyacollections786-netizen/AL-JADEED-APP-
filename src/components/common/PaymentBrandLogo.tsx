import React from 'react';

export type PaymentBrandType = 'easypaisa' | 'jazzcash' | 'sadapay' | 'bankTransfer' | 'bank' | 'crypto';

interface PaymentBrandLogoProps {
  method: PaymentBrandType | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  customLogoUrl?: string;
}

export const PaymentBrandLogo: React.FC<PaymentBrandLogoProps> = ({
  method,
  size = 'md',
  className = '',
  customLogoUrl,
}) => {
  const normalizedMethod = (method || '').toLowerCase().replace(/[^a-z]/g, '');

  const sizeClasses = {
    sm: 'w-8 h-8 min-w-[2rem]',
    md: 'w-11 h-11 min-w-[2.75rem]',
    lg: 'w-14 h-14 min-w-[3.5rem]',
  };

  // If a custom logo URL is provided and valid, display it directly
  if (customLogoUrl && customLogoUrl.trim().length > 0) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-2xl overflow-hidden bg-white/5 border border-purple-500/20 shadow-sm shrink-0 ${sizeClasses[size]} ${className}`}
      >
        <img
          src={customLogoUrl}
          alt={method}
          className="w-full h-full object-contain p-1"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // 1. EASYPAISA (Official Brand Colors: #00B649 Green, Clean Crisp Vector)
  if (normalizedMethod.includes('easypaisa')) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-2xl overflow-hidden bg-[#00A859] p-1.5 shadow-[0_4px_14px_rgba(0,168,89,0.35)] shrink-0 ${sizeClasses[size]} ${className}`}
        title="Easypaisa"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Official Easypaisa iconic flower / circular node symbol */}
          <circle cx="50" cy="50" r="46" fill="#00A859" />
          {/* Petal nodes */}
          <circle cx="50" cy="22" r="11" fill="#FFFFFF" />
          <circle cx="50" cy="78" r="11" fill="#FFFFFF" />
          <circle cx="22" cy="50" r="11" fill="#FFFFFF" />
          <circle cx="78" cy="50" r="11" fill="#FFFFFF" />
          <circle cx="30" cy="30" r="10" fill="#FFFFFF" opacity="0.95" />
          <circle cx="70" cy="30" r="10" fill="#FFFFFF" opacity="0.95" />
          <circle cx="30" cy="70" r="10" fill="#FFFFFF" opacity="0.95" />
          <circle cx="70" cy="70" r="10" fill="#FFFFFF" opacity="0.95" />
          {/* Center core */}
          <circle cx="50" cy="50" r="14" fill="#FFFFFF" />
          <circle cx="50" cy="50" r="7" fill="#00A859" />
        </svg>
      </div>
    );
  }

  // 2. JAZZCASH (Official Brand Colors: Red #D41620, Gold #FFC72C, Jet Black)
  if (normalizedMethod.includes('jazzcash') || normalizedMethod.includes('jazz')) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-2xl overflow-hidden bg-gradient-to-br from-[#1b0808] to-[#2c0a0a] border border-red-500/40 p-1.5 shadow-[0_4px_14px_rgba(212,22,32,0.35)] shrink-0 ${sizeClasses[size]} ${className}`}
        title="JazzCash"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Jazz Red Badge Background */}
          <rect width="100" height="100" rx="20" fill="#0f0202" />
          {/* Dynamic Jazz Cash Red Swirl */}
          <path
            d="M 18,32 C 28,14 65,12 80,30 C 92,44 88,68 72,78 C 55,88 28,84 20,68 C 14,56 22,42 36,38 C 50,34 64,42 62,54 C 60,62 48,66 42,58"
            stroke="#D41620"
            strokeWidth="11"
            strokeLinecap="round"
          />
          {/* Yellow spark accent */}
          <circle cx="74" cy="30" r="7" fill="#FFC72C" />
          {/* "JC" stylized monogram text */}
          <text
            x="48"
            y="57"
            fill="#FFFFFF"
            fontSize="26"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
            textAnchor="middle"
            letterSpacing="-1"
          >
            JC
          </text>
        </svg>
      </div>
    );
  }

  // 3. SADAPAY (Official Brand Colors: Vibrant Coral-Orange #FF583D / Clean Minimalist Modern)
  if (normalizedMethod.includes('sada') || normalizedMethod.includes('sadapay')) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-2xl overflow-hidden bg-[#FF583D] p-1.5 shadow-[0_4px_16px_rgba(255,88,61,0.4)] shrink-0 ${sizeClasses[size]} ${className}`}
        title="SadaPay"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="100" height="100" rx="22" fill="#FF583D" />
          {/* SadaPay stylized dual geometric card shape & curved flow */}
          <g transform="translate(18, 18) scale(0.64)">
            {/* Background card accent */}
            <rect
              x="16"
              y="10"
              width="74"
              height="48"
              rx="10"
              fill="#FFFFFF"
              opacity="0.3"
              transform="rotate(12 53 34)"
            />
            {/* Foreground card */}
            <rect
              x="8"
              y="20"
              width="74"
              height="48"
              rx="10"
              fill="#FFFFFF"
            />
            {/* Minimalist SadaPay Card Chip & Line */}
            <rect x="18" y="32" width="14" height="11" rx="3" fill="#FF583D" />
            <circle cx="64" cy="52" r="6" fill="#FF583D" />
            <circle cx="54" cy="52" r="6" fill="#FF8D7A" opacity="0.9" />
          </g>
          {/* "S" wordmark at bottom */}
          <text
            x="50"
            y="88"
            fill="#FFFFFF"
            fontSize="18"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
            textAnchor="middle"
            letterSpacing="0.5"
          >
            SadaPay
          </text>
        </svg>
      </div>
    );
  }

  // 4. BANK TRANSFER (Professional Neoclassical Bank / Financial Institution Emblem)
  if (normalizedMethod.includes('bank') || normalizedMethod.includes('transfer') || normalizedMethod.includes('ubl') || normalizedMethod.includes('ibft')) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-2xl overflow-hidden bg-gradient-to-br from-[#1e1b4b] via-[#2e1065] to-[#1e1b4b] border border-indigo-500/40 p-1.5 shadow-[0_4px_14px_rgba(99,102,241,0.3)] shrink-0 ${sizeClasses[size]} ${className}`}
        title="Bank Transfer"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Pediment roof triangle */}
          <path d="M 50,16 L 86,34 L 14,34 Z" fill="#818CF8" />
          {/* Architrave / header beam */}
          <rect x="16" y="36" width="68" height="6" rx="2" fill="#C7D2FE" />
          {/* 4 Classical architectural pillars */}
          <rect x="22" y="44" width="8" height="30" rx="2" fill="#E0E7FF" />
          <rect x="38" y="44" width="8" height="30" rx="2" fill="#E0E7FF" />
          <rect x="54" y="44" width="8" height="30" rx="2" fill="#E0E7FF" />
          <rect x="70" y="44" width="8" height="30" rx="2" fill="#E0E7FF" />
          {/* Stylobate / base steps */}
          <rect x="14" y="76" width="72" height="6" rx="2" fill="#C7D2FE" />
          <rect x="10" y="83" width="80" height="6" rx="2" fill="#818CF8" />
        </svg>
      </div>
    );
  }

  // 5. CRYPTO / USDT
  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl overflow-hidden bg-[#26a17b] p-1.5 shadow-[0_4px_14px_rgba(38,161,123,0.3)] shrink-0 ${sizeClasses[size]} ${className}`}
      title="Tether USDT"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="44" fill="#26a17b" />
        <path
          d="M 28,34 L 72,34 L 72,42 L 55,42 L 55,50 C 69,51 78,54 78,58 C 78,63 65,66 50,66 C 35,66 22,63 22,58 C 22,54 31,51 45,50 L 45,42 L 28,42 Z"
          fill="#FFFFFF"
        />
        <path
          d="M 50,71 L 50,56 M 34,57 C 38,60 44,61 50,61 C 56,61 62,60 66,57"
          stroke="#26a17b"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
