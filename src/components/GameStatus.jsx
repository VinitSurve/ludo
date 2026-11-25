import React from 'react';
import { PLAYER_COLORS } from '../game/constants';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export function GameStatus({
  activePlayer,
  gameStatus,
  diceRolled,
  diceValue,
  legalMoves = [],
  hasBaseAction = false,
  basePieceIdToEnter = null,
  onPieceClick,
  lastEvent,
}) {
  const colorCfg = PLAYER_COLORS[activePlayer?.colorKey] || PLAYER_COLORS.red;

  let title = `${activePlayer?.name}'s Turn`;
  let subtitle = 'Roll the dice to make your move.';
  let tag = 'Waiting Roll';
  let tagBg = colorCfg.bg;
  let tagColor = colorCfg.text;

  if (gameStatus === 'ROLLING') {
    title = `${activePlayer?.name} is rolling...`;
    subtitle = 'May fortune favor your pawns!';
    tag = 'Rolling';
  } else if (gameStatus === 'MOVING') {
    title = `${activePlayer?.name} is moving...`;
    subtitle = 'Stepping smoothly square by square along the track...';
    tag = 'Moving';
    tagBg = '#E0E7FF';
    tagColor = '#3730A3';
  } else if (gameStatus === 'AUTO_MOVING') {
    title = `Rolled a ${diceValue} — Moving Automatically!`;
    subtitle = lastEvent?.message || 'Only one legal move available — executing move...';
    tag = 'Auto Move';
    tagBg = '#DBEAFE';
    tagColor = '#1E40AF';
  } else if (gameStatus === 'WAITING_MOVE') {
    if (legalMoves.length === 0) {
      title = `Rolled a ${diceValue} — No Legal Moves`;
      subtitle = 'None of your pawns can make this move. Passing turn...';
      tag = 'No Moves';
      tagBg = '#FEE2E2';
      tagColor = '#991B1B';
    } else if (hasBaseAction) {
      title = `Lucky 6! Choose your move`;
      subtitle = 'Move an existing pawn or bring a new pawn out.';
      tag = 'Strategic Choice';
      tagBg = '#FEF3C7';
      tagColor = '#92400E';
    } else {
      title = `Rolled a ${diceValue}! Choose a pawn`;
      subtitle = `Multiple pawns can move. Click a highlighted pawn on the board to move ${diceValue} spaces.`;
      tag = 'Choose Pawn';
      tagBg = '#FEF9C3';
      tagColor = '#854D0E';
    }
  } else if (gameStatus === 'GAME_OVER') {
    title = `🏆 ${activePlayer?.name} Won the Game!`;
    subtitle = 'All 4 pawns safely reached the home center.';
    tag = 'Victory';
    tagBg = '#DCFCE7';
    tagColor = '#166534';
  }

  // Check special event banner
  if (lastEvent?.type === 'CAPTURE') {
    subtitle = lastEvent.message;
  } else if (lastEvent?.type === 'EXTRA_TURN') {
    subtitle = `🎉 ${lastEvent.message}`;
  }

  return (
    <div className="status-banner">
      <div className="status-card">
        <div className="status-player-info">
          <div
            className="player-avatar-circle"
            style={{
              backgroundColor: colorCfg.bg,
              borderColor: colorCfg.border,
            }}
          >
            {activePlayer?.avatar || '🦁'}
          </div>
          <div className="status-texts">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {hasBaseAction && basePieceIdToEnter !== null && onPieceClick && gameStatus === 'WAITING_MOVE' && (
            <button
              type="button"
              className="btn-bring-pawn-out-status"
              onClick={() => onPieceClick(basePieceIdToEnter)}
              title="Bring a new pawn out of base onto the track"
            >
              <Sparkles size={16} />
              <span>Bring a pawn out</span>
            </button>
          )}

          <span
            className="status-tag"
            style={{
              backgroundColor: tagBg,
              color: tagColor,
            }}
          >
            {tag}
          </span>
        </div>
      </div>
    </div>
  );
}
