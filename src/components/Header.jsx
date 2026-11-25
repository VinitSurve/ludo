import React from 'react';
import { Volume2, VolumeX, BookOpen, Settings, RotateCcw, PlusCircle, Dices } from 'lucide-react';

export function Header({
  boardMode,
  playerCount,
  soundMuted,
  onToggleSound,
  onOpenRules,
  onOpenSettings,
  onOpenNewGame,
}) {
  return (
    <header className="game-header">
      <div className="header-inner">
        {/* Logo and Game Title */}
        <div className="logo-area">
          <div className="logo-icon-box">
            <Dices size={24} />
          </div>
          <div>
            <h1 className="app-title">LUDO MASTER</h1>
          </div>
        </div>

        {/* Mode and Player Count Badges */}
        <div className="header-badges">
          <span className="badge badge-mode">
            {boardMode === 'extended' ? 'Extended (6-Player)' : 'Classic (4-Player)'}
          </span>
          <span className="badge badge-players">
            {playerCount} Players
          </span>
        </div>

        {/* Action Controls */}
        <div className="header-actions">
          {/* Sound Toggle */}
          <button
            type="button"
            className="btn-icon"
            onClick={onToggleSound}
            title={soundMuted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label={soundMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {soundMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Rules Button */}
          <button
            type="button"
            className="btn-icon"
            onClick={onOpenRules}
            title="Game Rules"
            aria-label="Game Rules"
          >
            <BookOpen size={18} />
          </button>

          {/* Settings Button */}
          <button
            type="button"
            className="btn-icon"
            onClick={onOpenSettings}
            title="Settings"
            aria-label="Settings"
          >
            <Settings size={18} />
          </button>

          {/* New Game Button */}
          <button
            type="button"
            className="btn-primary"
            onClick={onOpenNewGame}
          >
            <PlusCircle size={18} />
            <span>New Game</span>
          </button>
        </div>
      </div>
    </header>
  );
}
