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
      { primary: '#ff00ff', secondary: '#00ffff', dark: '#111', glow: 'rgba(255, 0, 255, 0.4)' }, // Neon Cyber
      { primary: '#f59e0b', secondary: '#ef4444', dark: '#111', glow: 'rgba(245, 158, 11, 0.4)' }, // Blaze
      { primary: '#10b981', secondary: '#059669', dark: '#0a0a0a', glow: 'rgba(16, 185, 129, 0.4)' }, // Matrix
      { primary: '#3b82f6', secondary: '#8b5cf6', dark: '#111', glow: 'rgba(59, 130, 246, 0.4)' }  // Plasma
    ];
    
    const palette = palettes[Math.floor(rand() * palettes.length)];
    
    return {
      palette,
      bodyType: Math.floor(rand() * 3),
      eyeType: Math.floor(rand() * 4),
      hasCrest: rand() > 0.4,
      cyberOverlay: rand() > 0.6,
      wingStyle: Math.floor(rand() * 3),
      animDur: 2 + rand() * 2
    };
  }, [seed]);

  const { palette, bodyType, eyeType, hasCrest, cyberOverlay, wingStyle, animDur } = assets;

  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <defs>
          <filter id={`f-${seed}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <style>
            {`
              .rooster-group { animation: breathe-${seed} ${animDur}s ease-in-out infinite; transform-origin: 50% 80%; }
              @keyframes breathe-${seed} { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.03) translateY(-1px); } }
              .rank-aura { animation: rotate 8s linear infinite; transform-origin: center; }
              @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}
          </style>
        </defs>

        {/* Rank Aura */}
        {rank !== "COMMON" && (
           <circle cx="50" cy="55" r="42" fill="none" stroke={palette.primary} strokeWidth="0.5" strokeDasharray="4 8" className="rank-aura" opacity="0.4" />
        )}

        <g className="rooster-group">
          {/* Body */}
          <path 
            d={bodyType === 0 ? "M30,70 Q50,90 70,70 Q75,45 50,45 Q25,45 30,70" : "M30,75 L70,75 L65,45 L35,45 Z"} 
            fill={palette.dark} 
            stroke={palette.primary} 
            strokeWidth="2"
            filter={`url(#f-${seed})`}
          />

          {/* Wing */}
          <path 
            d={wingStyle === 0 ? "M40,60 Q20,50 35,75" : "M40,55 L20,45 L30,75"} 
            fill="none" 
            stroke={palette.secondary} 
            strokeWidth="3" 
            strokeLinecap="round" 
          />

          {/* Neck & Head */}
          <path d="M50,45 Q55,25 50,18" fill="none" stroke={palette.primary} strokeWidth="8" strokeLinecap="round" />
          <circle cx="50" cy="18" r="10" fill={palette.dark} stroke={palette.primary} strokeWidth="2" />

          {/* Eye */}
          <circle cx={54} cy={16} r={eyeType === 0 ? 3 : 2} fill={eyeType === 1 ? palette.secondary : "#fff"} />
          {eyeType === 2 && <rect x="52" y="14" width="6" height="4" fill={palette.primary} opacity="0.8" />}

          {/* Beak */}
          <path d="M60,18 L72,22 L60,26 Z" fill="#f59e0b" />

          {/* Crest */}
          {hasCrest && (
            <path d="M42,12 L48,2 L52,10 L58,2 L62,15" fill="none" stroke={palette.secondary} strokeWidth="2" strokeLinecap="round" />
          )}

          {/* Cyber Lines */}
          {cyberOverlay && (
            <g opacity="0.5" stroke={palette.secondary} strokeWidth="0.5">
              <line x1="35" y1="65" x2="45" y2="75" />
              <line x1="65" y1="65" x2="55" y2="75" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};