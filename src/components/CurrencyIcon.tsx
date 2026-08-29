import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

/**
 * High-definition, sparkling gold coin icon that is clearly a minted coin (and never looks like a clock).
 */
export const CoinIcon: React.FC<IconProps> = ({ className = 'w-3.5 h-3.5', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width={size}
    height={size}
    className={`inline-block shrink-0 align-middle ${className}`}
  >
    <defs>
      <linearGradient id="coinGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="35%" stopColor="#f59e0b" />
        <stop offset="85%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
      <linearGradient id="coinInnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fffbeb" />
        <stop offset="60%" stopColor="#fde68a" />
        <stop offset="100%" stopColor="#fcd34d" />
      </linearGradient>
      <filter id="coinGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodColor="#78350f" floodOpacity="0.3" />
      </filter>
    </defs>

    {/* Outer Minted Rim */}
    <circle
      cx="12"
      cy="12"
      r="10"
      fill="url(#coinGoldGrad)"
      stroke="#92400e"
      strokeWidth="1.2"
      filter="url(#coinGlow)"
    />

    {/* Inner Milled Decorative Border */}
    <circle
      cx="12"
      cy="12"
      r="7.5"
      fill="url(#coinInnerGrad)"
      stroke="#d97706"
      strokeWidth="0.8"
      strokeDasharray="1.5 1"
    />

    {/* Botanical Florist Coin Emblem (Embossed Flower Blossom / Star Center) */}
    <g transform="translate(12, 12)">
      {/* 4 Petals */}
      <circle cx="0" cy="-3" r="1.8" fill="#d97706" opacity="0.85" />
      <circle cx="0" cy="3" r="1.8" fill="#d97706" opacity="0.85" />
      <circle cx="-3" cy="0" r="1.8" fill="#d97706" opacity="0.85" />
      <circle cx="3" cy="0" r="1.8" fill="#d97706" opacity="0.85" />
      {/* Center Gem / Seed */}
      <circle cx="0" cy="0" r="2.2" fill="#b45309" />
      <circle cx="-0.6" cy="-0.6" r="0.7" fill="#fffbeb" opacity="0.9" />
    </g>
  </svg>
);

/**
 * Botanical Bloom Token Icon (Emerald floral sprout medallion)
 */
export const BloomTokenIcon: React.FC<IconProps> = ({ className = 'w-3.5 h-3.5', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    width={size}
    height={size}
    className={`inline-block shrink-0 align-middle ${className}`}
  >
    <defs>
      <linearGradient id="tokenGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a7f3d0" />
        <stop offset="50%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="url(#tokenGreenGrad)" stroke="#065f46" strokeWidth="1.2" />
    <circle cx="12" cy="12" r="7.5" fill="#ecfdf5" stroke="#10b981" strokeWidth="0.8" />
    {/* Sprout Icon */}
    <path
      d="M12 16V10M12 10C12 7.5 10 6 7.5 6C7.5 8.5 9 10.5 12 10ZM12 10C12 7.5 14 6 16.5 6C16.5 8.5 15 10.5 12 10Z"
      stroke="#047857"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="#34d399"
    />
  </svg>
);
