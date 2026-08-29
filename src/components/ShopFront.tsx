import React, { useState } from 'react';
import { GameState, CustomerOrder, Customer } from '../types';
import { FLOWERS_BY_ID } from '../data/flowers';
import { soundManager } from '../audio/soundManager';
import { SleepyCatSvg, FlowerStemSvg } from './FlowerIllustrations';
import { FlowerShopScene } from './FlowerShopScene';
import { ShopKeeperCharacter } from './ShopKeeperCharacter';
import { CoinIcon } from './CurrencyIcon';
import { 
  Heart, 
  Sparkles, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  HelpCircle,
  Volume2,
  Coffee,
  Sun,
  Flame,
  Award,
  Sprout,
  Flower2,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ShopFrontProps {
  gameState: GameState;
  onSelectOrder: (order: CustomerOrder) => void;
  onPetCat: () => void;
  onClaimQuest: (questId: string) => void;
  onStartCustomBouquet: () => void;
  onVisitGarden?: () => void;
  onNavigateTab?: (tab: 'shop' | 'studio' | 'garden' | 'grimoire' | 'upgrades') => void;
}

export const ShopFront: React.FC<ShopFrontProps> = ({
  gameState,
  onSelectOrder,
  onPetCat,
  onClaimQuest,
  onStartCustomBouquet,
  onVisitGarden,
  onNavigateTab,
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    gameState.currentOrders[0]?.customer || null
  );
  const [catHearts, setCatHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  const handlePetCatClick = (e: React.MouseEvent) => {
    soundManager.playCatPurr();
    onPetCat();

    const rect = e.currentTarget.getBoundingClientRect();
    const newHeart = {
      id: Date.now(),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setCatHearts(prev => [...prev, newHeart]);
    setTimeout(() => {
      setCatHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1000);
  };

  const handleNavigateToTask = (title: string, desc: string) => {
    soundManager.playPaperRustle();
    const text = (title + ' ' + desc).toLowerCase();
    
    if (text.includes('pet') || text.includes('cat') || text.includes('feline')) {
      // Pet cat directly!
      onPetCat();
      soundManager.playCatPurr();
      confetti({ particleCount: 20, spread: 60 });
      return;
    }

    if (text.includes('garden') || text.includes('water') || text.includes('harvest') || text.includes('seed')) {
      if (onNavigateTab) onNavigateTab('garden');
      else if (onVisitGarden) onVisitGarden();
      return;
    }

    if (text.includes('bouquet') || text.includes('craft') || text.includes('arrange') || text.includes('order')) {
      if (gameState.currentOrders.length > 0) {
        onSelectOrder(gameState.currentOrders[0]);
      } else {
        onStartCustomBouquet();
      }
      return;
    }

    if (text.includes('grimoire') || text.includes('meaning') || text.includes('wisdom') || text.includes('lore')) {
      if (onNavigateTab) onNavigateTab('grimoire');
      return;
    }

    if (text.includes('upgrade') || text.includes('shop')) {
      if (onNavigateTab) onNavigateTab('upgrades');
      return;
    }

    // Default to garden if unknown
    if (onNavigateTab) onNavigateTab('garden');
  };

  const getTaskAction = (title: string, desc: string) => {
    const text = (title + ' ' + desc).toLowerCase();
    if (text.includes('pet') || text.includes('cat')) {
      return { label: 'Pet Midnight', icon: <Heart className="w-3 h-3 text-[#d68060] fill-[#d68060]" /> };
    }
    if (text.includes('garden') || text.includes('water') || text.includes('harvest')) {
      return { label: 'Greenhouse', icon: <Sprout className="w-3 h-3 text-[#8ca68e]" /> };
    }
    if (text.includes('bouquet') || text.includes('craft') || text.includes('arrange')) {
      return { label: 'Studio', icon: <Flower2 className="w-3 h-3 text-[#8ca68e]" /> };
    }
    if (text.includes('grimoire') || text.includes('meaning') || text.includes('wisdom')) {
      return { label: 'Grimoire', icon: <BookOpen className="w-3 h-3 text-[#8ca68e]" /> };
    }
    return { label: 'Go to Task', icon: <ArrowRight className="w-3 h-3 text-[#8ca68e]" /> };
  };

  return (
    <div className="space-y-6">
      {/* 1. ATMOSPHERIC FLOWER SHOP SCENE WITH WELCOMING FLORIST CHARACTER */}
      <FlowerShopScene gameState={gameState}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Welcoming Character Rosie & Studio Invitations */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-[#8ca68e]/20 border border-[#8ca68e]/35 text-[#4a4238] font-serif text-xs font-bold backdrop-blur-xs">
                🌿 Artisan Floristry & Botanical Conservatory
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/70 backdrop-blur-xs border border-[#eee6da] text-[#5c544b] font-medium">
                Weather: <strong className="text-[#4a4238]">{gameState.weather}</strong>
              </span>
            </div>

            <ShopKeeperCharacter
              gameState={gameState}
              onEnterStudio={onStartCustomBouquet}
              onVisitGarden={onVisitGarden}
            />
          </div>

          {/* Right Side: Midnight the Cozy Shop Cat Nook */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-5 rounded-3xl bg-white/85 border border-[#eee6da] backdrop-blur-md shadow-sm">
            <div className="relative flex flex-col items-center">
              {/* Floating Hearts from Petting */}
              {catHearts.map((heart) => (
                <div
                  key={heart.id}
                  style={{ left: heart.x, top: heart.y }}
                  className="absolute pointer-events-none text-[#d68060] animate-bounce transition-all text-base z-30"
                >
                  ❤️
                </div>
              ))}

              <SleepyCatSvg
                happiness={gameState.catHappiness}
                onClick={handlePetCatClick as unknown as () => void}
              />

              <div className="mt-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#4a4238]">
                  <span>Midnight the Shop Cat</span>
                  <span className="text-[#d68060]">🐾</span>
                </div>
                <p className="text-[11px] text-[#a69d91] mt-0.5">
                  Click to gently pet • Purrs award +1 Bloom Token!
                </p>
              </div>
            </div>
          </div>
        </div>
      </FlowerShopScene>

      {/* 2. VISITING CUSTOMER QUEUE & DAILY TASKS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 7 COLS: VISITING CUSTOMER ORDERS */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-xl font-bold text-[#4a4238]">
                Visiting Neighbors & Orders
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#f4f1eb] text-[#6d7a6e] border border-[#e8e2d8] font-bold text-xs">
                {gameState.currentOrders.filter(o => o.status === 'waiting').length} Waiting
              </span>
            </div>
            <span className="text-xs text-[#a69d91]">
              Fulfill their stories & feelings
            </span>
          </div>

          {/* Customer Cards List */}
          <div className="space-y-3">
            {gameState.currentOrders.map((order) => {
              const c = order.customer;
              const isSelected = selectedCustomer?.id === c.id;

              return (
                <div
                  key={order.orderId}
                  id={`order-card-${order.orderId}`}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
                    isSelected
                      ? 'bg-white border-[#8ca68e] shadow-md ring-1 ring-[#8ca68e]/30'
                      : 'bg-white border-[#eee6da] hover:border-[#8ca68e]/50 hover:shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    {/* Customer Info */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#f4f1eb] border border-[#e8e2d8] flex items-center justify-center font-serif text-lg font-bold text-[#6d7a6e] shrink-0">
                        {c.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-base font-bold text-[#4a4238]">
                            {c.name}
                          </h4>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#f4f1eb] text-[#5c544b] font-medium border border-[#eee6da]">
                            {c.title}
                          </span>
                          <span className="flex items-center gap-0.5 text-xs text-[#d68060] font-semibold">
                            <Heart className="w-3 h-3 fill-[#d68060]" /> Lv.{c.friendshipLevel}
                          </span>
                        </div>
                        <p className="text-xs text-[#5c544b] mt-1 line-clamp-2">
                          "{c.story}"
                        </p>
                      </div>
                    </div>

                    {/* Budget & Theme */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#eee6da]">
                      <div className="flex items-center gap-1.5 text-[#4a4238] font-bold text-sm">
                        <CoinIcon className="w-4 h-4" />
                        <span>Up to {c.budget}</span>
                      </div>
                      <span className="text-[11px] text-[#a69d91]">
                        Theme: <span className="font-medium text-[#5c544b]">{c.desiredTheme}</span>
                      </span>
                    </div>
                  </div>

                  {/* Preferences Tags */}
                  <div className="mt-3 pt-3 border-t border-[#eee6da] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-[#a69d91] font-medium">Desired:</span>
                      {c.preferredFlowers?.map(flowerId => {
                        const fl = FLOWERS_BY_ID[flowerId];
                        return fl ? (
                          <span
                            key={flowerId}
                            className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-[#f4f1eb] text-[#5c544b] border border-[#eee6da]"
                          >
                            <span
                              className="w-2 h-2 rounded-full inline-block"
                              style={{ backgroundColor: fl.color }}
                            />
                            {fl.name}
                          </span>
                        ) : null;
                      })}
                    </div>

                    <button
                      onClick={() => {
                        soundManager.playPaperRustle();
                        onSelectOrder(order);
                      }}
                      id={`accept-order-btn-${order.orderId}`}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#8ca68e] text-white hover:bg-[#7b947d] text-xs font-semibold transition-all active:scale-95 shadow-xs ml-auto"
                    >
                      <span>Craft for {c.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {gameState.currentOrders.length === 0 && (
              <div className="p-8 text-center bg-[#f4f1eb] rounded-3xl border border-dashed border-[#e8e2d8]">
                <p className="font-serif text-base text-[#4a4238] font-medium">
                  The shop is peacefully quiet
                </p>
                <p className="text-xs text-[#a69d91] mt-1 max-w-sm mx-auto">
                  New customers arrive with the morning sunrise. You can rest for the day or tend to your greenhouse garden!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT 5 COLS: TODAY'S TASKS & FRESH HARVEST QUICK VIEW */}
        <div className="lg:col-span-5 space-y-6">
          {/* Daily Quests / Tasks Card */}
          <div className="p-5 rounded-3xl bg-white border border-[#eee6da] shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#8ca68e]" />
                <h3 className="font-serif text-lg font-bold text-[#4a4238]">
                  Today's Tasks
                </h3>
              </div>
              <span className="text-xs font-bold text-[#6d7a6e] bg-[#8ca68e]/10 px-2.5 py-0.5 rounded-full border border-[#8ca68e]/20">
                {gameState.dailyQuests.filter(q => q.completed).length} / {gameState.dailyQuests.length} Done
              </span>
            </div>

            <div className="space-y-2.5">
              {gameState.dailyQuests.map((quest) => {
                const isDone = quest.completed;
                const actionInfo = getTaskAction(quest.title, quest.description);

                return (
                  <div
                    key={quest.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isDone
                        ? 'bg-[#8ca68e]/10 border-[#8ca68e]/30 shadow-2xs'
                        : 'bg-[#fcfaf7] border-[#e8e2d8] hover:border-[#8ca68e]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className={`text-xs font-bold ${isDone ? 'text-[#4a4238]' : 'text-[#5c544b]'}`}>
                            {quest.title}
                          </p>
                        </div>
                        <p className="text-[11px] text-[#a69d91] leading-relaxed">
                          {quest.description}
                        </p>
                      </div>

                      {/* Claim or Progress */}
                      {isDone ? (
                        quest.claimed ? (
                          <span className="text-[10px] font-bold text-[#6d7a6e] bg-[#8ca68e]/20 px-2.5 py-1 rounded-full whitespace-nowrap">
                            Completed ✓
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              soundManager.playCoin();
                              onClaimQuest(quest.id);
                              confetti({ particleCount: 20, spread: 55 });
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#d68060] hover:bg-[#c46f4f] text-white text-xs font-bold shadow-xs active:scale-95 animate-bounce whitespace-nowrap"
                          >
                            <CoinIcon className="w-3.5 h-3.5" />
                            <span>+{quest.rewardCoins} Claim</span>
                          </button>
                        )
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-[#5c544b] bg-white px-2 py-0.5 rounded-full border border-[#eee6da]">
                            {quest.progress}/{quest.target}
                          </span>
                          <button
                            onClick={() => handleNavigateToTask(quest.title, quest.description)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white hover:bg-[#8ca68e] text-[#5c544b] hover:text-white border border-[#eee6da] hover:border-[#8ca68e] text-[11px] font-semibold transition-colors shadow-2xs whitespace-nowrap"
                            title={`Jump directly to complete: ${quest.title}`}
                          >
                            {actionInfo.icon}
                            <span>{actionInfo.label}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Harvested Bloom Stock Shelf */}
          <div className="p-5 rounded-3xl bg-white border border-[#eee6da] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-[#4a4238]">
                Fresh Harvested Stems
              </h3>
              <span className="text-xs text-[#a69d91]">
                {Object.values(gameState.inventory).reduce((a: number, b: number) => a + b, 0)} stems in stock
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {Object.entries(gameState.inventory)
                .filter(([_, count]) => (count as number) > 0)
                .map(([flowerId, count]) => {
                  const fl = FLOWERS_BY_ID[flowerId];
                  if (!fl) return null;

                  return (
                    <div
                      key={flowerId}
                      className="p-2.5 rounded-2xl bg-[#f4f1eb] border border-[#e8e2d8] flex flex-col items-center text-center relative group hover:border-[#8ca68e]/40 transition-colors"
                    >
                      <FlowerStemSvg flower={fl} size={40} />
                      <span className="text-[11px] font-bold text-[#4a4238] mt-1 line-clamp-1">
                        {fl.name}
                      </span>
                      <span className="absolute top-1 right-1 text-[10px] font-bold bg-[#4a4238] text-white rounded-full px-1.5 py-0.2">
                        {count}
                      </span>
                    </div>
                  );
                })}

              {Object.values(gameState.inventory).every(c => (c as number) === 0) && (
                <div className="col-span-4 p-4 text-center text-[#a69d91] text-xs italic">
                  No stems in inventory. Visit your Botanical Greenhouse to harvest blooming flowers!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
