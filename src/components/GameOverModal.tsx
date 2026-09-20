import React, { useEffect, useState } from 'react';
import { GameStats } from '../types';
import { RotateCcw, Share2, Trophy, Award, Check, Sparkles, User, Medal } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { addLeaderboardScore } from '../utils/leaderboard';

interface GameOverModalProps {
  stats: GameStats;
  username: string;
  onRestart: () => void;
  onOpenLeaderboard: (highlightId?: string) => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  username,
  onRestart,
  onOpenLeaderboard,
}) => {
  const [copied, setCopied] = useState(false);
  const [leaderboardRank, setLeaderboardRank] = useState<number | null>(null);
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);
  const isNewHighScore = stats.score > 0 && stats.score >= stats.highScore;

  const getDevoteeRank = (score: number) => {
    if (score >= 1000) return { title: 'Supreme Modak Master 🌟', desc: 'Bappa is exceedingly delighted by your divine devotion!' };
    if (score >= 600) return { title: 'Devotee of Bappa 🕉️', desc: 'A blessed offering plate worthy of the grand pandal aarti!' };
    if (score >= 300) return { title: 'Modak Sevak 🍬', desc: 'Wonderful speed and devotion in catching sacred prasad!' };
    if (score >= 100) return { title: 'Prasad Seeker 🌸', desc: 'Good start in offering sacred gifts to Lord Ganesha!' };
    return { title: 'Bhakti Beginner 🙏', desc: 'Practice makes perfect. Bappa blesses your sincere effort!' };
  };

  const rank = getDevoteeRank(stats.score);

  useEffect(() => {
    sound.playGameOverSound();

    // Trigger joyful celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#EF4444', '#10B981', '#FBBF24', '#FFFFFF'],
      });
    } catch {
      // safe fallback
    }

    // Auto-save score to Bappa's Bhakti Leaderboard
    if (stats.score > 0) {
      const result = addLeaderboardScore({
        username: username || 'Devotee',
        score: stats.score,
        rankTitle: rank.title,
        normalModaks: stats.normalModaks,
        goldenModaks: stats.goldenModaks,
        maxCombo: stats.maxCombo,
        festivalLevel: stats.festivalLevel,
      });

      if (result.newRankIndex >= 0) {
        setLeaderboardRank(result.newRankIndex + 1);
        const savedItem = result.entries[result.newRankIndex];
        if (savedItem) {
          setSavedEntryId(savedItem.id);
        }
      }
    }
  }, [stats, username, rank.title]);

  const handleShare = async () => {
    const text = `🍬 Devotee "${username}" scored ${stats.score} points in "MODAK MASTER — Ganpati Bappa's Modak Challenge"!\n🏆 Rank: ${rank.title} ${leaderboardRank ? `(#${leaderboardRank} on Leaderboard)` : ''}\n✨ Modaks caught: ${stats.normalModaks + stats.goldenModaks}\n🙏 Ganpati Bappa Morya!`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // fallback
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-amber-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-amber-900/95 via-red-950/95 to-amber-950/95 border-2 border-amber-500/60 rounded-3xl p-4 sm:p-6 shadow-[0_0_50px_rgba(245,158,11,0.3)] text-center text-amber-100 flex flex-col items-center my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Auspicious Chants Banner */}
        <div className="text-amber-300 font-serif font-bold text-xs sm:text-sm tracking-widest uppercase mb-1">
          🙏 Mangal Murti Morya 🙏
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 font-serif tracking-wide mb-1">
          FESTIVAL AARTI COMPLETED
        </h2>

        {/* Username section acknowledgment */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/60 rounded-full border border-amber-500/40 text-amber-200 text-xs sm:text-sm font-semibold mb-2">
          <User className="w-3.5 h-3.5 text-amber-400" />
          <span>Devotee: <strong className="text-amber-300 font-serif">{username}</strong></span>
        </div>

        <p className="text-amber-200/80 text-xs sm:text-sm mb-3">
          Your sacred offerings have been gratefully presented to Lord Ganesha!
        </p>

        {/* Score & Rank Highlight Card */}
        <div className="w-full bg-gradient-to-br from-amber-950/70 to-red-950/70 rounded-2xl p-3.5 border border-amber-500/40 mb-3 shadow-inner">
          <div className="text-[11px] uppercase tracking-wider text-amber-300/80 font-bold mb-0.5">
            Final Offerings Score
          </div>
          <div className="text-4xl sm:text-5xl font-black text-amber-200 font-serif mb-1 drop-shadow-md">
            {stats.score}
          </div>

          {leaderboardRank && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/30 text-amber-200 text-xs font-bold border border-amber-400/50 mb-1.5">
              <Medal className="w-3.5 h-3.5 text-amber-300" />
              <span>Ranked <strong className="text-amber-300">#{leaderboardRank}</strong> on Bappa's Bhakti Leaderboard!</span>
            </div>
          )}

          {isNewHighScore && (
            <div className="block">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-400/50 animate-bounce">
                <Trophy className="w-3.5 h-3.5" /> NEW PERSONAL BEST RECORD!
              </span>
            </div>
          )}

          {/* Devotee Title */}
          <div className="mt-2 pt-2 border-t border-amber-700/40">
            <div className="flex items-center justify-center gap-1.5 text-base sm:text-lg font-bold text-yellow-300 font-serif">
              <Award className="w-4 h-4 text-amber-400" />
              <span>{rank.title}</span>
            </div>
            <p className="text-xs text-amber-200/80 italic mt-0.5 max-w-sm mx-auto">
              "{rank.desc}"
            </p>
          </div>
        </div>

        {/* Detailed Offerings Breakdown Grid */}
        <div className="w-full bg-black/30 rounded-2xl p-2.5 border border-amber-700/30 mb-3 text-xs sm:text-sm">
          <div className="text-[11px] uppercase tracking-wider font-bold text-amber-400 mb-1.5 text-center">
            Pooja Thali Summary
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-left">
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-amber-950/40 border border-amber-800/30">
              <span className="flex items-center gap-1 text-amber-200 text-xs">
                <span>🟡</span> Normal Modaks
              </span>
              <strong className="text-amber-300 font-mono text-xs sm:text-sm">{stats.normalModaks}</strong>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded-lg bg-amber-950/40 border border-amber-800/30">
              <span className="flex items-center gap-1 text-amber-200 text-xs">
                <span>✨</span> Golden Modaks
              </span>
              <strong className="text-amber-300 font-mono text-xs sm:text-sm">{stats.goldenModaks}</strong>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded-lg bg-amber-950/40 border border-amber-800/30">
              <span className="flex items-center gap-1 text-rose-300 text-xs">
                <span>🌸</span> Jaswand Flowers
              </span>
              <strong className="text-rose-300 font-mono text-xs sm:text-sm">{stats.flowers}</strong>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded-lg bg-amber-950/40 border border-amber-800/30">
              <span className="flex items-center gap-1 text-emerald-300 text-xs">
                <span>🌿</span> Durva Grass
              </span>
              <strong className="text-emerald-300 font-mono text-xs sm:text-sm">{stats.durva}</strong>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded-lg bg-amber-950/40 border border-amber-800/30">
              <span className="text-amber-200 text-xs">⚡ Max Combo</span>
              <strong className="text-amber-300 font-mono text-xs sm:text-sm">{stats.maxCombo}x</strong>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded-lg bg-amber-950/40 border border-amber-800/30">
              <span className="text-amber-200 text-xs">🏆 High Score</span>
              <strong className="text-amber-300 font-mono text-xs sm:text-sm">{stats.highScore}</strong>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={onRestart}
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] text-amber-950 font-black text-sm sm:text-base font-serif tracking-wider shadow-[0_4px_16px_rgba(245,158,11,0.4)] border-2 border-amber-200 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY AGAIN</span>
            </button>

            <button
              onClick={handleShare}
              className="py-3 px-4 rounded-2xl bg-amber-900/70 hover:bg-amber-800 border border-amber-500/50 text-amber-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Score Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-amber-400" />
                  <span>Share Devotion</span>
                </>
              )}
            </button>
          </div>

          {/* Button to open Bappa's Bhakti Leaderboard */}
          <button
            onClick={() => onOpenLeaderboard(savedEntryId || undefined)}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-800/60 to-red-900/60 hover:from-amber-700/80 hover:to-red-800/80 border border-amber-400/50 text-amber-200 hover:text-amber-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>View Bappa's Bhakti Leaderboard</span>
          </button>
        </div>

        {/* Sacred Shloka Footnote */}
        <div className="text-[10px] text-amber-400/70 italic mt-2.5 font-serif">
          वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ • निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा
        </div>
      </div>
    </div>
  );
};
