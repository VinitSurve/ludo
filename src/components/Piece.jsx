import React, { useState, useEffect, useRef } from 'react';
import { PLAYER_COLORS } from '../game/constants';

/**
 * Realistic 3D Ludo Pawn Component
 * Features a spherical head, narrow collar neck, bell body, stepped base,
 * soft contact drop shadow, smooth glossy highlights, and springy jumping animation.
 */
export function Piece({
  piece,
  isLegal = false,
  onClick,
  stackCount = 1,
  size = 'normal',
}) {
  const colorKey = piece.colorKey || 'red';
  const colorConfig = PLAYER_COLORS[colorKey] || PLAYER_COLORS.red;

  // Track jumping state when piece.step updates
  const [isJumping, setIsJumping] = useState(false);
  const prevStepRef = useRef(piece.step);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevStepRef.current = piece.step;
      return;
    }
    if (prevStepRef.current !== piece.step) {
      prevStepRef.current = piece.step;
      setIsJumping(true);
      const timer = setTimeout(() => {
        setIsJumping(false);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [piece.step]);

  const handleClick = (e) => {
    e.stopPropagation();
    if (isLegal && onClick) {
      onClick(piece.id);
    }
  };

  return (
    <div
      className={`pawn-wrapper ${isLegal ? 'pawn-selectable' : ''} ${isJumping ? 'pawn-jumping' : ''} ${piece.state === 'FINISHED' ? 'pawn-finished' : ''}`}
      onClick={handleClick}
      title={`${colorConfig.name} Pawn ${piece.id + 1} (${piece.state})`}
      style={{
        '--legal-glow': colorConfig.hex,
        '--pawn-theme-color': colorConfig.hex,
      }}
    >
      <svg
        viewBox="0 0 44 60"
        className="pawn-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Radial gradient for spherical head */}
          <radialGradient id={`pawn-head-${colorKey}-${piece.id}`} cx="32%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.88" />
            <stop offset="28%" stopColor={colorConfig.bg} />
            <stop offset="62%" stopColor={colorConfig.hex} />
            <stop offset="100%" stopColor={colorConfig.border} />
          </radialGradient>

          {/* Linear gradient for collar */}
          <linearGradient id={`pawn-collar-${colorKey}-${piece.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colorConfig.bg} />
            <stop offset="40%" stopColor={colorConfig.hex} />
            <stop offset="100%" stopColor={colorConfig.border} />
          </linearGradient>

          {/* Linear gradient for bell body */}
          <linearGradient id={`pawn-body-${colorKey}-${piece.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colorConfig.bg} />
            <stop offset="35%" stopColor={colorConfig.hex} />
            <stop offset="82%" stopColor={colorConfig.border} />
            <stop offset="100%" stopColor={colorConfig.accent || '#0F172A'} />
          </linearGradient>

          {/* Base gradient */}
          <radialGradient id={`pawn-base-${colorKey}-${piece.id}`} cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor={colorConfig.bg} />
            <stop offset="45%" stopColor={colorConfig.hex} />
            <stop offset="90%" stopColor={colorConfig.border} />
            <stop offset="100%" stopColor={colorConfig.accent || colorConfig.border} />
          </radialGradient>

          {/* Drop shadow */}
          <filter id={`pawnShadow-${piece.id}`} x="-20%" y="-10%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#0F172A" floodOpacity="0.35" />
          </filter>
        </defs>

        <g filter={`url(#pawnShadow-${piece.id})`}>
          {/* Ground contact shadow with dynamic jump scaling */}
          <ellipse
            cx="22"
            cy="55.5"
            rx="14.5"
            ry="3.5"
            className="pawn-ground-shadow"
            fill="rgba(15,23,42,0.28)"
            style={{ transformOrigin: '22px 55.5px' }}
          />

          {/* 1. Stepped Bottom Pedestal */}
          <path
            d="M 6.5 52 C 6.5 48.5, 37.5 48.5, 37.5 52 C 37.5 55.5, 6.5 55.5, 6.5 52 Z"
            fill={`url(#pawn-base-${colorKey}-${piece.id})`}
            stroke={colorConfig.border}
            strokeWidth="0.8"
          />
          <ellipse
            cx="22"
            cy="50.2"
            rx="13.5"
            ry="2.8"
            fill={`url(#pawn-base-${colorKey}-${piece.id})`}
          />
          <path
            d="M 8.5 50.2 C 9.5 46.5, 34.5 46.5, 35.5 50.2 Z"
            fill={`url(#pawn-body-${colorKey}-${piece.id})`}
          />

          {/* 2. Pawn Bell Body */}
          <path
            d="M 17 23.5 C 17 31, 8.5 42, 8.5 50 C 13.5 52, 30.5 52, 35.5 50 C 35.5 42, 27 31, 27 23.5 Z"
            fill={`url(#pawn-body-${colorKey}-${piece.id})`}
            stroke={colorConfig.border}
            strokeWidth="0.8"
          />

          {/* Body Gloss Highlight Streak */}
          <path
            d="M 18 24.5 C 18 30, 11.5 41, 11 48 C 13 48, 14.5 43, 16.5 34 C 18 29, 20.5 26, 20.5 24.5 Z"
            fill="#FFFFFF"
            opacity="0.38"
          />

          {/* 3. Narrow Neck Collar */}
          <ellipse
            cx="22"
            cy="22.8"
            rx="6.5"
            ry="2.2"
            fill={`url(#pawn-collar-${colorKey}-${piece.id})`}
            stroke={colorConfig.border}
            strokeWidth="0.6"
          />
          <ellipse
            cx="21"
            cy="22.2"
            rx="4.2"
            ry="1.1"
            fill="#FFFFFF"
            opacity="0.4"
          />

          {/* 4. Rounded Spherical Head */}
          <circle
            cx="22"
            cy="12.8"
            r="9.5"
            fill={`url(#pawn-head-${colorKey}-${piece.id})`}
            stroke={colorConfig.border}
            strokeWidth="0.8"
          />

          {/* Spherical Specular Gloss Reflection */}
          <ellipse
            cx="18.5"
            cy="9.5"
            rx="3.2"
            ry="2"
            transform="rotate(-25 18.5 9.5)"
            fill="#FFFFFF"
            opacity="0.82"
          />
          <circle
            cx="23"
            cy="7.5"
            r="1"
            fill="#FFFFFF"
            opacity="0.55"
          />
        </g>
      </svg>

      {/* Stack Count Badge */}
      {stackCount > 1 && (
        <span className="pawn-stack-badge" title={`${stackCount} pawns here`}>
          {stackCount}
        </span>
      )}
    </div>
  );
}
