import React, { useMemo } from 'react';

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

    const palettes = [
      { primary: '#ff00ff', secondary: '#00ffff', dark: '#0a0a0a' }, // Neon
      { primary: '#10b981', secondary: '#059669', dark: '#050505' }, // Cyber
      { primary: '#fbbf24', secondary: '#ef4444', dark: '#111' },    // Flame
      { primary: '#8b5cf6', secondary: '#3b82f6', dark: '#0a0a0a' }, // Plasma
    ];
    
    const rankAuras: Record<string, string> = {
      COMMON: 'none',
      RARE: '0 0 10px #3b82f6',
      EPIC: '0 0 15px #a855f7',
      LEGENDARY: '0 0 20px #eab308',
      MYTHIC: '0 0 25px #ef4444'
    };
    
    const basePalette = palettes[Math.floor(rand() * palettes.length)];

    return {
      palette: basePalette,
      aura: rankAuras[rank || 'COMMON'],
      headType: Math.floor(rand() * 4),
      bodyType: Math.floor(rand() * 3),
      wingType: Math.floor(rand() * 3),
      tailType: Math.floor(rand() * 3),
      animDur: 2 + rand() * 2
    };
  }, [seed, rank]);

  const { palette, aura, headType, bodyType, wingType, tailType, animDur } = assets;

  return (
    <div className={`relative inline-block select-none ${className}`} style={{ width: size, height: size, filter: `drop-shadow(${aura})` }}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <defs>
          <style>
            {`
              .rooster-base-${seed} { animation: pulse-${seed} ${animDur}s ease-in-out infinite; transform-origin: center bottom; }
              @keyframes pulse-${seed} { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02) translateY(-2px); } }
            `}
          </style>
        </defs>

        <g className={`rooster-base-${seed}`}>
          {/* Kuyruk */}
          <path 
            d={tailType === 0 ? "M30,60 Q10,40 20,20 Q30,15 40,40" : "M30,65 L10,30 L30,40 L15,20 L35,35"} 
            fill="none" 
            stroke={palette.primary} 
            strokeWidth="3" 
            strokeLinecap="round" 
            opacity="0.6" 
          />

          {/* Gövde */}
          <path 
            d={bodyType === 0 ? "M30,70 Q50,95 70,70 Q75,45 50,45 Q25,45 30,70" : "M30,50 L70,50 L75,80 L25,80 Z"} 
            fill={palette.dark} 
            stroke={palette.primary} 
            strokeWidth="2" 
          />

          {/* Kanat */}
          <path 
            d={wingType === 0 ? "M45,60 Q65,70 55,50" : "M40,55 L65,55 L55,75 Z"} 
            fill="#1a1a1a" 
            stroke={palette.secondary} 
            strokeWidth="1.5" 
          />

          {/* Boyun */}
          <path d="M50,45 Q55,30 50,22" fill="none" stroke={palette.primary} strokeWidth="8" strokeLinecap="round" />
          
          {/* Kafa */}
          <circle cx="50" cy="22" r="12" fill={palette.dark} stroke={palette.primary} strokeWidth="2" />
          
          {/* İbik (Crest) */}
          <path 
            d={headType === 0 ? "M42,15 Q50,-5 58,15" : "M45,12 L50,2 L55,12 Z"} 
            fill={palette.secondary} 
            opacity="0.8" 
          />

          {/* Gaga */}
          <path d="M60,22 L75,26 L60,30 Z" fill="#f59e0b" />

          {/* Göz */}
          <circle cx="56" cy="19" r="2.5" fill="#fff" />
          <circle cx="57" cy="19" r="1" fill="#000" />
          
          {/* Ayaklar */}
          <g stroke="#333" strokeWidth="3" strokeLinecap="round">
            <line x1="42" y1="75" x2="40" y2="92" />
            <line x1="58" y1="75" x2="60" y2="92" />
          </g>
        </g>
      </svg>
    </div>
  );
};