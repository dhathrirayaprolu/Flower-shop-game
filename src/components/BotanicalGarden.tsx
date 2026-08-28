import React, { useState, useEffect } from 'react';
import { GameState, GardenPlot, FlowerSpecies } from '../types';
import { ALL_FLOWERS, FLOWERS_BY_ID, getFlowersForSeason } from '../data/flowers';
import { GardenPlantStageSvg, FlowerStemSvg } from './FlowerIllustrations';
import { soundManager } from '../audio/soundManager';
import { 
  Sprout, 
  Droplet, 
  Sparkles, 
  Scissors, 
  ShoppingBag, 
  Sun, 
  Check, 
  Plus, 
  Coins, 
  Clock,
  Waves
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
  const [selectedPlotId, setSelectedPlotId] = useState<number | null>(null);
  const [selectedSeedToPlant, setSelectedSeedToPlant] = useState<string | null>(null);
  const [seedFilterSeason, setSeedFilterSeason] = useState<string>('all');

  const selectedPlot = gameState.gardenPlots.find(p => p.id === selectedPlotId);
  const seasonalFlowers = getFlowersForSeason(gameState.season);

  const handleWaterClick = (plotId: number) => {
    soundManager.playWatering();
    onWaterPlot(plotId);
  };

  const handleHarvestClick = (plotId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundManager.playSnip();
    onHarvestPlot(plotId);

    confetti({
      particleCount: 20,
      spread: 45,
      colors: ['#4ade80', '#fbbf24', '#f472b6'],
    });
  };

  return (
    <div className="space-y-6">
      {/* GREENHOUSE CLIMATE & NURSERY BANNER */}
      <div className="p-6 rounded-3xl bg-[#f4f1eb] border border-[#e8e2d8] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
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
            Sow seasonal seeds, gently hydrate rich soil with fresh well water, and nurture buds into radiant blooms for your bouquet orders.
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
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#8ca68e] text-white hover:bg-[#7b947d] font-semibold text-xs transition-all shadow-xs active:scale-95"
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
              <h3 className="font-serif text-lg font-bold text-[#4a4238]">
                Greenhouse Soil Plots ({gameState.gardenPlots.length})
              </h3>
              <span className="text-xs text-[#a69d91]">
                Click any plot to plant, water, or harvest
              </span>
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
                    className={`relative p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-between min-h-[170px] ${
                      isSelected
                        ? 'bg-white border-[#8ca68e] ring-2 ring-[#8ca68e]/30 shadow-md'
                        : isReady
                        ? 'bg-[#8ca68e]/10 border-[#8ca68e]/40 hover:border-[#8ca68e] shadow-xs'
                        : 'bg-[#f4f1eb] border-[#e8e2d8] hover:bg-white hover:border-[#8ca68e]/40'
                    }`}
                  >
                    {/* Plot Header Badge */}
                    <div className="w-full flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#a69d91]">#{plot.id + 1}</span>
                      {plot.isWatered ? (
                        <span className="text-[10px] text-[#6d7a6e] bg-[#8ca68e]/15 px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5 border border-[#8ca68e]/25">
                          <Droplet className="w-2.5 h-2.5 fill-[#6d7a6e]" /> Moist
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#d68060] bg-[#d68060]/10 px-2 py-0.5 rounded-full font-medium border border-[#d68060]/20">
                          Dry
                        </span>
                      )}
                    </div>

                    {/* Plant Stage Graphic */}
                    <div className="w-24 h-24 my-1">
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
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-[#4a4238] block truncate">
                            {flower.name}
                          </span>

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
                              className="w-full py-1.5 rounded-full bg-[#8ca68e] hover:bg-[#7b947d] text-white text-xs font-bold shadow-xs active:scale-95 flex items-center justify-center gap-1"
                            >
                              <Scissors className="w-3 h-3" />
                              <span>Harvest</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-[#a69d91] font-medium">
                              {plot.stage.toUpperCase()} ({Math.round(plot.growthProgress)}%)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#a69d91] font-medium">
                          Empty Soil
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT 5 COLS: SELECTED PLOT CARE ACTIONS & SEED CATALOG */}
        <div className="lg:col-span-5 space-y-4">
          {/* Plot Inspector / Quick Care */}
          {selectedPlot && (
            <div className="p-5 rounded-3xl bg-white border border-[#eee6da] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-serif text-base font-bold text-[#4a4238]">
                  Plot #{selectedPlot.id + 1} Care Station
                </h4>
                <button
                  onClick={() => setSelectedPlotId(null)}
                  className="text-xs text-[#a69d91] hover:text-[#4a4238]"
                >
                  ✕
                </button>
              </div>

              {selectedPlot.flowerId ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#f4f1eb] border border-[#e8e2d8]">
                    <FlowerStemSvg flower={FLOWERS_BY_ID[selectedPlot.flowerId]} size={48} />
                    <div>
                      <h5 className="font-bold text-sm text-[#4a4238]">
                        {FLOWERS_BY_ID[selectedPlot.flowerId]?.name}
                      </h5>
                      <p className="text-[11px] text-[#5c544b] italic">
                        "{FLOWERS_BY_ID[selectedPlot.flowerId]?.languageOfFlowers}"
                      </p>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#8ca68e]/15 text-[#6d7a6e] border border-[#8ca68e]/25 font-semibold inline-block mt-1">
                        Stage: {selectedPlot.stage}
                      </span>
                    </div>
                  </div>

                  {/* Care Actions: Water & Fertilize & Harvest */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleWaterClick(selectedPlot.id)}
                      className="py-2 px-3 rounded-full bg-[#f4f1eb] border border-[#e8e2d8] hover:bg-white text-[#5c544b] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Droplet className="w-3.5 h-3.5 text-[#8ca68e] fill-current" />
                      <span>Water Plot</span>
                    </button>

                    <button
                      onClick={() => {
                        soundManager.playChime();
                        onFertilizePlot(selectedPlot.id);
                      }}
                      className="py-2 px-3 rounded-full bg-[#f4f1eb] border border-[#e8e2d8] hover:bg-white text-[#5c544b] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#d68060]" />
                      <span>Fertilize (5🌿)</span>
                    </button>
                  </div>

                  {selectedPlot.stage === 'ready_to_harvest' && (
                    <button
                      onClick={() => handleHarvestClick(selectedPlot.id)}
                      className="w-full py-2.5 rounded-full bg-[#8ca68e] hover:bg-[#7b947d] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <Scissors className="w-4 h-4" />
                      <span>Harvest Fresh Stems to Shop</span>
                    </button>
                  )}
                </div>
              ) : (
                /* Empty Plot: Choose Seed to Plant */
                <div className="space-y-3">
                  <p className="text-xs text-[#5c544b]">
                    This soil plot is prepared. Select a seed packet from your bag below to plant:
                  </p>

                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {ALL_FLOWERS.map(fl => {
                      const seedCount = gameState.seedInventory[fl.id] || 0;

                      return (
                        <button
                          key={fl.id}
                          disabled={seedCount <= 0}
                          onClick={() => {
                            soundManager.playPaperRustle();
                            onPlantSeed(selectedPlot.id, fl.id);
                          }}
                          className={`p-2.5 rounded-2xl border text-left text-xs transition-all flex flex-col justify-between ${
                            seedCount > 0
                              ? 'bg-[#f4f1eb] border-[#e8e2d8] hover:bg-white hover:border-[#8ca68e]/50'
                              : 'opacity-40 bg-stone-50 border-[#eee6da] cursor-not-allowed'
                          }`}
                        >
                          <span className="font-bold text-[#4a4238] truncate">
                            {fl.name}
                          </span>
                          <div className="flex items-center justify-between mt-1 text-[11px]">
                            <span className="text-[#a69d91]">Seeds:</span>
                            <span className="font-bold text-[#6d7a6e]">{seedCount}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SEASONAL SEED NURSERY STORE */}
          <div className="p-5 rounded-3xl bg-white border border-[#eee6da] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#8ca68e]" />
                <h4 className="font-serif text-base font-bold text-[#4a4238]">
                  Seed Nursery Catalog
                </h4>
              </div>
              <span className="text-xs text-[#a69d91]">
                Your Coins: <strong className="text-[#4a4238]">{gameState.coins}🪙</strong>
              </span>
            </div>

            {/* Seed List */}
            <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
              {ALL_FLOWERS.map(fl => {
                const isCurrentSeason = fl.season === gameState.season || fl.season === 'All Year';
                const canAfford = gameState.coins >= fl.seedCost;

                return (
                  <div
                    key={fl.id}
                    className="p-2.5 rounded-2xl bg-[#f4f1eb]/60 border border-[#eee6da] flex items-center justify-between gap-3 hover:bg-[#f4f1eb]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: fl.color }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-[#4a4238] truncate">
                            {fl.name}
                          </span>
                          <span className="text-[9px] px-2 py-0.2 rounded-full bg-[#eee6da] text-[#5c544b] font-medium">
                            {fl.season}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#a69d91] block truncate">
                          Grows in ~{fl.growthTimeSeconds}s • Sells for {fl.stemSellValue}🪙
                        </span>
                      </div>
                    </div>

                    <button
                      disabled={!canAfford}
                      onClick={() => {
                        soundManager.playCoin();
                        onBuySeeds(fl.id, 1);
                      }}
                      className="px-3 py-1.5 rounded-full bg-[#8ca68e] hover:bg-[#7b947d] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs active:scale-95 shrink-0 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{fl.seedCost}🪙</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
