import React, { useState } from 'react';
import { Play, Sparkles, Trophy, User, Check, Edit3, Award } from 'lucide-react';
import { sound } from '../utils/audio';

interface StartScreenProps {
  onStart: () => void;
  highScore: number;
  username: string;
  onUpdateUsername: (name: string) => void;
  onOpenLeaderboard: () => void;
}

const PRESET_NAMES = ['Aarav', 'Priya', 'Ananya', 'Rohan', 'Bhakta', 'ModakSevak'];

export const StartScreen: React.FC<StartScreenProps> = ({
  onStart,
  highScore,
  username,
  onUpdateUsername,
  onOpenLeaderboard,
}) => {
  const [inputName, setInputName] = useState(username);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const handleNameChange = (val: string) => {
    const trimmed = val.slice(0, 18);
    setInputName(trimmed);
    onUpdateUsername(trimmed || 'Devotee');
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 1800);
  };

  const handleStartGame = () => {
    const finalName = inputName.trim() || 'Devotee';
    onUpdateUsername(finalName);
    sound.enableAudio();
    sound.playBellSound();
    onStart();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-amber-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-amber-900/95 via-red-950/95 to-amber-950/95 border-2 border-amber-500/60 rounded-3xl p-4 sm:p-6 shadow-[0_0_50px_rgba(245,158,11,0.28)] text-center text-amber-100 flex flex-col items-center my-auto">
        {/* Festive Toran Garland Accent */}
        <div className="flex items-center justify-center space-x-1 mb-1">
          <span className="text-amber-400 text-base sm:text-lg">🌸</span>
          <span className="text-orange-400 text-base sm:text-lg">🌼</span>
          <span className="text-amber-300 font-serif font-bold text-xs sm:text-sm tracking-widest uppercase">
            Ganesh Chaturthi Utsav
          </span>
          <span className="text-orange-400 text-base sm:text-lg">🌼</span>
          <span className="text-amber-400 text-base sm:text-lg">🌸</span>
        </div>

        {/* Sacred Traditional Greeting */}
        <div className="inline-block px-3.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-serif font-bold text-xs sm:text-sm tracking-wide mb-2 animate-pulse">
          🙏 Ganpati Bappa Morya 🙏
        </div>

        {/* Game Title */}
        <div className="relative mb-1">
          <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 font-serif tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
            MODAK MASTER
          </h1>
          <div className="text-[11px] sm:text-xs font-semibold tracking-wider text-amber-300/80 uppercase mt-0.5">
            Ganpati Bappa's Modak Challenge
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-amber-200/90 text-xs sm:text-sm font-medium max-w-md mx-auto mb-3 leading-relaxed">
          Catch sacred modaks, golden prasad, hibiscus & durva in your festive thali!
        </p>

        {/* USERNAME SECTION (Dedicated Devotee Name Registration) */}
        <div className="w-full bg-gradient-to-r from-amber-950/90 via-red-950/90 to-amber-950/90 rounded-2xl p-3 border-2 border-amber-500/50 mb-3 shadow-md text-left">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider font-serif">
              <User className="w-4 h-4 text-amber-400" />
              <span>Devotee Username</span>
            </div>
            {isSavedNotice && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold animate-pulse">
                <Check className="w-3 h-3" /> Saved!
              </span>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              id="devotee-username-input"
              value={inputName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter your devotee name (e.g. Aarav)"
              maxLength={18}
              className="w-full px-3 py-2 text-sm bg-black/60 border border-amber-400/60 rounded-xl text-amber-100 placeholder-amber-400/40 focus:outline-none focus:ring-2 focus:ring-amber-400/80 font-medium"
            />
            <span className="absolute right-2.5 top-2.5 text-[10px] text-amber-400/60 font-mono">
              {inputName.length}/18
            </span>
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px]">
            <span className="text-amber-400/70 text-[10px]">Quick choices:</span>
            {PRESET_NAMES.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleNameChange(preset)}
                className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold transition-all cursor-pointer ${
                  inputName.toLowerCase() === preset.toLowerCase()
                    ? 'bg-amber-500 text-amber-950 border-amber-300 font-bold'
                    : 'bg-amber-900/40 border-amber-700/40 text-amber-200 hover:bg-amber-800/50'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="text-[10px] text-amber-300/70 mt-1.5 flex items-center gap-1">
            <span>✨</span>
            <span>
              Your score will be logged on <strong className="text-amber-300">Bappa's Bhakti Leaderboard</strong> as{' '}
              <strong className="text-amber-200 underline">{inputName.trim() || 'Devotee'}</strong>
            </span>
          </div>
        </div>

        {/* High Score & Leaderboard Access Bar */}
        <div className="w-full flex items-center justify-between gap-2 mb-3 px-1">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-900/40 border border-amber-600/40 rounded-xl text-amber-200 text-xs font-semibold">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>High Score: <strong className="text-amber-300">{highScore}</strong></span>
          </div>

          <button
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-600/40 to-orange-600/40 hover:from-amber-600/60 hover:to-orange-600/60 border border-amber-400/50 rounded-xl text-amber-200 hover:text-amber-100 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span>Bappa's Leaderboard</span>
          </button>
        </div>

        {/* Offerings Points Guide Grid */}
        <div className="w-full bg-black/35 rounded-2xl p-2.5 border border-amber-600/30 mb-3 text-left">
          <div className="text-[10px] uppercase tracking-wider font-bold text-amber-400 mb-1.5 text-center">
            Sacred Offerings & Hazards Guide
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <div className="flex items-center space-x-2 bg-amber-950/40 p-1.5 rounded-lg border border-amber-700/20">
              <span className="text-base">🟡</span>
              <div>
                <div className="font-bold text-amber-200 text-[11px]">Normal Modak</div>
                <div className="text-emerald-400 font-semibold text-[10px]">+10 pts</div>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-amber-950/40 p-1.5 rounded-lg border border-amber-700/20">
              <span className="text-base">✨</span>
              <div>
                <div className="font-bold text-amber-300 text-[11px]">Golden Modak</div>
                <div className="text-amber-400 font-semibold text-[10px]">+50 pts</div>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-amber-950/40 p-1.5 rounded-lg border border-amber-700/20">
              <span className="text-base">🌸</span>
              <div>
                <div className="font-bold text-rose-300 text-[11px]">Jaswand Flower</div>
                <div className="text-emerald-400 font-semibold text-[10px]">+5 pts</div>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-red-950/40 p-1.5 rounded-lg border border-red-700/30">
              <span className="text-base">🔥</span>
              <div>
                <div className="font-bold text-red-300 text-[11px]">Burnt Modak</div>
                <div className="text-red-400 font-semibold text-[10px]">-20 pts & Diya</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons: START GAME & VIEW LEADERBOARD */}
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={handleStartGame}
            className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:via-orange-400 hover:to-amber-500 active:scale-[0.98] text-amber-950 font-black text-base sm:text-lg font-serif tracking-wider shadow-[0_4px_20px_rgba(245,158,11,0.5)] border-2 border-amber-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-amber-950 text-amber-950" />
            <span>START PLAYING AS {inputName.trim().toUpperCase() || 'DEVOTEE'}</span>
            <Sparkles className="w-4 h-4 text-amber-950" />
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-900/60 hover:bg-amber-800/80 border border-amber-500/40 text-amber-200 hover:text-amber-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Open Bappa's Bhakti Leaderboard</span>
          </button>
        </div>

        {/* Footer Note */}
        <div className="text-[10px] text-amber-400/60 mt-2.5">
          Controls: Left/Right keys or drag basket on screen • Mangal Murti Morya
        </div>
      </div>
    </div>
  );
};
