export type ItemType = 
  | 'normal_modak' 
  | 'golden_modak' 
  | 'flower' 
  | 'durva' 
  | 'burnt_modak' 
  | 'bomb';

export interface FallingItem {
  id: number;
  type: ItemType;
  x: number;
  y: number;
  speed: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  points: number;
  caught: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'star' | 'petal' | 'smoke';
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
  life: number;
}

export interface GameStats {
  score: number;
  highScore: number;
  combo: number;
  maxCombo: number;
  normalModaks: number;
  goldenModaks: number;
  flowers: number;
  durva: number;
  burntAvoided: number;
  totalCaught: number;
  lives: number; // Max 3 Diyas
  festivalLevel: number; // 1 to 5
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  score: number;
  date: string;
  rankTitle: string;
  normalModaks: number;
  goldenModaks: number;
  maxCombo: number;
  festivalLevel: number;
}

export type GameStatus = 'start' | 'playing' | 'paused' | 'gameover';

