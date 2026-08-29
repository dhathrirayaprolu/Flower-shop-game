import React from 'react';
import { GameState } from '../types';
import { CoinIcon, BloomTokenIcon } from './CurrencyIcon';
import { Heart, Calendar, Sparkles, X, Sun, Sunrise, Sunset, CloudRain, ShoppingBag, Sprout, ArrowRight } from 'lucide-react';

export type CurrencyInfoType = 'coins' | 'bloomTokens' | 'reputation' | 'daySeason' | 'tasks';

interface CurrencyInfoModalProps {
  isOpen: boolean;
  type: CurrencyInfoType;
  gameState: GameState;
  onClose: () => void;
  onNavigateTab: (tab: 'shop' | 'studio' | 'garden' | 'grimoire' | 'upgrades') => void;
}

export const CurrencyInfoModal: React.FC<CurrencyInfoModalProps> = ({
  isOpen,
  type,
  gameState,
  onClose,
  onNavigateTab,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#4a4238]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#fcfaf7] rounded-3xl border border-[#eee6da] shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-[#eee6da] pb-3.5">
          <div className="flex items-center gap-2.5">
            {type === 'coins' && (
              <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-xs">
                <CoinIcon className="w-5 h-5" />
              </div>
            )}
            {type === 'bloomTokens' && (
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-xs">
                <BloomTokenIcon className="w-5 h-5" />
              </div>
            )}
            {type === 'reputation' && (
              <div className="w-9 h-9 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center shadow-xs">
                <Heart className="w-5 h-5 text-[#d68060] fill-[#d68060]" />
              </div>
            )}
            {type === 'daySeason' && (
              <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center shadow-xs">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            )}
            {type === 'tasks' && (
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5 text-emerald-600" />
              </div>
            )}

            <div>
              <h3 className="font-serif text-lg font-bold text-[#4a4238]">
                {type === 'coins' && 'Boutique Coins'}
                {type === 'bloomTokens' && 'Bloom Tokens'}
                {type === 'reputation' && 'Customer Reputation & Friendship'}
                {type === 'daySeason' && `Day ${gameState.day} • ${gameState.season} Almanac`}
                {type === 'tasks' && "Today's Florist Tasks"}
              </h3>
              <p className="text-xs text-[#a69d91]">
                {type === 'coins' && 'Primary currency for nursery seeds & shop upgrades'}
                {type === 'bloomTokens' && 'Botanical mastery & prestige rewards'}
                {type === 'reputation' && 'Town love, loyalty level & gratuities'}
                {type === 'daySeason' && 'Seasonal weather conditions & growth cycles'}
                {type === 'tasks' && 'Daily quests & rewarding florist milestones'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f4f1eb] hover:bg-[#e8e2d8] text-[#5c544b] flex items-center justify-center transition-colors font-bold text-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CONTENT BY TYPE */}

        {/* 1. COINS EXPLANATION */}
        {type === 'coins' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-900">Current Balance:</span>
              <div className="flex items-center gap-1.5 font-serif text-xl font-bold text-amber-950">
                <CoinIcon className="w-5 h-5" />
                <span>{gameState.coins} Coins</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-[#5c544b]">
              <div className="p-3 rounded-2xl bg-white border border-[#eee6da] space-y-1">
                <p className="font-bold text-[#4a4238] flex items-center gap-1.5">
                  <span>✨ How to Earn Coins:</span>
                </p>
                <ul className="list-disc list-inside space-y-1 text-[#78716c] pl-1">
                  <li><strong>Craft Custom Bouquets:</strong> Complete visiting customer orders in the Bouquet Studio (+40 to +240🪙 per delivery).</li>
                  <li><strong>Complete Daily Tasks:</strong> Check "Today's Tasks" on the shopfront to claim coin bounties (+40 to +80🪙).</li>
                  <li><strong>Master Florist Tips:</strong> Matching customers' favorite flower varieties and color palettes triggers generous gratuities!</li>
                </ul>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-[#eee6da] space-y-1">
                <p className="font-bold text-[#4a4238] flex items-center gap-1.5">
                  <span>🛍️ What You Can Buy:</span>
                </p>
                <ul className="list-disc list-inside space-y-1 text-[#78716c] pl-1">
                  <li><strong>Flower Seeds:</strong> Buy rare seeds in the Greenhouse nursery (Roses, Dahlias, Sunflowers, etc.).</li>
                  <li><strong>Permanent Shop Upgrades:</strong> Expanded garden soil beds, automatic misting systems, velvet cat cushions, and glowing amber lanterns.</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  onClose();
                  onNavigateTab('garden');
                }}
                className="flex-1 py-2 px-3 rounded-full bg-[#8ca68e] text-white text-xs font-bold hover:bg-[#7b947d] transition-all flex items-center justify-center gap-1 shadow-xs"
              >
                <span>Buy Seeds (Nursery)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  onClose();
                  onNavigateTab('upgrades');
                }}
                className="flex-1 py-2 px-3 rounded-full bg-[#f4f1eb] text-[#4a4238] border border-[#e8e2d8] text-xs font-bold hover:bg-white transition-all flex items-center justify-center gap-1"
              >
                <span>Shop Upgrades</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 2. BLOOM TOKENS EXPLANATION */}
        {type === 'bloomTokens' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-900">Current Bloom Tokens:</span>
              <div className="flex items-center gap-1.5 font-serif text-xl font-bold text-emerald-950">
                <BloomTokenIcon className="w-5 h-5" />
                <span>{gameState.bloomTokens} Tokens</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-[#5c544b]">
              <div className="p-3 rounded-2xl bg-white border border-[#eee6da] space-y-1">
                <p className="font-bold text-[#4a4238]">🌿 How to Earn Bloom Tokens:</p>
                <ul className="list-disc list-inside space-y-1 text-[#78716c] pl-1">
                  <li><strong>Greenhouse Gardening:</strong> Harvesting fully grown flowers awards tokens, with bonus tokens for fertilizing high-quality Radiant blooms!</li>
                  <li><strong>Midnight the Shop Cat:</strong> Gently pet Midnight on the counter to boost happiness and receive companionship tokens!</li>
                  <li><strong>Discovering Flower Lore:</strong> Unlocking new botanical species in your Victorian Grimoire.</li>
                </ul>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-[#eee6da] space-y-1">
                <p className="font-bold text-[#4a4238]">🔮 Future Uses:</p>
                <p className="text-[#78716c] leading-relaxed">
                  Bloom Tokens represent your greenhouse botanic mastery. They unlock rare golden botanical cultivars, enchanted silk ribbon dyes, and ancient floral compendium entries.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onNavigateTab('garden');
              }}
              className="w-full py-2.5 px-4 rounded-full bg-[#8ca68e] text-white text-xs font-bold hover:bg-[#7b947d] transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Sprout className="w-4 h-4" />
              <span>Visit Greenhouse Garden</span>
            </button>
          </div>
        )}

        {/* 3. REPUTATION HEARTS EXPLANATION */}
        {type === 'reputation' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80 flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-900">Florist Town Reputation:</span>
              <div className="flex items-center gap-1.5 font-serif text-xl font-bold text-rose-950">
                <Heart className="w-5 h-5 text-[#d68060] fill-[#d68060]" />
                <span>{gameState.reputationHearts} Hearts</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-[#5c544b]">
              <div className="p-3 rounded-2xl bg-white border border-[#eee6da] space-y-1">
                <p className="font-bold text-[#4a4238]">❤️ How Reputation Grows:</p>
                <ul className="list-disc list-inside space-y-1 text-[#78716c] pl-1">
                  <li><strong>Delighting Customers:</strong> Each bouquet crafted with care raises customer friendship levels and earns +2 to +5 reputation hearts.</li>
                  <li><strong>Attaching Dedicated Notes:</strong> Personalizing gift cards tailored to recipient stories unlocks secret dialogue responses!</li>
                </ul>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-[#eee6da] space-y-1">
                <p className="font-bold text-[#4a4238]">🌟 Boutique Perks:</p>
                <p className="text-[#78716c] leading-relaxed">
                  Higher reputation brings VIP town patrons with larger floral budgets, exotic requests, and exclusive shop lore!
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onNavigateTab('shop');
              }}
              className="w-full py-2.5 px-4 rounded-full bg-[#d68060] text-white text-xs font-bold hover:bg-[#c46f4f] transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>Meet Visiting Customers</span>
            </button>
          </div>
        )}

        {/* 4. DAY, SEASON & WEATHER EXPLANATION */}
        {type === 'daySeason' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-2xl bg-white border border-[#eee6da] text-center">
                <span className="text-[11px] text-[#a69d91]">Season:</span>
                <p className="font-serif text-base font-bold text-[#4a4238]">
                  {gameState.season}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-[#eee6da] text-center">
                <span className="text-[11px] text-[#a69d91]">Weather & Time:</span>
                <p className="font-serif text-base font-bold text-[#4a4238]">
                  {gameState.weather} ({gameState.timeOfDay})
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#f4f1eb] border border-[#e8e2d8] space-y-2 text-xs text-[#5c544b]">
              <p className="font-bold text-[#4a4238]">🌦️ Natural Weather Influences:</p>
              <ul className="list-disc list-inside space-y-1 text-[#78716c] pl-1">
                <li><strong>Cozy Rain / Rainy Night:</strong> Automatically waters all your greenhouse garden plots overnight!</li>
                <li><strong>Sunny & Golden Mist:</strong> Enhances flower fragrance and speeds up daytime seedling growth.</li>
                <li><strong>Night Rest:</strong> Clicking <em>"Rest & End Day"</em> saves your progress, refreshes customer visits, and advances flower growth.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
