import { PIECE_STATES, BOARD_MODES } from './constants';
import { CLASSIC_SAFE_INDICES, EXTENDED_BOARD_DATA } from './boardLayouts';

/**
 * Checks if a track cell is safe from captures.
 */
export function isSafeCell(trackIndex, boardMode, rules) {
  if (rules?.safeSquaresEnabled === false) {
    return false;
  }
  if (trackIndex === null || trackIndex === undefined) {
    // Cells off track (home lanes, bases, finish) are always safe
    return true;
  }

  if (boardMode === BOARD_MODES.EXTENDED) {
    return EXTENDED_BOARD_DATA.safeIndices.includes(trackIndex);
  }

  return CLASSIC_SAFE_INDICES.includes(trackIndex);
}

/**
 * Checks if the moved piece captures any opponent pieces.
 * Returns array of captured pieces info.
 */
export function checkCaptures(movedPiece, allPieces, activePlayerId, boardMode, rules) {
  if (!rules?.captureEnabled && rules?.captureEnabled !== undefined && !rules.captureEnabled) {
    return [];
  }

  // Pieces not on main track cannot capture or be captured
  if (movedPiece.state !== PIECE_STATES.TRACK || movedPiece.trackIndex === null) {
    return [];
  }

  // If landing on a safe cell, no captures can happen
  if (isSafeCell(movedPiece.trackIndex, boardMode, rules)) {
    return [];
  }

  const captures = [];

  // Check all other players' pieces on the same trackIndex
  Object.entries(allPieces).forEach(([playerIdStr, pieces]) => {
    const playerId = Number(playerIdStr);
    if (playerId === activePlayerId) return; // Cannot capture own pieces

    pieces.forEach((piece) => {
      if (
        piece.state === PIECE_STATES.TRACK &&
        piece.trackIndex === movedPiece.trackIndex
      ) {
        captures.push({
          playerId,
          pieceId: piece.id,
          trackIndex: movedPiece.trackIndex,
        });
      }
    });
  });

  return captures;
}
