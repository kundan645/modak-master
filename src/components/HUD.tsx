import React from 'react';
import { GameStats } from '../types';
import { Volume2, VolumeX, Music, Music2, Pause, Play, Flame, Trophy, User } from 'lucide-react';
import { sound } from '../utils/audio';

interface HUDProps {
  stats: GameStats;
  isPaused: boolean;
  username: string;
  onTogglePause: () => void;
  onAudioChange: () => void;
  onOpenLeaderboard: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  isPaused,
  username,
  onTogglePause,
  onAudioChange,
  onOpenLeaderboard,
}) => {
  const getFestivalDayName = (level: number) => {
    switch (level) {
      case 1:
        return 'Day 1 • Sthapana';
      case 2:
        return 'Day 3 • Mahapooja';
      case 3:
        return 'Day 5 • Gauri Avahan';
      case 4:
        return 'Day 7 • Dhol-Tasha';
      case 5:
      default:
        return 'Day 10 • Anant Chaturdashi';
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-amber-950/95 via-red-950/95 to-amber-950/95 backdrop-blur-md px-2.5 sm:px-4 py-2 border-b border-amber-500/30 flex items-center justify-between z-30 select-none shadow-md">
      {/* Left: Score & High Score */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <div className="flex flex-col">
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold text-amber-400">
            Offerings Score
          </span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-xl sm:text-3xl font-black text-amber-200 tracking-tight font-serif drop-shadow-md">
              {stats.score}
            </span>
            {stats.combo > 1 && (
              <span className="text-[11px] sm:text-xs font-extrabold text-orange-400 animate-bounce">
                {stats.combo}x!
              </span>
            )}
          </div>
        </div>

        {/* High Score & Username Pill */}
        <div className="hidden md:flex flex-col border-l border-amber-800/80 pl-2.5">
          <span className="text-[9px] uppercase tracking-wider text-amber-400/80 font-medium">
            Best Devotion
          </span>
          <span className="text-xs sm:text-sm font-bold text-amber-300 font-serif">
            🏆 {stats.highScore}
          </span>
        </div>
      </div>

      {/* Center: Devotee Username Badge & Sacred Diyas (Lives) */}
      <div className="flex flex-col items-center">
        {/* Username + Stage Pill */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-amber-200 bg-amber-900/70 hover:bg-amber-800/80 px-2 py-0.5 rounded-full border border-amber-500/40 transition-colors cursor-pointer"
            title="Devotee Name & Leaderboard Standing"
          >
            <User className="w-3 h-3 text-amber-400" />
            <span className="max-w-[75px] sm:max-w-[120px] truncate">{username}</span>
          </button>

          <span className="hidden sm:inline-block text-[10px] sm:text-xs font-semibold text-amber-300/90 tracking-wide bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-700/40">
            {getFestivalDayName(stats.festivalLevel)}
          </span>
        </div>

        {/* Sacred Diyas (3 Lives) */}
        <div className="flex items-center space-x-1.5 mt-1">
          {Array.from({ length: 3 }).map((_, i) => {
            const isAlive = i < stats.lives;
            return (
              <div
                key={i}
                className={`relative transition-all duration-300 flex flex-col items-center ${
                  isAlive ? 'opacity-100 scale-100' : 'opacity-30 scale-90 grayscale'
                }`}
                title={isAlive ? 'Sacred Diya Lit' : 'Diya Extinguished'}
              >
                {/* Flame */}
                {isAlive ? (
                  <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-300 animate-pulse drop-shadow-[0_0_6px_#f59e0b]" />
                ) : (
                  <div className="w-3.5 h-3.5 flex items-center justify-center text-[10px] text-amber-800">
                    ✕
                  </div>
                )}
                {/* Brass Diya Base */}
                <div className="w-3.5 h-1 sm:w-4 sm:h-1.5 bg-gradient-to-r from-amber-600 to-amber-500 rounded-b-md border-t border-amber-300" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Leaderboard Button, Sound Controls & Pause */}
      <div className="flex items-center space-x-1 sm:space-x-1.5">
        {/* Bappa's Leaderboard Button */}
        <button
          onClick={onOpenLeaderboard}
          className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-gradient-to-r from-amber-600/50 to-orange-600/50 hover:from-amber-600/80 hover:to-orange-600/80 text-amber-200 hover:text-amber-100 border border-amber-400/50 transition-all flex items-center gap-1 cursor-pointer"
          title="Open Bappa's Bhakti Leaderboard"
          aria-label="Open Bappa's Bhakti Leaderboard"
        >
          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-xs font-bold hidden sm:inline">Leaderboard</span>
        </button>

        {/* SFX Button */}
        <button
          onClick={() => {
            sound.toggleSound();
            onAudioChange();
          }}
          className="p-1.5 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-700/50 transition-colors"
          title={sound.soundEnabled ? 'Mute Sound Effects' : 'Unmute Sound Effects'}
          aria-label="Toggle Sound Effects"
        >
          {sound.soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
          )}
        </button>

        {/* Festive Dhol Music Button */}
        <button
          onClick={() => {
            sound.toggleMusic();
            onAudioChange();
          }}
          className="p-1.5 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-700/50 transition-colors"
          title={sound.musicEnabled ? 'Stop Dhol Beats' : 'Play Festive Dhol Beats'}
          aria-label="Toggle Festive Music"
        >
          {sound.musicEnabled ? (
            <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 animate-bounce" />
          ) : (
            <Music2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
          )}
        </button>

        {/* Pause Button */}
        <button
          onClick={onTogglePause}
          className="p-1.5 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-700/50 transition-colors"
          title={isPaused ? 'Resume Game' : 'Pause Game'}
          aria-label="Pause or Resume"
        >
          {isPaused ? (
            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 fill-emerald-400" />
          ) : (
            <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
          )}
        </button>
      </div>
    </div>
  );
};
