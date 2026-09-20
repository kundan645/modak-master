import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Music, Music2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onAudioChange: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onAudioChange,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-amber-900/95 to-amber-950/95 border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl text-center text-amber-100 flex flex-col items-center">
        <div className="text-xs uppercase tracking-widest text-amber-400 font-bold mb-1">
          Festival Paused
        </div>
        <h2 className="text-2xl font-black text-amber-200 font-serif mb-4">
          Pooja in Progress
        </h2>

        {/* Action buttons */}
        <div className="w-full space-y-2.5 mb-4">
          <button
            onClick={onResume}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-black text-base font-serif flex items-center justify-center gap-2 shadow-lg border border-amber-300 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-amber-950" />
            <span>RESUME GAME</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-950 hover:bg-amber-900 border border-amber-700/60 text-amber-200 font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>RESTART FESTIVAL</span>
          </button>
        </div>

        {/* Audio Toggles */}
        <div className="flex items-center justify-center space-x-3 pt-3 border-t border-amber-800/60 w-full text-xs text-amber-300">
          <button
            onClick={() => {
              sound.toggleSound();
              onAudioChange();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-900/50 hover:bg-amber-800 border border-amber-700/40 cursor-pointer"
          >
            {sound.soundEnabled ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4 text-amber-600" />}
            <span>Sound: {sound.soundEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => {
              sound.toggleMusic();
              onAudioChange();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-900/50 hover:bg-amber-800 border border-amber-700/40 cursor-pointer"
          >
            {sound.musicEnabled ? <Music className="w-4 h-4 text-amber-300" /> : <Music2 className="w-4 h-4 text-amber-600" />}
            <span>Dhol: {sound.musicEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
