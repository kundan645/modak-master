import React from 'react';

interface GaneshaSanctumProps {
  combo: number;
  lastCaughtItem: string | null;
  blessingSparkle: boolean;
}

export const GaneshaSanctum: React.FC<GaneshaSanctumProps> = ({
  combo,
  blessingSparkle,
}) => {
  // Glow aura intensity scales with combo
  const auraGlow = Math.min(1, 0.4 + combo * 0.15);

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-b from-amber-950 via-red-950 to-amber-950 border-b-2 border-amber-500/40 shadow-xl select-none">
      {/* Decorative Traditional Toran (Marigold Garland & Mango Leaves) */}
      <div className="absolute top-0 left-0 right-0 h-4 flex justify-between items-center px-1 pointer-events-none z-20">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="flex items-center -space-x-1">
            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 shadow-sm border border-amber-300/60 animate-pulse" 
                 style={{ animationDuration: `${2 + (i % 3) * 0.5}s` }} />
            <div className="w-3 h-3 rounded-tl-lg rounded-br-lg bg-emerald-700 -rotate-45 shadow-xs" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-3 pt-3.5 pb-2 max-w-4xl mx-auto">
        {/* Left Temple Bell & Diya */}
        <div className="flex items-center space-x-2">
          {/* Hanging Bell */}
          <div className="flex flex-col items-center origin-top animate-[wiggle_3s_ease-in-out_infinite]">
            <div className="w-0.5 h-4 bg-amber-400/80" />
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-amber-300 drop-shadow-[0_2px_4px_rgba(245,158,11,0.5)] fill-amber-400">
              <path d="M12 2C8.5 2 6 5 6 9v5l-2 3v1h16v-1l-2-3V9c0-4-2.5-7-6-7zm0 19a2.5 2.5 0 0 1-2.5-2.5h5A2.5 2.5 0 0 1 12 21z" />
            </svg>
          </div>

          {/* Diya */}
          <div className="hidden sm:flex flex-col items-center">
            {/* Flame */}
            <div className="w-2.5 h-4 bg-gradient-to-t from-orange-500 via-amber-300 to-yellow-100 rounded-full animate-pulse shadow-[0_0_8px_#f59e0b]" />
            {/* Brass Diya Base */}
            <div className="w-6 h-2 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-700 rounded-b-full border-t border-amber-300" />
          </div>
        </div>

        {/* Center: Auspicious Ganesha Divine Iconography & Mandap */}
        <div className="flex flex-col items-center justify-center relative">
          {/* Golden Prabhavali / Divine Halo Aura */}
          <div 
            className="absolute -top-4 w-32 h-32 rounded-full pointer-events-none transition-all duration-500"
            style={{
              background: `radial-gradient(circle, rgba(251,191,36,${auraGlow}) 0%, rgba(245,158,11,${auraGlow * 0.5}) 40%, rgba(0,0,0,0) 70%)`,
              transform: blessingSparkle ? 'scale(1.2)' : 'scale(1)',
            }}
          />

          {/* Sacred Ganesha Motif (Stylized Traditional Auspicious Silhouette) */}
          <div className="relative z-10 flex items-center justify-center">
            <svg viewBox="0 0 120 100" className="w-20 h-16 sm:w-24 sm:h-18 transition-transform duration-300">
              <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FDE68A" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#B45309" />
                </linearGradient>
                <radialGradient id="haloCenter" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.2" />
                </radialGradient>
              </defs>

              {/* Halo ring */}
              <circle cx="60" cy="42" r="32" fill="url(#haloCenter)" stroke="#FBBF24" strokeWidth="1.5" strokeDasharray="3 2" />

              {/* Crown (Mukut) */}
              <path d="M50 24 L60 8 L70 24 L66 26 L60 20 L54 26 Z" fill="url(#goldGrad)" stroke="#78350F" strokeWidth="0.8" />
              <circle cx="60" cy="16" r="2.5" fill="#EF4444" />

              {/* Large Benevolent Ears */}
              {/* Left Ear */}
              <path d="M46 32 C34 30 30 42 36 50 C40 54 46 50 48 46" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
              {/* Right Ear */}
              <path d="M74 32 C86 30 90 42 84 50 C80 54 74 50 72 46" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />

              {/* Ganesha Face & Sacred Trunk (Vakratunda) curving gracefully to the left to hold modak */}
              <path d="M50 34 C50 30 70 30 70 34 C70 42 66 50 64 58 C62 66 52 68 46 64 C42 61 44 56 48 56 C52 56 56 60 58 54 C60 48 64 42 64 36 Z" 
                    fill="url(#goldGrad)" stroke="#78350F" strokeWidth="1.5" />

              {/* Auspicious Tilak / Red Trishul Mark on Forehead */}
              <path d="M57 32 L63 32 L60 38 Z" fill="#DC2626" />
              <line x1="60" y1="28" x2="60" y2="35" stroke="#FDE68A" strokeWidth="1" />

              {/* Modak in Ganesha's Sacred Left Trunk / Hand */}
              <g transform="translate(42, 58) scale(0.65)">
                <path d="M12 2 C8 8 2 14 2 20 C2 24 6 26 12 26 C18 26 22 24 22 20 C22 14 16 8 12 2 Z" fill="#FEF08A" stroke="#D97706" strokeWidth="1.5" />
                <path d="M12 4 L12 24 M7 8 C8 14 8 20 8 24 M17 8 C16 14 16 20 16 24" stroke="#F59E0B" strokeWidth="1" />
              </g>

              {/* Abhaya Mudra (Blessing Hand) on Right */}
              <path d="M76 44 C82 46 84 52 82 58 C80 62 76 60 74 56" fill="url(#goldGrad)" stroke="#B45309" strokeWidth="1.5" />
              <circle cx="78" cy="52" r="2" fill="#DC2626" />

              {/* Kind Eyes */}
              <ellipse cx="56" cy="36" rx="1.8" ry="1.2" fill="#451A03" />
              <ellipse cx="64" cy="36" rx="1.8" ry="1.2" fill="#451A03" />
            </svg>
          </div>

          {/* Sacred Mantra & Blessing Text */}
          <div className="text-center mt-0.5">
            <span className="text-[11px] sm:text-xs font-serif font-bold text-amber-300 tracking-wider flex items-center justify-center gap-1">
              <span>ॐ गं गणपतये नमः</span>
              {combo >= 3 && (
                <span className="bg-amber-500/30 text-amber-200 text-[10px] px-1.5 py-0.5 rounded-full border border-amber-400/50 animate-pulse">
                  {combo >= 5 ? '✨ AARTI RUSH!' : `⚡ ${combo}x BLESSING`}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Right Temple Bell & Diya */}
        <div className="flex items-center space-x-2">
          {/* Diya */}
          <div className="hidden sm:flex flex-col items-center">
            <div className="w-2.5 h-4 bg-gradient-to-t from-orange-500 via-amber-300 to-yellow-100 rounded-full animate-pulse shadow-[0_0_8px_#f59e0b]" />
            <div className="w-6 h-2 bg-gradient-to-r from-amber-700 via-amber-400 to-amber-600 rounded-b-full border-t border-amber-300" />
          </div>

          {/* Hanging Bell */}
          <div className="flex flex-col items-center origin-top animate-[wiggle_3.5s_ease-in-out_infinite]">
            <div className="w-0.5 h-4 bg-amber-400/80" />
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-amber-300 drop-shadow-[0_2px_4px_rgba(245,158,11,0.5)] fill-amber-400">
              <path d="M12 2C8.5 2 6 5 6 9v5l-2 3v1h16v-1l-2-3V9c0-4-2.5-7-6-7zm0 19a2.5 2.5 0 0 1-2.5-2.5h5A2.5 2.5 0 0 1 12 21z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
