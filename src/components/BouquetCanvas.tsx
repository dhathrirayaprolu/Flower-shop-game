import React from 'react';
import { PlacedStem, WrapOption, RibbonOption, CardTagOption } from '../types';
import { FLOWERS_BY_ID } from '../data/flowers';
import { FlowerStemSvg } from './FlowerIllustrations';

interface BouquetCanvasProps {
  stems: PlacedStem[];
  wrap: WrapOption;
  ribbon: RibbonOption;
  cardTag: CardTagOption | null;
  selectedStemUid?: string | null;
  onSelectStem?: (uid: string) => void;
  interactive?: boolean;
}

export const BouquetCanvas: React.FC<BouquetCanvasProps> = ({
  stems,
  wrap,
  ribbon,
  cardTag,
  selectedStemUid,
  onSelectStem,
  interactive = false,
}) => {
  return (
    <div className="relative w-full h-80 sm:h-96 md:h-[420px] bg-[#f4f1eb] bg-[radial-gradient(#e8e2d8_1px,transparent_1px)] [background-size:20px_20px] rounded-3xl border border-[#e8e2d8] flex items-center justify-center overflow-hidden shadow-xs select-none">
      {/* Background Soft Studio Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/60 via-transparent to-transparent pointer-events-none" />

      {/* Empty State Prompt */}
      {stems.length === 0 && (
        <div className="text-center p-6 max-w-xs text-[#a69d91] z-10">
          <p className="font-serif text-lg text-[#4a4238] font-semibold mb-1">Your Crafting Table</p>
          <p className="text-xs text-[#a69d91]">
            Pick stems from your harvested inventory below to begin arranging your bespoke bouquet.
          </p>
        </div>
      )}

      {/* STALKS & BLOOMS LAYER */}
      <div className="absolute inset-0 flex items-center justify-center">
        {stems.map((stem) => {
          const flower = FLOWERS_BY_ID[stem.flowerId];
          if (!flower) return null;
          const isSelected = selectedStemUid === stem.uid;

          return (
            <div
              key={stem.uid}
              id={`stem-${stem.uid}`}
              onClick={(e) => {
                if (interactive && onSelectStem) {
                  e.stopPropagation();
                  onSelectStem(stem.uid);
                }
              }}
              style={{
                transform: `translate(${stem.x}px, ${stem.y}px) rotate(${stem.rotation}deg) scale(${stem.scale})`,
                zIndex: stem.layer + 5,
              }}
              className={`absolute transition-all cursor-pointer ${
                isSelected
                  ? 'ring-2 ring-[#8ca68e] ring-offset-2 rounded-full p-1 bg-[#8ca68e]/10'
                  : 'hover:brightness-105'
              }`}
            >
              <FlowerStemSvg
                flower={flower}
                size={84}
                rotation={0}
              />
            </div>
          );
        })}
      </div>

      {/* WRAPPING PAPER LAYER (Conical Wrap overlaying the lower half of stems) */}
      {stems.length > 0 && (
        <div className="absolute bottom-4 z-20 pointer-events-none flex flex-col items-center">
          <svg viewBox="0 0 200 160" className="w-52 h-44 drop-shadow-md overflow-visible">
            {/* Kraft/Parchment Conical Cone Fold */}
            <path
              d="M 20 20 L 100 150 L 180 20 Q 140 38 100 24 Q 60 38 20 20 Z"
              fill={wrap.color}
              stroke="#4a4238"
              strokeWidth="1.2"
              opacity="0.95"
            />
            {/* Left wrap fold */}
            <path
              d="M 20 20 L 100 150 L 85 24 Z"
              fill={wrap.color}
              stroke="#4a4238"
              strokeWidth="0.8"
              opacity="0.6"
            />
            {/* Right wrap fold */}
            <path
              d="M 180 20 L 100 150 L 115 24 Z"
              fill={wrap.color}
              stroke="#4a4238"
              strokeWidth="0.8"
              opacity="0.8"
            />
            {/* Soft subtle pattern lines for parchment / linen */}
            {wrap.pattern === 'newspaper' && (
              <g opacity="0.35" stroke="#4a4238" strokeWidth="0.8">
                <line x1="45" y1="50" x2="80" y2="50" />
                <line x1="45" y1="58" x2="82" y2="58" />
                <line x1="45" y1="66" x2="76" y2="66" />
                <line x1="120" y1="50" x2="155" y2="50" />
                <line x1="118" y1="58" x2="155" y2="58" />
              </g>
            )}

            {/* RIBBON & BOW */}
            <g transform="translate(100, 105)">
              {/* Bow loop left */}
              <ellipse
                cx="-18"
                cy="-6"
                rx="14"
                ry="8"
                fill={ribbon.color}
                stroke="#4a4238"
                strokeWidth="1"
                transform="rotate(-20)"
              />
              {/* Bow loop right */}
              <ellipse
                cx="18"
                cy="-6"
                rx="14"
                ry="8"
                fill={ribbon.color}
                stroke="#4a4238"
                strokeWidth="1"
                transform="rotate(20)"
              />
              {/* Knot Center */}
              <circle
                cx="0"
                cy="-4"
                r="6.5"
                fill={ribbon.color}
                stroke="#383129"
                strokeWidth="1.2"
              />
              {/* Tails hanging down */}
              <path
                d="M -4 2 Q -15 26 -20 38 Q -10 32 -3 10"
                fill={ribbon.color}
                stroke="#4a4238"
                strokeWidth="0.8"
              />
              <path
                d="M 4 2 Q 15 26 20 38 Q 10 32 3 10"
                fill={ribbon.color}
                stroke="#4a4238"
                strokeWidth="0.8"
              />
            </g>

            {/* Custom Tag Hanging from Ribbon */}
            {cardTag && (
              <g transform="translate(136, 115) rotate(14)">
                <rect
                  x="-16"
                  y="-8"
                  width="44"
                  height="26"
                  rx="3"
                  fill="#fcfaf7"
                  stroke="#8ca68e"
                  strokeWidth="1"
                  className="drop-shadow-xs"
                />
                <circle cx="-10" cy="5" r="2.5" fill="#4a4238" />
                <line x1="-10" y1="5" x2="-22" y2="-8" stroke="#8ca68e" strokeWidth="1.2" />
                <text
                  x="2"
                  y="9"
                  fill="#4a4238"
                  className="text-[8px] font-serif font-bold select-none"
                >
                  {cardTag.icon} {cardTag.title.slice(0, 7)}..
                </text>
              </g>
            )}
          </svg>
        </div>
      )}
    </div>
  );
};
