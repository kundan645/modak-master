import React, { useRef, useEffect, useCallback } from 'react';
import { FallingItem, Particle, FloatingText, GameStats, ItemType } from '../types';
import { sound } from '../utils/audio';

interface GameCanvasProps {
  stats: GameStats;
  onUpdateStats: (updater: (prev: GameStats) => GameStats) => void;
  onGameOver: () => void;
  onItemCatchEffect: (itemName: string) => void;
  externalMoveDir: number; // -1 (left), 0 (none), 1 (right) from touch controls
  isPaused: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  stats,
  onUpdateStats,
  onGameOver,
  onItemCatchEffect,
  externalMoveDir,
  isPaused,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Basket player state
  const basketRef = useRef({
    x: 200,
    y: 500,
    width: 100,
    height: 38,
    vx: 0,
    tilt: 0,
    targetTilt: 0,
  });

  // Game loop state refs
  const itemsRef = useRef<FallingItem[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const nextItemId = useRef(1);
  const nextTextId = useRef(1);
  const lastSpawnTime = useRef(0);
  const screenShakeRef = useRef(0);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const mousePosRef = useRef<{ x: number | null }>({ x: null });
  const touchActiveRef = useRef(false);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(e.key)) {
        keysPressed.current[e.key.toLowerCase()] = true;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(e.key)) {
        keysPressed.current[e.key.toLowerCase()] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Spawn new falling item
  const spawnItem = useCallback((canvasWidth: number, level: number) => {
    const types: { type: ItemType; weight: number; points: number }[] = [
      { type: 'normal_modak', weight: 45, points: 10 },
      { type: 'golden_modak', weight: 12, points: 50 },
      { type: 'flower', weight: 16, points: 5 },
      { type: 'durva', weight: 14, points: 5 },
      { type: 'burnt_modak', weight: 8 + level * 2, points: -20 },
      { type: 'bomb', weight: 5 + level * 1.5, points: 0 },
    ];

    const totalWeight = types.reduce((sum, item) => sum + item.weight, 0);
    let rand = Math.random() * totalWeight;
    let chosen = types[0];

    for (const item of types) {
      if (rand < item.weight) {
        chosen = item;
        break;
      }
      rand -= item.weight;
    }

    // Base speed increases with festival level
    const baseSpeed = 2.0 + level * 0.45;
    const speedVariation = (Math.random() - 0.5) * 0.6;
    const speed = Math.max(1.8, baseSpeed + speedVariation);

    const margin = 50;
    const x = margin + Math.random() * (canvasWidth - margin * 2);

    itemsRef.current.push({
      id: nextItemId.current++,
      type: chosen.type,
      x,
      y: -30,
      speed,
      size: chosen.type === 'golden_modak' ? 38 : chosen.type === 'normal_modak' ? 34 : 32,
      rotation: (Math.random() - 0.5) * 0.4,
      rotationSpeed: (Math.random() - 0.5) * 0.03,
      points: chosen.points,
      caught: false,
    });
  }, []);

  // Add floating point popup text
  const addFloatingText = (x: number, y: number, text: string, color: string) => {
    floatingTextsRef.current.push({
      id: nextTextId.current++,
      x,
      y,
      text,
      color,
      alpha: 1,
      scale: 1.2,
      life: 0,
    });
  };

  // Add particle bursts
  const addParticles = (x: number, y: number, type: ItemType) => {
    let count = 14;
    let colors = ['#FDE68A', '#F59E0B', '#FEF3C7'];
    let shape: 'circle' | 'star' | 'petal' | 'smoke' = 'circle';

    if (type === 'golden_modak') {
      count = 24;
      colors = ['#FDE047', '#FBBF24', '#FFFBEB', '#F59E0B'];
      shape = 'star';
    } else if (type === 'flower') {
      count = 18;
      colors = ['#EF4444', '#F43F5E', '#FCA5A5', '#FEF08A'];
      shape = 'petal';
    } else if (type === 'durva') {
      count = 16;
      colors = ['#10B981', '#34D399', '#059669', '#6EE7B7'];
      shape = 'petal';
    } else if (type === 'burnt_modak') {
      count = 14;
      colors = ['#374151', '#4B5563', '#1F2937', '#EF4444'];
      shape = 'smoke';
    } else if (type === 'bomb') {
      count = 20;
      colors = ['#DC2626', '#F97316', '#4B5563', '#FBBF24'];
      shape = 'smoke';
    }

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (shape === 'smoke' ? 2 : 1),
        size: shape === 'smoke' ? 6 + Math.random() * 8 : 3 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: 25 + Math.random() * 20,
        shape,
      });
    }
  };

  // Main Canvas Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    // Canvas resize observer for dynamic full responsiveness
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.resetTransform();
        ctx.scale(dpr, dpr);

        // Adjust basket placement
        basketRef.current.y = height - 52;
        basketRef.current.width = Math.min(130, Math.max(90, width * 0.26));
      }
    });

    resizeObserver.observe(container);

    const render = (time: number) => {
      const dt = Math.min(32, time - lastTime); // cap frame time to prevent giant jumps
      lastTime = time;

      if (!isPaused) {
        const width = parseFloat(canvas.style.width) || canvas.width;
        const height = parseFloat(canvas.style.height) || canvas.height;

        // 1. UPDATE BASKET POSITION
        const basket = basketRef.current;
        let moveDirection = 0;

        if (keysPressed.current['arrowleft'] || keysPressed.current['a']) {
          moveDirection -= 1;
        }
        if (keysPressed.current['arrowright'] || keysPressed.current['d']) {
          moveDirection += 1;
        }
        if (externalMoveDir !== 0) {
          moveDirection += externalMoveDir;
        }

        const maxSpeed = width > 500 ? 10.5 : 8.5;
        const accel = 1.6;
        const friction = 0.82;

        if (moveDirection !== 0) {
          basket.vx += moveDirection * accel;
          basket.targetTilt = moveDirection * 0.15; // subtle tilt angle in radians
        } else if (mousePosRef.current.x !== null && !touchActiveRef.current) {
          // Smooth mouse follow
          const targetX = mousePosRef.current.x;
          const diff = targetX - basket.x;
          basket.vx = diff * 0.22;
          basket.targetTilt = Math.max(-0.18, Math.min(0.18, diff * 0.008));
        } else {
          basket.vx *= friction;
          basket.targetTilt = 0;
        }

        // Clamp speed
        basket.vx = Math.max(-maxSpeed, Math.min(maxSpeed, basket.vx));
        basket.x += basket.vx;
        basket.tilt += (basket.targetTilt - basket.tilt) * 0.15;

        // Boundary constraint
        const halfBasket = basket.width / 2;
        if (basket.x < halfBasket) {
          basket.x = halfBasket;
          basket.vx = 0;
        } else if (basket.x > width - halfBasket) {
          basket.x = width - halfBasket;
          basket.vx = 0;
        }

        // 2. SPAWN FALLING ITEMS
        // Interval reduces slightly with score/level (from 1100ms down to 550ms)
        const spawnInterval = Math.max(550, 1150 - stats.festivalLevel * 100);
        if (time - lastSpawnTime.current > spawnInterval) {
          spawnItem(width, stats.festivalLevel);
          lastSpawnTime.current = time;
        }

        // 3. UPDATE FALLING ITEMS & COLLISION
        const basketTop = basket.y - basket.height / 2;
        const basketBottom = basket.y + basket.height / 2;
        const basketLeft = basket.x - basket.width / 2;
        const basketRight = basket.x + basket.width / 2;

        for (let i = itemsRef.current.length - 1; i >= 0; i--) {
          const item = itemsRef.current[i];
          item.y += item.speed;
          item.rotation += item.rotationSpeed;

          // Check Catch Collision with Pooja Plate
          const itemBottom = item.y + item.size / 2;
          const itemHorizontalCenter = item.x;

          if (
            !item.caught &&
            itemBottom >= basketTop &&
            item.y <= basketBottom &&
            itemHorizontalCenter >= basketLeft - 12 &&
            itemHorizontalCenter <= basketRight + 12
          ) {
            item.caught = true;

            // Handle catch effects according to contest prompt specifications
            if (item.type === 'normal_modak') {
              sound.playBellSound(stats.combo > 2);
              addParticles(item.x, item.y, item.type);
              addFloatingText(item.x, item.y - 10, '+10', '#FDE047');
              onItemCatchEffect('Normal Modak');

              onUpdateStats((prev) => {
                const newCombo = prev.combo + 1;
                const bonus = Math.floor(newCombo / 5) * 5;
                const newScore = prev.score + 10 + bonus;
                const newLevel = Math.min(5, 1 + Math.floor(newScore / 200));
                return {
                  ...prev,
                  score: newScore,
                  combo: newCombo,
                  maxCombo: Math.max(prev.maxCombo, newCombo),
                  normalModaks: prev.normalModaks + 1,
                  totalCaught: prev.totalCaught + 1,
                  highScore: Math.max(prev.highScore, newScore),
                  festivalLevel: newLevel,
                };
              });
            } else if (item.type === 'golden_modak') {
              sound.playGoldenChime();
              addParticles(item.x, item.y, item.type);
              addFloatingText(item.x, item.y - 15, '+50 ✨', '#FBBF24');
              onItemCatchEffect('Golden Modak');

              onUpdateStats((prev) => {
                const newCombo = prev.combo + 2;
                const newScore = prev.score + 50 + newCombo * 5;
                const newLevel = Math.min(5, 1 + Math.floor(newScore / 200));
                return {
                  ...prev,
                  score: newScore,
                  combo: newCombo,
                  maxCombo: Math.max(prev.maxCombo, newCombo),
                  goldenModaks: prev.goldenModaks + 1,
                  totalCaught: prev.totalCaught + 1,
                  highScore: Math.max(prev.highScore, newScore),
                  festivalLevel: newLevel,
                };
              });
            } else if (item.type === 'flower') {
              sound.playFlowerSound();
              addParticles(item.x, item.y, item.type);
              addFloatingText(item.x, item.y - 10, '+5 🌸', '#F43F5E');
              onItemCatchEffect('Sacred Hibiscus');

              onUpdateStats((prev) => {
                const newScore = prev.score + 5;
                return {
                  ...prev,
                  score: newScore,
                  flowers: prev.flowers + 1,
                  totalCaught: prev.totalCaught + 1,
                  highScore: Math.max(prev.highScore, newScore),
                };
              });
            } else if (item.type === 'durva') {
              sound.playFlowerSound();
              addParticles(item.x, item.y, item.type);
              addFloatingText(item.x, item.y - 10, '+5 🌿', '#34D399');
              onItemCatchEffect('Durva Grass');

              onUpdateStats((prev) => {
                const newScore = prev.score + 5;
                return {
                  ...prev,
                  score: newScore,
                  durva: prev.durva + 1,
                  totalCaught: prev.totalCaught + 1,
                  highScore: Math.max(prev.highScore, newScore),
                };
              });
            } else if (item.type === 'burnt_modak') {
              // Burnt Modak = -20 points, loses a Diya life
              sound.playBurntSound();
              addParticles(item.x, item.y, item.type);
              addFloatingText(item.x, item.y - 10, '-20 🔥', '#EF4444');
              screenShakeRef.current = 14;

              onUpdateStats((prev) => {
                const newScore = Math.max(0, prev.score - 20);
                const newLives = prev.lives - 1;
                if (newLives <= 0) {
                  setTimeout(() => onGameOver(), 300);
                }
                return {
                  ...prev,
                  score: newScore,
                  combo: 0,
                  lives: Math.max(0, newLives),
                };
              });
            } else if (item.type === 'bomb') {
              // Wrong object / firecracker hazard = loses combo, breaks plate focus
              sound.playBombSound();
              addParticles(item.x, item.y, item.type);
              addFloatingText(item.x, item.y - 10, 'COMBO LOST! 💣', '#F97316');
              screenShakeRef.current = 12;

              onUpdateStats((prev) => {
                const newLives = prev.lives - 1;
                if (newLives <= 0) {
                  setTimeout(() => onGameOver(), 300);
                }
                return {
                  ...prev,
                  combo: 0,
                  lives: Math.max(0, newLives),
                };
              });
            }

            // Remove caught item
            itemsRef.current.splice(i, 1);
            continue;
          }

          // Off bottom of screen
          if (item.y > height + 40) {
            itemsRef.current.splice(i, 1);
          }
        }

        // 4. UPDATE PARTICLES
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.08; // subtle gravity
          p.life++;
          p.alpha = 1 - p.life / p.maxLife;

          if (p.life >= p.maxLife) {
            particlesRef.current.splice(i, 1);
          }
        }

        // 5. UPDATE FLOATING TEXTS
        for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
          const ft = floatingTextsRef.current[i];
          ft.y -= 1.4;
          ft.life += dt;
          ft.alpha = Math.max(0, 1 - ft.life / 1000);
          if (ft.life > 1000) {
            floatingTextsRef.current.splice(i, 1);
          }
        }

        // Screen shake decay
        if (screenShakeRef.current > 0) {
          screenShakeRef.current *= 0.86;
          if (screenShakeRef.current < 0.5) screenShakeRef.current = 0;
        }

        // 6. RENDER EVERYTHING TO CANVAS
        ctx.save();
        ctx.clearRect(0, 0, width, height);

        // Apply screen shake
        if (screenShakeRef.current > 0) {
          const dx = (Math.random() - 0.5) * screenShakeRef.current;
          const dy = (Math.random() - 0.5) * screenShakeRef.current;
          ctx.translate(dx, dy);
        }

        // A. Background Festive Ambience (Sanctum glow & Rangoli floor)
        drawFestiveBackground(ctx, width, height);

        // B. Draw Falling Items
        for (const item of itemsRef.current) {
          drawItem(ctx, item);
        }

        // C. Draw Particles
        for (const p of particlesRef.current) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;

          if (p.shape === 'star') {
            drawStar(ctx, p.x, p.y, 4, p.size, p.size / 2);
          } else if (p.shape === 'petal') {
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, p.size, p.size * 0.6, p.vx, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // D. Draw Basket / Sacred Pooja Thali Plate
        drawPoojaThali(ctx, basket);

        // E. Draw Floating Texts
        for (const ft of floatingTextsRef.current) {
          ctx.save();
          ctx.globalAlpha = ft.alpha;
          ctx.fillStyle = ft.color;
          ctx.font = 'bold 20px "Outfit", sans-serif';
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 6;
          ctx.fillText(ft.text, ft.x, ft.y);
          ctx.restore();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [isPaused, onGameOver, onItemCatchEffect, onUpdateStats, spawnItem, stats.festivalLevel, externalMoveDir, stats.combo]);

  // Touch & Mouse event tracking
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    touchActiveRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    basketRef.current.x = Math.max(
      basketRef.current.width / 2,
      Math.min(rect.width - basketRef.current.width / 2, touchX)
    );
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    touchActiveRef.current = true;
    handleTouchMove(e);
  };

  const handleTouchEnd = () => {
    touchActiveRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mousePosRef.current.x = e.clientX - rect.left;
  };

  const handleMouseLeave = () => {
    mousePosRef.current.x = null;
  };

  return (
    <div ref={containerRef} className="relative w-full h-full flex-1 touch-none overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-ew-resize"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
};

// --- PROCEDURAL CANVAS DRAWING UTILITIES ---

function drawFestiveBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Radiant temple background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#260c07');
  grad.addColorStop(0.5, '#3b120c');
  grad.addColorStop(1, '#1b0704');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Subtle traditional mandap curtain pillar borders on left and right
  ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
  ctx.fillRect(0, 0, 16, height);
  ctx.fillRect(width - 16, 0, 16, height);

  // Floating gentle diya aura near bottom floor
  const floorGlow = ctx.createRadialGradient(width / 2, height - 30, 20, width / 2, height - 30, width * 0.6);
  floorGlow.addColorStop(0, 'rgba(245, 158, 11, 0.16)');
  floorGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = floorGlow;
  ctx.fillRect(0, height - 120, width, 120);

  // Rangoli line at base
  ctx.strokeStyle = 'rgba(253, 230, 138, 0.15)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(20, height - 8);
  ctx.lineTo(width - 20, height - 8);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawPoojaThali(
  ctx: CanvasRenderingContext2D,
  basket: { x: number; y: number; width: number; height: number; tilt: number }
) {
  ctx.save();
  ctx.translate(basket.x, basket.y);
  ctx.rotate(basket.tilt);

  const w = basket.width;
  const h = basket.height;

  // Divine golden aura underneath basket
  const aura = ctx.createRadialGradient(0, 6, 10, 0, 6, w * 0.65);
  aura.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
  aura.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.ellipse(0, 8, w * 0.7, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ornate Brass Thali Plate Outer Rim
  const rimGrad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  rimGrad.addColorStop(0, '#B45309');
  rimGrad.addColorStop(0.2, '#F59E0B');
  rimGrad.addColorStop(0.5, '#FEF08A');
  rimGrad.addColorStop(0.8, '#F59E0B');
  rimGrad.addColorStop(1, '#92400E');

  // Thali Body (Ellipse with depth)
  ctx.beginPath();
  ctx.ellipse(0, 4, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#78350F';
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(0, 0, w / 2, (h * 0.75) / 2, 0, 0, Math.PI * 2);
  ctx.fillStyle = rimGrad;
  ctx.fill();
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Red Velvet Pooja Cloth Center
  const velvetGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, w * 0.38);
  velvetGrad.addColorStop(0, '#DC2626');
  velvetGrad.addColorStop(0.8, '#991B1B');
  velvetGrad.addColorStop(1, '#7F1D1D');
  ctx.beginPath();
  ctx.ellipse(0, 0, (w * 0.8) / 2, ((h * 0.75) * 0.7) / 2, 0, 0, Math.PI * 2);
  ctx.fillStyle = velvetGrad;
  ctx.fill();

  // Sacred Lotus/Swastik Motif in Center of Thali
  ctx.strokeStyle = '#FDE68A';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  // Small center flower
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const px = Math.cos(angle) * 9;
    const py = Math.sin(angle) * 4;
    ctx.beginPath();
    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Brass Ring Rim Beads / Petal Engravings
  ctx.fillStyle = '#FEF3C7';
  const beadCount = 14;
  for (let i = 0; i < beadCount; i++) {
    const angle = (i * Math.PI * 2) / beadCount;
    const bx = Math.cos(angle) * (w / 2 - 3);
    const by = Math.sin(angle) * ((h * 0.75) / 2 - 2);
    ctx.beginPath();
    ctx.arc(bx, by, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Left & Right Brass Handles
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(-w / 2 - 3, -1, 7, Math.PI * 0.5, Math.PI * 1.5);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(w / 2 + 3, -1, 7, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.stroke();

  ctx.restore();
}

function drawItem(ctx: CanvasRenderingContext2D, item: FallingItem) {
  ctx.save();
  ctx.translate(item.x, item.y);
  ctx.rotate(item.rotation);

  const s = item.size;

  if (item.type === 'normal_modak') {
    // 🟡 NORMAL MODAK: Classic Steamed Ukadiche Modak
    const grad = ctx.createLinearGradient(0, -s / 2, 0, s / 2);
    grad.addColorStop(0, '#FEF9C3'); // Soft cream top
    grad.addColorStop(0.5, '#FEF08A');
    grad.addColorStop(1, '#FDE047'); // Warm saffron base

    // Teardrop / Pleated Fluted Modak Shape
    ctx.beginPath();
    ctx.moveTo(0, -s / 2);
    ctx.bezierCurveTo(-s * 0.2, -s * 0.2, -s / 2, 0, -s / 2, s * 0.25);
    ctx.bezierCurveTo(-s / 2, s * 0.5, -s * 0.25, s / 2, 0, s / 2);
    ctx.bezierCurveTo(s * 0.25, s / 2, s / 2, s * 0.5, s / 2, s * 0.25);
    ctx.bezierCurveTo(s / 2, 0, s * 0.2, -s * 0.2, 0, -s / 2);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#EAB308';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Delicate pleats / fluted ridges
    ctx.strokeStyle = '#CA8A04';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -s / 2 + 2);
    ctx.lineTo(0, s / 2 - 2);
    ctx.moveTo(0, -s / 2 + 3);
    ctx.quadraticCurveTo(-s * 0.22, 0, -s * 0.22, s * 0.38);
    ctx.moveTo(0, -s / 2 + 3);
    ctx.quadraticCurveTo(s * 0.22, 0, s * 0.22, s * 0.38);
    ctx.stroke();

    // Saffron Kesar Strand at the Tip
    ctx.fillStyle = '#EA580C';
    ctx.beginPath();
    ctx.arc(0, -s / 2 + 1, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.type === 'golden_modak') {
    // ✨ GOLDEN MODAK: Radiant Divine Prasad with Star Halo
    // Glow behind
    const halo = ctx.createRadialGradient(0, 0, 4, 0, 0, s * 0.85);
    halo.addColorStop(0, 'rgba(251, 191, 36, 0.8)');
    halo.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
    halo.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.85, 0, Math.PI * 2);
    ctx.fill();

    // Polished gold gradient
    const goldGrad = ctx.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2);
    goldGrad.addColorStop(0, '#FFFBEB');
    goldGrad.addColorStop(0.2, '#FDE047');
    goldGrad.addColorStop(0.5, '#F59E0B');
    goldGrad.addColorStop(0.8, '#D97706');
    goldGrad.addColorStop(1, '#92400E');

    ctx.beginPath();
    ctx.moveTo(0, -s / 2);
    ctx.bezierCurveTo(-s * 0.2, -s * 0.2, -s / 2, 0, -s / 2, s * 0.25);
    ctx.bezierCurveTo(-s / 2, s * 0.5, -s * 0.25, s / 2, 0, s / 2);
    ctx.bezierCurveTo(s * 0.25, s / 2, s / 2, s * 0.5, s / 2, s * 0.25);
    ctx.bezierCurveTo(s / 2, 0, s * 0.2, -s * 0.2, 0, -s / 2);
    ctx.closePath();
    ctx.fillStyle = goldGrad;
    ctx.fill();
    ctx.strokeStyle = '#FEF08A';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Golden flutes
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, -s / 2 + 2);
    ctx.lineTo(0, s / 2 - 2);
    ctx.moveTo(0, -s / 2 + 3);
    ctx.quadraticCurveTo(-s * 0.25, 0, -s * 0.25, s * 0.38);
    ctx.moveTo(0, -s / 2 + 3);
    ctx.quadraticCurveTo(s * 0.25, 0, s * 0.25, s * 0.38);
    ctx.stroke();

    // Sparkling jewel highlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-s * 0.15, -s * 0.1, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.type === 'flower') {
    // 🌸 SACRED RED HIBISCUS (Jaswand)
    const petalCount = 5;
    const r = s * 0.42;

    for (let i = 0; i < petalCount; i++) {
      const angle = (i * Math.PI * 2) / petalCount;
      ctx.save();
      ctx.rotate(angle);
      const petGrad = ctx.createRadialGradient(0, -r * 0.6, 2, 0, -r * 0.6, r);
      petGrad.addColorStop(0, '#FDA4AF');
      petGrad.addColorStop(0.4, '#F43F5E');
      petGrad.addColorStop(1, '#BE123C');
      ctx.fillStyle = petGrad;

      ctx.beginPath();
      ctx.ellipse(0, -r * 0.6, r * 0.45, r * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#9F1239';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();
    }

    // Golden Pistil / Stamen in center
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(s * 0.2, -s * 0.25);
    ctx.stroke();
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(s * 0.2, -s * 0.25, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.type === 'durva') {
    // 🌿 SACRED DURVA GRASS BUNDLE
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    // 3 curved grass blades
    ctx.beginPath();
    ctx.moveTo(0, s * 0.35);
    ctx.quadraticCurveTo(-s * 0.35, -s * 0.1, -s * 0.3, -s * 0.4);
    ctx.stroke();

    ctx.strokeStyle = '#34D399';
    ctx.beginPath();
    ctx.moveTo(0, s * 0.35);
    ctx.quadraticCurveTo(0, -s * 0.1, 0, -s * 0.45);
    ctx.stroke();

    ctx.strokeStyle = '#059669';
    ctx.beginPath();
    ctx.moveTo(0, s * 0.35);
    ctx.quadraticCurveTo(s * 0.35, -s * 0.1, s * 0.3, -s * 0.4);
    ctx.stroke();

    // Tied with red sacred Mauli thread at base
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(-5, s * 0.15, 10, 5);
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(-5, s * 0.22, 10, 2);
  } else if (item.type === 'burnt_modak') {
    // 🔥 BURNT MODAK: Overcooked, charred black with embers
    const burntGrad = ctx.createLinearGradient(0, -s / 2, 0, s / 2);
    burntGrad.addColorStop(0, '#374151');
    burntGrad.addColorStop(0.6, '#1F2937');
    burntGrad.addColorStop(1, '#111827');

    ctx.beginPath();
    ctx.moveTo(0, -s / 2);
    ctx.bezierCurveTo(-s * 0.2, -s * 0.2, -s / 2, 0, -s / 2, s * 0.25);
    ctx.bezierCurveTo(-s / 2, s * 0.5, -s * 0.25, s / 2, 0, s / 2);
    ctx.bezierCurveTo(s * 0.25, s / 2, s / 2, s * 0.5, s / 2, s * 0.25);
    ctx.bezierCurveTo(s / 2, 0, s * 0.2, -s * 0.2, 0, -s / 2);
    ctx.closePath();
    ctx.fillStyle = burntGrad;
    ctx.fill();
    ctx.strokeStyle = '#4B5563';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Red glowing ember crack
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-s * 0.15, 0);
    ctx.lineTo(0, s * 0.15);
    ctx.lineTo(s * 0.2, s * 0.05);
    ctx.stroke();

    // Charcoal smoke puff at top
    ctx.fillStyle = 'rgba(75, 85, 99, 0.7)';
    ctx.beginPath();
    ctx.arc(0, -s * 0.55, 3.5, 0, Math.PI * 2);
    ctx.arc(3, -s * 0.7, 4.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.type === 'bomb') {
    // 💣 WRONG OBJECT: Traditional festive firecracker / cracked clay with lit spark fuse
    // Pot body
    const potGrad = ctx.createRadialGradient(-3, -2, 2, 0, 2, s * 0.4);
    potGrad.addColorStop(0, '#78350F');
    potGrad.addColorStop(0.7, '#451A03');
    potGrad.addColorStop(1, '#1F2937');

    ctx.beginPath();
    ctx.arc(0, 3, s * 0.38, 0, Math.PI * 2);
    ctx.fillStyle = potGrad;
    ctx.fill();
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Fuse
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.35 + 3);
    ctx.quadraticCurveTo(s * 0.2, -s * 0.5, s * 0.15, -s * 0.65);
    ctx.stroke();

    // Lit spark flame
    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.arc(s * 0.15, -s * 0.65, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(s * 0.15, -s * 0.65, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}
