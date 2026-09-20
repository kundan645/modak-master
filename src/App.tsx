/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStats, GameStatus } from './types';
import { GaneshaSanctum } from './components/GaneshaSanctum';
import { HUD } from './components/HUD';
import { GameCanvas } from './components/GameCanvas';
import { StartScreen } from './components/StartScreen';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { MobileControls } from './components/MobileControls';
import { LeaderboardModal } from './components/LeaderboardModal';
import { sound } from './utils/audio';
import { getStoredUsername, setStoredUsername } from './utils/leaderboard';

export default function App() {
  const [status, setStatus] = useState<GameStatus>('start');
  const [lastCaughtItem, setLastCaughtItem] = useState<string | null>(null);
  const [blessingSparkle, setBlessingSparkle] = useState<boolean>(false);
  const [externalMoveDir, setExternalMoveDir] = useState<number>(0);
  const [, setAudioRenderTick] = useState(0);

  // Devotee Username state
  const [username, setUsername] = useState<string>(() => getStoredUsername());

  // Leaderboard Modal state
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [highlightEntryId, setHighlightEntryId] = useState<string | null>(null);
  const preLeaderboardStatusRef = useRef<GameStatus>('start');

  // Load high score from local storage
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('modak_master_highscore');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: highScore,
    combo: 0,
    maxCombo: 0,
    normalModaks: 0,
    goldenModaks: 0,
    flowers: 0,
    durva: 0,
    burntAvoided: 0,
    totalCaught: 0,
    lives: 3,
    festivalLevel: 1,
  });

  // Sync high score to localStorage when it increases
  useEffect(() => {
    if (stats.score > highScore) {
      setHighScore(stats.score);
      try {
        localStorage.setItem('modak_master_highscore', stats.score.toString());
      } catch {
        // safe fallback
      }
    }
  }, [stats.score, highScore]);

  // Global keyboard shortcuts (Pause on Escape / P)
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (showLeaderboard) {
        if (e.key === 'Escape') {
          handleCloseLeaderboard();
        }
        return;
      }

      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (status === 'playing') {
          setStatus('paused');
        } else if (status === 'paused') {
          setStatus('playing');
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [status, showLeaderboard]);

  const handleUpdateUsername = (newName: string) => {
    const clean = setStoredUsername(newName);
    setUsername(clean);
  };

  const handleOpenLeaderboard = (highlightId?: string) => {
    preLeaderboardStatusRef.current = status;
    if (status === 'playing') {
      setStatus('paused');
    }
    setHighlightEntryId(highlightId || null);
    setShowLeaderboard(true);
  };

  const handleCloseLeaderboard = () => {
    setShowLeaderboard(false);
    setHighlightEntryId(null);
    // If we paused the game only because we opened the leaderboard, resume
    if (preLeaderboardStatusRef.current === 'playing') {
      setStatus('playing');
    }
  };

  // Start new game session
  const handleStart = () => {
    setStats({
      score: 0,
      highScore: highScore,
      combo: 0,
      maxCombo: 0,
      normalModaks: 0,
      goldenModaks: 0,
      flowers: 0,
      durva: 0,
      burntAvoided: 0,
      totalCaught: 0,
      lives: 3,
      festivalLevel: 1,
    });
    setStatus('playing');
  };

  // Game over trigger
  const handleGameOver = useCallback(() => {
    setStatus('gameover');
  }, []);

  // Item catch feedback for divine sanctum
  const handleItemCatchEffect = useCallback((itemName: string) => {
    setLastCaughtItem(itemName);
    setBlessingSparkle(true);
    setTimeout(() => setBlessingSparkle(false), 300);
  }, []);

  // Toggle pause
  const handleTogglePause = () => {
    if (status === 'playing') {
      setStatus('paused');
    } else if (status === 'paused') {
      setStatus('playing');
    }
  };

  const handleAudioChange = () => {
    setAudioRenderTick((t) => t + 1);
  };

  return (
    <div className="flex flex-col h-screen w-screen max-w-full overflow-hidden bg-amber-950 font-sans select-none touch-none">
      {/* 1. Divine Sanctum Canopy with Lord Ganesha */}
      <GaneshaSanctum
        combo={stats.combo}
        lastCaughtItem={lastCaughtItem}
        blessingSparkle={blessingSparkle}
      />

      {/* 2. Heads-Up Display (Offerings Score, High Score, Diyas/Lives, Level, Devotee Username, Leaderboard) */}
      <HUD
        stats={stats}
        isPaused={status === 'paused'}
        username={username}
        onTogglePause={handleTogglePause}
        onAudioChange={handleAudioChange}
        onOpenLeaderboard={() => handleOpenLeaderboard()}
      />

      {/* 3. Main Game Field Canvas */}
      <main className="relative flex-1 w-full flex flex-col min-h-0">
        <GameCanvas
          stats={stats}
          onUpdateStats={setStats}
          onGameOver={handleGameOver}
          onItemCatchEffect={handleItemCatchEffect}
          externalMoveDir={externalMoveDir}
          isPaused={status !== 'playing' || showLeaderboard}
        />

        {/* Start Screen Overlay */}
        {status === 'start' && !showLeaderboard && (
          <StartScreen
            onStart={handleStart}
            highScore={highScore}
            username={username}
            onUpdateUsername={handleUpdateUsername}
            onOpenLeaderboard={() => handleOpenLeaderboard()}
          />
        )}

        {/* Pause Modal Overlay */}
        {status === 'paused' && !showLeaderboard && (
          <PauseModal
            onResume={() => setStatus('playing')}
            onRestart={handleStart}
            onAudioChange={handleAudioChange}
          />
        )}

        {/* Game Over / Aarti Completion Overlay */}
        {status === 'gameover' && !showLeaderboard && (
          <GameOverModal
            stats={stats}
            username={username}
            onRestart={handleStart}
            onOpenLeaderboard={(highlightId) => handleOpenLeaderboard(highlightId)}
          />
        )}

        {/* 🏆 Bappa's Bhakti Leaderboard Modal */}
        {showLeaderboard && (
          <LeaderboardModal
            currentUsername={username}
            onUpdateUsername={handleUpdateUsername}
            onClose={handleCloseLeaderboard}
            highlightEntryId={highlightEntryId}
          />
        )}
      </main>

      {/* 4. Touch Arrow Controls for Mobile Devices */}
      {status === 'playing' && !showLeaderboard && (
        <MobileControls
          onMoveStart={(dir) => setExternalMoveDir(dir)}
          onMoveEnd={() => setExternalMoveDir(0)}
        />
      )}
    </div>
  );
}
