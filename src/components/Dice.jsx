import React from 'react';
import { Dices, Sparkles } from 'lucide-react';
import { PLAYER_COLORS } from '../game/constants';

export function Dice({
  diceValue,
  isRolling = false,
  diceRolled = false,
  activePlayer,
  onRoll,
  canRoll = true,
  hasBaseAction = false,
  basePieceIdToEnter = null,
  onPieceClick = null,
}) {
  const colorCfg = PLAYER_COLORS[activePlayer?.colorKey] || PLAYER_COLORS.red;

  const displayValue = diceValue || 1;

  // Dice face pips helper
  const renderPips = (val) => {
    return Array.from({ length: val }).map((_, i) => (
      <span key={`pip-${val}-${i}`} className="pip" />
    ));
  };

  return (
    <div className="dice-panel-card">
      <div style={{ width: '100%' }}>
        <span
          style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: colorCfg.text,
          }}
        >
          {activePlayer?.name}'s Turn
        </span>
      </div>

      {/* 3D Animated Dice Container */}
      <div
        className="dice-container-3d"
        onClick={() => canRoll && !isRolling && onRoll()}
        title={canRoll ? 'Click to Roll Dice' : ''}
      >
        <div
          className={`dice-cube ${isRolling ? 'rolling' : ''}`}
          style={{
            transform: !isRolling
              ? getDiceFaceRotation(displayValue)
              : undefined,
          }}
        >
          {/* 6 Faces of the Cube */}
          <div className="dice-face face-1" style={{ transform: 'translateZ(50px)' }}>
            {renderPips(1)}
          </div>
          <div className="dice-face face-6" style={{ transform: 'rotateY(180deg) translateZ(50px)' }}>
            {renderPips(6)}
          </div>
          <div className="dice-face face-2" style={{ transform: 'rotateY(-90deg) translateZ(50px)' }}>
            {renderPips(2)}
          </div>
          <div className="dice-face face-5" style={{ transform: 'rotateY(90deg) translateZ(50px)' }}>
            {renderPips(5)}
          </div>
          <div className="dice-face face-3" style={{ transform: 'rotateX(90deg) translateZ(50px)' }}>
            {renderPips(3)}
          </div>
          <div className="dice-face face-4" style={{ transform: 'rotateX(-90deg) translateZ(50px)' }}>
            {renderPips(4)}
          </div>
        </div>
      </div>

      {/* Primary Roll Button */}
      <button
        type="button"
        className="btn-roll-dice"
        onClick={onRoll}
        disabled={!canRoll || isRolling}
        style={{
          '--roll-color': colorCfg.hex,
          '--roll-color-dark': colorCfg.border,
        }}
      >
        <Dices size={22} />
        <span>{isRolling ? 'Rolling...' : diceRolled ? `Rolled: ${diceValue}` : 'Roll Dice'}</span>
      </button>

      {/* Bring a Pawn Out strategic option on rolling 6 */}
      {hasBaseAction && basePieceIdToEnter !== null && onPieceClick && diceRolled && !isRolling && (
        <button
          type="button"
          className="btn-bring-pawn-out-dice"
          onClick={() => onPieceClick(basePieceIdToEnter)}
          title="Bring a new pawn out of base onto the starting track"
        >
          <Sparkles size={20} />
          <span>Bring a Pawn Out</span>
        </button>
      )}
    </div>
  );
}

// Helper: 3D rotation to show specific face on top
function getDiceFaceRotation(value) {
  switch (value) {
    case 1:
      return 'rotateX(0deg) rotateY(0deg)';
    case 2:
      return 'rotateX(0deg) rotateY(90deg)';
    case 3:
      return 'rotateX(-90deg) rotateY(0deg)';
    case 4:
      return 'rotateX(90deg) rotateY(0deg)';
    case 5:
      return 'rotateX(0deg) rotateY(-90deg)';
    case 6:
      return 'rotateX(0deg) rotateY(180deg)';
    default:
      return 'rotateX(0deg) rotateY(0deg)';
  }
}
