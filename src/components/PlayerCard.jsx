import React from 'react';
import { Plus, Minus, RotateCcw } from 'lucide-react';
import { PLAYER_COLORS } from '../game/constants';
import { calculatePlayerPieceStats } from '../game/turnManager';

export function PlayerCard({
  player,
  isActive = false,
  pieces = [],
  score = 0,
  onAdjustScore,
  onResetScore,
}) {
  const colorCfg = PLAYER_COLORS[player.colorKey] || PLAYER_COLORS.red;
  const stats = calculatePlayerPieceStats(pieces);

  return (
    <div
      className={`player-card ${isActive ? 'is-active' : ''}`}
      style={{
        '--card-theme-color': colorCfg.hex,
        '--card-glow-color': colorCfg.hex + '33',
      }}
    >
      <div className="player-card-header">
        <div className="player-card-profile">
          <div
            className="player-avatar-circle"
            style={{
              backgroundColor: colorCfg.bg,
              borderColor: colorCfg.border,
            }}
          >
            {player.avatar || '🦁'}
          </div>
          <div>
            <h3 className="player-card-name">{player.name}</h3>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: colorCfg.text,
              }}
            >
              {colorCfg.name}
            </span>
          </div>
        </div>

        {isActive && (
          <span className="player-turn-indicator">
            Turn
          </span>
        )}
      </div>

      {/* Piece Statistics */}
      <div className="piece-stat-grid">
        <div className="piece-stat-item">
          <div className="label">Base</div>
          <div className="val">{stats.inBase}</div>
        </div>
        <div className="piece-stat-item">
          <div className="label">Board</div>
          <div className="val">{stats.onBoard}</div>
        </div>
        <div className="piece-stat-item">
          <div className="label">Home</div>
          <div className="val" style={{ color: stats.finished === 4 ? '#16A34A' : 'inherit' }}>
            {stats.finished}/4
          </div>
        </div>
      </div>

      {/* Manual Score Controls */}
      <div className="manual-score-row">
        <div className="score-display-box">
          <span className="score-label">Score:</span>
          <span className="score-num">{score}</span>
        </div>

        <div className="score-btn-group">
          <button
            type="button"
            className="btn-score-ctrl"
            onClick={() => onAdjustScore(player.id, 1)}
            title="Add 1 point"
            aria-label="Add 1 point"
          >
            <Plus size={14} />
          </button>
          <button
            type="button"
            className="btn-score-ctrl"
            onClick={() => onAdjustScore(player.id, -1)}
            disabled={score <= 0}
            title="Subtract 1 point"
            aria-label="Subtract 1 point"
            style={{ opacity: score <= 0 ? 0.4 : 1 }}
          >
            <Minus size={14} />
          </button>
          <button
            type="button"
            className="btn-score-ctrl btn-score-reset"
            onClick={() => onResetScore(player.id)}
            title="Reset score"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
