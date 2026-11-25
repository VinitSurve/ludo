import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, PlusCircle, Sparkles } from 'lucide-react';
import { PLAYER_COLORS } from '../game/constants';

export function WinnerModal({
  winner,
  isOpen,
  onRematch,
  onNewGame,
}) {
  useEffect(() => {
    if (isOpen) {
      // Fire celebratory confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
        }, 300);
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen || !winner) return null;

  const colorCfg = PLAYER_COLORS[winner.colorKey] || PLAYER_COLORS.red;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ textAlign: 'center', padding: '32px 24px' }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: colorCfg.bg,
            border: `3px solid ${colorCfg.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            margin: '0 auto 16px',
            boxShadow: `0 8px 20px ${colorCfg.hex}40`,
          }}
        >
          {winner.avatar || '🦁'}
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#CA8A04', fontWeight: 800, fontSize: '0.9rem', marginBottom: '4px' }}>
          <Trophy size={20} />
          <span>CHAMPION</span>
        </div>

        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.9rem', color: '#0F172A', marginBottom: '8px' }}>
          {winner.name} Wins!
        </h2>

        <p style={{ color: '#64748B', fontSize: '0.95rem', marginBottom: '24px' }}>
          All 4 {colorCfg.name} pieces have conquered the board and safely reached the home finish!
        </p>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onRematch}
            style={{ padding: '10px 18px', fontSize: '0.95rem' }}
          >
            <RotateCcw size={16} />
            <span>Play Again</span>
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={onNewGame}
            style={{ padding: '10px 20px', fontSize: '0.95rem' }}
          >
            <PlusCircle size={16} />
            <span>New Game</span>
          </button>
        </div>
      </div>
    </div>
  );
}
