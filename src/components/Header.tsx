import React from 'react';
import { GameState, Season, TimeOfDay, Weather } from '../types';
import { 
  Volume2, 
  VolumeX, 
  CloudRain, 
  Sun, 
  Sunrise, 
  Sunset, 
  Moon, 
  BookOpen, 
  ShoppingBag, 
  Flower2, 
  Sparkles, 
  Store, 
  Sprout, 
  Music,
  Heart,
  Coins,
  Settings
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface HeaderProps {
  gameState: GameState;
  activeTab: 'shop' | 'studio' | 'garden' | 'grimoire' | 'upgrades';
  setActiveTab: (tab: 'shop' | 'studio' | 'garden' | 'grimoire' | 'upgrades') => void;
  onToggleAudio: () => void;
  onAdvanceDay: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  gameState,
  activeTab,
  setActiveTab,
  onToggleAudio,
  onAdvanceDay,
  onOpenSettings,
}) => {
  const getSeasonEmoji = (season: Season) => {
    switch (season) {
      case 'Spring': return '🌸';
      case 'Summer': return '🌻';
      case 'Autumn': return '🍁';
      case 'Winter': return '❄️';
    }
  };

  const getTimeIcon = (time: TimeOfDay) => {
    switch (time) {
      case 'Morning': return <Sunrise className="w-3.5 h-3.5 text-[#d68060]" />;
      case 'Afternoon': return <Sun className="w-3.5 h-3.5 text-[#d68060]" />;
      case 'Evening': return <Sunset className="w-3.5 h-3.5 text-[#8ca68e]" />;
      case 'Rainy Night': return <CloudRain className="w-3.5 h-3.5 text-[#6d7a6e]" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#fcfaf7]/95 backdrop-blur-md border-b border-[#eee6da] px-3 py-2.5 sm:px-6 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Logo & Day / Season Track */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8ca68e]/15 border border-[#8ca68e]/30 flex items-center justify-center text-[#6d7a6e] shadow-xs">
              <Flower2 className="w-5 h-5 text-[#8ca68e]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#4a4238]">
                  Bloom & Thread
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#8ca68e]/15 text-[#6d7a6e] border border-[#8ca68e]/25">
                  Natural Florist
                </span>
              </div>
              <p className="text-xs text-[#a69d91] italic hidden sm:block">
                "Where feelings bloom into living botanicals"
              </p>
            </div>
          </div>

          {/* Quick Audio & Settings Toggle on Mobile */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={onToggleAudio}
              className={`p-2 rounded-full border transition-colors ${
                gameState.bgmPlaying
                  ? 'bg-[#8ca68e] text-white border-[#7b947d]'
                  : 'bg-white text-[#5c544b] border-[#eee6da]'
              }`}
              title="Toggle Lo-Fi Music"
            >
              {gameState.bgmPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-full bg-white border border-[#eee6da] text-[#5c544b] hover:bg-[#f4f1eb]"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Currencies & Season Clock in Natural Pill Container */}
        <div className="flex flex-wrap items-center justify-between sm:justify-center gap-1.5 sm:gap-2.5 bg-[#f4f1eb] px-3 py-1.5 rounded-full border border-[#e8e2d8]">
          {/* Day & Season */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#eee6da] shadow-xs">
            <span className="text-sm">{getSeasonEmoji(gameState.season)}</span>
            <span className="text-xs font-semibold text-[#4a4238]">
              Day {gameState.day}
            </span>
            <span className="text-[11px] text-[#a69d91] font-medium">
              • {gameState.season}
            </span>
          </div>

          {/* Time & Weather */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#eee6da] shadow-xs">
            {getTimeIcon(gameState.timeOfDay)}
            <span className="text-xs font-medium text-[#5c544b]">
              {gameState.timeOfDay}
            </span>
          </div>

          {/* Coins */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#eee6da] text-[#4a4238] font-semibold text-xs shadow-xs">
            <Coins className="w-3.5 h-3.5 text-[#d68060]" />
            <span>{gameState.coins}</span>
          </div>

          {/* Bloom Tokens */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#eee6da] text-[#6d7a6e] font-semibold text-xs shadow-xs">
            <Sprout className="w-3.5 h-3.5 text-[#8ca68e]" />
            <span>{gameState.bloomTokens}</span>
          </div>

          {/* Reputation Hearts */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#eee6da] text-[#d68060] font-semibold text-xs shadow-xs">
            <Heart className="w-3.5 h-3.5 text-[#d68060] fill-[#d68060]" />
            <span>{gameState.reputationHearts}</span>
          </div>

          {/* Advance to Next Day Button */}
          <button
            onClick={() => {
              soundManager.playChime();
              onAdvanceDay();
            }}
            id="advance-day-btn"
            className="flex items-center gap-1.5 px-3.5 py-1 text-xs font-medium rounded-full bg-[#4a4238] text-[#fcfaf7] hover:bg-[#383129] active:scale-95 transition-all shadow-xs"
            title="End current day and rest overnight"
          >
            <Moon className="w-3.5 h-3.5 text-[#d68060]" />
            <span className="hidden sm:inline">Rest &</span> End Day
          </button>
        </div>

        {/* Right Desktop Controls & Settings */}
        <div className="hidden md:flex items-center gap-2">
          {/* Lo-Fi Music Player Bar */}
          <button
            onClick={onToggleAudio}
            id="header-music-toggle"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all ${
              gameState.bgmPlaying
                ? 'bg-[#8ca68e] text-white border-[#7b947d] shadow-xs'
                : 'bg-white text-[#5c544b] border-[#eee6da] hover:bg-[#f4f1eb]'
            }`}
          >
            {gameState.bgmPlaying ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-white animate-pulse" />
                <span>Lo-Fi Music: On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#a69d91]" />
                <span>Play Cozy Music</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenSettings}
            id="header-settings-btn"
            className="p-2 rounded-full bg-white border border-[#eee6da] text-[#5c544b] hover:bg-[#f4f1eb] transition-colors shadow-xs"
            title="Sound & Game Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Game Navigation Bar - Natural Tones Floating Capsule Style */}
      <div className="max-w-7xl mx-auto mt-2 pt-1">
        <nav className="inline-flex items-center p-1 bg-[#f4f1eb] rounded-full border border-[#e8e2d8] gap-1 overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => {
              soundManager.playPaperRustle();
              setActiveTab('shop');
            }}
            id="nav-tab-shop"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'shop'
                ? 'bg-white text-[#4a4238] font-bold shadow-xs'
                : 'text-[#a69d91] hover:text-[#4a4238] hover:bg-white/40'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-[#8ca68e]" />
            <span>Shopfront</span>
            {gameState.currentOrders.filter(o => o.status === 'waiting').length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#d68060] animate-ping" />
            )}
          </button>

          <button
            onClick={() => {
              soundManager.playPaperRustle();
              setActiveTab('studio');
            }}
            id="nav-tab-studio"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'studio'
                ? 'bg-white text-[#4a4238] font-bold shadow-xs'
                : 'text-[#a69d91] hover:text-[#4a4238] hover:bg-white/40'
            }`}
          >
            <Flower2 className="w-3.5 h-3.5 text-[#8ca68e]" />
            <span>Bouquet Studio</span>
          </button>

          <button
            onClick={() => {
              soundManager.playPaperRustle();
              setActiveTab('garden');
            }}
            id="nav-tab-garden"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'garden'
                ? 'bg-white text-[#4a4238] font-bold shadow-xs'
                : 'text-[#a69d91] hover:text-[#4a4238] hover:bg-white/40'
            }`}
          >
            <Sprout className="w-3.5 h-3.5 text-[#8ca68e]" />
            <span>Greenhouse</span>
            {gameState.gardenPlots.filter(p => p.stage === 'ready_to_harvest').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#8ca68e] text-white text-[9px] font-bold">
                {gameState.gardenPlots.filter(p => p.stage === 'ready_to_harvest').length} Ready
              </span>
            )}
          </button>

          <button
            onClick={() => {
              soundManager.playPaperRustle();
              setActiveTab('grimoire');
            }}
            id="nav-tab-grimoire"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'grimoire'
                ? 'bg-white text-[#4a4238] font-bold shadow-xs'
                : 'text-[#a69d91] hover:text-[#4a4238] hover:bg-white/40'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#8ca68e]" />
            <span>Grimoire</span>
          </button>

          <button
            onClick={() => {
              soundManager.playPaperRustle();
              setActiveTab('upgrades');
            }}
            id="nav-tab-upgrades"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'upgrades'
                ? 'bg-white text-[#4a4238] font-bold shadow-xs'
                : 'text-[#a69d91] hover:text-[#4a4238] hover:bg-white/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8ca68e]" />
            <span>Upgrades</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
