import React, { useState } from 'react';
import { 
  GameState, 
  PlacedStem, 
  CustomerOrder, 
  WrapOption, 
  RibbonOption, 
  CardTagOption 
} from '../types';
import { FLOWERS_BY_ID, ALL_FLOWERS } from '../data/flowers';
import { WRAP_OPTIONS, RIBBON_OPTIONS, CARD_TAGS } from '../data/customers';
import { BouquetCanvas } from './BouquetCanvas';
import { FlowerStemSvg } from './FlowerIllustrations';
import { soundManager } from '../audio/soundManager';
import { 
  Sparkles, 
  RotateCw, 
  RotateCcw, 
  Trash2, 
  Layers, 
  Plus, 
  Minus, 
  ArrowRight, 
  Heart, 
  Coins, 
  Check, 
  Wand2, 
  Info,
  Gift
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BouquetStudioProps {
  gameState: GameState;
  activeOrder: CustomerOrder | null;
  onClearOrder: () => void;
  onFinishBouquet: (
    stems: PlacedStem[],
    wrap: WrapOption,
    ribbon: RibbonOption,
    cardTag: CardTagOption | null,
    order: CustomerOrder | null
  ) => void;
  onConsumeStems: (flowerIds: string[]) => void;
}

export const BouquetStudio: React.FC<BouquetStudioProps> = ({
  gameState,
  activeOrder,
  onClearOrder,
  onFinishBouquet,
  onConsumeStems,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Pick Stems, 2: Arrange Canvas, 3: Wrap & Card
  const [placedStems, setPlacedStems] = useState<PlacedStem[]>(
    gameState.activeBouquet.stems.length > 0
      ? gameState.activeBouquet.stems
      : []
  );
  const [selectedStemUid, setSelectedStemUid] = useState<string | null>(null);
  const [selectedWrap, setSelectedWrap] = useState<WrapOption>(
    gameState.activeBouquet.wrap || WRAP_OPTIONS[0]
  );
  const [selectedRibbon, setSelectedRibbon] = useState<RibbonOption>(
    gameState.activeBouquet.ribbon || RIBBON_OPTIONS[0]
  );
  const [selectedTag, setSelectedTag] = useState<CardTagOption | null>(
    gameState.activeBouquet.cardTag || CARD_TAGS[0]
  );

  // Available stem inventory tracking within workshop
  const availableInventory = { ...gameState.inventory };
  // Subtract stems already added to canvas
  placedStems.forEach(stem => {
    if (availableInventory[stem.flowerId] !== undefined) {
      availableInventory[stem.flowerId] = Math.max(0, availableInventory[stem.flowerId] - 1);
    }
  });

  // Calculate bouquet aesthetics & match
  const totalFlowerValue = placedStems.reduce((sum, stem) => {
    const f = FLOWERS_BY_ID[stem.flowerId];
    return sum + (f ? f.stemSellValue : 10);
  }, 0);

  // Theme matching bonus if active customer order exists
  let customerMatchBonus = 0;
  let matchesTheme = true;
  if (activeOrder) {
    const c = activeOrder.customer;
    if (placedStems.length >= c.minStems) {
      customerMatchBonus += 30;
    }
    const matchingPreferred = placedStems.filter(stem =>
      c.preferredFlowers?.includes(stem.flowerId)
    ).length;
    customerMatchBonus += matchingPreferred * 25;
  }

  const finalBouquetValue = totalFlowerValue + customerMatchBonus + (selectedWrap.cost > 0 ? 15 : 0) + (selectedRibbon.cost > 0 ? 10 : 0);

  const handleAddStem = (flowerId: string) => {
    if ((availableInventory[flowerId] || 0) <= 0) return;

    soundManager.playSnip();

    // Compute pleasant natural fan offset
    const index = placedStems.length;
    const spreadX = (index % 2 === 0 ? 1 : -1) * (Math.floor(index / 2) * 22);
    const spreadY = -Math.floor(index / 2) * 12;
    const rotation = (index % 2 === 0 ? 1 : -1) * (Math.floor(index / 2) * 9);

    const newStem: PlacedStem = {
      uid: 'stem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      flowerId,
      x: spreadX,
      y: spreadY,
      rotation,
      scale: 1,
      layer: index,
    };

    setPlacedStems(prev => [...prev, newStem]);
    setSelectedStemUid(newStem.uid);
  };

  const handleRemoveStem = (uid: string) => {
    soundManager.playSnip();
    setPlacedStems(prev => prev.filter(s => s.uid !== uid));
    if (selectedStemUid === uid) {
      setSelectedStemUid(null);
    }
  };

  const handleAutoArrange = () => {
    soundManager.playChime();
    setPlacedStems(prev => {
      return prev.map((stem, idx) => {
        const total = prev.length;
        const normalized = total > 1 ? (idx / (total - 1)) * 2 - 1 : 0;
        return {
          ...stem,
          x: normalized * 45,
          y: -Math.abs(normalized) * 18,
          rotation: normalized * 24,
          scale: 1 - Math.abs(normalized) * 0.1,
          layer: idx,
        };
      });
    });
  };

  const handleFinishAndDeliver = () => {
    if (placedStems.length === 0) return;

    soundManager.playCoin();
    soundManager.playChime();

    // Trigger joyful confetti
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f472b6', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa'],
    });

    // Notify parent
    onFinishBouquet(placedStems, selectedWrap, selectedRibbon, selectedTag, activeOrder);
  };

  return (
    <div className="space-y-6">
      {/* WORKBENCH BANNER & ACTIVE CUSTOMER BRIEF */}
      {activeOrder && (
        <div className="p-4 sm:p-5 rounded-3xl bg-[#f4f1eb] border border-[#e8e2d8] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#eee6da] flex items-center justify-center font-serif text-xl font-bold text-[#6d7a6e] shrink-0">
              {activeOrder.customer.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#8ca68e]/15 text-[#6d7a6e] border border-[#8ca68e]/25">
                  Custom Order
                </span>
                <h3 className="font-serif text-base font-bold text-[#4a4238]">
                  {activeOrder.customer.name} • {activeOrder.customer.title}
                </h3>
              </div>
              <p className="text-xs text-[#5c544b] mt-1 max-w-xl">
                "{activeOrder.customer.requestText}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClearOrder}
              className="text-xs text-[#a69d91] hover:text-[#4a4238] underline px-2 py-1"
            >
              Craft as Freeform instead
            </button>
          </div>
        </div>
      )}

      {/* 3-STEP CRAFTING PROGRESSION HEADER */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 p-1.5 bg-[#f4f1eb] rounded-full border border-[#e8e2d8]">
        <button
          onClick={() => {
            soundManager.playPaperRustle();
            setStep(1);
          }}
          className={`py-2 sm:py-2.5 px-3 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            step === 1
              ? 'bg-white text-[#4a4238] shadow-xs font-bold'
              : 'text-[#a69d91] hover:text-[#4a4238]'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-[#8ca68e]/15 flex items-center justify-center text-xs font-bold text-[#6d7a6e]">
            1
          </span>
          <span className="truncate">Pick Stems ({placedStems.length})</span>
        </button>

        <button
          onClick={() => {
            soundManager.playPaperRustle();
            setStep(2);
          }}
          className={`py-2 sm:py-2.5 px-3 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            step === 2
              ? 'bg-white text-[#4a4238] shadow-xs font-bold'
              : 'text-[#a69d91] hover:text-[#4a4238]'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-[#8ca68e]/15 flex items-center justify-center text-xs font-bold text-[#6d7a6e]">
            2
          </span>
          <span className="truncate">Arrange Harmony</span>
        </button>

        <button
          onClick={() => {
            soundManager.playPaperRustle();
            setStep(3);
          }}
          className={`py-2 sm:py-2.5 px-3 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            step === 3
              ? 'bg-white text-[#4a4238] shadow-xs font-bold'
              : 'text-[#a69d91] hover:text-[#4a4238]'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-[#8ca68e]/15 flex items-center justify-center text-xs font-bold text-[#6d7a6e]">
            3
          </span>
          <span className="truncate">Wrap & Gift Tag</span>
        </button>
      </div>

      {/* MAIN WORKBENCH GRID: CANVAS ON LEFT, TOOL PANEL ON RIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT 7 COLS: BOUQUET VISUAL CANVAS & ACTIVE STEM CONTROLS */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#eee6da] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#4a4238]">
                  Bouquet Arrangement Canvas
                </h3>
                <p className="text-xs text-[#a69d91]">
                  Click any flower in the vase to adjust position, rotation, and layer
                </p>
              </div>

              {/* Auto Arrange & Clear */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAutoArrange}
                  title="Auto-Harmonize Fan Pattern"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f4f1eb] border border-[#e8e2d8] text-[#5c544b] text-xs font-medium hover:bg-white hover:border-[#8ca68e]/50 transition-colors shadow-xs"
                >
                  <Wand2 className="w-3.5 h-3.5 text-[#8ca68e]" />
                  <span>Harmonize</span>
                </button>

                {placedStems.length > 0 && (
                  <button
                    onClick={() => {
                      soundManager.playSnip();
                      setPlacedStems([]);
                      setSelectedStemUid(null);
                    }}
                    title="Clear All Stems"
                    className="p-1.5 rounded-full bg-[#f4f1eb] hover:bg-rose-50 text-[#a69d91] hover:text-rose-700 transition-colors border border-[#e8e2d8]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Visual Canvas Renderer */}
            <BouquetCanvas
              stems={placedStems}
              wrap={selectedWrap}
              ribbon={selectedRibbon}
              cardTag={selectedTag}
              selectedStemUid={selectedStemUid}
              onSelectStem={setSelectedStemUid}
              interactive={true}
            />

            {/* Stem Micro-Adjustment Bar for Selected Flower */}
            {selectedStemUid && (
              <div className="p-3 rounded-2xl bg-[#f4f1eb] border border-[#e8e2d8] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 font-medium text-[#4a4238]">
                  <span>Selected:</span>
                  <span className="font-bold text-[#6d7a6e]">
                    {FLOWERS_BY_ID[placedStems.find(s => s.uid === selectedStemUid)?.flowerId || '']?.name}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Rotate Left */}
                  <button
                    onClick={() => {
                      soundManager.playSnip();
                      setPlacedStems(prev =>
                        prev.map(s => (s.uid === selectedStemUid ? { ...s, rotation: s.rotation - 10 } : s))
                      );
                    }}
                    className="p-1.5 rounded-lg bg-white border border-[#eee6da] text-[#5c544b] hover:bg-[#f4f1eb]"
                    title="Rotate Stem Left"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  {/* Rotate Right */}
                  <button
                    onClick={() => {
                      soundManager.playSnip();
                      setPlacedStems(prev =>
                        prev.map(s => (s.uid === selectedStemUid ? { ...s, rotation: s.rotation + 10 } : s))
                      );
                    }}
                    className="p-1.5 rounded-lg bg-white border border-[#eee6da] text-[#5c544b] hover:bg-[#f4f1eb]"
                    title="Rotate Stem Right"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>

                  {/* Move Left */}
                  <button
                    onClick={() => {
                      setPlacedStems(prev =>
                        prev.map(s => (s.uid === selectedStemUid ? { ...s, x: s.x - 8 } : s))
                      );
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white border border-[#eee6da] text-[#5c544b] font-bold hover:bg-[#f4f1eb]"
                    title="Nudge Left"
                  >
                    ←
                  </button>

                  {/* Move Right */}
                  <button
                    onClick={() => {
                      setPlacedStems(prev =>
                        prev.map(s => (s.uid === selectedStemUid ? { ...s, x: s.x + 8 } : s))
                      );
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white border border-[#eee6da] text-[#5c544b] font-bold hover:bg-[#f4f1eb]"
                    title="Nudge Right"
                  >
                    →
                  </button>

                  {/* Move Up */}
                  <button
                    onClick={() => {
                      setPlacedStems(prev =>
                        prev.map(s => (s.uid === selectedStemUid ? { ...s, y: s.y - 8 } : s))
                      );
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white border border-[#eee6da] text-[#5c544b] font-bold hover:bg-[#f4f1eb]"
                    title="Raise Stem"
                  >
                    ↑
                  </button>

                  {/* Move Down */}
                  <button
                    onClick={() => {
                      setPlacedStems(prev =>
                        prev.map(s => (s.uid === selectedStemUid ? { ...s, y: s.y + 8 } : s))
                      );
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white border border-[#eee6da] text-[#5c544b] font-bold hover:bg-[#f4f1eb]"
                    title="Lower Stem"
                  >
                    ↓
                  </button>

                  {/* Remove Single Stem */}
                  <button
                    onClick={() => handleRemoveStem(selectedStemUid)}
                    className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100"
                    title="Remove stem"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT 5 COLS: STEP-BASED CONTROL ACCORDION */}
        <div className="lg:col-span-5 space-y-4">
          {/* STEP 1: PICK STEMS */}
          {step === 1 && (
            <div className="p-5 rounded-3xl bg-white border border-[#eee6da] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-base font-bold text-[#4a4238]">
                  Harvested Flower Stems
                </h4>
                <span className="text-xs text-[#a69d91]">Click to add to vase</span>
              </div>

              {/* Flower Inventory Cards */}
              <div className="grid grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {ALL_FLOWERS.map(fl => {
                  const count = availableInventory[fl.id] || 0;
                  const isPreferred = activeOrder?.customer.preferredFlowers?.includes(fl.id);

                  return (
                    <div
                      key={fl.id}
                      onClick={() => handleAddStem(fl.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center relative ${
                        count > 0
                          ? 'bg-[#f4f1eb] border-[#e8e2d8] hover:border-[#8ca68e]/50 hover:bg-white active:scale-95'
                          : 'opacity-40 bg-stone-50 border-[#eee6da] cursor-not-allowed'
                      }`}
                    >
                      {isPreferred && count > 0 && (
                        <span className="absolute -top-1.5 -left-1.5 text-[9px] px-2 py-0.5 rounded-full bg-[#d68060] text-white font-bold shadow-xs">
                          Desired!
                        </span>
                      )}

                      <FlowerStemSvg flower={fl} size={48} />
                      <span className="text-xs font-bold text-[#4a4238] mt-1 line-clamp-1">
                        {fl.name}
                      </span>
                      <span className="text-[10px] text-[#a69d91] italic line-clamp-1">
                        {fl.languageOfFlowers}
                      </span>

                      <div className="mt-2 w-full flex items-center justify-between text-[11px] pt-1.5 border-t border-[#eee6da]">
                        <span className="text-[#a69d91] font-medium">In Stock:</span>
                        <span className="font-bold text-[#4a4238]">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  disabled={placedStems.length === 0}
                  onClick={() => {
                    soundManager.playPaperRustle();
                    setStep(2);
                  }}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#8ca68e] text-white hover:bg-[#7b947d] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-all shadow-xs"
                >
                  <span>Proceed to Arrange ({placedStems.length} stems)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ARRANGE STEMS HELP & PRESETS */}
          {step === 2 && (
            <div className="p-5 rounded-3xl bg-white border border-[#eee6da] shadow-xs space-y-4">
              <h4 className="font-serif text-base font-bold text-[#4a4238]">
                Arranging Presets & Harmony
              </h4>

              <p className="text-xs text-[#5c544b] leading-relaxed">
                Position each stem to give the bouquet full volume and balance. Click any flower on the canvas on the left to rotate, raise, or layer it!
              </p>

              {/* Bouquet Composition Summary */}
              <div className="p-4 rounded-2xl bg-[#f4f1eb] border border-[#e8e2d8] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#a69d91] font-medium">Total Stems:</span>
                  <span className="font-bold text-[#4a4238]">{placedStems.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#a69d91] font-medium">Arrangement Harmony:</span>
                  <span className="font-bold text-[#6d7a6e]">
                    {placedStems.length >= 4 ? '🌸 Radiant & Balanced' : '🌱 Sweet & Simple'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#a69d91] font-medium">Estimated Value:</span>
                  <span className="font-bold text-[#d68060]">{finalBouquetValue} 🪙</span>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-3 border-t border-[#eee6da]">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-[#5c544b] hover:text-[#4a4238] px-3 py-2"
                >
                  ← Back to Pick Stems
                </button>
                <button
                  onClick={() => {
                    soundManager.playPaperRustle();
                    setStep(3);
                  }}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#8ca68e] text-white hover:bg-[#7b947d] text-xs font-bold transition-all shadow-xs"
                >
                  <span>Next: Wrap & Ribbon</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: WRAP, RIBBON & GIFT TAG */}
          {step === 3 && (
            <div className="p-5 rounded-3xl bg-white border border-[#eee6da] shadow-xs space-y-4">
              <h4 className="font-serif text-base font-bold text-[#4a4238]">
                Wrapping, Ribbon & Handwritten Tag
              </h4>

              {/* 1. Wrap Style */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#4a4238]">
                  1. Choose Wrapping Paper:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {WRAP_OPTIONS.map(wrap => (
                    <button
                      key={wrap.id}
                      onClick={() => {
                        soundManager.playPaperRustle();
                        setSelectedWrap(wrap);
                      }}
                      className={`p-2.5 rounded-2xl border text-left text-xs transition-all flex items-center gap-2 ${
                        selectedWrap.id === wrap.id
                          ? 'bg-[#f4f1eb] border-[#8ca68e] ring-1 ring-[#8ca68e]/30'
                          : 'bg-[#f4f1eb]/50 border-[#eee6da] hover:bg-white'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-stone-400 shrink-0"
                        style={{ backgroundColor: wrap.color }}
                      />
                      <span className="truncate font-medium text-[#4a4238]">
                        {wrap.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Ribbon & Bow */}
              <div className="space-y-2 pt-2 border-t border-[#eee6da]">
                <label className="text-xs font-bold text-[#4a4238]">
                  2. Tie with Ribbon:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {RIBBON_OPTIONS.map(ribbon => (
                    <button
                      key={ribbon.id}
                      onClick={() => {
                        soundManager.playRibbonTie();
                        setSelectedRibbon(ribbon);
                      }}
                      className={`p-2.5 rounded-2xl border text-left text-xs transition-all flex items-center gap-2 ${
                        selectedRibbon.id === ribbon.id
                          ? 'bg-[#f4f1eb] border-[#8ca68e] ring-1 ring-[#8ca68e]/30'
                          : 'bg-[#f4f1eb]/50 border-[#eee6da] hover:bg-white'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-stone-400 shrink-0"
                        style={{ backgroundColor: ribbon.color }}
                      />
                      <span className="truncate font-medium text-[#4a4238]">
                        {ribbon.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Gift Tag Note */}
              <div className="space-y-2 pt-2 border-t border-[#eee6da]">
                <label className="text-xs font-bold text-[#4a4238]">
                  3. Attach Gift Tag & Message:
                </label>
                <div className="space-y-1.5">
                  {CARD_TAGS.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => {
                        soundManager.playPaperRustle();
                        setSelectedTag(tag);
                      }}
                      className={`w-full p-2.5 rounded-2xl border text-left text-xs transition-all ${
                        selectedTag?.id === tag.id
                          ? 'bg-[#8ca68e]/10 border-[#8ca68e] ring-1 ring-[#8ca68e]/30'
                          : 'bg-[#f4f1eb]/50 border-[#eee6da] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#4a4238]">
                          {tag.icon} {tag.title}
                        </span>
                        {selectedTag?.id === tag.id && (
                          <Check className="w-3.5 h-3.5 text-[#6d7a6e]" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#5c544b] italic mt-0.5">
                        "{tag.note}"
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* FINISH AND DELIVER BUTTON */}
              <div className="pt-4 border-t border-[#eee6da]">
                <button
                  disabled={placedStems.length === 0}
                  onClick={handleFinishAndDeliver}
                  id="deliver-bouquet-btn"
                  className="w-full py-3.5 px-4 rounded-full bg-[#8ca68e] hover:bg-[#7b947d] text-white font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  <Gift className="w-4 h-4 text-white" />
                  <span>
                    {activeOrder
                      ? `Deliver to ${activeOrder.customer.name} (+${finalBouquetValue}🪙)`
                      : `Complete Bouquet (+${finalBouquetValue}🪙)`}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
