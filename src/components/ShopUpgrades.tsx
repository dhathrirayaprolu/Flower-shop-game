import React from 'react';
import { GameState } from '../types';
import { SHOP_UPGRADES } from '../data/customers';
import { soundManager } from '../audio/soundManager';
import { Sparkles, Check, ArrowUpRight, Store, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ShopUpgradesProps {
  gameState: GameState;
  onBuyUpgrade: (upgradeId: string, cost: number) => void;
}

export const ShopUpgradesView: React.FC<ShopUpgradesProps> = ({
  gameState,
  onBuyUpgrade,
}) => {
  return (
    <div className="space-y-6">
      {/* SHOP UPGRADE BANNER */}
      <div className="p-6 rounded-3xl bg-[#f4f1eb] border border-[#e8e2d8] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full bg-[#8ca68e]/15 text-[#6d7a6e] font-serif text-xs font-bold border border-[#8ca68e]/25">
              🏮 Floristry & Greenhouse Expansion
            </span>
            <span className="text-xs text-[#a69d91] font-medium">
              Permanent Upgrades & Decor
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#4a4238]">
            Grow Your Flower Shop
          </h2>
          <p className="text-xs text-[#5c544b] max-w-xl">
            Upgrade your store with artisanal lighting, automatic greenhouse misting, expanded soil plots, and cozy amenities for Midnight the cat.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#eee6da] shadow-xs">
          <span className="text-xs text-[#a69d91] font-medium">Available Funds:</span>
          <span className="font-serif text-base font-bold text-[#4a4238]">
            {gameState.coins} 🪙
          </span>
        </div>
      </div>

      {/* UPGRADE TILES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SHOP_UPGRADES.map(upgrade => {
          const isUnlocked = gameState.unlockedUpgrades.includes(upgrade.id);
          const canAfford = gameState.coins >= upgrade.cost;

          return (
            <div
              key={upgrade.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-white border-[#8ca68e]/40 shadow-xs'
                  : canAfford
                  ? 'bg-white border-[#eee6da] hover:border-[#8ca68e]/50 hover:shadow-xs'
                  : 'bg-[#f4f1eb]/60 border-[#e8e2d8] opacity-70'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{upgrade.icon}</span>
                  {isUnlocked ? (
                    <span className="inline-flex items-center gap-1 text-[11px] px-3 py-1 rounded-full bg-[#8ca68e]/15 text-[#6d7a6e] border border-[#8ca68e]/25 font-bold">
                      <Check className="w-3 h-3" /> Unlocked
                    </span>
                  ) : (
                    <span className="font-serif text-sm font-bold text-[#d68060] bg-[#d68060]/10 px-3 py-1 rounded-full border border-[#d68060]/20">
                      {upgrade.cost} 🪙
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-serif text-base font-bold text-[#4a4238]">
                    {upgrade.name}
                  </h3>
                  <p className="text-xs text-[#5c544b] mt-1 leading-relaxed">
                    {upgrade.description}
                  </p>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#f4f1eb] border border-[#e8e2d8] text-[11px] font-semibold text-[#4a4238] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#d68060] shrink-0" />
                  <span>{upgrade.benefit}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#eee6da]">
                {isUnlocked ? (
                  <div className="w-full py-2 text-center text-xs font-semibold text-[#6d7a6e]">
                    Active & Enhancing Shop
                  </div>
                ) : (
                  <button
                    disabled={!canAfford}
                    onClick={() => {
                      soundManager.playCoin();
                      soundManager.playChime();
                      confetti({ particleCount: 30, spread: 60 });
                      onBuyUpgrade(upgrade.id, upgrade.cost);
                    }}
                    className="w-full py-2.5 rounded-full bg-[#8ca68e] hover:bg-[#7b947d] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Purchase Upgrade ({upgrade.cost}🪙)</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
