import React, { useState } from 'react';
import { LeaderboardEntry } from '../types';
import {
  Trophy,
  Award,
  Medal,
  Crown,
  User,
  Check,
  Edit2,
  X,
  Sparkles,
  Flame,
  Calendar,
  RotateCcw,
} from 'lucide-react';
import { getLeaderboard, setStoredUsername } from '../utils/leaderboard';

interface LeaderboardModalProps {
  currentUsername: string;
  onUpdateUsername: (newName: string) => void;
  onClose: () => void;
  highlightEntryId?: string | null;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  currentUsername,
  onUpdateUsername,
  onClose,
  highlightEntryId,
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(() => getLeaderboard());
  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(currentUsername);

  const handleSaveName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = tempName.trim() || 'Devotee';
    onUpdateUsername(clean);
    setStoredUsername(clean);
    setIsEditingName(false);
  };

  const filteredEntries = activeTab === 'mine'
    ? entries.filter(
        (e) => e.username.trim().toLowerCase() === currentUsername.trim().toLowerCase()
      )
    : entries;

  const myBestEntry = entries.find(
    (e) => e.username.trim().toLowerCase() === currentUsername.trim().toLowerCase()
  );
  const myBestRank = myBestEntry ? entries.indexOf(myBestEntry) + 1 : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-amber-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-amber-900/98 via-red-950/98 to-amber-950/98 border-2 border-amber-500/70 rounded-3xl p-4 sm:p-6 shadow-[0_0_60px_rgba(245,158,11,0.35)] text-amber-100 flex flex-col my-auto max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-amber-950/80 hover:bg-amber-800 text-amber-300 hover:text-amber-100 border border-amber-500/40 transition-colors cursor-pointer z-10"
          aria-label="Close Leaderboard"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Section Header */}
        <div className="text-center mb-3">
          <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 font-serif font-bold tracking-widest uppercase mb-1">
            <span>🌸</span>
            <span>GANESH CHATURTHI UTSAV</span>
            <span>🌸</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400 font-serif tracking-wide drop-shadow-md flex items-center justify-center gap-2">
            <Trophy className="w-7 h-7 text-amber-400 fill-amber-400/20" />
            <span>BAPPA'S BHAKTI LEADERBOARD</span>
          </h2>

          <p className="text-amber-200/80 text-xs sm:text-sm mt-0.5">
            Hall of Devotees • Supreme Modak Offerings
          </p>
        </div>

        {/* Devotee Username Section (Player Name Input & Edit) */}
        <div className="w-full bg-gradient-to-r from-amber-950/80 via-red-950/80 to-amber-950/80 rounded-2xl p-3 sm:p-3.5 border border-amber-500/40 mb-3 shadow-inner">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 font-serif font-bold text-base shadow-sm shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                  Your Devotee Name (Player Username)
                </span>
                {!isEditingName ? (
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-extrabold text-amber-100 font-serif tracking-wide">
                      {currentUsername}
                    </span>
                    <button
                      onClick={() => {
                        setTempName(currentUsername);
                        setIsEditingName(true);
                      }}
                      className="p-1 rounded text-amber-400 hover:text-amber-200 hover:bg-amber-800/50 transition-colors"
                      title="Change Devotee Username"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSaveName} className="flex items-center gap-1.5 mt-0.5">
                    <input
                      type="text"
                      maxLength={18}
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      placeholder="Enter username"
                      className="px-2 py-1 text-xs sm:text-sm bg-black/60 border border-amber-400/70 rounded-lg text-amber-100 placeholder-amber-400/40 focus:outline-none focus:ring-1 focus:ring-amber-300 w-36 sm:w-44 font-semibold"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" /> Save
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Devotee Personal Best Status */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end bg-black/30 sm:bg-transparent px-2.5 py-1 sm:p-0 rounded-lg sm:rounded-none">
              <div className="text-right">
                <span className="text-[10px] text-amber-300/80 uppercase font-semibold block">
                  Personal Best Rank
                </span>
                <span className="text-xs sm:text-sm font-bold text-amber-200">
                  {myBestRank ? (
                    <span className="text-amber-300 font-serif">
                      Rank #{myBestRank} ({myBestEntry?.score} pts)
                    </span>
                  ) : (
                    <span className="text-amber-400/60 italic">No runs recorded yet</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Controls: All Devotees vs My Devotion Records */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex gap-1.5 bg-black/40 p-1 rounded-xl border border-amber-700/40">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-amber-500 text-amber-950 shadow-sm'
                  : 'text-amber-300 hover:text-amber-100 hover:bg-amber-900/40'
              }`}
            >
              All Devotees ({entries.length})
            </button>
            <button
              onClick={() => setActiveTab('mine')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'mine'
                  ? 'bg-amber-500 text-amber-950 shadow-sm'
                  : 'text-amber-300 hover:text-amber-100 hover:bg-amber-900/40'
              }`}
            >
              My Records ({entries.filter((e) => e.username.toLowerCase() === currentUsername.toLowerCase()).length})
            </button>
          </div>

          <div className="text-[11px] text-amber-300/70 hidden sm:flex items-center gap-1 font-serif">
            <span>🪔</span>
            <span>May Bappa shower blessings!</span>
          </div>
        </div>

        {/* Leaderboard Entries List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-48 max-h-72 sm:max-h-80">
          {filteredEntries.length === 0 ? (
            <div className="p-8 text-center bg-black/25 rounded-2xl border border-amber-800/30 text-amber-300/80">
              <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-60" />
              <p className="font-semibold text-sm">No devotion records found for this view.</p>
              <p className="text-xs text-amber-400/60 mt-1">
                Play a game to register your score on Bappa's Bhakti Leaderboard!
              </p>
            </div>
          ) : (
            filteredEntries.map((entry, index) => {
              const actualRank = entries.findIndex((e) => e.id === entry.id) + 1;
              const isCurrentUser =
                entry.username.trim().toLowerCase() === currentUsername.trim().toLowerCase();
              const isHighlighted = highlightEntryId === entry.id;

              return (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border transition-all ${
                    isHighlighted
                      ? 'bg-gradient-to-r from-amber-500/30 via-orange-500/20 to-amber-500/30 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                      : isCurrentUser
                      ? 'bg-amber-900/50 border-amber-400/60 shadow-sm'
                      : actualRank === 1
                      ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-950/40 border-amber-400/50'
                      : actualRank === 2
                      ? 'bg-gradient-to-r from-slate-400/15 via-amber-900/30 to-amber-950/40 border-slate-400/40'
                      : actualRank === 3
                      ? 'bg-gradient-to-r from-orange-600/15 via-amber-900/30 to-amber-950/40 border-orange-500/40'
                      : 'bg-black/30 border-amber-800/30 hover:bg-amber-950/40'
                  }`}
                >
                  {/* Left: Rank & Devotee Info */}
                  <div className="flex items-center gap-2.5">
                    {/* Rank Badge */}
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center font-serif font-black text-sm shrink-0">
                      {actualRank === 1 ? (
                        <span className="text-xl" title="1st Place - Gold">🥇</span>
                      ) : actualRank === 2 ? (
                        <span className="text-xl" title="2nd Place - Silver">🥈</span>
                      ) : actualRank === 3 ? (
                        <span className="text-xl" title="3rd Place - Bronze">🥉</span>
                      ) : (
                        <span className="text-amber-400/80 font-mono text-xs font-bold">
                          #{actualRank}
                        </span>
                      )}
                    </div>

                    {/* Name & Title */}
                    <div className="text-left">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm sm:text-base text-amber-100 tracking-wide">
                          {entry.username}
                        </span>
                        {isCurrentUser && (
                          <span className="px-1.5 py-0.2 bg-amber-500/30 text-amber-300 text-[10px] font-bold rounded-full border border-amber-400/40">
                            YOU
                          </span>
                        )}
                        {actualRank === 1 && (
                          <span className="text-[10px] bg-yellow-400/20 text-yellow-300 px-1.5 py-0.2 rounded border border-yellow-400/40 font-semibold">
                            🏆 Champion
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-amber-300/70">
                        <span>{entry.rankTitle}</span>
                        <span>•</span>
                        <span className="text-amber-400/60 text-[10px]">{entry.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Score & Modak Details */}
                  <div className="text-right pl-2">
                    <div className="text-base sm:text-xl font-black text-amber-300 font-serif drop-shadow-sm">
                      {entry.score}{' '}
                      <span className="text-xs font-sans text-amber-400/80">pts</span>
                    </div>
                    <div className="text-[10px] text-amber-200/60 font-mono">
                      🟡 {entry.normalModaks} | ✨ {entry.goldenModaks} | {entry.maxCombo}x
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info & close button */}
        <div className="mt-3 pt-3 border-t border-amber-700/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-amber-300/80">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Offer the purest modaks to climb Bappa's Bhakti Leaderboard!</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-amber-950 font-extrabold text-xs sm:text-sm font-serif cursor-pointer shadow-md transition-all"
          >
            Back to Game
          </button>
        </div>
      </div>
    </div>
  );
};
