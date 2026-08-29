import React from 'react';
import { GameState } from '../types';

interface FlowerShopSceneProps {
  gameState: GameState;
  children?: React.ReactNode;
}

export const FlowerShopScene: React.FC<FlowerShopSceneProps> = ({
  gameState,
  children,
}) => {
  const getLighting = () => {
    switch (gameState.timeOfDay) {
      case 'Morning':
        return {
          sky: 'from-[#fef3c7] via-[#fffbeb] to-[#f4ede4]',
          windowTint: 'rgba(254, 240, 138, 0.15)',
          beamColor: 'rgba(254, 240, 138, 0.25)',
          ambient: 'from-[#faf6f0] via-[#f7f2ea] to-[#eee7dc]',
          counter: '#854d0e',
        };
      case 'Afternoon':
        return {
          sky: 'from-[#dbeafe] via-[#f0f9ff] to-[#f4f1eb]',
          windowTint: 'rgba(191, 219, 254, 0.12)',
          beamColor: 'rgba(255, 255, 255, 0.2)',
          ambient: 'from-[#fcfaf7] via-[#f5f0e6] to-[#eee5d8]',
          counter: '#78350f',
        };
      case 'Evening':
        return {
          sky: 'from-[#475569] via-[#334155] to-[#1e293b]',
          windowTint: 'rgba(251, 146, 60, 0.2)',
          beamColor: 'rgba(251, 191, 36, 0.15)',
          ambient: 'from-[#2d2822] via-[#3a3229] to-[#25211b]',
          counter: '#5c2d0c',
        };
      case 'Rainy Night':
        return {
          sky: 'from-[#334155] via-[#475569] to-[#1e293b]',
          windowTint: 'rgba(148, 163, 184, 0.2)',
          beamColor: 'rgba(224, 242, 254, 0.1)',
          ambient: 'from-[#2f2b25] via-[#38332c] to-[#26221c]',
          counter: '#522b0f',
        };
    }
  };

  const lighting = getLighting();
  const isNight = gameState.timeOfDay === 'Evening' || gameState.timeOfDay === 'Rainy Night';

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-[#e8e2d8] shadow-sm transition-all duration-700 ${isNight ? 'text-[#fcfaf7]' : 'text-[#4a4238]'}`}>
      {/* 1. SCENIC VECTOR FLOWER SHOP BACKGROUND CANVAS */}
      <div className={`absolute inset-0 bg-gradient-to-b ${lighting.ambient} pointer-events-none`}>
        {/* Greenhouse Arch Windows & Outdoor Garden Silhouettes */}
        <svg
          viewBox="0 0 1000 480"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full opacity-90"
        >
          <defs>
            {/* Soft Sun Ray Gradient */}
            <linearGradient id="sunbeamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Glass reflection gradient */}
            <linearGradient id="glassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.15" />
            </linearGradient>

            {/* Wood Texture Pattern */}
            <pattern id="woodSlat" width="20" height="20" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="20" y2="0" stroke="#45230c" strokeWidth="0.8" opacity="0.15" />
            </pattern>
          </defs>

          {/* BACKGROUND SKY BEHIND WINDOWS */}
          <rect x="0" y="0" width="1000" height="340" fill={lighting.windowTint} />

          {/* OUTSIDE TREES & GREENERY SILHOUETTES BEHIND GLASS */}
          <g opacity={isNight ? '0.2' : '0.45'}>
            <circle cx="120" cy="180" r="110" fill="#4d7c0f" />
            <circle cx="280" cy="160" r="90" fill="#65a30d" />
            <circle cx="480" cy="190" r="120" fill="#3f6212" />
            <circle cx="720" cy="170" r="100" fill="#4d7c0f" />
            <circle cx="900" cy="185" r="115" fill="#65a30d" />
          </g>

          {/* SUN RAYS STREAMING IN */}
          {!isNight && (
            <g opacity="0.6">
              <polygon points="0,0 260,480 180,480 0,60" fill="url(#sunbeamGrad)" />
              <polygon points="200,0 520,480 420,480 150,0" fill="url(#sunbeamGrad)" />
              <polygon points="500,0 840,480 720,480 400,0" fill="url(#sunbeamGrad)" />
            </g>
          )}

          {/* GREENHOUSE MULTI-PANE ARCHED WINDOWS */}
          <g stroke="#64748b" strokeWidth="3" fill="url(#glassGrad)" opacity="0.75">
            {/* Window 1 */}
            <path d="M 60 260 L 60 80 Q 150 20 240 80 L 240 260 Z" />
            <line x1="150" y1="35" x2="150" y2="260" />
            <line x1="60" y1="120" x2="240" y2="120" />
            <line x1="60" y1="190" x2="240" y2="190" />

            {/* Window 2 */}
            <path d="M 280 260 L 280 80 Q 370 20 460 80 L 460 260 Z" />
            <line x1="370" y1="35" x2="370" y2="260" />
            <line x1="280" y1="120" x2="460" y2="120" />
            <line x1="280" y1="190" x2="460" y2="190" />

            {/* Window 3 */}
            <path d="M 540 260 L 540 80 Q 630 20 720 80 L 720 260 Z" />
            <line x1="630" y1="35" x2="630" y2="260" />
            <line x1="540" y1="120" x2="720" y2="120" />
            <line x1="540" y1="190" x2="720" y2="190" />

            {/* Window 4 */}
            <path d="M 760 260 L 760 80 Q 850 20 940 80 L 940 260 Z" />
            <line x1="850" y1="35" x2="850" y2="260" />
            <line x1="760" y1="120" x2="940" y2="120" />
            <line x1="760" y1="190" x2="940" y2="190" />
          </g>

          {/* RAINDROPS ON WINDOW IF RAINY */}
          {gameState.weather === 'Cozy Rain' && (
            <g stroke="#93c5fd" strokeWidth="1.2" opacity="0.4" strokeLinecap="round">
              <line x1="120" y1="70" x2="116" y2="90" />
              <line x1="180" y1="130" x2="176" y2="155" />
              <line x1="340" y1="60" x2="336" y2="85" />
              <line x1="420" y1="140" x2="416" y2="165" />
              <line x1="600" y1="90" x2="596" y2="120" />
              <line x1="680" y1="160" x2="676" y2="185" />
              <line x1="820" y1="75" x2="816" y2="105" />
              <line x1="890" y1="140" x2="886" y2="165" />
            </g>
          )}

          {/* TIMBER CEILING BEAMS & HANGING DRIED HERBS / LANTERNS */}
          <rect x="0" y="0" width="1000" height="24" fill="#543318" />
          <rect x="0" y="24" width="1000" height="8" fill="#3f230f" />

          {/* Hanging string of fairy lights */}
          <path
            d="M 0 32 Q 150 65 300 32 Q 450 68 600 32 Q 750 65 900 32 Q 950 45 1000 32"
            fill="none"
            stroke="#92400e"
            strokeWidth="1.5"
          />
          {[50, 100, 150, 200, 250, 350, 400, 450, 500, 550, 650, 700, 750, 800, 850, 950].map((x, i) => {
            const y = 32 + Math.sin(x / 45) * 12;
            return (
              <g key={i} transform={`translate(${x}, ${y})`}>
                <circle cx="0" cy="4" r="3.5" fill={isNight ? '#fde047' : '#fef08a'} />
                <circle cx="0" cy="4" r="7" fill="#facc15" opacity="0.3" />
              </g>
            );
          })}

          {/* Hanging Dried Lavender Bundles & Eucalyptus */}
          <g transform="translate(80, 28)">
            <line x1="0" y1="0" x2="0" y2="28" stroke="#78350f" strokeWidth="1.5" />
            <ellipse cx="0" cy="42" rx="7" ry="18" fill="#7e22ce" />
            <ellipse cx="0" cy="42" rx="5" ry="14" fill="#a855f7" />
          </g>
          <g transform="translate(220, 28)">
            <line x1="0" y1="0" x2="0" y2="34" stroke="#78350f" strokeWidth="1.5" />
            <ellipse cx="0" cy="48" rx="9" ry="16" fill="#047857" />
            <circle cx="-4" cy="44" r="5" fill="#6ee7b7" />
            <circle cx="4" cy="50" r="5" fill="#34d399" />
          </g>
          <g transform="translate(680, 28)">
            <line x1="0" y1="0" x2="0" y2="30" stroke="#78350f" strokeWidth="1.5" />
            <ellipse cx="0" cy="46" rx="8" ry="18" fill="#c026d3" />
            <ellipse cx="0" cy="46" rx="5" ry="14" fill="#e879f9" />
          </g>
          <g transform="translate(860, 28)">
            <line x1="0" y1="0" x2="0" y2="36" stroke="#78350f" strokeWidth="1.5" />
            <ellipse cx="0" cy="52" rx="9" ry="18" fill="#059669" />
          </g>

          {/* Hanging Vintage Brass Lanterns */}
          <g transform="translate(480, 28)">
            <line x1="0" y1="0" x2="0" y2="38" stroke="#92400e" strokeWidth="2" />
            <polygon points="-8,38 8,38 12,62 -12,62" fill="#d97706" stroke="#78350f" strokeWidth="1" />
            <rect x="-6" y="44" width="12" height="14" fill="#fef08a" opacity="0.85" />
            <circle cx="0" cy="51" r="14" fill="#fef08a" opacity="0.25" />
          </g>

          {/* BACK WALL SHELVING WITH POTTED PLANTS & BOTANICALS (Comfortably low near floor level) */}
          <rect x="0" y="300" width="1000" height="12" fill="#6b4226" />
          <rect x="0" y="312" width="1000" height="6" fill="#4a2c1d" />

          {/* Terracotta pots on shelf */}
          <g transform="translate(80, 278)">
            <polygon points="-12,22 12,22 10,34 -10,34" fill="#c2410c" />
            {/* Fern foliage */}
            <path d="M 0 22 Q -18 6 -14 -4 Q -4 10 0 22" fill="#15803d" />
            <path d="M 0 22 Q 18 6 14 -4 Q 4 10 0 22" fill="#22c55e" />
            <path d="M 0 22 Q 0 2 0 -8 Q 6 8 0 22" fill="#16a34a" />
          </g>
          <g transform="translate(200, 272)">
            <ellipse cx="0" cy="28" rx="14" ry="8" fill="#0284c7" />
            <circle cx="-4" cy="18" r="8" fill="#ec4899" />
            <circle cx="4" cy="14" r="7" fill="#f472b6" />
            <circle cx="0" cy="22" r="6" fill="#fb7185" />
          </g>
          <g transform="translate(740, 276)">
            {/* Glass terrarium cloche */}
            <path d="M -12 24 L -12 8 Q 0 -6 12 8 L 12 24 Z" fill="rgba(255,255,255,0.4)" stroke="#64748b" strokeWidth="1" />
            <ellipse cx="0" cy="24" rx="14" ry="4" fill="#475569" />
            <circle cx="0" cy="16" r="4" fill="#84cc16" />
          </g>
          <g transform="translate(880, 278)">
            <polygon points="-14,22 14,22 11,34 -11,34" fill="#ea580c" />
            <circle cx="0" cy="12" r="10" fill="#166534" />
            <circle cx="-6" cy="10" r="7" fill="#22c55e" />
            <circle cx="6" cy="8" r="8" fill="#4ade80" />
          </g>

          {/* RUSTIC OAK WOOD WORKSHOP FLOOR */}
          <rect x="0" y="340" width="1000" height="140" fill={isNight ? '#3a2717' : '#dfd2c0'} />
          <line x1="0" y1="380" x2="1000" y2="380" stroke="#c4b5a0" strokeWidth="1" opacity="0.6" />
          <line x1="0" y1="425" x2="1000" y2="425" stroke="#c4b5a0" strokeWidth="1" opacity="0.6" />

          {/* ZINC BUCKETS FILLED WITH FRESH CUT BLOOMS ON FLOOR */}
          {/* Bucket Left: Sunflowers & Daisies */}
          <g transform="translate(60, 370)">
            <polygon points="-22,20 22,20 18,70 -18,70" fill="#94a3b8" stroke="#64748b" strokeWidth="1.5" />
            <ellipse cx="0" cy="20" rx="22" ry="7" fill="#64748b" />
            {/* Sunflowers */}
            <circle cx="-8" cy="-8" r="14" fill="#eab308" />
            <circle cx="-8" cy="-8" r="7" fill="#451a03" />
            <circle cx="10" cy="-4" r="12" fill="#facc15" />
            <circle cx="10" cy="-4" r="6" fill="#78350f" />
            <circle cx="0" cy="6" r="10" fill="#ffffff" />
            <circle cx="0" cy="6" r="4" fill="#eab308" />
          </g>

          {/* Bucket Right: Roses, Peonies & Eucalyptus */}
          <g transform="translate(930, 365)">
            <polygon points="-24,20 24,20 20,75 -20,75" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5" />
            <ellipse cx="0" cy="20" rx="24" ry="8" fill="#94a3b8" />
            {/* Rose blooms */}
            <circle cx="-10" cy="-6" r="13" fill="#e11d48" />
            <circle cx="8" cy="-10" r="14" fill="#fb7185" />
            <circle cx="0" cy="4" r="11" fill="#f43f5e" />
            <ellipse cx="-16" cy="4" rx="10" ry="5" fill="#34d399" />
            <ellipse cx="16" cy="2" rx="10" ry="5" fill="#10b981" />
          </g>

          {/* FOREGROUND WOODEN WORKBENCH TOP (Lower border) */}
          <path
            d="M 0 440 L 1000 440 L 1000 480 L 0 480 Z"
            fill={lighting.counter}
            opacity="0.3"
          />
        </svg>
      </div>

      {/* 2. FOREGROUND INTERACTIVE CONTENT */}
      <div className="relative z-10 p-5 sm:p-7 lg:p-8">
        {children}
      </div>
    </div>
  );
};
