import React, { useState } from 'react';
import { GameState, GardenPlot, FlowerSpecies } from '../types';
import { ALL_FLOWERS, FLOWERS_BY_ID, getFlowersForSeason } from '../data/flowers';
import { GardenPlantStageSvg, FlowerStemSvg } from './FlowerIllustrations';
import { soundManager } from '../audio/soundManager';
import { CoinIcon, BloomTokenIcon } from './CurrencyIcon';
import { 
  Sprout, 
  Droplet, 
  Sparkles, 
  Scissors, 
  ShoppingBag, 
  Sun, 
  Check, 
  Plus, 
  Clock,
  Waves,
  Heart,
  Package,
  Layers,
  Info,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BotanicalGardenProps {
  gameState: GameState;
  onPlantSeed: (plotId: number, flowerId: string) => void;
  onWaterPlot: (plotId: number) => void;
  onWaterAllPlots: () => void;
  onFertilizePlot: (plotId: number) => void;
  onHarvestPlot: (plotId: number) => void;
  onBuySeeds: (flowerId: string, count: number) => void;
}

export const BotanicalGarden: React.FC<BotanicalGardenProps> = ({
  gameState,
  onPlantSeed,
  onWaterPlot,
  onWaterAllPlots,
  onFertilizePlot,
  onHarvestPlot,
  onBuySeeds,
}) => {
  const [selectedPlotId, setSelectedPlotId] = useState<number | null>(0);
  const [inspectingFlowerId, setInspectingFlowerId] = useState<string | null>(null);
  const [seedFilter, setSeedFilter] = useState<'all' | 'in_stock' | 'needed' | 'season'>('all');
  const [targetPlotForPlanting, setTargetPlotForPlanting] = useState<number | null>(null);

  const selectedPlot = gameState.gardenPlots.find(p => p.id === selectedPlotId);
  const inspectingFlower = inspectingFlowerId ? FLOWERS_BY_ID[inspectingFlowerId] : null;

  // Active customer orders requiring or preferring flowers
  const activeOrders = (gameState.currentOrders || []).filter(
    o => o.status === 'waiting' || o.status === 'in_progress'
  );

  const getOrdersDemandingFlower = (flowerId: string) => {
    return activeOrders.filter(o => o.customer.preferredFlowers?.includes(flowerId));
  };

  const handleWaterClick = (plotId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundManager.playWatering();
    onWaterPlot(plotId);
  };

  const handleFertilizeClick = (plotId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundManager.playChime();
    onFertilizePlot(plotId);
  };

  const handleHarvestClick = (plotId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundManager.playSnip();
    onHarvestPlot(plotId);

    confetti({
      particleCount: 25,
      spread: 50,
      colors: ['#4ade80', '#fbbf24', '#f472b6', '#8ca68e'],
    });
  };

  // Find next empty plot if any
  const firstEmptyPlot = gameState.gardenPlots.find(p => !p.flowerId);

  // Filtered seed list based on selected filter tab
  const filteredFlowers = ALL_FLOWERS.filter(fl => {
    if (seedFilter === 'season') {
      return fl.season === gameState.season || fl.season === 'All Year';
    }
    if (seedFilter === 'in_stock') {
      const stock = gameState.inventory[fl.id] || 0;
      const seeds = gameState.seedInventory[fl.id] || 0;
      return stock > 0 || seeds > 0;
    }
    if (seedFilter === 'needed') {
      return getOrdersDemandingFlower(fl.id).length > 0;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* GREENHOUSE CLIMATE & NURSERY BANNER */}
      <div className="p-6 rounded-3xl bg-[#f4f1eb] border border-[#e8e2d8] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3.5 py-1 rounded-full bg-[#8ca68e]/15 text-[#6d7a6e] font-serif text-xs font-bold border border-[#8ca68e]/25">
              🌿 Botanical Greenhouse & Nursery
            </span>
            <span className="text-xs text-[#a69d91] font-medium">
              Current Season: <strong className="text-[#4a4238]">{gameState.season}</strong>
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#4a4238]">
            Botanical Garden Sanctuary
          </h2>
          <p className="text-xs text-[#5c544b] max-w-xl">
            Select seeds to inspect botanical heritage, check harvest stock & order requests, then plant and nurture with well water and organic compost.
          </p>
        </div>

        {/* Global Greenhouse Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              soundManager.playWatering();
              onWaterAllPlots();
            }}
            id="water-all-plots-btn"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#8ca68e] text-white hover:bg-[#7b947d] font-semibold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Droplet className="w-3.5 h-3.5 fill-current" />
            <span>Water All Plots</span>
          </button>
        </div>
      </div>

      {/* TWO COLUMN VIEW: SOIL PLOTS GRID & SEED SELECTION / CARE STATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT 7 COLS: INTERACTIVE GARDEN PLOTS */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-3xl bg-white border border-[#eee6da] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#4a4238]">
                  Soil Plots ({gameState.gardenPlots.length})
                </h3>
                <p className="text-xs text-[#a69d91]">
                  Click any plot to focus care, water, or harvest
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#6d7a6e] bg-[#8ca68e]/10 px-2.5 py-1 rounded-full border border-[#8ca68e]/20 font-bold">
                  {gameState.gardenPlots.filter(p => p.stage === 'ready_to_harvest').length} Ready
                </span>
              </div>
            </div>

            {/* Garden Plots Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {gameState.gardenPlots.map((plot) => {
                const flower = plot.flowerId ? FLOWERS_BY_ID[plot.flowerId] : null;
                const isSelected = selectedPlotId === plot.id;
                const isReady = plot.stage === 'ready_to_harvest';

                return (
                  <div
                    key={plot.id}
                    id={`garden-plot-${plot.id}`}
                    onClick={() => {
                      soundManager.playPaperRustle();
                      setSelectedPlotId(plot.id);
                    }}
                    className={`relative p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-between min-h-[185px] ${
                      isSelected
                        ? 'bg-white border-[#8ca68e] ring-2 ring-[#8ca68e]/30 shadow-md'
                        : isReady
                        ? 'bg-[#8ca68e]/10 border-[#8ca68e]/40 hover:border-[#8ca68e] shadow-xs'
                        : 'bg-[#f4f1eb] border-[#e8e2d8] hover:bg-white hover:border-[#8ca68e]/40'
                    }`}
                  >
                    {/* Plot Header Badge */}
                    <div className="w-full flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#4a4238] flex items-center gap-1">
                        Plot #{plot.id + 1}
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8ca68e]" />
                        )}
                      </span>
                      {plot.flowerId ? (
                        plot.isWatered ? (
                          <span className="text-[10px] text-[#6d7a6e] bg-[#8ca68e]/15 px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5 border border-[#8ca68e]/25">
                            <Droplet className="w-2.5 h-2.5 fill-[#6d7a6e]" /> Moist
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#d68060] bg-[#d68060]/10 px-2 py-0.5 rounded-full font-medium border border-[#d68060]/20 flex items-center gap-0.5 animate-pulse">
                            Dry Soil
                          </span>
                        )
                      ) : (
                        <span className="text-[10px] text-[#a69d91] bg-stone-100 px-2 py-0.5 rounded-full">
                          Empty
                        </span>
                      )}
                    </div>

                    {/* Plant Stage Graphic */}
                    <div className="w-24 h-24 my-1 flex items-center justify-center">
                      <GardenPlantStageSvg
                        flower={flower}
                        stage={plot.stage}
                        quality={plot.quality}
                        isWatered={plot.isWatered}
                      />
                    </div>

                    {/* Plant Status & Quick Button */}
                    <div className="w-full text-center mt-1">
                      {flower ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-center gap-1">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: flower.color }}
                            />
                            <span className="text-xs font-bold text-[#4a4238] truncate max-w-[110px]">
                              {flower.name}
                            </span>
                          </div>

                          {/* Progress Bar */}
                          {plot.stage !== 'ready_to_harvest' && (
                            <div className="w-full bg-[#eee6da] h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-[#8ca68e] h-full rounded-full transition-all duration-300"
                                style={{ width: `${plot.growthProgress}%` }}
                              />
                            </div>
                          )}

                          {isReady ? (
                            <button
                              onClick={(e) => handleHarvestClick(plot.id, e)}
                              className="w-full py-1.5 rounded-full bg-[#8ca68e] hover:bg-[#7b947d] text-white text-xs font-bold shadow-xs active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Scissors className="w-3 h-3" />
                              <span>Harvest Bloom</span>
                            </button>
                          ) : (
                            <div className="flex items-center justify-between text-[10px] text-[#78716c] px-1">
                              <span className="capitalize font-medium">{plot.stage}</span>
                              <span className="font-bold">{Math.round(plot.growthProgress)}%</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-1">
                          <span className="text-[11px] text-[#8ca68e] font-semibold flex items-center justify-center gap-1">
                            <Plus className="w-3 h-3" /> Ready to Sow
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTIVE PLOT CARE STATION (If a plot is selected) */}
          {selectedPlot && (
            <div className="p-5 rounded-3xl bg-white border border-[#eee6da] shadow-xs space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#8ca68e]" />
                  <h4 className="font-serif text-base font-bold text-[#4a4238]">
                    Plot #{selectedPlot.id + 1} Care Station
                  </h4>
                </div>
                <span className="text-xs text-[#a69d91]">
                  {selectedPlot.flowerId ? 'Actively Growing' : 'Empty Soil Bed'}
                </span>
              </div>

              {selectedPlot.flowerId ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#f4f1eb] border border-[#e8e2d8]">
                    <FlowerStemSvg flower={FLOWERS_BY_ID[selectedPlot.flowerId]} size={48} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-sm text-[#4a4238] truncate">
                          {FLOWERS_BY_ID[selectedPlot.flowerId]?.name}
                        </h5>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8ca68e]/15 text-[#6d7a6e] font-bold border border-[#8ca68e]/25">
                          {selectedPlot.stage.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5c544b] italic truncate">
                        "{FLOWERS_BY_ID[selectedPlot.flowerId]?.languageOfFlowers}"
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-[#78716c]">
                        <span>Soil: {selectedPlot.isWatered ? '💧 Hydrated' : '🍂 Needs Water'}</span>
                        <span>Quality: <strong className="text-[#4a4238]">{selectedPlot.quality}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Care Actions: Water & Fertilize & Harvest */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={(e) => handleWaterClick(selectedPlot.id, e)}
                      disabled={selectedPlot.isWatered}
                      className={`py-2 px-3 rounded-full border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        selectedPlot.isWatered
                          ? 'bg-stone-100 text-[#a69d91] border-stone-200 cursor-default'
                          : 'bg-[#f4f1eb] border-[#e8e2d8] hover:bg-white text-[#5c544b] hover:border-[#8ca68e]'
                      }`}
                    >
                      <Droplet className={`w-3.5 h-3.5 ${selectedPlot.isWatered ? 'text-[#a69d91]' : 'text-[#8ca68e] fill-current'}`} />
                      <span>{selectedPlot.isWatered ? 'Hydrated' : 'Water Plot'}</span>
                    </button>

                    <button
                      onClick={(e) => handleFertilizeClick(selectedPlot.id, e)}
                      disabled={selectedPlot.fertilized || gameState.bloomTokens < 5}
                      className={`py-2 px-3 rounded-full border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        selectedPlot.fertilized
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-[#f4f1eb] border-[#e8e2d8] hover:bg-white text-[#5c544b] hover:border-[#d68060]'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#d68060]" />
                      <span>{selectedPlot.fertilized ? '✨ Fertilized' : 'Fertilize (5🌿)'}</span>
                    </button>
                  </div>

                  {selectedPlot.stage === 'ready_to_harvest' && (
                    <button
                      onClick={(e) => handleHarvestClick(selectedPlot.id, e)}
                      className="w-full py-2.5 rounded-full bg-[#8ca68e] hover:bg-[#7b947d] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Scissors className="w-4 h-4" />
                      <span>Harvest Fresh Stem to Stock</span>
                    </button>
                  )}
                </div>
              ) : (
                /* Empty Plot guidance */
                <div className="p-3.5 rounded-2xl bg-[#f4f1eb] border border-[#e8e2d8] flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-[#5c544b]">
                    <Sprout className="w-4 h-4 text-[#8ca68e]" />
                    <span>Select a seed from the catalog on the right to inspect and plant in Plot #{selectedPlot.id + 1}.</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT 5 COLS: SEED CATALOG WITH VISUAL PHOTOS, STOCK COUNTS & ORDER DEMANDS */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-3xl bg-white border border-[#eee6da] shadow-xs space-y-4">
            {/* Header with Search & Filter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-base font-bold text-[#4a4238] flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#8ca68e]" />
                    <span>Seed Nursery & Flower Catalog</span>
                  </h4>
                  <p className="text-xs text-[#a69d91]">
                    Click any flower to view details & plant
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4f1eb] border border-[#e8e2d8] text-xs font-bold text-[#4a4238]">
                  <CoinIcon size={14} />
                  <span>{gameState.coins}</span>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setSeedFilter('all')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    seedFilter === 'all'
                      ? 'bg-[#8ca68e] text-white'
                      : 'bg-[#f4f1eb] text-[#5c544b] hover:bg-[#eee6da]'
                  }`}
                >
                  All ({ALL_FLOWERS.length})
                </button>
                <button
                  onClick={() => setSeedFilter('needed')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                    seedFilter === 'needed'
                      ? 'bg-[#d68060] text-white'
                      : 'bg-[#f4f1eb] text-[#5c544b] hover:bg-[#eee6da]'
                  }`}
                >
                  <Heart className="w-3 h-3" />
                  <span>Needed for Orders</span>
                </button>
                <button
                  onClick={() => setSeedFilter('in_stock')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                    seedFilter === 'in_stock'
                      ? 'bg-[#8ca68e] text-white'
                      : 'bg-[#f4f1eb] text-[#5c544b] hover:bg-[#eee6da]'
                  }`}
                >
                  <Package className="w-3 h-3" />
                  <span>In Stock</span>
                </button>
                <button
                  onClick={() => setSeedFilter('season')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                    seedFilter === 'season'
                      ? 'bg-[#8ca68e] text-white'
                      : 'bg-[#f4f1eb] text-[#5c544b] hover:bg-[#eee6da]'
                  }`}
                >
                  <Sun className="w-3 h-3" />
                  <span>{gameState.season}</span>
                </button>
              </div>
            </div>

            {/* SEED CATALOG LIST WITH REAL PHOTOS / VISUAL ILLUSTRATIONS */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {filteredFlowers.map((fl) => {
                const seedCount = gameState.seedInventory[fl.id] || 0;
                const stockCount = gameState.inventory[fl.id] || 0;
                const demandingOrders = getOrdersDemandingFlower(fl.id);
                const isSelectedForInspect = inspectingFlowerId === fl.id;

                return (
                  <div
                    key={fl.id}
                    id={`seed-item-${fl.id}`}
                    onClick={() => {
                      soundManager.playPaperRustle();
                      setInspectingFlowerId(fl.id);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelectedForInspect
                        ? 'bg-white border-[#8ca68e] ring-2 ring-[#8ca68e]/30 shadow-xs'
                        : 'bg-[#f4f1eb]/70 border-[#e8e2d8] hover:bg-white hover:border-[#8ca68e]/50'
                    }`}
                  >
                    {/* Visual Flower Icon / Illustration & Details */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Visual Photo / Illustration container */}
                      <div className="w-12 h-12 rounded-xl bg-white border border-[#eee6da] shadow-2xs flex items-center justify-center shrink-0 p-1">
                        <FlowerStemSvg flower={fl} size={38} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-[#4a4238] truncate">
                            {fl.name}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#eee6da] text-[#5c544b] font-medium">
                            {fl.season}
                          </span>

                          {/* Customer Order Demand Badge */}
                          {demandingOrders.length > 0 && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#d68060] text-white font-bold flex items-center gap-1 shadow-2xs">
                              <Heart className="w-2.5 h-2.5 fill-current" />
                              <span>Needed ({demandingOrders.length})</span>
                            </span>
                          )}
                        </div>

                        {/* Stock & Seed Inventory Counts in List */}
                        <div className="flex items-center gap-3 mt-1 text-[11px]">
                          <span className="text-[#5c544b] flex items-center gap-1">
                            <Package className="w-3 h-3 text-[#8ca68e]" />
                            <span>In Stock: <strong className="text-[#4a4238]">{stockCount}</strong></span>
                          </span>

                          <span className="text-[#5c544b] flex items-center gap-1">
                            <Sprout className="w-3 h-3 text-[#8ca68e]" />
                            <span>Seeds: <strong className={seedCount > 0 ? 'text-[#6d7a6e]' : 'text-[#a69d91]'}>{seedCount}</strong></span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right action button */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] text-[#a69d91] block">Cost</span>
                        <span className="text-xs font-bold text-[#4a4238] flex items-center gap-0.5 justify-end">
                          <CoinIcon size={12} /> {fl.seedCost}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#a69d91]" />
                    </div>
                  </div>
                );
              })}

              {filteredFlowers.length === 0 && (
                <div className="text-center p-6 text-[#a69d91] text-xs">
                  No flowers match the selected filter.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FLOWER DETAIL & PLANTING INSPECTION MODAL / DRAWER */}
      {inspectingFlower && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setInspectingFlowerId(null)}
        >
          <div
            className="bg-white rounded-3xl border border-[#e8e2d8] shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-150 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#f4f1eb] border border-[#e8e2d8] flex items-center justify-center p-1 shadow-2xs">
                  <FlowerStemSvg flower={inspectingFlower} size={48} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: inspectingFlower.color }}
                    />
                    <h3 className="font-serif text-xl font-bold text-[#4a4238]">
                      {inspectingFlower.name}
                    </h3>
                  </div>
                  <p className="text-xs text-[#a69d91] italic font-serif">
                    {inspectingFlower.scientificName} • {inspectingFlower.category}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectingFlowerId(null)}
                className="w-8 h-8 rounded-full bg-[#f4f1eb] hover:bg-[#eee6da] text-[#5c544b] flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Language of Flowers Meaning */}
            <div className="p-3.5 rounded-2xl bg-[#8ca68e]/10 border border-[#8ca68e]/20 space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#6d7a6e] block">
                🌸 Language of Flowers Meaning
              </span>
              <p className="text-xs font-serif italic text-[#4a4238]">
                "{inspectingFlower.languageOfFlowers}"
              </p>
            </div>

            {/* Botanical Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-[#f4f1eb] border border-[#eee6da]">
                <span className="text-[10px] text-[#a69d91] block">Season</span>
                <span className="font-bold text-[#4a4238] flex items-center gap-1 mt-0.5">
                  <Sun className="w-3 h-3 text-[#d68060]" />
                  <span>{inspectingFlower.season}</span>
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#f4f1eb] border border-[#eee6da]">
                <span className="text-[10px] text-[#a69d91] block">Growth Time</span>
                <span className="font-bold text-[#4a4238] flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-[#8ca68e]" />
                  <span>~{inspectingFlower.growthTimeSeconds}s</span>
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#f4f1eb] border border-[#eee6da]">
                <span className="text-[10px] text-[#a69d91] block">Harvest Value</span>
                <span className="font-bold text-[#4a4238] flex items-center gap-1 mt-0.5">
                  <CoinIcon size={12} />
                  <span>{inspectingFlower.stemSellValue}🪙</span>
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#f4f1eb] border border-[#eee6da]">
                <span className="text-[10px] text-[#a69d91] block">Scent Profile</span>
                <span className="font-bold text-[#4a4238] text-[11px] mt-0.5 block truncate">
                  {inspectingFlower.scentProfile}
                </span>
              </div>
            </div>

            {/* Live Inventory & Active Orders Status */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-[#e8e2d8] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#4a4238]">Current Stock & Inventory</span>
                <span className="text-[11px] text-[#a69d91]">Your Greenhouse Bag</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#eee6da]">
                  <span className="text-[#5c544b] flex items-center gap-1.5">
                    <Sprout className="w-3.5 h-3.5 text-[#8ca68e]" />
                    <span>Seeds in Bag:</span>
                  </span>
                  <strong className="text-sm text-[#4a4238]">
                    {gameState.seedInventory[inspectingFlower.id] || 0}
                  </strong>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#eee6da]">
                  <span className="text-[#5c544b] flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-[#8ca68e]" />
                    <span>Harvested Stems:</span>
                  </span>
                  <strong className="text-sm text-[#4a4238]">
                    {gameState.inventory[inspectingFlower.id] || 0}
                  </strong>
                </div>
              </div>

              {/* Active Orders Demanding This Flower */}
              {getOrdersDemandingFlower(inspectingFlower.id).length > 0 ? (
                <div className="p-2.5 rounded-xl bg-[#d68060]/10 border border-[#d68060]/20 flex items-center gap-2 text-xs text-[#d68060] font-medium">
                  <Heart className="w-3.5 h-3.5 fill-current shrink-0" />
                  <span>
                    Requested by <strong>{getOrdersDemandingFlower(inspectingFlower.id).length} active customer order(s)</strong>!
                  </span>
                </div>
              ) : (
                <p className="text-[11px] text-[#a69d91]">
                  Description: {inspectingFlower.description}
                </p>
              )}
            </div>

            {/* Target Plot Selection & Explicit Actions */}
            <div className="space-y-3 pt-1 border-t border-[#eee6da]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#4a4238]">Select Target Soil Plot:</span>
                <span className="text-[#a69d91] text-[11px]">
                  Plot #{((targetPlotForPlanting !== null ? targetPlotForPlanting : selectedPlotId ?? firstEmptyPlot?.id ?? 0) + 1)} chosen
                </span>
              </div>

              {/* Plot Selector Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {gameState.gardenPlots.map((plot) => {
                  const currentPlotChosen = (targetPlotForPlanting !== null ? targetPlotForPlanting : selectedPlotId) === plot.id;
                  const isOccupied = !!plot.flowerId;

                  return (
                    <button
                      key={plot.id}
                      onClick={() => setTargetPlotForPlanting(plot.id)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                        currentPlotChosen
                          ? 'bg-[#8ca68e] text-white border-[#8ca68e] shadow-xs'
                          : isOccupied
                          ? 'bg-stone-100 text-[#a69d91] border-[#eee6da]'
                          : 'bg-[#f4f1eb] text-[#5c544b] border-[#e8e2d8] hover:border-[#8ca68e]'
                      }`}
                    >
                      <span>Plot #{plot.id + 1}</span>
                      {isOccupied ? (
                        <span className="text-[9px] opacity-80">(Growing)</span>
                      ) : (
                        <span className="text-[9px] text-emerald-800 font-bold">● Empty</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons: Buy Seed Packet & Plant Seed Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {/* Quick Buy Seeds */}
                <button
                  disabled={gameState.coins < inspectingFlower.seedCost}
                  onClick={() => {
                    soundManager.playCoin();
                    onBuySeeds(inspectingFlower.id, 1);
                  }}
                  className="py-3 px-4 rounded-full bg-[#f4f1eb] hover:bg-[#eee6da] disabled:opacity-40 text-[#4a4238] font-bold text-xs flex items-center justify-center gap-1.5 border border-[#e8e2d8] cursor-pointer"
                >
                  <CoinIcon size={14} />
                  <span>Buy 1 Seed ({inspectingFlower.seedCost}🪙)</span>
                </button>

                {/* Explicit Plant Seed Button */}
                <button
                  disabled={(gameState.seedInventory[inspectingFlower.id] || 0) <= 0}
                  onClick={() => {
                    const plotToPlant = targetPlotForPlanting !== null ? targetPlotForPlanting : selectedPlotId ?? firstEmptyPlot?.id ?? 0;
                    soundManager.playPaperRustle();
                    onPlantSeed(plotToPlant, inspectingFlower.id);
                    setSelectedPlotId(plotToPlant);
                    setInspectingFlowerId(null);
                  }}
                  className="py-3 px-4 rounded-full bg-[#8ca68e] hover:bg-[#7b947d] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
                >
                  <Sprout className="w-4 h-4" />
                  <span>
                    {(gameState.seedInventory[inspectingFlower.id] || 0) > 0
                      ? `Sow Seed in Plot #${((targetPlotForPlanting !== null ? targetPlotForPlanting : selectedPlotId ?? firstEmptyPlot?.id ?? 0) + 1)}`
                      : 'No Seeds in Bag'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
