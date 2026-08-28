import React from 'react';
import { GameState, Season } from '../types';
import { soundManager } from '../audio/soundManager';
import { Moon, Sun, Coins, Heart, Sprout, Sparkles, ArrowRight } from 'lucide-react';

interface DaySummaryModalProps {
  isOpen: boolean;
  gameState: GameState;
  onStartNewDay: () => void;
}

export const DaySummaryModal: React.FC<DaySummaryModalProps> = ({
  isOpen,
  gameState,
  onStartNewDay,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#4a4238]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#fcfaf7] rounded-3xl border border-[#eee6da] shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in duration-300">
        {/* Night / Moon Banner */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-[#f4f1eb] border border-[#e8e2d8] flex items-center justify-center mx-auto text-[#8ca68e]">
            <Moon className="w-8 h-8 text-[#8ca68e]" />
          </div>

          <div className="space-y-0.5">
            <span className="text-xs uppercase font-bold tracking-widest text-[#8ca68e]">
              Evening Rest in the Cottage
            </span>
            <h3 className="font-serif text-2xl font-bold text-[#4a4238]">
              Day {gameState.day} Concluded
            </h3>
            <p className="text-xs text-[#a69d91]">
              {gameState.season} Season • Night settles softly over the garden
            </p>
          </div>
        </div>

        {/* Daily Harvest & Financial Log */}
        <div className="p-4 rounded-2xl bg-white border border-[#eee6da] shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-[#4a4238] uppercase tracking-wider">
            Botanical Ledger
          </h4>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-[#f4f1eb] border border-[#e8e2d8]">
              <span className="text-[10px] text-[#a69d91] block font-medium">Shop Coins</span>
              <span className="font-serif text-base font-bold text-[#4a4238]">
                {gameState.coins} 🪙
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#f4f1eb] border border-[#e8e2d8]">
              <span className="text-[10px] text-[#6d7a6e] block font-medium">Bloom Tokens</span>
              <span className="font-serif text-base font-bold text-[#6d7a6e]">
                {gameState.bloomTokens} 🌿
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#f4f1eb] border border-[#e8e2d8]">
              <span className="text-[10px] text-[#d68060] block font-medium">Hearts</span>
              <span className="font-serif text-base font-bold text-[#d68060]">
                {gameState.reputationHearts} 💖
              </span>
            </div>
          </div>
        </div>

        {/* Tomorrow's Garden Forecast */}
        <div className="p-3.5 rounded-2xl bg-[#f4f1eb] border border-[#e8e2d8] text-xs text-[#5c544b] flex items-start gap-2.5">
          <Sun className="w-4 h-4 text-[#d68060] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#4a4238]">Tomorrow's Forecast:</strong> Morning sunlight will gently warmth your greenhouse. New neighbor requests and blooming buds await!
          </p>
        </div>

        {/* Morning Button */}
        <button
          onClick={() => {
            soundManager.playChime();
            onStartNewDay();
          }}
          className="w-full py-3.5 px-4 rounded-full bg-[#8ca68e] hover:bg-[#7b947d] text-white font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
        >
          <Sun className="w-4 h-4 text-amber-200" />
          <span>Wake to Day {gameState.day + 1} Morning</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
