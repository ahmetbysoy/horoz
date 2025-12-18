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

    // Palettes
    const palettes = [
      { primary: '#ff00ff', secondary: '#00ffff', dark: '#1a1a1a', glow: 'rgba(0, 255, 255, 0.5)' }, // Cyber
      { primary: '#fbbf24', secondary: '#dc2626', dark: '#1a1a1a', glow: 'rgba(251, 191, 36, 0.5)' }, // Fire
      { primary: '#10b981', secondary: '#064e3b', dark: '#0a0a0a', glow: 'rgba(16, 185, 129, 0.5)' }, // Matrix
      { primary: '#8b5cf6', secondary: '#4c1d95', dark: '#0f172a', glow: 'rgba(139, 92, 246, 0.5)' }, // Void
      { primary: '#ef4444', secondary: '#7f1d1d', dark: '#000000', glow: 'rgba(239, 68, 68, 0.5)' }, // Blood
    ];
    
    const palette = palettes[Math.floor(rand() * palettes.length)];
    
    return {
      palette,
      bodyType: Math.floor(rand() * 3), // 0: Round, 1: Edgy, 2: Cybernetic
      wingType: Math.floor(rand() * 3), // 0: Feathery, 1: Blade, 2: Mechanical
      eyeType: Math.floor(rand() * 3),  // 0: Organic, 1: Cyborg, 2: VR Goggles
      hasCrest: rand() > 0.3,
      cyberParts: rand() > 0.5,
      tailScale: 0.8 + rand() * 0.5,
      animationSpeed: 2 + rand() * 2
    };
  }, [seed]);

  const { palette, bodyType, wingType, eyeType, hasCrest, cyberParts, tailScale, animationSpeed } = assets;

  return (
    <div className={`relative inline-block select-none ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl overflow-visible">
        <defs>
          <filter id={`glow-${seed}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          <linearGradient id={`grad-${seed}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.primary} />
            <stop offset="100%" stopColor={palette.secondary} />
          </linearGradient>

          <style>
            {`
              @keyframes breathe {
                0%, 100% { transform: scale(1) translateY(0); }
                50% { transform: scale(1.02) translateY(-2px); }
              }
              @keyframes scan {
                0% { opacity: 0.3; }
                50% { opacity: 0.8; }
                100% { opacity: 0.3; }
              }
              .rooster-group {
                animation: breathe ${animationSpeed}s ease-in-out infinite;
                transform-origin: 50% 80%;
              }
              .cyber-glow {
                animation: scan 1s ease-in-out infinite;
              }
            `}
          </style>
        </defs>

        <g className="rooster-group">
          {/* Rank Aura */}
          {rank !== "COMMON" && (
            <circle cx="50" cy="55" r="40" fill="none" stroke={palette.primary} strokeWidth="0.5" strokeDasharray="2 4" opacity="0.3" className="animate-spin" style={{ animationDuration: '10s' }} />
          )}

          {/* Tail */}
          <g transform={`scale(${tailScale})`} opacity="0.8">
             <path d="M25,60 Q5,40 20,30 Q10,20 30,25 Q20,10 40,20" fill="none" stroke={palette.primary} strokeWidth="3" strokeLinecap="round" filter={`url(#glow-${seed})`} />
             <path d="M28,65 Q15,50 25,40" fill="none" stroke={palette.secondary} strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Legs */}
          <g stroke="#333" strokeWidth="2.5" strokeLinecap="round">
            <line x1="42" y1="75" x2="38" y2="92" />
            <line x1="58" y1="75" x2="62" y2="92" />
            {/* Feet Claws */}
            <path d="M38,92 L32,96 M38,92 L44,96" />
            <path d="M62,92 L56,96 M62,92 L68,96" />
          </g>

          {/* Body */}
          <g>
            {bodyType === 0 && <circle cx="50" cy="60" r="24" fill={palette.dark} stroke={palette.primary} strokeWidth="2" />}
            {bodyType === 1 && <path d="M30,50 L70,50 L75,75 L25,75 Z" fill={palette.dark} stroke={palette.primary} strokeWidth="2" />}
            {bodyType === 2 && (
               <g>
                 <rect x="30" y="45" width="40" height="30" rx="4" fill={palette.dark} stroke={palette.primary} strokeWidth="2" />
                 <line x1="30" y1="55" x2="70" y2="55" stroke={palette.primary} strokeWidth="0.5" opacity="0.5" />
                 <line x1="30" y1="65" x2="70" y2="65" stroke={palette.primary} strokeWidth="0.5" opacity="0.5" />
               </g>
            )}
          </g>

          {/* Wing */}
          <g>
            {wingType === 0 && <path d="M40,60 Q50,80 70,55 Q60,50 40,60" fill={palette.dark} stroke={palette.secondary} strokeWidth="2" />}
            {wingType === 1 && <path d="M40,55 L75,50 L65,70 Z" fill={palette.dark} stroke={palette.secondary} strokeWidth="2" />}
            {wingType === 2 && (
              <g>
                <path d="M40,55 L75,55 L70,75 L35,65 Z" fill="#222" stroke={palette.secondary} strokeWidth="2" />
                <circle cx="55" cy="62" r="2" fill={palette.primary} className="cyber-glow" />
              </g>
            )}
          </g>

          {/* Neck & Head */}
          <path d="M50,45 Q55,30 50,22" fill="none" stroke={palette.primary} strokeWidth="6" strokeLinecap="round" />
          <circle cx="50" cy="22" r="11" fill={palette.dark} stroke={palette.primary} strokeWidth="2" />

          {/* Crest / Mohawk */}
          {hasCrest && (
            <path d="M42,15 L48,5 L52,12 L58,5 L62,18" fill="none" stroke={palette.secondary} strokeWidth="3" strokeLinecap="round" filter={`url(#glow-${seed})`} />
          )}

          {/* Eye */}
          <g transform="translate(54, 18)">
            {eyeType === 0 && <circle r="3" fill="#fff" stroke={palette.secondary} strokeWidth="1" />}
            {eyeType === 1 && (
              <g>
                <rect x="-3" y="-2" width="6" height="4" fill="#000" stroke={palette.primary} strokeWidth="1" />
                <circle r="1" fill={palette.primary} className="cyber-glow" />
              </g>
            )}
            {eyeType === 2 && <path d="M-5,-3 L5,-3 L5,3 L-5,3 Z" fill={palette.secondary} filter={`url(#glow-${seed})`} />}
            <circle r="0.5" fill="#fff" opacity="0.8" />
          </g>

          {/* Beak */}
          <path d="M60,22 L75,26 L60,30 Z" fill="#f59e0b" stroke="#000" strokeWidth="1" />

          {/* Cyber Details Overlay */}
          {cyberParts && (
            <g opacity="0.6" stroke={palette.primary} strokeWidth="0.5">
              <line x1="40" y1="50" x2="35" y2="40" />
              <circle cx="35" cy="40" r="1" fill={palette.primary} />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};