import React from 'react';
import { FlowerSpecies } from '../types';

interface UnifiedFlowerPieceProps {
  flower: FlowerSpecies;
  stemLength?: number; // 0.5 to 2.0 (default: 1.0)
  flowerScale?: number; // 0.6 to 1.6 (default: 1.0)
  stemCurve?: number; // -30 to 30 (default: 0)
  className?: string;
  isSelected?: boolean;
}

export const UnifiedFlowerPiece: React.FC<UnifiedFlowerPieceProps> = ({
  flower,
  stemLength = 1.0,
  flowerScale = 1.0,
  stemCurve = 0,
  className = '',
  isSelected = false,
}) => {
  const p = flower.palette;
  const stemLen = Math.max(0.4, Math.min(2.2, stemLength));
  const fScale = Math.max(0.5, Math.min(1.8, flowerScale));
  const curve = Math.max(-40, Math.min(40, stemCurve));

  // Compute key geometric stem points
  const startX = 0;
  const startY = 8;
  const midX = curve * 0.45;
  const midY = startY + stemLen * 50;
  const endX = curve;
  const endY = startY + stemLen * 115;

  // Leaf 1 (Left lower leaf)
  const leaf1Y = startY + stemLen * 45;
  const leaf1X = midX * 0.8;

  // Leaf 2 (Right upper leaf)
  const leaf2Y = startY + stemLen * 25;
  const leaf2X = midX * 0.4;

  return (
    <svg
      viewBox="-65 -55 130 230"
      className={`w-full h-full overflow-visible pointer-events-none drop-shadow-sm ${className}`}
    >
      <defs>
        {/* Soft botanical glow for selection */}
        <filter id={`glow-${flower.id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={p.petalShadow} floodOpacity="0.4" />
        </filter>
      </defs>

      {/* 1. SEAMLESS BOTANICAL STEM & LEAVES */}
      <g id="flower-stem-group">
        {/* Main Stem Stalk with natural taper */}
        <path
          d={`M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`}
          fill="none"
          stroke={p.stem}
          strokeWidth="4.2"
          strokeLinecap="round"
        />
        {/* Inner stem highlight for round depth */}
        <path
          d={`M ${startX - 0.8} ${startY + 2} Q ${midX - 0.8} ${midY} ${endX - 0.8} ${endY - 3}`}
          fill="none"
          stroke="#ffffff"
          strokeWidth="1"
          opacity="0.3"
          strokeLinecap="round"
        />

        {/* Stem Leaf 1: Graceful Arching Leaf Left */}
        <path
          d={`M ${leaf1X} ${leaf1Y} Q ${leaf1X - 22} ${leaf1Y - 10} ${leaf1X - 26} ${leaf1Y - 22} Q ${leaf1X - 10} ${leaf1Y - 14} ${leaf1X} ${leaf1Y - 4}`}
          fill={p.stem}
          stroke={p.stem}
          strokeWidth="0.8"
          opacity="0.95"
        />
        {/* Leaf 1 center vein */}
        <path
          d={`M ${leaf1X} ${leaf1Y} Q ${leaf1X - 14} ${leaf1Y - 10} ${leaf1X - 24} ${leaf1Y - 20}`}
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.6"
          opacity="0.4"
        />

        {/* Stem Leaf 2: Graceful Arching Leaf Right */}
        <path
          d={`M ${leaf2X} ${leaf2Y} Q ${leaf2X + 20} ${leaf2Y - 8} ${leaf2X + 24} ${leaf2Y - 18} Q ${leaf2X + 10} ${leaf2Y - 12} ${leaf2X} ${leaf2Y - 3}`}
          fill={p.stem}
          stroke={p.stem}
          strokeWidth="0.8"
          opacity="0.9"
        />
        {/* Leaf 2 center vein */}
        <path
          d={`M ${leaf2X} ${leaf2Y} Q ${leaf2X + 12} ${leaf2Y - 8} ${leaf2X + 22} ${leaf2Y - 16}`}
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.6"
          opacity="0.4"
        />

        {/* Calyx & Receptacle Cup joining Stem directly to Blossom */}
        <path
          d={`M -6 ${startY - 4} Q 0 ${startY + 6} 6 ${startY - 4} Q 0 ${startY} -6 ${startY - 4}`}
          fill={p.stem}
        />
        <path
          d={`M -4 ${startY - 2} L -7 ${startY - 8} L -2 ${startY - 3} L 0 ${startY - 10} L 2 ${startY - 3} L 7 ${startY - 8} L 4 ${startY - 2} Z`}
          fill={p.stem}
          opacity="0.95"
        />

        {/* Fresh angled florist cut on stem base */}
        <ellipse
          cx={endX}
          cy={endY}
          rx="2.8"
          ry="1.4"
          fill="#fef08a"
          stroke={p.stem}
          strokeWidth="0.8"
          transform={`rotate(25, ${endX}, ${endY})`}
        />
      </g>

      {/* 2. FLOWER BLOSSOM HEAD (Seamlessly connected at 0, 0) */}
      <g id="flower-blossom-group" transform={`scale(${fScale})`}>
        {renderBloomHeadUnified(flower.iconSvgKey, p)}
      </g>
    </svg>
  );
};

function renderBloomHeadUnified(key: string, p: FlowerSpecies['palette']) {
  switch (key) {
    case 'tulip':
      return (
        <g transform="translate(0, 0)">
          {/* Back cupped petals */}
          <path
            d="M -18 4 Q -24 -24 0 -34 Q 24 -24 18 4 Q 0 10 -18 4 Z"
            fill={p.petalShadow}
          />
          {/* Left petal fold */}
          <path
            d="M -16 2 Q -26 -18 -4 -28 Q 0 -8 -4 6 Z"
            fill={p.petal}
          />
          {/* Right petal fold */}
          <path
            d="M 16 2 Q 26 -18 4 -28 Q 0 -8 4 6 Z"
            fill={p.petal}
          />
          {/* Center heart petal */}
          <path
            d="M -9 6 Q 0 -32 9 6 Q 0 10 -9 6 Z"
            fill={p.petal}
            stroke={p.petalShadow}
            strokeWidth="0.8"
          />
        </g>
      );

    case 'daisy':
    case 'chamomile':
      return (
        <g transform="translate(0, -6)">
          {/* Outer daisy ray petals */}
          {[0, 24, 48, 72, 96, 120, 144, 168, 192, 216, 240, 264, 288, 312, 336].map((deg) => (
            <ellipse
              key={deg}
              cx="0"
              cy="-17"
              rx="4.2"
              ry="12"
              fill={deg % 48 === 0 ? p.petalShadow : p.petal}
              stroke={p.petalShadow}
              strokeWidth="0.4"
              transform={`rotate(${deg})`}
            />
          ))}
          {/* Golden Center Disc */}
          <circle cx="0" cy="0" r="11" fill={p.center} stroke="#b45309" strokeWidth="1" />
          <circle cx="-3" cy="-3" r="3.5" fill="#fef08a" opacity="0.8" />
          {/* Seed florets texture */}
          <circle cx="2" cy="3" r="1" fill="#78350f" opacity="0.6" />
          <circle cx="-2" cy="4" r="1" fill="#78350f" opacity="0.6" />
          <circle cx="4" cy="-2" r="1" fill="#78350f" opacity="0.6" />
        </g>
      );

    case 'rose':
      return (
        <g transform="translate(0, -6)">
          {/* Outer full petals */}
          <circle cx="0" cy="0" r="23" fill={p.petalShadow} />
          {/* Lush rose swirls */}
          <path d="M -16 -8 Q 0 -25 16 -8 Q 20 12 0 20 Q -20 12 -16 -8" fill={p.petal} />
          <path d="M -12 -4 Q 0 -16 12 -4 Q 14 9 0 14 Q -14 9 -12 -4" fill={p.petalShadow} />
          <path d="M -8 -2 Q 0 -10 8 -2 Q 8 6 0 8 Q -8 6 -8 -2" fill={p.petal} />
          <circle cx="0" cy="0" r="3.5" fill={p.center} opacity="0.75" />
        </g>
      );

    case 'sunflower':
      return (
        <g transform="translate(0, -6)">
          {/* Dual layers of radiant golden rays */}
          {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340].map((deg) => (
            <polygon
              key={`back-${deg}`}
              points="0,-29 6,-14 -6,-14"
              fill={p.petalShadow}
              transform={`rotate(${deg})`}
            />
          ))}
          {[10, 30, 50, 70, 90, 110, 130, 150, 170, 190, 210, 230, 250, 270, 290, 310, 330, 350].map((deg) => (
            <polygon
              key={`front-${deg}`}
              points="0,-27 5.5,-12 -5.5,-12"
              fill={p.petal}
              transform={`rotate(${deg})`}
            />
          ))}
          {/* Dark Seed Center */}
          <circle cx="0" cy="0" r="14" fill={p.center} stroke="#78350f" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="11" fill="#451a03" />
          <circle cx="-3" cy="-3" r="3" fill="#ca8a04" opacity="0.6" />
        </g>
      );

    case 'lavender':
      return (
        <g transform="translate(0, -22)">
          {/* Stack of fragrant purple florets */}
          {[-16, -8, 0, 8, 16, 24, 32].map((y, i) => (
            <g key={i} transform={`translate(0, ${y})`}>
              <ellipse cx="-8" cy="0" rx="5.5" ry="4" fill={p.petal} />
              <ellipse cx="8" cy="0" rx="5.5" ry="4" fill={p.petal} />
              <circle cx="0" cy="-2" r="4.5" fill={p.petalShadow} />
              <circle cx="-2" cy="-2" r="1.8" fill={p.center} />
            </g>
          ))}
        </g>
      );

    case 'hydrangea':
      return (
        <g transform="translate(0, -8)">
          <circle cx="0" cy="0" r="25" fill={p.petalShadow} opacity="0.3" />
          {[-14, 0, 14].map((x) =>
            [-12, 2, 14].map((y) => (
              <g key={`${x}-${y}`} transform={`translate(${x + (y % 2 === 0 ? 3 : -3)}, ${y})`}>
                <circle cx="-4.5" cy="-4.5" r="4.8" fill={p.petal} />
                <circle cx="4.5" cy="-4.5" r="4.8" fill={p.petal} />
                <circle cx="-4.5" cy="4.5" r="4.8" fill={p.petal} />
                <circle cx="4.5" cy="4.5" r="4.8" fill={p.petal} />
                <circle cx="0" cy="0" r="2.2" fill={p.center} />
              </g>
            ))
          )}
        </g>
      );

    case 'peony':
    case 'dahlia':
    case 'camellia':
      return (
        <g transform="translate(0, -6)">
          <circle cx="0" cy="0" r="25" fill={p.petalShadow} />
          {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((deg) => (
            <ellipse
              key={deg}
              cx="0"
              cy="-13"
              rx="8"
              ry="11"
              fill={p.petal}
              opacity="0.92"
              transform={`rotate(${deg})`}
            />
          ))}
          {[18, 54, 90, 126, 162, 198, 234, 270, 306, 342].map((deg) => (
            <ellipse
              key={deg}
              cx="0"
              cy="-8"
              rx="6"
              ry="8"
              fill={p.petalShadow}
              transform={`rotate(${deg})`}
            />
          ))}
          <circle cx="0" cy="0" r="6.5" fill={p.center} />
        </g>
      );

    case 'cherry_blossom':
      return (
        <g transform="translate(0, -6)">
          {[0, 72, 144, 216, 288].map((deg) => (
            <path
              key={deg}
              d="M 0 -24 C -7 -20 -9 -9 0 0 C 9 -9 7 -20 0 -24"
              fill={p.petal}
              stroke={p.petalShadow}
              strokeWidth="0.8"
              transform={`rotate(${deg})`}
            />
          ))}
          <circle cx="0" cy="0" r="5.5" fill={p.petalShadow} />
          <circle cx="0" cy="0" r="3.2" fill={p.center} />
        </g>
      );

    case 'snowdrop':
    case 'hellebore':
      return (
        <g transform="translate(0, -10)">
          <path
            d="M -13 2 C -20 20 -4 32 0 34 C 4 32 20 20 13 2 Z"
            fill={p.petal}
            stroke={p.petalShadow}
            strokeWidth="0.8"
          />
          <path d="M -4 26 L 0 34 L 4 26" fill="none" stroke={p.center} strokeWidth="2.2" />
          <circle cx="0" cy="2" r="4.5" fill={p.stem} />
        </g>
      );

    case 'eucalyptus':
      return (
        <g transform="translate(0, -20)">
          {[-12, -2, 8, 18, 28, 38].map((y, i) => (
            <g key={i} transform={`translate(0, ${y})`}>
              <circle cx="-11" cy="0" r="9.5" fill={p.petal} opacity="0.95" />
              <circle cx="11" cy="0" r="9.5" fill={p.petal} opacity="0.95" />
              <circle cx="-11" cy="0" r="7.5" fill={p.petalShadow} opacity="0.35" />
              <circle cx="11" cy="0" r="7.5" fill={p.petalShadow} opacity="0.35" />
            </g>
          ))}
        </g>
      );

    case 'fern':
      return (
        <g transform="translate(0, -18)">
          {[-14, -4, 6, 16, 26, 36].map((y, i) => (
            <g key={i} transform={`translate(0, ${y})`}>
              <path d="M 0 0 Q -18 -4 -22 -12 Q -12 -2 0 0" fill={p.petal} />
              <path d="M 0 0 Q 18 -4 22 -12 Q 12 -2 0 0" fill={p.petal} />
            </g>
          ))}
        </g>
      );

    default: // Babys breath & meadow wildflowers
      return (
        <g transform="translate(0, -12)">
          {[-16, -7, 7, 16].map((x) =>
            [-16, -5, 6].map((y) => (
              <g key={`${x}-${y}`} transform={`translate(${x}, ${y})`}>
                <line x1="0" y1="0" x2={-x * 0.4} y2="14" stroke={p.stem} strokeWidth="1.2" />
                <circle cx="0" cy="0" r="4" fill={p.petal} stroke={p.petalShadow} strokeWidth="0.5" />
                <circle cx="0" cy="0" r="1.2" fill={p.center} />
              </g>
            ))
          )}
        </g>
      );
  }
}
