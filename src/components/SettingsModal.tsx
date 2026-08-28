import React from 'react';
import { GameState } from '../types';
import { soundManager } from '../audio/soundManager';
import { Volume2, Music, CloudRain, RotateCcw, X, Info } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  gameState: GameState;
  onClose: () => void;
  onUpdateAudio: (bgmVol: number, sfxVol: number, rainVol: number, track: string) => void;
  onResetGame: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  gameState,
  onClose,
  onUpdateAudio,
  onResetGame,
}) => {
  if (!isOpen) return null;

  const tracks = soundManager.getTrackNames();

  return (
    <div className="fixed inset-0 z-50 bg-[#4a4238]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#fcfaf7] rounded-3xl border border-[#eee6da] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-[#8ca68e]" />
            <h3 className="font-serif text-xl font-bold text-[#4a4238]">
              Cozy Audio & Game Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#a69d91] hover:text-[#4a4238] hover:bg-[#f4f1eb] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lo-Fi Music Track Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#4a4238] flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-[#8ca68e]" />
            <span>Lo-Fi Music Track:</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {tracks.map(track => (
              <button
                key={track}
                onClick={() => {
                  soundManager.setTrack(track);
                  onUpdateAudio(
                    gameState.bgmVolume,
                    gameState.sfxVolume,
                    gameState.ambientRainVolume,
                    track
                  );
                }}
                className={`p-2.5 rounded-2xl border text-xs font-medium transition-all text-left ${
                  gameState.selectedBgmTrack === track
                    ? 'bg-[#8ca68e]/15 border-[#8ca68e] text-[#4a4238] font-bold'
                    : 'bg-white border-[#eee6da] text-[#5c544b] hover:bg-[#f4f1eb]'
                }`}
              >
                {track}
              </button>
            ))}
          </div>
        </div>

        {/* Volume Sliders */}
        <div className="space-y-4 pt-2 border-t border-[#eee6da]">
          {/* Lo-Fi Music Volume */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#5c544b]">Lo-Fi Synthesizer Music</span>
              <span className="font-bold text-[#4a4238]">{Math.round(gameState.bgmVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={gameState.bgmVolume}
              onChange={(e) => {
                const vol = parseFloat(e.target.value);
                soundManager.setBgmVolume(vol);
                onUpdateAudio(vol, gameState.sfxVolume, gameState.ambientRainVolume, gameState.selectedBgmTrack);
              }}
              className="w-full accent-[#8ca68e] cursor-pointer"
            />
          </div>

          {/* SFX Volume */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#5c544b]">Tactile SFX (Shears, Watering, Ribbon)</span>
              <span className="font-bold text-[#4a4238]">{Math.round(gameState.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={gameState.sfxVolume}
              onChange={(e) => {
                const vol = parseFloat(e.target.value);
                soundManager.setSfxVolume(vol);
                onUpdateAudio(gameState.bgmVolume, vol, gameState.ambientRainVolume, gameState.selectedBgmTrack);
              }}
              className="w-full accent-[#8ca68e] cursor-pointer"
            />
          </div>

          {/* Ambient Rain Volume */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#5c544b]">Window Rain Ambience</span>
              <span className="font-bold text-[#4a4238]">{Math.round(gameState.ambientRainVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={gameState.ambientRainVolume}
              onChange={(e) => {
                const vol = parseFloat(e.target.value);
                soundManager.setRainVolume(vol);
                onUpdateAudio(gameState.bgmVolume, gameState.sfxVolume, vol, gameState.selectedBgmTrack);
              }}
              className="w-full accent-[#8ca68e] cursor-pointer"
            />
          </div>
        </div>

        {/* Reset Progress Option */}
        <div className="pt-3 border-t border-[#eee6da] flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('Reset game back to day 1 fresh start?')) {
                onResetGame();
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-[#d68060] hover:text-[#b86244] font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Save Progress</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#8ca68e] text-white text-xs font-bold hover:bg-[#7b947d]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
