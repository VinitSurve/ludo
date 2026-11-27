import React from 'react';
import { PLAYER_COLORS } from '../game/constants';
import { calculatePlayerPieceStats } from '../game/turnManager';

export function PlayerCard({
  player,
  isActive = false,
  pieces = [],
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
    </div>
  );
}
