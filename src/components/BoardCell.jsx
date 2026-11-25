import React from 'react';
import { Star, ArrowRight, ArrowDown, ArrowLeft, ArrowUp } from 'lucide-react';
import { Piece } from './Piece';
import { CELL_TYPES } from '../game/constants';

export function BoardCell({
  cell,
  piecesHere = [],
  legalPieceIds = [],
  activePlayerId,
  hasBaseAction = false,
  onPieceClick,
}) {
  const { row, col, type, playerColor, isSafe, isStart, homeLaneIndex } = cell;

  // Find start arrow direction
  const getStartArrow = () => {
    if (!isStart) return null;
    if (playerColor === 'red') return <ArrowRight className="start-indicator-arrow" style={{ color: '#EF4444' }} />;
    if (playerColor === 'green') return <ArrowDown className="start-indicator-arrow" style={{ color: '#22C55E' }} />;
    if (playerColor === 'yellow') return <ArrowLeft className="start-indicator-arrow" style={{ color: '#CA8A04' }} />;
    if (playerColor === 'blue') return <ArrowUp className="start-indicator-arrow" style={{ color: '#3B82F6' }} />;
    return null;
  };

  // Determine top piece to render if multiple
  const topPiece = piecesHere[piecesHere.length - 1];
  const isTopPieceLegal = topPiece && topPiece.playerId === activePlayerId && legalPieceIds.includes(topPiece.id);

  let cellClass = 'board-cell track-cell';
  if (isSafe && !isStart) cellClass += ' safe-cell';
  if (isStart) cellClass += ` start-cell cell-${playerColor}`;
  if (isStart && hasBaseAction) cellClass += ' start-cell-highlight-pulse';
  if (type === CELL_TYPES.HOME_LANE) cellClass += ` cell-${playerColor}`;

  return (
    <div
      className={cellClass}
      data-row={row}
      data-col={col}
    >
      {/* Safe Star Icon */}
      {isSafe && !isStart && (
        <Star className="safe-star-icon" fill="currentColor" />
      )}

      {/* Start Direction Arrow */}
      {getStartArrow()}

      {/* Render Piece on Cell */}
      {topPiece && (
        <Piece
          piece={topPiece}
          isLegal={isTopPieceLegal}
          onClick={onPieceClick}
          stackCount={piecesHere.length}
        />
      )}
    </div>
  );
}
