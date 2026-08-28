import React, { useState } from 'react';
import { GameState, FlowerSpecies, Season } from '../types';
import { ALL_FLOWERS, SEASONS_LIST } from '../data/flowers';
import { FlowerStemSvg } from './FlowerIllustrations';
import { soundManager } from '../audio/soundManager';
import { BookOpen, Sparkles, Filter, Heart, Info, Feather } from 'lucide-react';

interface FlowerGrimoireProps {
  gameState: GameState;
}

export const FlowerGrimoire: React.FC<FlowerGrimoireProps> = ({ gameState }) => {
  const [selectedSeason, setSelectedSeason] = useState<string>('All');
  const [selectedFlower, setSelectedFlower] = useState<FlowerSpecies>(ALL_FLOWERS[0]);

  const filteredFlowers = ALL_FLOWERS.filter(fl => {
    if (selectedSeason === 'All') return true;
    return fl.season === selectedSeason || fl.season === 'All Year';
  });

  return (
    <div className="space-y-6">
      {/* GRIMOIRE HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-[#f4f1eb] border border-[#e8e2d8] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full bg-[#8ca68e]/15 text-[#6d7a6e] font-serif text-xs font-bold border border-[#8ca68e]/25">
              📖 The Florist's Botanical Compendium
            </span>
            <span className="text-xs text-[#a69d91] font-medium">
              Victorian Floriography & Lore
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#4a4238]">
            Flower Grimoire & Meanings
          </h2>
          <p className="text-xs text-[#5c544b] max-w-xl">
            "In every petal lies an unspoken phrase, and in every blossom a quiet memory." Explore the secret language of botanical specimens.
          </p>
        </div>

        {/* Season Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-full border border-[#eee6da] shadow-xs">
          <button
            onClick={() => {
              soundManager.playPaperRustle();
              setSelectedSeason('All');
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedSeason === 'All'
                ? 'bg-[#8ca68e] text-white shadow-xs'
                : 'text-[#a69d91] hover:text-[#4a4238]'
            }`}
          >
            All Blooms
          </button>
          {SEASONS_LIST.map(season => (
            <button
              key={season}
              onClick={() => {
                soundManager.playPaperRustle();
                setSelectedSeason(season);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedSeason === season
                  ? 'bg-[#8ca68e] text-white shadow-xs'
                  : 'text-[#a69d91] hover:text-[#4a4238]'
              }`}
            >
              {season}
            </button>
          ))}
        </div>
      </div>

      {/* TWO COLUMN VIEW: FLOWER GRID & HERBARIUM PARCHMENT DISPLAY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT 7 COLS: FLOWER ENTRY CARDS */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredFlowers.map(fl => {
            const isSelected = selectedFlower.id === fl.id;
            const isCurrentSeason = fl.season === gameState.season;

            return (
              <div
                key={fl.id}
                onClick={() => {
                  soundManager.playPaperRustle();
                  setSelectedFlower(fl);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center relative ${
                  isSelected
                    ? 'bg-white border-[#8ca68e] ring-2 ring-[#8ca68e]/30 shadow-md scale-102'
                    : 'bg-white border-[#eee6da] hover:border-[#8ca68e]/40 hover:shadow-xs'
                }`}
              >
                {isCurrentSeason && (
                  <span className="absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#8ca68e]/15 text-[#6d7a6e] border border-[#8ca68e]/25">
                    In Season
                  </span>
                )}

                <div className="my-1">
                  <FlowerStemSvg flower={fl} size={54} />
                </div>

                <span className="font-serif font-bold text-xs text-[#4a4238] mt-1 line-clamp-1">
                  {fl.name}
                </span>

                <span className="text-[10px] text-[#a69d91] italic mt-0.5 line-clamp-1">
                  "{fl.languageOfFlowers}"
                </span>

                <div className="mt-2 w-full pt-1.5 border-t border-[#eee6da] flex items-center justify-between text-[10px] text-[#5c544b]">
                  <span>{fl.category}</span>
                  <span className="font-semibold text-[#d68060]">{fl.stemSellValue}🪙</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT 5 COLS: VINTAGE BOTANICAL PARCHMENT FOLIO */}
        <div className="lg:col-span-5">
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#eee6da] shadow-xs relative overflow-hidden space-y-4">
            {/* Parchment Vintage Corner Ornament */}
            <div className="absolute top-3 right-3 text-[#eee6da] pointer-events-none">
              <Feather className="w-8 h-8" />
            </div>

            {/* Header / Botanical Title */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-widest text-[#8ca68e]">
                  {selectedFlower.category}
                </span>
                <span className="text-xs text-[#a69d91]">•</span>
                <span className="text-xs text-[#a69d91] font-medium">
                  {selectedFlower.season} Season
                </span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#4a4238] mt-0.5">
                {selectedFlower.name}
              </h3>
              <p className="text-xs text-[#8ca68e] italic font-serif">
                {selectedFlower.scientificName}
              </p>
            </div>

            {/* Visual Specimen Illustration Frame */}
            <div className="py-6 rounded-2xl bg-[#f4f1eb] border border-[#e8e2d8] flex items-center justify-center">
              <FlowerStemSvg flower={selectedFlower} size={96} />
            </div>

            {/* Victorian Meaning & Floriography */}
            <div className="p-4 rounded-2xl bg-[#f4f1eb] border border-[#e8e2d8] space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#4a4238]">
                <Heart className="w-3.5 h-3.5 fill-[#d68060] text-[#d68060]" />
                <span>Language of Flowers (Floriography):</span>
              </div>
              <p className="text-xs sm:text-sm font-serif italic text-[#4a4238] font-medium leading-relaxed">
                "{selectedFlower.languageOfFlowers}"
              </p>
            </div>

            {/* Botanical Notes & Scent */}
            <div className="space-y-2 text-xs text-[#5c544b]">
              <p className="leading-relaxed">
                {selectedFlower.description}
              </p>

              <div className="pt-2 border-t border-[#eee6da] grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-[#f4f1eb] border border-[#e8e2d8]">
                  <span className="text-[#a69d91] block">Scent Profile:</span>
                  <span className="font-bold text-[#4a4238]">{selectedFlower.scentProfile}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#f4f1eb] border border-[#e8e2d8]">
                  <span className="text-[#a69d91] block">Growth Duration:</span>
                  <span className="font-bold text-[#4a4238]">~{selectedFlower.growthTimeSeconds} seconds</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
