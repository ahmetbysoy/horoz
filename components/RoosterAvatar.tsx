import React, { useMemo } from 'react';

// Seeded random helper
const mulberry32 = (a: number) => {
  return () => {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

const cyrb128 = (str: string) => {
  let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
}

interface RoosterAvatarProps {
  seed: string;
  size?: number;
  className?: string;
  rank?: string;
}

export const RoosterAvatar: React.FC<RoosterAvatarProps> = ({ seed, size = 120, className = "", rank = "COMMON" }) => {
  const assets = useMemo(() => {
    const seedParts = cyrb128(seed);
    const rand = mulberry32(seedParts[0]);

    // Color Palettes
    const palettes = [
      { primary: '#ff00ff', secondary: '#00ffff', dark: '#0a0a0a', glow: '#ff00ff' }, // Cyberpunk Classic
      { primary: '#10b981', secondary: '#059669', dark: '#050505', glow: '#10b981' }, // Matrix Green
      { primary: '#fbbf24', secondary: '#ef4444', dark: '#111', glow: '#fbbf24' },    // Solar Flare
      { primary: '#8b5cf6', secondary: '#3b82f6', dark: '#0a0a0a', glow: '#8b5cf6' }, // Neon Void
    ];
    
    // Rank Overrides
    const rankColors: Record<string, string> = {
      COMMON: '#9ca3af',
      RARE: '#3b82f6',
      EPIC: '#a855f7',
      LEGENDARY: '#eab308',
      MYTHIC: '#ef4444'
    };
    
    const palette = palettes[Math.floor(rand() * palettes.length)];
    const primaryColor = rank === 'COMMON' ? palette.primary : rankColors[rank] || palette.primary;

    return {
      palette: { ...palette, primary: primaryColor },
      bodyShape: Math.floor(rand() * 3), // 0: Curvy, 1: Square, 2: Cyber-Tank
      crestType: Math.floor(rand() * 4), // Mohawk, Classic, Spike, Tech
      eyeStyle: Math.floor(rand() * 3),  // Organic, Lens, VR
      hasCyberWing: rand() > 0.5,
      tailIntensity: 0.5 + rand() * 1.5,
      animSpeed: 2 + rand() * 2
    };
  }, [seed, rank]);

  const { palette, bodyShape, crestType, eyeStyle, hasCyberWing, tailIntensity, animSpeed } = assets;

  return (
    <div className={`relative inline-block select-none ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
        <defs>
          <filter id={`glow-${seed}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id={`grad-${seed}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.primary} />
            <stop offset="100%" stopColor={palette.secondary} />
          </linearGradient>
          <style>
            {`
              .rooster-base { animation: breathe-${seed} ${animSpeed}s ease-in-out infinite; transform-origin: 50% 80%; }
              @keyframes breathe-${seed} { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02) translateY(-2px); } }
              .cyber-line { stroke-dasharray: 100; stroke-dashoffset: 100; animation: dash 3s linear infinite; }
              @keyframes dash { to { stroke-dashoffset: 0; } }
            `}
          </style>
        </defs>

        {/* Outer Aura for Rare+ */}
        {rank !== 'COMMON' && (
           <circle cx="50" cy="55" r="45" fill="none" stroke={palette.primary} strokeWidth="0.5" strokeDasharray="2 4" opacity="0.3" className="animate-spin" style={{ animationDuration: '20s' }} />
        )}

        <g className="rooster-base">
          {/* Tail */}
          <g opacity="0.7">
            <path d="M30,65 Q10,40 25,25 Q15,15 35,20 Q25,5 45,15" fill="none" stroke={palette.primary} strokeWidth="3" strokeLinecap="round" filter={`url(#glow-${seed})`} />
          </g>

          {/* Legs */}
          <g stroke="#333" strokeWidth="3" strokeLinecap="round">
            <line x1="42" y1="75" x2="40" y2="92" />
            <line x1="58" y1="75" x2="60" y2="92" />
            <path d="M40,92 L35,96 M40,92 L45,96" />
            <path d="M60,92 L55,96 M60,92 L65,96" />
          </g>

          {/* Body */}
          <g>
             {bodyShape === 0 && <path d="M30,70 Q50,95 70,70 Q75,45 50,45 Q25,45 30,70" fill={palette.dark} stroke={palette.primary} strokeWidth="2" />}
             {bodyShape === 1 && <path d="M30,50 L70,50 L75,75 L25,75 Z" fill={palette.dark} stroke={palette.primary} strokeWidth="2" />}
             {bodyShape === 2 && (
               <g>
                 <rect x="28" y="48" width="44" height="28" rx="2" fill={palette.dark} stroke={palette.primary} strokeWidth="2" />
                 <line x1="28" y1="58" x2="72" y2="58" stroke={palette.primary} strokeWidth="0.5" opacity="0.3" />
                 <circle cx="35" cy="53" r="1.5" fill={palette.secondary} className="animate-pulse" />
               </g>
             )}
          </g>

          {/* Wing */}
          <g transform="translate(40, 55)">
            {hasCyberWing ? (
              <path d="M0,0 L35,-5 L30,20 L-5,10 Z" fill="#222" stroke={palette.secondary} strokeWidth="2" filter={`url(#glow-${seed})`} />
            ) : (
              <path d="M0,0 Q15,20 30,-5 Q20,10 0,0" fill="#222" stroke={palette.secondary} strokeWidth="2" />
            )}
            {/* Cyber detail on wing */}
            <line x1="5" y1="5" x2="25" y2="5" stroke={palette.primary} strokeWidth="0.5" opacity="0.5" />
          </g>

          {/* Neck & Head */}
          <path d="M50,45 Q55,30 50,22" fill="none" stroke={palette.primary} strokeWidth="8" strokeLinecap="round" />
          <circle cx="50" cy="22" r="12" fill={palette.dark} stroke={palette.primary} strokeWidth="2" />

          {/* Crest / Mohawk */}
          <g>
            {crestType === 0 && <path d="M42,15 Q50,-5 58,15" fill="none" stroke={palette.secondary} strokeWidth="4" strokeLinecap="round" filter={`url(#glow-${seed})`} />}
            {crestType === 1 && <path d="M45,12 L50,2 L55,12" fill={palette.secondary} opacity="0.8" />}
            {crestType === 2 && (
               <g stroke={palette.secondary} strokeWidth="2">
                 <line x1="45" y1="12" x2="45" y2="4" />
                 <line x1="50" y1="12" x2="50" y2="2" />
                 <line x1="55" y1="12" x2="55" y2="4" />
               </g>
            )}
            {crestType === 3 && <rect x="46" y="5" width="8" height="8" rx="1" fill={palette.secondary} filter={`url(#glow-${seed})`} />}
          </g>

          {/* Beak */}
          <path d="M60,22 L75,26 L60,30 Z" fill="#f59e0b" stroke="#000" strokeWidth="0.5" />

          {/* Eye */}
          <g transform="translate(56, 19)">
            {eyeStyle === 0 && <circle r="3" fill="#fff" />}
            {eyeStyle === 1 && <circle r="3" fill="#000" stroke={palette.primary} strokeWidth="1" />}
            {eyeStyle === 2 && <rect x="-4" y="-2" width="8" height="4" fill={palette.secondary} filter={`url(#glow-${seed})`} />}
            <circle r="0.8" fill={palette.primary} className="animate-pulse" />
          </g>

          {/* Cyber Overlay Patterns */}
          <g opacity="0.2" stroke={palette.primary} strokeWidth="0.3">
            <line x1="30" y1="60" x2="70" y2="60" />
            <line x1="50" y1="45" x2="50" y2="75" />
          </g>
        </g>
      </svg>
    </div>
  );
};