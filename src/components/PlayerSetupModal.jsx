import React, { useState } from 'react';
import { X, Play, Users, Sparkles } from 'lucide-react';
import {
  DEFAULT_PLAYERS_CONFIG,
  PLAYER_COLORS,
  AVAILABLE_AVATARS,
  BOARD_MODES,
} from '../game/constants';

export function PlayerSetupModal({
  isOpen,
  onClose,
  onStartGame,
  initialPlayerCount = 4,
}) {
  const [playerCount, setPlayerCount] = useState(initialPlayerCount);
  const [players, setPlayers] = useState(() => {
    return DEFAULT_PLAYERS_CONFIG[initialPlayerCount].map((p) => ({ ...p }));
  });

  if (!isOpen) return null;

  // Handle changing player count (2 to 6)
  const handleSelectCount = (count) => {
    setPlayerCount(count);
    const defaults = DEFAULT_PLAYERS_CONFIG[count];
    setPlayers(
      defaults.map((defP, idx) => {
        const existing = players[idx];
        return {
          ...defP,
          name: existing?.name || defP.name,
          avatar: existing?.avatar || defP.avatar,
          colorKey: existing?.colorKey || defP.colorKey,
        };
      })
    );
  };

  const handleNameChange = (idx, name) => {
    setPlayers((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, name } : p))
    );
  };

  const handleAvatarChange = (idx, avatar) => {
    setPlayers((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, avatar } : p))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onStartGame(playerCount, { players });
    onClose();
  };

  const boardMode = playerCount >= 5 ? BOARD_MODES.EXTENDED : BOARD_MODES.CLASSIC;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users className="text-blue-600" size={24} />
            <h2 className="modal-title">New Game Setup</h2>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Player Count Selector (2, 3, 4, 5, 6) */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: '#475569' }}>
              CHOOSE NUMBER OF PLAYERS
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[2, 3, 4, 5, 6].map((count) => (
                <button
                  key={`cnt-${count}`}
                  type="button"
                  onClick={() => handleSelectCount(count)}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    background: playerCount === count ? '#3B82F6' : '#F1F5F9',
                    color: playerCount === count ? '#FFFFFF' : '#334155',
                    border: '2px solid',
                    borderColor: playerCount === count ? '#2563EB' : 'transparent',
                    boxShadow: playerCount === count ? '0 4px 10px rgba(37,99,235,0.25)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {count}
                </button>
              ))}
            </div>
            <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#64748B' }}>
              {boardMode === 'extended'
                ? '⭐ 5-6 Players: Extended 6-Sector Hexagonal Board with Red, Blue, Green, Yellow, Purple, Orange.'
                : '⭐ 2-4 Players: Classic 15×15 4-Color Board.'}
            </div>
          </div>

          {/* Player Configuration Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {players.slice(0, playerCount).map((player, idx) => {
              const colorCfg = PLAYER_COLORS[player.colorKey] || PLAYER_COLORS.red;

              return (
                <div
                  key={`setup-player-${player.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: colorCfg.bg,
                    border: `1.5px solid ${colorCfg.border}`,
                  }}
                >
                  {/* Avatar Picker / Cycle */}
                  <select
                    value={player.avatar}
                    onChange={(e) => handleAvatarChange(idx, e.target.value)}
                    style={{
                      fontSize: '1.3rem',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    {AVAILABLE_AVATARS.map((av) => (
                      <option key={av} value={av}>
                        {av}
                      </option>
                    ))}
                  </select>

                  {/* Player Name Input */}
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) => handleNameChange(idx, e.target.value)}
                      maxLength={16}
                      placeholder={`Player ${idx + 1}`}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: '#0F172A',
                        background: '#FFFFFF',
                      }}
                    />
                  </div>

                  {/* Color Badge */}
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: colorCfg.text,
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: '#FFFFFF',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}
                  >
                    {colorCfg.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              <Play size={16} />
              <span>Start Game</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
