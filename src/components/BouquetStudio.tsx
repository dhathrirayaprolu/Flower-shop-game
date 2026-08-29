import React, { useState } from 'react';
import { 
  GameState, 
  PlacedStem, 
  CustomerOrder, 
  WrapOption, 
  RibbonOption, 
  CardTagOption,
  FlowerSpecies 
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
  Gift,
  FlipHorizontal,
  Sliders,
  Palette,
  Eye,
  RefreshCw,
  LayoutGrid
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
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Pick Stems, 2: Arrange Canvas, 3: Wrap & Card
  const [placedStems, setPlacedStems] = useState<PlacedStem[]>(
    gameState.activeBouquet.stems.length > 0
      ? gameState.activeBouquet.stems
      : []
  );
  const [selectedStemUid, setSelectedStemUid] = useState<string | null>(null);
  const [selectedStemUids, setSelectedStemUids] = useState<string[]>([]);
  const [vesselStyle, setVesselStyle] = useState<'hand_tied_wrap' | 'vintage_vase'>('hand_tied_wrap');
  const [selectedWrap, setSelectedWrap] = useState<WrapOption>(
    gameState.activeBouquet.wrap || WRAP_OPTIONS[0]
  );
  const [selectedRibbon, setSelectedRibbon] = useState<RibbonOption>(
    gameState.activeBouquet.ribbon || RIBBON_OPTIONS[0]
  );
  const [selectedTag, setSelectedTag] = useState<CardTagOption | null>(
    gameState.activeBouquet.cardTag || CARD_TAGS[0]
  );
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);

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

  // ADD STEM
  const handleAddStem = (flowerId: string) => {
    if ((availableInventory[flowerId] || 0) <= 0) return;

    soundManager.playSnip();

    // Natural fan layout calculation
    const index = placedStems.length;
    const spreadX = (index % 2 === 0 ? 1 : -1) * (Math.floor(index / 2) * 26);
    const spreadY = -Math.floor(index / 2) * 14 - 20;
    const rotation = (index % 2 === 0 ? 1 : -1) * (Math.floor(index / 2) * 12);

    const newStem: PlacedStem = {
      uid: 'stem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      flowerId,
      x: spreadX,
      y: spreadY,
      rotation,
      scale: 1,
      layer: index,
      flipped: false,
    };

    setPlacedStems(prev => [...prev, newStem]);
    setSelectedStemUid(newStem.uid);
  };

  // UPDATE STEM
  const handleUpdateStem = (updatedStem: PlacedStem) => {
    setPlacedStems(prev =>
      prev.map(s => (s.uid === updatedStem.uid ? updatedStem : s))
    );
  };

  // REMOVE STEM
  const handleRemoveStem = (uid: string) => {
    soundManager.playSnip();
    setPlacedStems(prev => prev.filter(s => s.uid !== uid));
    if (selectedStemUid === uid) {
      setSelectedStemUid(null);
    }
  };

  // DUPLICATE STEM
  const handleDuplicateStem = (stem: PlacedStem) => {
    if ((availableInventory[stem.flowerId] || 0) <= 0) return;

    soundManager.playSnip();
    const newStem: PlacedStem = {
      ...stem,
      uid: 'stem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      x: stem.x + 18,
      y: stem.y - 10,
      rotation: stem.rotation + 8,
      layer: placedStems.length,
    };
    setPlacedStems(prev => [...prev, newStem]);
    setSelectedStemUid(newStem.uid);
  };

  // UPDATE MULTIPLE STEMS
  const handleUpdateStems = (updatedStems: PlacedStem[]) => {
    setPlacedStems(prev => {
      const map = new Map(updatedStems.map(s => [s.uid, s]));
      return prev.map(s => map.get(s.uid) || s);
    });
  };

  // REMOVE MULTIPLE STEMS
  const handleRemoveStems = (uids: string[]) => {
    soundManager.playSnip();
    const set = new Set(uids);
    setPlacedStems(prev => prev.filter(s => !set.has(s.uid)));
    setSelectedStemUids([]);
    if (selectedStemUid && set.has(selectedStemUid)) {
      setSelectedStemUid(null);
    }
  };

  // DUPLICATE MULTIPLE STEMS
  const handleDuplicateStems = (stemsToDup: PlacedStem[]) => {
    soundManager.playSnip();
    const newStems: PlacedStem[] = [];
    const newUids: string[] = [];
    let currentLen = placedStems.length;

    stemsToDup.forEach(stem => {
      if ((availableInventory[stem.flowerId] || 0) <= 0) return;
      const newStem: PlacedStem = {
        ...stem,
        uid: 'stem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        x: stem.x + 16,
        y: stem.y - 12,
        layer: currentLen++,
      };
      newStems.push(newStem);
      newUids.push(newStem.uid);
    });

    if (newStems.length > 0) {
      setPlacedStems(prev => [...prev, ...newStems]);
      setSelectedStemUids(newUids);
      setSelectedStemUid(newUids[0]);
    }
  };

  // SWAP FLOWER SPECIES IN PLACE
  const handleSwapFlowerSpecies = (stemUid: string, newFlowerId: string) => {
    if ((availableInventory[newFlowerId] || 0) <= 0) return;
    soundManager.playSnip();
    setPlacedStems(prev =>
      prev.map(s => (s.uid === stemUid ? { ...s, flowerId: newFlowerId } : s))
    );
  };

  // MOVE STEM LAYER (ORDERING)
  const handleMoveStemLayer = (stemUid: string, direction: 'forward' | 'backward' | 'front' | 'back') => {
    soundManager.playPaperRustle();
    setPlacedStems(prev => {
      const sorted = [...prev].sort((a, b) => a.layer - b.layer);
      const currentIndex = sorted.findIndex(s => s.uid === stemUid);
      if (currentIndex === -1) return prev;

      const item = sorted[currentIndex];
      const newSorted = [...sorted];

      if (direction === 'front') {
        newSorted.splice(currentIndex, 1);
        newSorted.push(item);
      } else if (direction === 'back') {
        newSorted.splice(currentIndex, 1);
        newSorted.unshift(item);
      } else if (direction === 'forward') {
        if (currentIndex < newSorted.length - 1) {
          const next = newSorted[currentIndex + 1];
          newSorted[currentIndex] = next;
          newSorted[currentIndex + 1] = item;
        }
      } else if (direction === 'backward') {
        if (currentIndex > 0) {
          const prevItem = newSorted[currentIndex - 1];
          newSorted[currentIndex] = prevItem;
          newSorted[currentIndex - 1] = item;
        }
      }

      return newSorted.map((stem, idx) => ({
        ...stem,
        layer: idx,
      }));
    });
  };

  // PRESET ARRANGEMENT STYLES
  const applyArrangementPreset = (preset: 'dome' | 'meadow' | 'spiral' | 'ikebana' | 'crescent') => {
    soundManager.playChime();
    if (placedStems.length === 0) return;

    setPlacedStems(prev => {
      const count = prev.length;
      return prev.map((stem, idx) => {
        if (preset === 'dome') {
          // Classic Dutch Dome: center tallest, flanking flowers stepping down
          const normalized = count > 1 ? (idx / (count - 1)) * 2 - 1 : 0;
          return {
            ...stem,
            x: Math.round(normalized * 85),
            y: Math.round(-65 + Math.abs(normalized) * 45),
            rotation: Math.round(normalized * 28),
            scale: 1 - Math.abs(normalized) * 0.12,
            layer: idx === 0 ? count : idx,
          };
        }

        if (preset === 'meadow') {
          // Wildflower Meadow: Asymmetrical organic heights and airy breezes
          const spread = count > 1 ? (idx / (count - 1)) * 180 - 90 : 0;
          const randomY = ((idx * 37) % 50) - 80;
          const randomRot = ((idx * 23) % 40) - 20;
          return {
            ...stem,
            x: Math.round(spread),
            y: Math.round(randomY),
            rotation: Math.round(randomRot),
            scale: 0.9 + ((idx % 3) * 0.1),
            layer: idx,
          };
        }

        if (preset === 'spiral') {
          // Professional Hand-tied Spiral Fan
          const angle = ((idx - count / 2) / Math.max(1, count)) * 60;
          const radius = 60 + (idx % 2) * 20;
          const rad = (angle - 90) * (Math.PI / 180);
          return {
            ...stem,
            x: Math.round(Math.cos(rad) * radius),
            y: Math.round(Math.sin(rad) * radius + 15),
            rotation: Math.round(angle * 0.75),
            scale: 1,
            layer: idx,
          };
        }

        if (preset === 'ikebana') {
          // Minimalist Ikebana Tiering (Shin, Soe, Hikae)
          const tier = idx % 3;
          let ix = 0;
          let iy = -90;
          let irot = 5;
          if (tier === 1) {
            ix = -55;
            iy = -45;
            irot = -24;
          } else if (tier === 2) {
            ix = 65;
            iy = -30;
            irot = 32;
          }
          return {
            ...stem,
            x: ix + (Math.floor(idx / 3) * 12),
            y: iy + (Math.floor(idx / 3) * 8),
            rotation: irot,
            scale: tier === 0 ? 1.15 : tier === 1 ? 0.95 : 0.85,
            layer: idx,
          };
        }

        // Crescent / Heart
        const t = count > 1 ? (idx / (count - 1)) * Math.PI : 0;
        return {
          ...stem,
          x: Math.round(-Math.cos(t) * 90),
          y: Math.round(-Math.sin(t) * 80 - 10),
          rotation: Math.round((idx - count / 2) * 16),
          scale: 1,
          layer: idx,
        };
      });
    });
  };

  // FINISH & DELIVER
  const handleFinishAndDeliver = () => {
    if (placedStems.length === 0) return;

    soundManager.playCoin();
    soundManager.playChime();

    // Trigger joyful confetti
    confetti({
      particleCount: 85,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#f472b6', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa'],
    });

    onFinishBouquet(placedStems, selectedWrap, selectedRibbon, selectedTag, activeOrder);
  };

  const selectedStem = placedStems.find(s => s.uid === selectedStemUid);

  return (
    <div className="space-y-6">
      {/* 1. WORKBENCH BRIEF & CUSTOMER ORDER STATUS */}
      {activeOrder && (
        <div className="p-4 sm:p-5 rounded-3xl bg-[#f4f1eb] border border-[#e8e2d8] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#eee6da] flex items-center justify-center font-serif text-xl font-bold text-[#6d7a6e] shrink-0 shadow-2xs">
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

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-right">
              <span className="text-xs text-[#a69d91] block">Budget Reward</span>
              <span className="font-bold text-[#4a4238] text-sm">+{activeOrder.customer.budget}🪙</span>
            </div>
            <button
              onClick={onClearOrder}
              className="text-xs text-[#a69d91] hover:text-[#4a4238] underline px-2 py-1"
            >
              Freeform Craft
            </button>
          </div>
        </div>
      )}

      {/* 2. 3-STEP CRAFTING PROGRESSION HEADER */}
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
          <span className="truncate">1. Pick Stems ({placedStems.length})</span>
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
          <span className="truncate">2. Arrange & Position</span>
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
          <span className="truncate">3. Wrap & Silk Tag</span>
        </button>
      </div>

      {/* 3. MAIN WORKBENCH GRID: CANVAS ON LEFT, CONTROLS ON RIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT 7 COLS: BOUQUET INTERACTIVE CANVAS & QUICK PRESETS */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#eee6da] shadow-xs space-y-3.5">
            {/* Header with Arrangement Presets */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#4a4238]">
                  Bouquet Crafting Table
                </h3>
                <p className="text-xs text-[#a69d91]">
                  Drag any flower on canvas to reposition • Rotate, raise, or layer in place
                </p>
              </div>

              {/* Vessel Style Toggle & Full Preview Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="px-3 py-1.5 rounded-full bg-[#f4f1eb] hover:bg-[#8ca68e]/20 text-[#4a4238] border border-[#e8e2d8] text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                  title="Inspect finished bouquet presentation before customer hand-off"
                >
                  <Eye className="w-3.5 h-3.5 text-[#6d7a6e]" />
                  <span>Preview Presentation</span>
                </button>

                <div className="flex items-center gap-1.5 p-1 bg-[#f4f1eb] rounded-full border border-[#e8e2d8]">
                  <button
                    onClick={() => setVesselStyle('hand_tied_wrap')}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                      vesselStyle === 'hand_tied_wrap'
                        ? 'bg-white text-[#4a4238] shadow-2xs'
                        : 'text-[#a69d91] hover:text-[#4a4238]'
                    }`}
                  >
                    💐 Hand-Tied Wrap
                  </button>
                  <button
                    onClick={() => setVesselStyle('vintage_vase')}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                      vesselStyle === 'vintage_vase'
                        ? 'bg-white text-[#4a4238] shadow-2xs'
                        : 'text-[#a69d91] hover:text-[#4a4238]'
                    }`}
                  >
                    🏺 Table Vase
                  </button>
                </div>
              </div>
            </div>

            {/* PRESET HARMONY ARRANGEMENTS BAR */}
            {placedStems.length > 0 && (
              <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-[#f4f1eb] border border-[#e8e2d8] overflow-x-auto">
                <span className="text-[11px] font-bold text-[#6d7a6e] shrink-0 flex items-center gap-1">
                  <Wand2 className="w-3.5 h-3.5 text-[#8ca68e]" />
                  <span>Style Presets:</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => applyArrangementPreset('dome')}
                    className="px-2.5 py-1 rounded-full bg-white hover:bg-[#8ca68e]/15 text-[#5c544b] hover:text-[#4a4238] border border-[#eee6da] text-[11px] font-semibold transition-all shadow-2xs shrink-0"
                    title="Classic Dutch Florist Dome"
                  >
                    👑 Classic Dome
                  </button>

                  <button
                    onClick={() => applyArrangementPreset('meadow')}
                    className="px-2.5 py-1 rounded-full bg-white hover:bg-[#8ca68e]/15 text-[#5c544b] hover:text-[#4a4238] border border-[#eee6da] text-[11px] font-semibold transition-all shadow-2xs shrink-0"
                    title="Asymmetric Wild European Meadow"
                  >
                    🌿 Wild Meadow
                  </button>

                  <button
                    onClick={() => applyArrangementPreset('spiral')}
                    className="px-2.5 py-1 rounded-full bg-white hover:bg-[#8ca68e]/15 text-[#5c544b] hover:text-[#4a4238] border border-[#eee6da] text-[11px] font-semibold transition-all shadow-2xs shrink-0"
                    title="Spiral Hand-tied Posy"
                  >
                    🌾 Spiral Fan
                  </button>

                  <button
                    onClick={() => applyArrangementPreset('ikebana')}
                    className="px-2.5 py-1 rounded-full bg-white hover:bg-[#8ca68e]/15 text-[#5c544b] hover:text-[#4a4238] border border-[#eee6da] text-[11px] font-semibold transition-all shadow-2xs shrink-0"
                    title="Sculptural Minimalist Ikebana"
                  >
                    📐 Ikebana
                  </button>

                  <div className="w-[1px] h-4 bg-[#e8e2d8] mx-0.5" />

                  <button
                    onClick={() => {
                      soundManager.playPaperRustle();
                      setSelectedStemUids(placedStems.map(s => s.uid));
                      setSelectedStemUid(placedStems.length > 0 ? placedStems[0].uid : null);
                    }}
                    className="px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold transition-all shadow-2xs shrink-0 flex items-center gap-1"
                    title="Select All Flowers (Ctrl+A)"
                  >
                    <span>✨ Select All</span>
                  </button>

                  <button
                    onClick={() => {
                      soundManager.playSnip();
                      setPlacedStems([]);
                      setSelectedStemUid(null);
                    }}
                    title="Clear All Stems"
                    className="p-1 rounded-full text-[#a69d91] hover:text-rose-700 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* VISUAL REALISTIC BOUQUET CANVAS */}
            <BouquetCanvas
              stems={placedStems}
              wrap={selectedWrap}
              ribbon={selectedRibbon}
              cardTag={selectedTag}
              selectedStemUid={selectedStemUid}
              selectedStemUids={selectedStemUids}
              onSelectStem={(uid) => {
                setSelectedStemUid(uid);
                setSelectedStemUids(uid ? [uid] : []);
              }}
              onSelectStems={(uids) => {
                setSelectedStemUids(uids);
                setSelectedStemUid(uids.length > 0 ? uids[0] : null);
              }}
              onUpdateStem={handleUpdateStem}
              onUpdateStems={handleUpdateStems}
              onRemoveStem={handleRemoveStem}
              onRemoveStems={handleRemoveStems}
              onDuplicateStem={handleDuplicateStem}
              onDuplicateStems={handleDuplicateStems}
              onMoveStemLayer={handleMoveStemLayer}
              interactive={true}
              vesselStyle={vesselStyle}
            />

            {/* STEM SWAP IN-PLACE DRAWER IF STEM IS SELECTED */}
            {selectedStem && (
              <div className="p-3.5 rounded-2xl bg-[#f4f1eb] border border-[#e8e2d8] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 text-[#8ca68e]" />
                    <span className="font-bold text-[#4a4238]">
                      Swap '{FLOWERS_BY_ID[selectedStem.flowerId]?.name}' in place:
                    </span>
                  </div>
                  <span className="text-[11px] text-[#a69d91]">
                    Keeps position, rotation & size
                  </span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {ALL_FLOWERS.filter(f => (availableInventory[f.id] || 0) > 0).map(f => (
                    <button
                      key={f.id}
                      onClick={() => handleSwapFlowerSpecies(selectedStem.uid, f.id)}
                      className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 shrink-0 transition-all ${
                        selectedStem.flowerId === f.id
                          ? 'bg-[#8ca68e] text-white font-bold border-[#8ca68e]'
                          : 'bg-white text-[#5c544b] border-[#eee6da] hover:border-[#8ca68e]'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
                      <span>{f.name}</span>
                      <span className="text-[10px] opacity-75">({availableInventory[f.id]})</span>
                    </button>
                  ))}
                  {ALL_FLOWERS.every(f => (availableInventory[f.id] || 0) <= 0) && (
                    <span className="text-[#a69d91] italic text-[11px]">
                      No other harvested stems in stock to swap.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT 5 COLS: STEP-BASED ACCORDION PANEL */}
        <div className="lg:col-span-5 space-y-4">
          {/* STEP 1: PICK STEMS */}
          {step === 1 && (
            <div className="p-5 rounded-3xl bg-white border border-[#eee6da] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-base font-bold text-[#4a4238]">
                    Harvested Flower Stems
                  </h4>
                  <p className="text-xs text-[#a69d91]">Click to add into the bouquet</p>
                </div>
                <span className="text-xs font-bold text-[#6d7a6e] bg-[#8ca68e]/10 px-2.5 py-0.5 rounded-full border border-[#8ca68e]/20">
                  {placedStems.length} in vase
                </span>
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

          {/* STEP 2: ARRANGE STEMS & HARMONY BREAKDOWN */}
          {step === 2 && (
            <div className="p-5 rounded-3xl bg-white border border-[#eee6da] shadow-xs space-y-4">
              <h4 className="font-serif text-base font-bold text-[#4a4238]">
                Arrangement Composition & Harmony
              </h4>

              <p className="text-xs text-[#5c544b] leading-relaxed">
                Click and drag flowers directly on the left canvas to customize their placement. Use the floating toolbar to spin, raise, scale, or flip any stem!
              </p>

              {/* Bouquet Composition Summary */}
              <div className="p-4 rounded-2xl bg-[#f4f1eb] border border-[#e8e2d8] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#a69d91] font-medium">Total Stems:</span>
                  <span className="font-bold text-[#4a4238]">{placedStems.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#a69d91] font-medium">Composition Balance:</span>
                  <span className="font-bold text-[#6d7a6e]">
                    {placedStems.length >= 5 ? '🌸 Full & Magnificent' : placedStems.length >= 3 ? '🌱 Sweet & Balanced' : '🌾 Delicate Posy'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#a69d91] font-medium">Estimated Value:</span>
                  <span className="font-bold text-[#d68060]">{finalBouquetValue} 🪙</span>
                </div>
              </div>

              {/* SELECTED STEM FINE-TUNING & RESIZE INSPECTOR */}
              {selectedStem && (
                <div className="p-4 rounded-2xl bg-[#f4f1eb] border border-[#8ca68e]/40 shadow-xs space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-[#e8e2d8]">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shadow-2xs"
                        style={{ backgroundColor: FLOWERS_BY_ID[selectedStem.flowerId]?.color || '#8ca68e' }}
                      />
                      <span className="font-serif font-bold text-sm text-[#4a4238]">
                        Customize '{FLOWERS_BY_ID[selectedStem.flowerId]?.name}' Piece
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedStemUid(null)}
                        className="px-2 py-1 rounded-lg bg-white border border-[#e8e2d8] text-[11px] font-bold text-[#5c544b] hover:bg-[#8ca68e]/10 transition-colors flex items-center gap-1 shadow-2xs"
                        title="Finish editing this flower"
                      >
                        ✕ Done
                      </button>
                      <button
                        onClick={() => handleRemoveStem(selectedStem.uid)}
                        className="p-1 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors"
                        title="Delete stem"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 1. Overall Flower Piece Scale (Unified Bloom + Stem) */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#5c544b]">Overall Piece Size:</span>
                      <span className="font-bold text-[#6d7a6e]">{Math.round((selectedStem.scale || 1.0) * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const s = Math.max(0.5, Math.round(((selectedStem.scale || 1.0) - 0.1) * 10) / 10);
                          handleUpdateStem({ ...selectedStem, scale: s });
                        }}
                        className="w-6 h-6 rounded-lg bg-white border border-[#e8e2d8] flex items-center justify-center text-xs font-bold text-[#5c544b] hover:bg-[#8ca68e]/10"
                      >
                        -
                      </button>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.05"
                        value={selectedStem.scale || 1.0}
                        onChange={(e) => handleUpdateStem({ ...selectedStem, scale: parseFloat(e.target.value) })}
                        className="w-full accent-[#8ca68e] cursor-pointer"
                      />
                      <button
                        onClick={() => {
                          const s = Math.min(2.0, Math.round(((selectedStem.scale || 1.0) + 0.1) * 10) / 10);
                          handleUpdateStem({ ...selectedStem, scale: s });
                        }}
                        className="w-6 h-6 rounded-lg bg-white border border-[#e8e2d8] flex items-center justify-center text-xs font-bold text-[#5c544b] hover:bg-[#8ca68e]/10"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* 2. Stem Length / Height Adjustment */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#5c544b]">Stem Length:</span>
                      <span className="font-bold text-[#6d7a6e]">{Math.round((selectedStem.stemLength ?? 1.0) * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const l = Math.max(0.4, Math.round(((selectedStem.stemLength ?? 1.0) - 0.1) * 10) / 10);
                          handleUpdateStem({ ...selectedStem, stemLength: l });
                        }}
                        className="w-6 h-6 rounded-lg bg-white border border-[#e8e2d8] flex items-center justify-center text-xs font-bold text-[#5c544b] hover:bg-[#8ca68e]/10"
                      >
                        -
                      </button>
                      <input
                        type="range"
                        min="0.4"
                        max="2.0"
                        step="0.05"
                        value={selectedStem.stemLength ?? 1.0}
                        onChange={(e) => handleUpdateStem({ ...selectedStem, stemLength: parseFloat(e.target.value) })}
                        className="w-full accent-[#8ca68e] cursor-pointer"
                      />
                      <button
                        onClick={() => {
                          const l = Math.min(2.0, Math.round(((selectedStem.stemLength ?? 1.0) + 0.1) * 10) / 10);
                          handleUpdateStem({ ...selectedStem, stemLength: l });
                        }}
                        className="w-6 h-6 rounded-lg bg-white border border-[#e8e2d8] flex items-center justify-center text-xs font-bold text-[#5c544b] hover:bg-[#8ca68e]/10"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* 3. Blossom Head Size Ratio */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#5c544b]">Blossom Head Size:</span>
                      <span className="font-bold text-[#6d7a6e]">{Math.round((selectedStem.flowerScale ?? 1.0) * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const b = Math.max(0.5, Math.round(((selectedStem.flowerScale ?? 1.0) - 0.1) * 10) / 10);
                          handleUpdateStem({ ...selectedStem, flowerScale: b });
                        }}
                        className="w-6 h-6 rounded-lg bg-white border border-[#e8e2d8] flex items-center justify-center text-xs font-bold text-[#5c544b] hover:bg-[#8ca68e]/10"
                      >
                        -
                      </button>
                      <input
                        type="range"
                        min="0.5"
                        max="1.8"
                        step="0.05"
                        value={selectedStem.flowerScale ?? 1.0}
                        onChange={(e) => handleUpdateStem({ ...selectedStem, flowerScale: parseFloat(e.target.value) })}
                        className="w-full accent-[#8ca68e] cursor-pointer"
                      />
                      <button
                        onClick={() => {
                          const b = Math.min(1.8, Math.round(((selectedStem.flowerScale ?? 1.0) + 0.1) * 10) / 10);
                          handleUpdateStem({ ...selectedStem, flowerScale: b });
                        }}
                        className="w-6 h-6 rounded-lg bg-white border border-[#e8e2d8] flex items-center justify-center text-xs font-bold text-[#5c544b] hover:bg-[#8ca68e]/10"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* 4. Stem Curve / Botanical Arch */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#5c544b]">Stem Arch / Bend:</span>
                      <span className="font-bold text-[#6d7a6e]">{selectedStem.stemCurve ?? 0}°</span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      step="2"
                      value={selectedStem.stemCurve ?? 0}
                      onChange={(e) => handleUpdateStem({ ...selectedStem, stemCurve: parseInt(e.target.value) })}
                      className="w-full accent-[#8ca68e] cursor-pointer"
                    />
                  </div>

                  {/* Layer Management Bar */}
                  <div className="space-y-1.5 pt-1 border-t border-[#e8e2d8]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#5c544b] flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-[#8ca68e]" />
                        <span>Layer Order:</span>
                      </span>
                      <span className="font-bold text-[#6d7a6e]">
                        Layer {(placedStems.slice().sort((a, b) => a.layer - b.layer).findIndex(s => s.uid === selectedStem.uid) + 1)} of {placedStems.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        onClick={() => handleMoveStemLayer(selectedStem.uid, 'back')}
                        title="Send to Very Back"
                        className="py-1.5 px-1 rounded-xl border bg-white border-[#e8e2d8] text-[11px] font-bold text-[#5c544b] hover:bg-stone-50 active:scale-95 transition-all text-center"
                      >
                        ⇤ Bottom
                      </button>
                      <button
                        onClick={() => handleMoveStemLayer(selectedStem.uid, 'backward')}
                        title="Send Layer Down 1 Step"
                        className="py-1.5 px-1 rounded-xl border bg-white border-[#e8e2d8] text-[11px] font-bold text-[#5c544b] hover:bg-stone-50 active:scale-95 transition-all text-center"
                      >
                        ▼ Down
                      </button>
                      <button
                        onClick={() => handleMoveStemLayer(selectedStem.uid, 'forward')}
                        title="Bring Layer Up 1 Step"
                        className="py-1.5 px-1 rounded-xl border bg-white border-[#e8e2d8] text-[11px] font-bold text-[#5c544b] hover:bg-stone-50 active:scale-95 transition-all text-center"
                      >
                        ▲ Up
                      </button>
                      <button
                        onClick={() => handleMoveStemLayer(selectedStem.uid, 'front')}
                        title="Bring to Very Front"
                        className="py-1.5 px-1 rounded-xl border bg-white border-[#e8e2d8] text-[11px] font-bold text-[#5c544b] hover:bg-stone-50 active:scale-95 transition-all text-center"
                      >
                        Top ⇥
                      </button>
                    </div>
                  </div>

                  {/* Quick Action Toggles */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#e8e2d8]">
                    <button
                      onClick={() => handleUpdateStem({ ...selectedStem, flipped: !selectedStem.flipped })}
                      className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                        selectedStem.flipped ? 'bg-[#8ca68e] text-white border-[#8ca68e]' : 'bg-white text-[#5c544b] border-[#e8e2d8] hover:bg-stone-50'
                      }`}
                    >
                      <FlipHorizontal className="w-3.5 h-3.5" />
                      <span>Flip</span>
                    </button>

                    <button
                      onClick={() => handleDuplicateStem(selectedStem)}
                      className="p-1.5 rounded-xl border bg-white border-[#e8e2d8] text-xs font-semibold text-[#5c544b] hover:bg-stone-50 flex items-center justify-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Clone</span>
                    </button>

                    <button
                      onClick={() => handleRemoveStem(selectedStem.uid)}
                      className="p-1.5 rounded-xl border bg-rose-50 text-rose-700 border-rose-200 text-xs font-semibold hover:bg-rose-100 flex items-center justify-center gap-1 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Placed Stems Quick Selector List */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#4a4238]">Flowers in Bouquet:</span>
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                  {placedStems.map((stem, idx) => {
                    const fl = FLOWERS_BY_ID[stem.flowerId];
                    const isSelected = selectedStemUid === stem.uid;

                    return (
                      <div
                        key={stem.uid}
                        onClick={() => setSelectedStemUid(stem.uid)}
                        className={`p-2 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#8ca68e]/15 border-[#8ca68e] font-bold text-[#4a4238]'
                            : 'bg-[#f4f1eb] border-[#eee6da] text-[#5c544b] hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: fl?.color }} />
                          <span className="truncate">{fl?.name}</span>
                        </div>
                        <span className="text-[10px] text-[#a69d91]">
                          Layer {stem.layer + 1} • {Math.round((stem.scale || 1) * 100)}%
                        </span>
                      </div>
                    );
                  })}
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
                Wrapping, Silk Ribbon & Handwritten Tag
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
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#4a4238]">
                    3. Attach Gift Tag & Message:
                  </label>
                  {selectedTag && (
                    <span className="text-[10px] text-[#78716c] font-medium">
                      {selectedTag.note.length}/55 chars
                    </span>
                  )}
                </div>

                {/* Preset Tag Choices */}
                <div className="grid grid-cols-1 gap-1.5">
                  {CARD_TAGS.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => {
                        soundManager.playPaperRustle();
                        setSelectedTag(tag);
                      }}
                      className={`w-full p-2 rounded-2xl border text-left text-xs transition-all ${
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
                      <p className="text-[11px] text-[#5c544b] italic mt-0.5 truncate">
                        "{tag.note}"
                      </p>
                    </button>
                  ))}
                </div>

                {/* Custom Note Dedicated Input */}
                {selectedTag && (
                  <div className="p-3 rounded-2xl bg-[#f4f1eb] border border-[#e8e2d8] space-y-1.5">
                    <div className="flex justify-between text-[11px] text-[#5c544b] font-semibold">
                      <span>Personalize Handwritten Note:</span>
                      <span className={selectedTag.note.length >= 50 ? 'text-amber-700 font-bold' : 'text-[#78716c]'}>
                        {55 - selectedTag.note.length} left
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={55}
                      value={selectedTag.note}
                      onChange={(e) => {
                        setSelectedTag({
                          ...selectedTag,
                          note: e.target.value,
                        });
                      }}
                      placeholder="Write your custom heartfelt dedication..."
                      className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#e8e2d8] focus:border-[#8ca68e] focus:ring-1 focus:ring-[#8ca68e]/40 outline-none text-[#4a4238] font-serif italic"
                    />
                  </div>
                )}
              </div>

              {/* FINISH AND DELIVER BUTTON */}
              <div className="pt-4 border-t border-[#eee6da] space-y-2">
                <button
                  onClick={() => setIsPreviewModalOpen(true)}
                  type="button"
                  className="w-full py-2.5 px-4 rounded-full bg-[#f4f1eb] hover:bg-[#e8e2d8] text-[#4a4238] font-bold text-xs border border-[#e8e2d8] transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4 text-[#6d7a6e]" />
                  <span>Inspect Finished Arrangement Before Hand-off</span>
                </button>

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

      {/* 4. HIGH-FIDELITY BOUQUET HAND-OFF PRESENTATION MODAL */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#fcfaf7] rounded-3xl max-w-2xl w-full border border-[#eee6da] shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-white border-b border-[#eee6da] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#8ca68e]/15 text-[#6d7a6e]">
                  <Gift className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#4a4238]">
                    Bouquet Presentation & Quality Inspection
                  </h3>
                  <p className="text-xs text-[#a69d91]">
                    Customer view before official delivery & wrapping
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f4f1eb] hover:bg-[#e8e2d8] text-[#5c544b] flex items-center justify-center text-sm font-bold transition-all"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-5 overflow-y-auto space-y-5">
              {/* Grand Showcase Bouquet Canvas */}
              <div className="rounded-2xl border border-[#e8e2d8] shadow-inner overflow-hidden bg-[#f8f5ef]">
                <BouquetCanvas
                  stems={placedStems}
                  wrap={selectedWrap}
                  ribbon={selectedRibbon}
                  cardTag={selectedTag}
                  interactive={false}
                  vesselStyle={vesselStyle}
                />
              </div>

              {/* Order Context & Customer Note */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Left Card: Customer & Dedication */}
                <div className="p-4 rounded-2xl bg-white border border-[#eee6da] space-y-2">
                  <span className="text-xs font-bold text-[#6d7a6e] flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-[#d68060]" />
                    <span>Recipient Story</span>
                  </span>
                  {activeOrder ? (
                    <div>
                      <p className="font-serif text-sm font-bold text-[#4a4238]">
                        For {activeOrder.customer.name} ({activeOrder.customer.title})
                      </p>
                      <p className="text-xs text-[#78716c] italic mt-1">
                        "{activeOrder.customer.story}"
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-[#78716c] italic">
                      Artisan Masterpiece — Crafted for our boutique conservatory showroom.
                    </p>
                  )}
                </div>

                {/* Right Card: Attached Note & Ribbon Details */}
                <div className="p-4 rounded-2xl bg-white border border-[#eee6da] space-y-2">
                  <span className="text-xs font-bold text-[#6d7a6e] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#8ca68e]" />
                    <span>Attached Gift Message</span>
                  </span>
                  {selectedTag ? (
                    <div>
                      <p className="text-xs font-bold text-[#4a4238]">
                        {selectedTag.icon} {selectedTag.title}
                      </p>
                      <p className="text-xs text-[#574c43] font-serif italic mt-0.5">
                        "{selectedTag.note}"
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-[#a69d91] italic">No message tag attached</p>
                  )}
                </div>
              </div>

              {/* Botanical Layers & Adobe Fresco Layer Customization Guide */}
              <div className="p-4 rounded-2xl bg-[#8ca68e]/10 border border-[#8ca68e]/25 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#4a4238] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#6d7a6e]" />
                    <span>Adobe Fresco / Illustrator Layer Compatibility</span>
                  </span>
                  <span className="text-[11px] font-bold text-[#6d7a6e] bg-white px-2.5 py-0.5 rounded-full border border-[#8ca68e]/30">
                    {placedStems.length} Active Layer Pieces
                  </span>
                </div>
                <p className="text-xs text-[#5c544b] leading-relaxed">
                  Every botanical element (blossom head, calyx, stem stalk, foliage leaves) and vessel (ceramic glaze, wrap, silk ribbon) is organized as distinct vector layers. Custom Adobe Fresco layers can be plugged in directly with independent stem scaling, bloom sizing, curvature, and z-ordering.
                </p>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-white border-t border-[#eee6da] flex items-center justify-between">
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-2 rounded-full border border-[#e8e2d8] text-xs font-semibold text-[#5c544b] hover:bg-[#f4f1eb]"
              >
                Back to Workbench
              </button>

              <button
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  handleFinishAndDeliver();
                }}
                className="px-6 py-2.5 rounded-full bg-[#8ca68e] hover:bg-[#7b947d] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                <Gift className="w-4 h-4" />
                <span>Deliver Bouquet (+{finalBouquetValue}🪙)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
