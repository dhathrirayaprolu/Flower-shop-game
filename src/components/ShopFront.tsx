import React, { useState } from 'react';
import { GameState, CustomerOrder, Customer } from '../types';
import { FLOWERS_BY_ID } from '../data/flowers';
import { soundManager } from '../audio/soundManager';
import { SleepyCatSvg, FlowerStemSvg } from './FlowerIllustrations';
import { 
  Heart, 
  Coins, 
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
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ShopFrontProps {
  gameState: GameState;
  onSelectOrder: (order: CustomerOrder) => void;
  onPetCat: () => void;
  onClaimQuest: (questId: string) => void;
  onStartCustomBouquet: () => void;
}

export const ShopFront: React.FC<ShopFrontProps> = ({
  gameState,
  onSelectOrder,
  onPetCat,
  onClaimQuest,
  onStartCustomBouquet,
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
      id: Date.now() + Math.random(),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setCatHearts(prev => [...prev.slice(-6), newHeart]);

    // Minor confetti burst for delight
    confetti({
      particleCount: 8,
      spread: 40,
      origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
      colors: ['#fda4af', '#f43f5e', '#fb7185'],
    });

    window.setTimeout(() => {
      setCatHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1500);
  };

  const getDayLightingStyle = () => {
    switch (gameState.timeOfDay) {
      case 'Morning':
        return 'from-[#f4f1eb] via-[#fcfaf7] to-[#f4f1eb]';
      case 'Afternoon':
        return 'from-[#f7f3ed] via-[#fcfaf7] to-[#f0ede6]';
      case 'Evening':
        return 'from-[#efe9df] via-[#f4f1eb] to-[#e6decb]/40';
      case 'Rainy Night':
        return 'from-[#e8e4dc] via-[#f4f1eb] to-[#dcd6ca]/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* SHOP MAIN ATMOSPHERE & VISUAL STOREFRONT BANNER */}
      <div className={`relative overflow-hidden rounded-3xl border border-[#e8e2d8] bg-gradient-to-b ${getDayLightingStyle()} p-6 sm:p-8 shadow-xs transition-all duration-700`}>
        {/* Subtle grid dot pattern overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#e8e2d8_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Shopkeeper Desk & Ambiance */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-[#8ca68e]/15 border border-[#8ca68e]/25 text-[#6d7a6e] font-serif text-xs font-semibold">
                🌿 Botanical Studio & Floristry
              </span>
              <span className="text-xs text-[#a69d91]">
                Weather: <strong className="text-[#4a4238]">{gameState.weather}</strong>
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#4a4238] font-bold tracking-tight">
              Welcome to Bloom & Thread
            </h2>

            <p className="text-sm sm:text-base text-[#5c544b] leading-relaxed font-sans max-w-xl">
              Fresh botanical cuttings are resting on the wooden counter, ready to be arranged with love. Listen to the soft raindrops on the skylight and craft bespoke bouquets for neighbors and travelers.
            </p>

            {/* Blackboard Quote */}
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#4a4238] text-[#fcfaf7] shadow-sm border border-[#383129]">
              <span className="text-[#eee6da] font-serif text-sm italic font-medium">
                "Live in full bloom, one petal at a time."
              </span>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  soundManager.playSnip();
                  onStartCustomBouquet();
                }}
                id="shop-craft-freeform-btn"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#8ca68e] text-white hover:bg-[#7b947d] font-medium text-sm transition-all shadow-xs active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Open Bouquet Crafting Table</span>
              </button>
            </div>
          </div>

          {/* Right Side: The Sleepy Cat Nook & Warm Lantern */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-5 rounded-3xl bg-white/80 border border-[#eee6da] backdrop-blur-xs shadow-xs">
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
                  Click to gently pet • Happiness purr gives +1 Bloom Token!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TWO COLUMN CONTENT: VISITING CUSTOMERS & DAILY QUESTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 7 COLS: VISITING CUSTOMER QUEUE & ORDERS */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-xl font-bold text-[#4a4238]">
                Visiting Customers
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
                    {/* Customer Info & Avatar Seed */}
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

                    {/* Budget & Rewards */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#eee6da]">
                      <div className="flex items-center gap-1.5 text-[#4a4238] font-bold text-sm">
                        <Coins className="w-4 h-4 text-[#d68060]" />
                        <span>Up to {c.budget}</span>
                      </div>
                      <span className="text-[11px] text-[#a69d91]">
                        Theme: <span className="font-medium text-[#5c544b]">{c.desiredTheme}</span>
                      </span>
                    </div>
                  </div>

                  {/* Specific Preferences Tags */}
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

        {/* RIGHT 5 COLS: TODAY'S TASKS & HARVESTED STOCK QUICK VIEW */}
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
                {gameState.dailyQuests.filter(q => q.completed).length} / {gameState.dailyQuests.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {gameState.dailyQuests.map((quest) => {
                const isDone = quest.completed;

                return (
                  <div
                    key={quest.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      isDone
                        ? 'bg-[#8ca68e]/10 border-[#8ca68e]/30'
                        : 'bg-[#f4f1eb] border-[#e8e2d8]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <p className={`text-xs font-bold ${isDone ? 'text-[#4a4238]' : 'text-[#5c544b]'}`}>
                            {quest.title}
                          </p>
                        </div>
                        <p className="text-[11px] text-[#a69d91]">
                          {quest.description}
                        </p>
                      </div>

                      {/* Claim or Progress */}
                      {isDone ? (
                        quest.claimed ? (
                          <span className="text-[10px] font-bold text-[#6d7a6e] bg-[#8ca68e]/20 px-2.5 py-0.5 rounded-full">
                            Completed ✓
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              soundManager.playCoin();
                              onClaimQuest(quest.id);
                              confetti({ particleCount: 15, spread: 50 });
                            }}
                            className="px-3 py-1 rounded-full bg-[#d68060] hover:bg-[#c46f4f] text-white text-xs font-bold shadow-xs active:scale-95 animate-bounce"
                          >
                            Claim +{quest.rewardCoins}🪙
                          </button>
                        )
                      ) : (
                        <span className="text-xs font-medium text-[#5c544b] bg-white px-2.5 py-0.5 rounded-full border border-[#eee6da]">
                          {quest.progress}/{quest.target}
                        </span>
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
