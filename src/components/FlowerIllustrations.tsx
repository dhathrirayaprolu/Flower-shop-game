import React from 'react';
import { FlowerSpecies } from '../types';

interface FlowerProps {
  flower?: FlowerSpecies;
  size?: number;
  className?: string;
  stage?: 'seed' | 'sprout' | 'bud' | 'blooming' | 'ready_to_harvest';
  rotation?: number;
}

export const FlowerStemSvg: React.FC<{
  flower: FlowerSpecies;
  size?: number;
  rotation?: number;
  className?: string;
}> = ({ flower, size = 64, rotation = 0, className = '' }) => {
  const p = flower.palette;

  return (
    <div
      style={{
        width: size,
        height: size,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'bottom center',
      }}
      className={`inline-flex items-center justify-center transition-transform ${className}`}
    >
      <svg
        viewBox="0 0 100 120"
        className="w-full h-full drop-shadow-sm overflow-visible"
      >
        {/* Main Stem */}
        <path
          d="M 50 115 Q 48 70 50 42"
          fill="none"
          stroke={p.stem}
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Stem Leaves */}
        <path
          d="M 49 85 Q 30 78 28 68 Q 42 72 49 80"
          fill={p.stem}
          opacity="0.9"
        />
        <path
          d="M 51 68 Q 70 60 72 50 Q 58 56 51 64"
          fill={p.stem}
          opacity="0.9"
        />

        {/* Specific Flower Bloom Head Renderers */}
        {renderBloomHead(flower.iconSvgKey, p)}
      </svg>
    </div>
  );
};

function renderBloomHead(key: string, p: FlowerSpecies['palette']) {
  switch (key) {
    case 'tulip':
      return (
        <g transform="translate(50, 38)">
          <path
            d="M -16 2 Q -22 -24 0 -32 Q 22 -24 16 2 Q 0 8 -16 2 Z"
            fill={p.petalShadow}
          />
          <path
            d="M -14 0 Q -24 -20 -4 -28 Q 0 -10 -4 4 Z"
            fill={p.petal}
          />
          <path
            d="M 14 0 Q 24 -20 4 -28 Q 0 -10 4 4 Z"
            fill={p.petal}
          />
          <path
            d="M -8 4 Q 0 -30 8 4 Q 0 8 -8 4 Z"
            fill={p.petal}
            stroke={p.petalShadow}
            strokeWidth="0.8"
          />
        </g>
      );

    case 'daisy':
    case 'chamomile':
      return (
        <g transform="translate(50, 36)">
          {/* Petals ring */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
            <ellipse
              key={deg}
              cx="0"
              cy="-16"
              rx="4"
              ry="11"
              fill={p.petal}
              stroke={p.petalShadow}
              strokeWidth="0.5"
              transform={`rotate(${deg})`}
            />
          ))}
          {/* Sunny Golden Center */}
          <circle cx="0" cy="0" r="10" fill={p.center} stroke="#ca8a04" strokeWidth="1" />
          <circle cx="-3" cy="-3" r="2.5" fill="#fef08a" opacity="0.7" />
        </g>
      );

    case 'rose':
      return (
        <g transform="translate(50, 36)">
          {/* Outer Layer */}
          <circle cx="0" cy="0" r="20" fill={p.petalShadow} />
          {/* Petal whorls */}
          <path d="M -14 -6 Q 0 -22 14 -6 Q 18 10 0 18 Q -18 10 -14 -6" fill={p.petal} />
          <path d="M -10 -2 Q 0 -14 10 -2 Q 12 8 0 12 Q -12 8 -10 -2" fill={p.petalShadow} />
          <path d="M -6 0 Q 0 -8 6 0 Q 6 6 0 8 Q -6 6 -6 0" fill={p.petal} />
          <circle cx="0" cy="0" r="3" fill={p.center} opacity="0.6" />
        </g>
      );

    case 'sunflower':
      return (
        <g transform="translate(50, 36)">
          {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map(deg => (
            <polygon
              key={deg}
              points="0,-26 5,-12 -5,-12"
              fill={deg % 45 === 0 ? p.petal : p.petalShadow}
              transform={`rotate(${deg})`}
            />
          ))}
          <circle cx="0" cy="0" r="13" fill={p.center} stroke="#78350f" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="10" fill="#451a03" />
          <circle cx="-3" cy="-3" r="2" fill="#ca8a04" opacity="0.5" />
        </g>
      );

    case 'lavender':
      return (
        <g transform="translate(50, 20)">
          {/* Stack of florets */}
          {[-12, -4, 4, 12, 20, 28].map((y, i) => (
            <g key={i} transform={`translate(0, ${y})`}>
              <ellipse cx="-7" cy="0" rx="5" ry="3.5" fill={p.petal} />
              <ellipse cx="7" cy="0" rx="5" ry="3.5" fill={p.petal} />
              <circle cx="0" cy="-2" r="4" fill={p.petalShadow} />
              <circle cx="-2" cy="-2" r="1.5" fill={p.center} />
            </g>
          ))}
        </g>
      );

    case 'hydrangea':
      return (
        <g transform="translate(50, 34)">
          {/* Cloud cluster */}
          <circle cx="0" cy="0" r="22" fill={p.petalShadow} opacity="0.3" />
          {[-12, 0, 12].map(x =>
            [-10, 2, 12].map(y => (
              <g key={`${x}-${y}`} transform={`translate(${x + (y % 2 === 0 ? 3 : -3)}, ${y})`}>
                <circle cx="-4" cy="-4" r="4.5" fill={p.petal} />
                <circle cx="4" cy="-4" r="4.5" fill={p.petal} />
                <circle cx="-4" cy="4" r="4.5" fill={p.petal} />
                <circle cx="4" cy="4" r="4.5" fill={p.petal} />
                <circle cx="0" cy="0" r="2" fill={p.center} />
              </g>
            ))
          )}
        </g>
      );

    case 'peony':
    case 'dahlia':
    case 'camellia':
      return (
        <g transform="translate(50, 36)">
          <circle cx="0" cy="0" r="23" fill={p.petalShadow} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
            <ellipse
              key={deg}
              cx="0"
              cy="-12"
              rx="7"
              ry="10"
              fill={p.petal}
              opacity="0.9"
              transform={`rotate(${deg})`}
            />
          ))}
          {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map(deg => (
            <ellipse
              key={deg}
              cx="0"
              cy="-7"
              rx="5"
              ry="7"
              fill={p.petalShadow}
              transform={`rotate(${deg})`}
            />
          ))}
          <circle cx="0" cy="0" r="6" fill={p.center} />
        </g>
      );

    case 'cherry_blossom':
      return (
        <g transform="translate(50, 36)">
          {[0, 72, 144, 216, 288].map(deg => (
            <path
              key={deg}
              d="M 0 -22 C -6 -18 -8 -8 0 0 C 8 -8 6 -18 0 -22"
              fill={p.petal}
              stroke={p.petalShadow}
              strokeWidth="0.8"
              transform={`rotate(${deg})`}
            />
          ))}
          <circle cx="0" cy="0" r="5" fill={p.petalShadow} />
          <circle cx="0" cy="0" r="3" fill={p.center} />
        </g>
      );

    case 'snowdrop':
    case 'hellebore':
      return (
        <g transform="translate(50, 30)">
          {/* Nodding bell */}
          <path
            d="M -12 2 C -18 18 -4 28 0 30 C 4 28 18 18 12 2 Z"
            fill={p.petal}
            stroke={p.petalShadow}
            strokeWidth="0.8"
          />
          <path d="M -4 24 L 0 30 L 4 24" fill="none" stroke={p.center} strokeWidth="2" />
          <circle cx="0" cy="2" r="4" fill={p.stem} />
        </g>
      );

    case 'eucalyptus':
      return (
        <g transform="translate(50, 20)">
          {[-10, 0, 10, 20, 30].map((y, i) => (
            <g key={i} transform={`translate(0, ${y})`}>
              <circle cx="-10" cy="0" r="9" fill={p.petal} opacity="0.9" />
              <circle cx="10" cy="0" r="9" fill={p.petal} opacity="0.9" />
              <circle cx="-10" cy="0" r="7" fill={p.petalShadow} opacity="0.4" />
              <circle cx="10" cy="0" r="7" fill={p.petalShadow} opacity="0.4" />
            </g>
          ))}
        </g>
      );

    case 'fern':
      return (
        <g transform="translate(50, 25)">
          {[-12, -2, 8, 18, 28].map((y, i) => (
            <g key={i} transform={`translate(0, ${y})`}>
              <path d="M 0 0 Q -16 -4 -20 -10 Q -10 -2 0 0" fill={p.petal} />
              <path d="M 0 0 Q 16 -4 20 -10 Q 10 -2 0 0" fill={p.petal} />
            </g>
          ))}
        </g>
      );

    default: // Babys breath & others
      return (
        <g transform="translate(50, 30)">
          {[-15, -6, 6, 15].map(x =>
            [-14, -4, 6].map(y => (
              <g key={`${x}-${y}`} transform={`translate(${x}, ${y})`}>
                <line x1="0" y1="0" x2={-x * 0.4} y2="12" stroke={p.stem} strokeWidth="1" />
                <circle cx="0" cy="0" r="3.5" fill={p.petal} stroke={p.petalShadow} strokeWidth="0.5" />
                <circle cx="0" cy="0" r="1" fill={p.center} />
              </g>
            ))
          )}
        </g>
      );
  }
}

export const GardenPlantStageSvg: React.FC<{
  flower: FlowerSpecies | null;
  stage: 'empty' | 'seed' | 'sprout' | 'bud' | 'blooming' | 'ready_to_harvest';
  quality?: 'Normal' | 'Lush' | 'Radiant';
  isWatered?: boolean;
}> = ({ flower, stage, quality = 'Normal', isWatered = false }) => {
  if (stage === 'empty' || !flower) {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Empty Soil Pot */}
        <ellipse cx="50" cy="72" rx="34" ry="14" fill="#573318" />
        <ellipse cx="50" cy="69" rx="32" ry="12" fill={isWatered ? '#3d200e' : '#6b4226'} />
        {/* Soft furrow markers */}
        <path d="M 32 68 Q 50 72 68 68" stroke="#45230c" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
        {/* Idle little shovel/trowel icon */}
        <g transform="translate(43, 35) scale(0.6)" opacity="0.35">
          <path d="M 12 2 L 18 8 L 8 18 L 2 12 Z" fill="#94a3b8" />
          <line x1="18" y1="8" x2="28" y2="-2" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  const p = flower.palette;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        {/* Soil Base with Moisture Lighting */}
        <ellipse cx="50" cy="74" rx="36" ry="15" fill="#452410" />
        <ellipse cx="50" cy="71" rx="33" ry="12" fill={isWatered ? '#2c1507' : '#5a351d'} />
        {isWatered && (
          <ellipse cx="48" cy="68" rx="18" ry="4" fill="#60a5fa" opacity="0.25" />
        )}

        {/* Stage: SEED */}
        {stage === 'seed' && (
          <g transform="translate(50, 68)">
            <ellipse cx="0" cy="0" rx="5" ry="3" fill="#b45309" stroke="#78350f" strokeWidth="1" />
            <path d="M 0 -2 Q 2 -8 5 -10" stroke="#86efac" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </g>
        )}

        {/* Stage: SPROUT */}
        {stage === 'sprout' && (
          <g transform="translate(50, 68)">
            <path d="M 0 0 Q 0 -14 0 -22" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 0 -14 Q -12 -20 -10 -28 Q 0 -22 0 -14" fill="#22c55e" />
            <path d="M 0 -18 Q 12 -24 10 -32 Q 0 -26 0 -18" fill="#4ade80" />
          </g>
        )}

        {/* Stage: BUD */}
        {stage === 'bud' && (
          <g transform="translate(50, 68)">
            <path d="M 0 0 Q -2 -22 0 -36" stroke={p.stem} strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 0 -18 Q -16 -24 -14 -32 Q 0 -24 0 -18" fill={p.stem} />
            <path d="M 0 -24 Q 16 -30 14 -38 Q 0 -30 0 -24" fill={p.stem} />
            {/* Swollen Calyx & Peek of Petal Color */}
            <ellipse cx="0" cy="-38" rx="7" ry="10" fill={p.stem} />
            <ellipse cx="0" cy="-42" rx="4.5" ry="6" fill={p.petal} />
          </g>
        )}

        {/* Stage: BLOOMING / READY TO HARVEST */}
        {(stage === 'blooming' || stage === 'ready_to_harvest') && (
          <g transform="translate(50, 68)">
            {/* Stem & Leaves */}
            <path d="M 0 0 Q -3 -25 0 -42" stroke={p.stem} strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M 0 -20 Q -20 -28 -18 -38 Q 0 -28 0 -20" fill={p.stem} />
            <path d="M 0 -28 Q 20 -36 18 -46 Q 0 -36 0 -28" fill={p.stem} />

            {/* Bloom Top */}
            <g transform="translate(0, -42) scale(0.9)">
              {renderBloomHead(flower.iconSvgKey, p)}
            </g>

            {/* Sparkles if Radiant or Ready */}
            {stage === 'ready_to_harvest' && (
              <g className="animate-pulse">
                <circle cx="-20" cy="-45" r="2" fill="#fde047" />
                <circle cx="22" cy="-50" r="2.5" fill="#fef08a" />
                <circle cx="-10" cy="-62" r="1.8" fill="#fde047" />
                {quality === 'Radiant' && (
                  <circle cx="16" cy="-28" r="3" fill="#fbbf24" />
                )}
              </g>
            )}
          </g>
        )}
      </svg>

      {/* Radiant Glow Badge */}
      {quality === 'Radiant' && (
        <span className="absolute -top-1 right-1 text-xs px-1.5 py-0.5 rounded-full bg-amber-400/90 text-amber-950 font-bold shadow-xs">
          ✨ Radiant
        </span>
      )}
    </div>
  );
};

export const SleepyCatSvg: React.FC<{
  happiness: number;
  onClick?: () => void;
  className?: string;
}> = ({ happiness, onClick, className = '' }) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      title="Pet Midnight the cozy shop cat!"
      className={`group relative cursor-pointer select-none transition-transform hover:scale-105 active:scale-95 ${className}`}
    >
      <svg viewBox="0 0 120 90" className="w-28 h-20 drop-shadow-md">
        {/* Woven Wicker Basket */}
        <ellipse cx="60" cy="65" rx="52" ry="18" fill="#854d0e" />
        <ellipse cx="60" cy="60" rx="48" ry="14" fill="#a16207" />
        <ellipse cx="60" cy="58" rx="44" ry="11" fill="#713f12" />

        {/* Soft Red/Cream Tartan Blanket */}
        <ellipse cx="60" cy="56" rx="40" ry="9" fill="#fda4af" opacity="0.8" />

        {/* Curled Black Cat Body */}
        <ellipse cx="58" cy="50" rx="30" ry="18" fill="#18181b" />

        {/* Cat Head */}
        <circle cx="40" cy="42" r="14" fill="#18181b" />

        {/* Ears */}
        <polygon points="32,32 36,20 42,30" fill="#18181b" />
        <polygon points="34,30 37,22 40,29" fill="#f43f5e" opacity="0.5" />

        <polygon points="44,30 49,20 53,32" fill="#18181b" />
        <polygon points="46,29 49,22 51,30" fill="#f43f5e" opacity="0.5" />

        {/* Sleepy curved smiling eyes */}
        <path d="M 33 42 Q 36 45 39 42" stroke="#fef08a" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M 43 42 Q 46 45 49 42" stroke="#fef08a" strokeWidth="1.8" strokeLinecap="round" fill="none" />

        {/* Nose & Mouth */}
        <polygon points="41,47 40,49 42,49" fill="#fb7185" />
        <path d="M 39 50 Q 41 52 43 50" stroke="#71717a" strokeWidth="1" fill="none" />

        {/* Cute Tail curled around body */}
        <path
          d="M 85 52 Q 94 40 82 34 Q 74 38 78 44"
          fill="none"
          stroke="#18181b"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Golden Collar with Tiny Bell */}
        <path d="M 32 50 Q 41 55 49 50" stroke="#eab308" strokeWidth="2.5" fill="none" />
        <circle cx="41" cy="54" r="2.5" fill="#facc15" stroke="#a16207" strokeWidth="0.8" />

        {/* Sleep "zZ" or Love Hearts */}
        <text x="68" y="24" className="text-xs fill-amber-300 font-serif italic select-none group-hover:hidden">
          zZ
        </text>
        <text x="80" y="16" className="text-xs fill-amber-200 font-serif italic select-none group-hover:hidden">
          z
        </text>
      </svg>
    </div>
  );
};
