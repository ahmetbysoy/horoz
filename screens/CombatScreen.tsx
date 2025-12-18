import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { feedbackService } from '../services/feedbackService';

// --- PHYSICS CONSTANTS ---
const GRAVITY = 0.4; // Yerçekimi azaltıldı (Daha hafif hissettirir)
const AIR_DRAG = 0.995; // Hava direnci azaltıldı (Hızını daha uzun süre korur)
const BOUNCE_DAMPING = 0.6;
const SLING_FORCE_MULTIPLIER = 0.25; // Fırlatma gücü artırıldı
const MAX_DRAG_DISTANCE = 160; // Çekme mesafesi uzatıldı (Daha fazla gerilebilir)
const ENEMY_RADIUS = 45;
const PLAYER_RADIUS = 35;

export const CombatScreen: React.FC = () => {
  const { state, resolveCombat, closeCombat } = useGame();
  const { activeCombat } = state;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Game Logic State (Refs for performance, bypassing React render cycle)
  const gameState = useRef({
    width: 0,
    height: 0,
    anchor: { x: 0, y: 0 }, // Slingshot center
    player: { x: 0, y: 0, vx: 0, vy: 0, isFlying: false, isDragging: false, rotation: 0 },
    enemy: { x: 0, y: 0, vx: 3, vy: 0, hp: 100, maxHp: 100 },
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
    dragStart: { x: 0, y: 0 },
    gameOver: false,
    scoreShown: false
  });

  // UI State (Only for overlays like HP bars and modals)
  const [uiState, setUiState] = useState({
    playerHP: 100,
    enemyHP: 100,
    gameOverType: null as 'WIN' | 'LOSE' | null
  });

  // Assets
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // --- INITIALIZATION ---
  useEffect(() => {
    if (!activeCombat) return;

    // Load Sprites (Using simple circles/emojis via canvas drawing, but setup for images)
    setAssetsLoaded(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        gameState.current.width = canvas.width;
        gameState.current.height = canvas.height;
        
        // Set Initial Positions
        gameState.current.anchor = { x: canvas.width / 2, y: canvas.height - 180 };
        resetPlayerPosition();
        
        gameState.current.enemy.x = canvas.width / 2;
        gameState.current.enemy.y = 150;
        gameState.current.enemy.vx = 3;
        
        gameState.current.enemy.maxHp = activeCombat.enemyRooster.stats.health;
        gameState.current.enemy.hp = activeCombat.enemyRooster.stats.health;
      }
    };

    window.addEventListener('resize', resize);
    resize();
    feedbackService.playBattleStart();

    // Game Loop
    let animationFrameId: number;
    const loop = () => {
      update();
      draw();
      animationFrameId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const resetPlayerPosition = () => {
    gameState.current.player.x = gameState.current.anchor.x;
    gameState.current.player.y = gameState.current.anchor.y;
    gameState.current.player.vx = 0;
    gameState.current.player.vy = 0;
    gameState.current.player.isFlying = false;
    gameState.current.player.isDragging = false;
    gameState.current.player.rotation = 0;
  };

  // --- PHYSICS ENGINE ---
  const update = () => {
    const state = gameState.current;
    if (state.gameOver) return;

    // 1. Enemy AI
    state.enemy.x += state.enemy.vx;
    if (state.enemy.x > state.width - 50 || state.enemy.x < 50) {
      state.enemy.vx *= -1;
    }

    // 2. Player Physics
    if (state.player.isFlying) {
      // Gravity
      state.player.vy += GRAVITY;
      
      // Drag
      state.player.vx *= AIR_DRAG;
      state.player.vy *= AIR_DRAG;

      // Move
      state.player.x += state.player.vx;
      state.player.y += state.player.vy;

      // Rotation based on velocity
      state.player.rotation = Math.atan2(state.player.vy, state.player.vx);

      // Wall Collisions
      if (state.player.x < PLAYER_RADIUS) {
        state.player.x = PLAYER_RADIUS;
        state.player.vx *= -BOUNCE_DAMPING;
      } else if (state.player.x > state.width - PLAYER_RADIUS) {
        state.player.x = state.width - PLAYER_RADIUS;
        state.player.vx *= -BOUNCE_DAMPING;
      }

      // Ceiling Collision
      if (state.player.y < PLAYER_RADIUS) {
        state.player.y = PLAYER_RADIUS;
        state.player.vy *= -BOUNCE_DAMPING;
      }

      // Floor Collision (Miss)
      if (state.player.y > state.height + PLAYER_RADIUS) {
        handleMiss();
      }

      // Enemy Collision
      const dx = state.player.x - state.enemy.x;
      const dy = state.player.y - state.enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < PLAYER_RADIUS + ENEMY_RADIUS) {
        handleHit();
      }
    }

    // 3. Particles
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2; // particle gravity
      p.life -= 0.05;
      if (p.life <= 0) state.particles.splice(i, 1);
    }
  };

  const handleHit = () => {
    const state = gameState.current;
    
    // Create explosion
    createParticles(state.player.x, state.player.y, '#ef4444', 15);
    createParticles(state.player.x, state.player.y, '#fbbf24', 10);
    
    feedbackService.playHit();
    
    // Damage logic
    const dmg = activeCombat!.playerRooster.stats.attack * (1 + Math.abs(state.player.vy * 0.1)); // Speed bonus
    state.enemy.hp = Math.max(0, state.enemy.hp - dmg);
    
    // UI Update
    setUiState(prev => ({ ...prev, enemyHP: state.enemy.hp }));

    if (state.enemy.hp <= 0) {
      endGame('WIN');
    } else {
      // Bounce back
      state.player.vy = -Math.abs(state.player.vy) * 0.5;
      state.player.vx = -state.player.vx * 0.5;
      
      // Auto reset after short delay
      setTimeout(() => {
          if (!state.gameOver) resetPlayerPosition();
      }, 500);
    }
  };

  const handleMiss = () => {
    const state = gameState.current;
    feedbackService.playError();
    
    // Take damage
    const dmg = activeCombat!.enemyRooster.stats.attack;
    const newHp = Math.max(0, uiState.playerHP - dmg);
    
    setUiState(prev => ({ ...prev, playerHP: newHp }));

    if (newHp <= 0) {
      endGame('LOSE');
    } else {
      resetPlayerPosition();
    }
  };

  const endGame = (type: 'WIN' | 'LOSE') => {
    gameState.current.gameOver = true;
    
    if (type === 'WIN') {
        feedbackService.playSuccess();
        resolveCombat(activeCombat!.playerRooster.id, { gold: 500, xp: 100 });
    } else {
        feedbackService.playError();
        resolveCombat(activeCombat!.enemyRooster.id, { gold: 10, xp: 5 });
    }
    
    setUiState(prev => ({ ...prev, gameOverType: type }));
  };

  const createParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      gameState.current.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1.0,
        color
      });
    }
  };

  // --- RENDER ENGINE ---
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const state = gameState.current;

    // Clear
    ctx.clearRect(0, 0, state.width, state.height);

    // 1. Draw Background Grid
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)'; // Purple tint
    ctx.lineWidth = 1;
    const gridSize = 40;
    
    for (let x = 0; x < state.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, state.height); ctx.stroke();
    }
    for (let y = 0; y < state.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(state.width, y); ctx.stroke();
    }

    // 2. Trajectory Line (Only when dragging)
    if (state.player.isDragging) {
      ctx.beginPath();
      let simX = state.player.x;
      let simY = state.player.y;
      
      // Calculate launch vector
      const dx = state.anchor.x - state.player.x;
      const dy = state.anchor.y - state.player.y;
      let simVx = dx * SLING_FORCE_MULTIPLIER;
      let simVy = dy * SLING_FORCE_MULTIPLIER;

      ctx.moveTo(simX, simY);
      
      for (let i = 0; i < 25; i++) {
        simVy += GRAVITY;
        simVx *= AIR_DRAG;
        simVy *= AIR_DRAG;
        simX += simVx;
        simY += simVy;
        ctx.lineTo(simX, simY);
        // Stop drawing if hits floor
        if (simY > state.height) break;
      }
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 3. Elastic Bands (Back)
    if (!state.player.isFlying) {
      ctx.beginPath();
      ctx.moveTo(state.anchor.x - 30, state.anchor.y); // Left post
      ctx.lineTo(state.player.x, state.player.y);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#3730a3'; // Indigo
      ctx.stroke();
    }

    // 4. Enemy
    ctx.save();
    ctx.translate(state.enemy.x, state.enemy.y);
    // Glow
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 20;
    // Body
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath(); ctx.arc(0, 0, ENEMY_RADIUS, 0, Math.PI * 2); ctx.fill();
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-15, -10, 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(15, -10, 8, 0, Math.PI * 2); ctx.fill();
    // Angry Brows
    ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-25, -20); ctx.lineTo(-5, -5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(25, -20); ctx.lineTo(5, -5); ctx.stroke();
    // Beak
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath(); ctx.moveTo(-10, 5); ctx.lineTo(10, 5); ctx.lineTo(0, 20); ctx.fill();
    ctx.restore();

    // 5. Player
    ctx.save();
    ctx.translate(state.player.x, state.player.y);
    ctx.rotate(state.player.rotation);
    // Glow
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 15;
    // Body
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath(); ctx.arc(0, 0, PLAYER_RADIUS, 0, Math.PI * 2); ctx.fill();
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(10, -10, 6, 0, Math.PI * 2); ctx.fill();
    // Beak
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(25, 5); ctx.lineTo(10, 10); ctx.fill();
    // Comb
    ctx.fillStyle = '#dc2626';
    ctx.beginPath(); ctx.arc(-5, -25, 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-15, -20, 6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // 6. Elastic Bands (Front)
    if (!state.player.isFlying) {
      ctx.beginPath();
      ctx.moveTo(state.anchor.x + 30, state.anchor.y); // Right post
      ctx.lineTo(state.player.x, state.player.y);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#3730a3';
      ctx.stroke();
      
      // Slingshot Posts
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(state.anchor.x - 35, state.anchor.y, 10, 60);
      ctx.fillRect(state.anchor.x + 25, state.anchor.y, 10, 60);
    }

    // 7. Particles
    state.particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.random() * 3 + 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

  };

  // --- INPUT HANDLERS ---
  const getPointerPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const onStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameState.current.player.isFlying || gameState.current.gameOver) return;
    
    const pos = getPointerPos(e);
    const dist = Math.hypot(pos.x - gameState.current.player.x, pos.y - gameState.current.player.y);
    
    // Only grab if close to bird
    if (dist < 60) {
      gameState.current.player.isDragging = true;
      e.preventDefault(); // Prevent scrolling
    }
  };

  const onMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!gameState.current.player.isDragging) return;
    
    const pos = getPointerPos(e);
    const anchor = gameState.current.anchor;
    
    // Calculate vector from anchor to mouse
    const dx = pos.x - anchor.x;
    const dy = pos.y - anchor.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Clamp distance
    const clamp = Math.min(dist, MAX_DRAG_DISTANCE);
    const angle = Math.atan2(dy, dx);
    
    gameState.current.player.x = anchor.x + Math.cos(angle) * clamp;
    gameState.current.player.y = anchor.y + Math.sin(angle) * clamp;
    
    // Rotation faces opposite to pull
    gameState.current.player.rotation = angle + Math.PI; // Face towards anchor
  };

  const onEnd = () => {
    if (!gameState.current.player.isDragging) return;
    
    const state = gameState.current;
    state.player.isDragging = false;
    
    const dx = state.anchor.x - state.player.x;
    const dy = state.anchor.y - state.player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 20) {
      // Fire!
      state.player.vx = dx * SLING_FORCE_MULTIPLIER;
      state.player.vy = dy * SLING_FORCE_MULTIPLIER;
      state.player.isFlying = true;
      feedbackService.playClick();
    } else {
      // Cancel
      resetPlayerPosition();
    }
  };

  if (!activeCombat || !activeCombat.playerRooster || !activeCombat.enemyRooster) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900 flex flex-col font-rajdhani overflow-hidden">
      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-4 z-20 flex justify-between pointer-events-none">
          {/* Player HP */}
          <div className="w-1/3">
             <div className="text-xs text-blue-400 font-bold mb-1 shadow-black drop-shadow-md">{activeCombat.playerRooster.name}</div>
             <div className="h-4 bg-gray-900 rounded-full overflow-hidden border border-blue-900">
                <div 
                    className="h-full bg-blue-500 transition-all duration-300" 
                    style={{ width: `${(uiState.playerHP / 100) * 100}%` }}
                ></div>
             </div>
          </div>
          
          <div className="text-4xl font-black text-white/10 italic">VS</div>

          {/* Enemy HP */}
          <div className="w-1/3 text-right">
             <div className="text-xs text-red-500 font-bold mb-1 shadow-black drop-shadow-md">{activeCombat.enemyRooster.name}</div>
             <div className="h-4 bg-gray-900 rounded-full overflow-hidden border border-red-900">
                <div 
                    className="h-full bg-red-600 transition-all duration-300" 
                    style={{ width: `${(uiState.enemyHP / gameState.current.enemy.maxHp) * 100}%` }}
                ></div>
             </div>
          </div>
      </div>

      {/* Main Game Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full touch-none"
        onMouseDown={onStart}
        onMouseMove={onMove}
        onMouseUp={onEnd}
        onMouseLeave={onEnd}
        onTouchStart={onStart}
        onTouchMove={onMove}
        onTouchEnd={onEnd}
      />

      {/* Tutorial Hint */}
      {!uiState.gameOverType && !gameState.current.player.isFlying && !gameState.current.player.isDragging && (
          <div className="absolute bottom-10 left-0 w-full text-center pointer-events-none animate-pulse">
             <span className="bg-black/50 text-white px-4 py-2 rounded-full text-sm font-bold border border-white/20">
                ÇEK VE BIRAK 👇
             </span>
          </div>
      )}

      {/* Game Over Modal */}
      {uiState.gameOverType && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in">
              <h1 className={`text-6xl font-black mb-4 tracking-tighter italic ${uiState.gameOverType === 'WIN' ? 'text-yellow-500' : 'text-gray-500'}`}>
                  {uiState.gameOverType === 'WIN' ? 'ZAFER!' : 'YENİLGİ'}
              </h1>
              <div className="flex space-x-4">
                  <button 
                    onClick={closeCombat}
                    className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform"
                  >
                      ŞEHRE DÖN
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};