/**
 * Turn Manager handles turn rotations, bonus turns, skipping, and game ending.
 */

export function getNextPlayerIndex(currentIndex, playersCount) {
  return (currentIndex + 1) % playersCount;
}

/**
 * Determines whether the current player receives an extra turn.
 */
export function evaluateBonusTurn({
  diceValue,
  consecutiveSixes,
  hasCaptured,
  hasFinishedPiece,
  rules,
}) {
  // Check three consecutive sixes penalty
  if (rules?.threeSixesPenalty && consecutiveSixes >= 3) {
    return {
      extraTurn: false,
      reason: 'three_sixes_penalty',
    };
  }

  if (hasCaptured && rules?.extraTurnOnCapture !== false) {
    return {
      extraTurn: true,
      reason: 'capture',
    };
  }

  if (hasFinishedPiece && rules?.extraTurnOnFinish !== false) {
    return {
      extraTurn: true,
      reason: 'finish_piece',
    };
  }

  if (diceValue === 6 && rules?.extraTurnOnSix !== false) {
    return {
      extraTurn: true,
      reason: 'rolled_six',
    };
  }

  return {
    extraTurn: false,
    reason: 'normal',
  };
}

/**
 * Checks if a player has won the game (all 4 pieces finished).
 */
export function checkPlayerWon(playerPieces) {
  if (!playerPieces || playerPieces.length === 0) return false;
  return playerPieces.every((p) => p.state === 'FINISHED');
}

/**
 * Calculates current piece statistics for a player.
 */
export function calculatePlayerPieceStats(playerPieces) {
  let inBase = 0;
  let onBoard = 0;
  let finished = 0;

  (playerPieces || []).forEach((p) => {
    if (p.state === 'BASE') inBase++;
    else if (p.state === 'FINISHED') finished++;
    else onBoard++;
  });

  return {
    inBase,
    onBoard,
    finished,
    total: playerPieces ? playerPieces.length : 4,
  };
}
