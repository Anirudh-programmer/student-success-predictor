import React from 'react';

export interface BrandLogoProps {
  size?: number;
  variant?: 'full' | 'mark' | 'compact' | 'icon';
  theme?: 'dark' | 'light' | 'monochrome';
  className?: string;
}

/**
 * Veridian Brand Logo
 * Geometric vector identity combining an open book of knowledge,
 * a growing leaf of academic progression, and an upward trajectory apex
 * crowned by a muted-gold evidence compass pip.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 32,
  variant = 'full',
  theme = 'light',
  className = ''
}) => {
  // Color tokens based on theme
  const colors = {
    dark: {
      leftWing: '#2A5A4D', // Forest mid
      rightWing: '#407263', // Forest light
      centerStem: '#64866F', // Sage
      goldPip: '#D4B87A', // Muted gold
      bgCircle: '#102E27', // Deep forest
      primaryText: '#FFFFFF',
      subText: '#9CB0A4',
      badgeBg: 'rgba(100, 134, 111, 0.2)',
      badgeText: '#A8C2B1',
      badgeBorder: 'rgba(100, 134, 111, 0.35)'
    },
    light: {
      leftWing: '#173F35', // Deep Forest
      rightWing: '#255447', // Forest
      centerStem: '#64866F', // Sage
      goldPip: '#C6A96B', // Muted gold
      bgCircle: '#E6EEE5', // Pale sage
      primaryText: '#102E27',
      subText: '#66736D',
      badgeBg: '#F0F4EF',
      badgeText: '#3B5B44',
      badgeBorder: '#DCE4DB'
    },
    monochrome: {
      leftWing: 'currentColor',
      rightWing: 'currentColor',
      centerStem: 'currentColor',
      goldPip: 'currentColor',
      bgCircle: 'transparent',
      primaryText: 'currentColor',
      subText: 'currentColor',
      badgeBg: 'transparent',
      badgeText: 'currentColor',
      badgeBorder: 'currentColor'
    }
  }[theme];

  const iconSvg = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-200 veridian-logo-reveal"
      aria-label="Veridian Student Success Intelligence Logo"
    >
      {/* Background soft shield/squircle */}
      <rect
        x="1.5"
        y="1.5"
        width="41"
        height="41"
        rx="11"
        fill={colors.bgCircle}
        stroke={theme === 'dark' ? '#254E43' : '#D6E2D4'}
        strokeWidth="1.2"
      />

      {/* Left Wing / Open Book Page */}
      <path
        d="M22 33.5C16.8 31.8 11.2 30.5 7.5 32.2C8.6 24.2 12.5 16.5 19.8 12.8C20.6 18.2 21.3 25.8 22 33.5Z"
        fill={colors.leftWing}
      />

      {/* Right Wing / Sprouting Leaf Page */}
      <path
        d="M22 33.5C27.2 31.8 32.8 30.5 36.5 32.2C35.4 24.2 31.5 16.5 24.2 12.8C23.4 18.2 22.7 25.8 22 33.5Z"
        fill={colors.rightWing}
      />

      {/* Center Stem / Vein of Knowledge */}
      <path
        d="M22 33.5C21.4 24.8 20.8 17.5 22 9C23.2 17.5 22.6 24.8 22 33.5Z"
        fill={colors.centerStem}
      />

      {/* Muted Gold Apex Compass / Star Pip */}
      <path
        d="M22 4.2L23.8 6.8L22 9.4L20.2 6.8Z"
        fill={colors.goldPip}
      />
      {/* Subtle small gold center point */}
      <circle cx="22" cy="6.8" r="0.9" fill="#FFFFFF" opacity="0.8" />
    </svg>
  );

  if (variant === 'mark' || variant === 'icon') {
    return <div className={`inline-flex items-center ${className}`}>{iconSvg}</div>;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {iconSvg}
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className="font-bold text-sm tracking-tight leading-tight truncate"
            style={{ color: colors.primaryText }}
          >
            Student Success
          </span>
          <span
            className="text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.2 rounded"
            style={{
              backgroundColor: colors.badgeBg,
              color: colors.badgeText,
              border: `1px solid ${colors.badgeBorder}`
            }}
          >
            Veridian
          </span>
        </div>
        <p
          className="text-[11px] font-medium tracking-tight m-0 leading-tight truncate"
          style={{ color: colors.subText }}
        >
          Predictor Platform
        </p>
      </div>
    </div>
  );
};
