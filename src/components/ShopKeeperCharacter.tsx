import React, { useState } from 'react';
import { GameState } from '../types';
import { soundManager } from '../audio/soundManager';
import { Sparkles, MessageCircle, Heart, ArrowRight } from 'lucide-react';

interface ShopKeeperCharacterProps {
  gameState: GameState;
  onEnterStudio: () => void;
  onVisitGarden?: () => void;
}

const FLORIST_DIALOGUES = [
  "Welcome to Bloom & Thread! The morning dew is fresh on the sweet blossoms today.",
  "Every bouquet tells a quiet story. Take your time arranging each stem with love!",
  "Did you know? Blending focal blooms with delicate greenery like eucalyptus creates natural harmony.",
  "Look at our visiting neighbors today—they are hoping for something uniquely crafted from the heart.",
  "The skylight lets in the most wonderful gentle sunlight. It's the perfect day to arrange flowers!",
  "Feel free to rotate, raise, or layer any flower in our Bouquet Studio. You have complete artistic freedom!",
];

export const ShopKeeperCharacter: React.FC<ShopKeeperCharacterProps> = ({
  gameState,
  onEnterStudio,
  onVisitGarden,
}) => {
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [isWaving, setIsWaving] = useState(false);

  const handleNextDialogue = () => {
    soundManager.playChime();
    setIsWaving(true);
    setDialogueIndex((prev) => (prev + 1) % FLORIST_DIALOGUES.length);
    setTimeout(() => setIsWaving(false), 1200);
  };

  const getGreeting = () => {
    if (gameState.timeOfDay === 'Morning') return 'Good morning, dear botanist!';
    if (gameState.timeOfDay === 'Afternoon') return 'Good afternoon, welcome in!';
    if (gameState.timeOfDay === 'Evening') return 'A peaceful twilight welcome to you!';
    return 'Cozy rainy greetings! Come inside where it is warm.';
  };

  return (
    <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
      {/* FLORIST CHARACTER SVG ILLUSTRATION */}
      <div 
        onClick={handleNextDialogue}
        className="relative group cursor-pointer transition-transform hover:scale-105 active:scale-98 shrink-0"
        title="Click to chat with Rosie, the Master Florist!"
      >
        {/* Soft shadow on floor */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#4a4238]/20 rounded-full blur-xs pointer-events-none" />

        <svg
          viewBox="0 0 160 220"
          className="w-36 h-48 sm:w-44 sm:h-56 drop-shadow-md overflow-visible"
        >
          {/* Hair back bun / locks */}
          <ellipse cx="80" cy="50" rx="34" ry="32" fill="#5c3826" />
          <circle cx="80" cy="22" r="16" fill="#4a2c1d" />

          {/* Torso / Knit Sweater */}
          <path
            d="M 52 110 Q 80 102 108 110 L 112 175 L 48 175 Z"
            fill="#e2dbcd"
            stroke="#4a4238"
            strokeWidth="1.2"
          />

          {/* Cozy Sage Florist Apron with Crossback Straps */}
          <path
            d="M 60 115 L 100 115 L 106 182 L 54 182 Z"
            fill="#7b947d"
            stroke="#4a4238"
            strokeWidth="1.2"
          />
          {/* Apron straps */}
          <line x1="64" y1="92" x2="72" y2="115" stroke="#667c68" strokeWidth="3" />
          <line x1="96" y1="92" x2="88" y2="115" stroke="#667c68" strokeWidth="3" />

          {/* Apron Pocket with Floral Scissors & Lavender Sprig */}
          <rect
            x="66"
            y="142"
            width="28"
            height="22"
            rx="4"
            fill="#6d856f"
            stroke="#4a4238"
            strokeWidth="1"
          />
          {/* Brass scissors peeking out */}
          <g transform="translate(71, 134) rotate(-15) scale(0.65)">
            <ellipse cx="4" cy="2" rx="4" ry="2" fill="none" stroke="#d97706" strokeWidth="1.5" />
            <ellipse cx="4" cy="10" rx="4" ry="2" fill="none" stroke="#d97706" strokeWidth="1.5" />
            <line x1="8" y1="6" x2="20" y2="6" stroke="#92400e" strokeWidth="2" />
          </g>
          {/* Lavender sprig peeking */}
          <g transform="translate(86, 130) rotate(12) scale(0.55)">
            <line x1="0" y1="18" x2="0" y2="0" stroke="#15803d" strokeWidth="1.5" />
            <circle cx="-2" cy="2" r="2" fill="#a855f7" />
            <circle cx="2" cy="5" r="2" fill="#c084fc" />
            <circle cx="-1" cy="9" r="2" fill="#a855f7" />
          </g>

          {/* Legs / Skirt / Slacks */}
          <path d="M 54 182 L 106 182 L 102 210 L 58 210 Z" fill="#6d5843" />
          {/* Boots */}
          <ellipse cx="68" cy="214" rx="10" ry="5" fill="#382415" />
          <ellipse cx="92" cy="214" rx="10" ry="5" fill="#382415" />

          {/* Arms */}
          {/* Left arm resting/holding clipboard */}
          <path
            d="M 52 110 Q 38 140 52 160"
            fill="none"
            stroke="#e2dbcd"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Left hand with gardening glove */}
          <circle cx="52" cy="160" r="7" fill="#8ca68e" stroke="#4a4238" strokeWidth="0.8" />

          {/* Right arm (waving or holding flower) */}
          <path
            d={isWaving ? "M 108 110 Q 130 90 126 65" : "M 108 110 Q 128 135 116 156"}
            fill="none"
            stroke="#e2dbcd"
            strokeWidth="12"
            strokeLinecap="round"
            className="transition-all duration-300"
          />
          {/* Right hand waving */}
          <g transform={isWaving ? "translate(126, 62) rotate(10)" : "translate(116, 156)"}>
            <circle cx="0" cy="0" r="7" fill="#8ca68e" stroke="#4a4238" strokeWidth="0.8" />
            {/* Trimmed flower held in hand */}
            <line x1="0" y1="0" x2="8" y2="-14" stroke="#15803d" strokeWidth="2" />
            <circle cx="9" cy="-15" r="4.5" fill="#fb7185" />
            <circle cx="9" cy="-15" r="2" fill="#fde047" />
          </g>

          {/* Neck */}
          <rect x="74" y="76" width="12" height="16" fill="#f8d7c2" />

          {/* Head & Face */}
          <ellipse cx="80" cy="62" rx="20" ry="22" fill="#fed7aa" />

          {/* Bangs / Front Hair */}
          <path
            d="M 60 56 Q 80 40 100 56 Q 94 44 80 42 Q 66 44 60 56 Z"
            fill="#5c3826"
          />
          {/* Side strand */}
          <path d="M 60 56 Q 58 72 63 80" fill="none" stroke="#5c3826" strokeWidth="4" strokeLinecap="round" />
          <path d="M 100 56 Q 102 72 97 80" fill="none" stroke="#5c3826" strokeWidth="4" strokeLinecap="round" />

          {/* Flower in Hair */}
          <g transform="translate(94, 44) scale(0.75)">
            <circle cx="0" cy="0" r="6" fill="#f472b6" />
            <circle cx="0" cy="0" r="2.5" fill="#fef08a" />
            <path d="M -5 3 Q -10 6 -6 10" fill="#22c55e" />
          </g>

          {/* Eyes (warm, smiling crescents) */}
          <path d="M 70 60 Q 74 57 77 60" stroke="#382415" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M 83 60 Q 86 57 90 60" stroke="#382415" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Cheerful Blush Cheeks */}
          <circle cx="68" cy="67" r="4" fill="#fb7185" opacity="0.55" />
          <circle cx="92" cy="67" r="4" fill="#fb7185" opacity="0.55" />

          {/* Nose & Smile */}
          <path d="M 80 64 Q 81 67 79 68" stroke="#d97706" strokeWidth="1" strokeLinecap="round" fill="none" />
          <path d="M 75 72 Q 80 77 85 72" stroke="#b91c1c" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </svg>

        {/* Small floating hint badge */}
        <div className="absolute -top-2 -right-1 flex items-center gap-1 bg-[#8ca68e] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
          <span>Rosie</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
        </div>
      </div>

      {/* WELCOMING SPEECH BUBBLE & CALL TO ACTION */}
      <div className="space-y-3 max-w-lg w-full">
        {/* Speech Bubble Card */}
        <div className="relative p-4 sm:p-5 rounded-3xl bg-white/95 backdrop-blur-md border border-[#eee6da] shadow-md transition-all">
          {/* Speech bubble arrow on left on desktop, top on mobile */}
          <div className="hidden sm:block absolute -left-2.5 bottom-6 w-3 h-3 bg-white border-l border-b border-[#eee6da] rotate-45" />

          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-sm font-bold text-[#4a4238]">
                Rosie • Head Florist
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8ca68e]/15 text-[#6d7a6e] font-semibold">
                🌿 Welcome
              </span>
            </div>
            <button
              onClick={handleNextDialogue}
              className="text-[11px] text-[#8ca68e] hover:text-[#7b947d] font-semibold flex items-center gap-1"
            >
              <MessageCircle className="w-3 h-3" />
              <span>Next Tip</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-[#5c544b] font-medium leading-relaxed">
            "{FLORIST_DIALOGUES[dialogueIndex]}"
          </p>

          <p className="text-[11px] text-[#a69d91] mt-2 italic flex items-center gap-1">
            <span>💡</span>
            <span>{getGreeting()}</span>
          </p>
        </div>

        {/* Primary Welcoming Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              soundManager.playSnip();
              onEnterStudio();
            }}
            id="welcome-enter-studio-btn"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#8ca68e] hover:bg-[#7b947d] text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Step into Bouquet Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {onVisitGarden && (
            <button
              onClick={() => {
                soundManager.playChime();
                onVisitGarden();
              }}
              id="welcome-visit-garden-btn"
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-white/90 hover:bg-white text-[#5c544b] border border-[#e8e2d8] font-semibold text-xs transition-all active:scale-95 shadow-2xs"
            >
              <span>🌱 Greenhouse</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
