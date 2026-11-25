import { PIECE_STATES, BOARD_MODES } from './constants';
import {
  generateClassicPlayerPath,
  generateExtendedPlayerPath,
} from './boardLayouts';

/**
 * Get total path length and finish step for a player
 */
export function getPlayerPathInfo(colorKey, boardMode) {
  if (boardMode === BOARD_MODES.EXTENDED) {
    const path = generateExtendedPlayerPath(colorKey);
    return {
      path,
      finishStep: path.length - 1, // 70
    };
  }
  const path = generateClassicPlayerPath(colorKey);
  return {
    path,
    finishStep: path.length - 1, // 56
  };
}

/**
 * Checks if a specific piece can legally move given a dice value and rules.
 */
export function canPieceMove(piece, diceValue, playerColorKey, boardMode, rules) {
  if (!piece) return false;
  if (piece.state === PIECE_STATES.FINISHED) return false;

  const { finishStep } = getPlayerPathInfo(playerColorKey, boardMode);

  // Piece is in base
  if (piece.state === PIECE_STATES.BASE) {
    if (rules?.requireSixToLeaveBase !== false) {
      return diceValue === 6;
    }
    return true;
  }

  // Piece is on track or in home lane
  const targetStep = piece.step + diceValue;

  if (targetStep > finishStep) {
    // Overshooting is prohibited if exactFinish is enabled
    if (rules?.exactFinish !== false) {
      return false;
    }
    return true;
  }

  return true;
}

/**
 * Returns list of legal piece IDs that the active player can move.
 */
export function getLegalMoves(playerPieces, diceValue, playerColorKey, boardMode, rules) {
  if (!playerPieces || !diceValue) return [];

  const legalPieceIds = [];
  playerPieces.forEach((piece) => {
    if (canPieceMove(piece, diceValue, playerColorKey, boardMode, rules)) {
      legalPieceIds.push(piece.id);
    }
  });

  return legalPieceIds;
}

/**
 * Calculates legal actions and handles automatic move selection logic.
 *
 * Core rule:
 * Strategic actions available to a player:
 * - Each movable piece already on the board is a distinct strategic choice.
 * - Bringing a pawn out of base (if allowed by dice, e.g. roll is 6) is a single distinct strategic choice
 *   (all base pawns are functionally identical).
 *
 * Total distinct strategic actions:
 * totalActions = movableBoardPieces.length + (movableBasePieces.length > 0 ? 1 : 0)
 *
 * 1. totalActions === 0:
 *    - No legal moves available -> isAutoMove: false, reason: 'no_legal_moves'
 *
 * 2. totalActions === 1:
 *    - Only ONE strategic action exists. Automatic execution is desirable and unambiguous:
 *      a) If movableBasePieces.length > 0 (e.g. all pieces in base on roll 6, or board pieces blocked):
 *         Auto-bring the first base piece out -> isAutoMove: true, reason: 'auto_enter_base'
 *      b) If movableBoardPieces.length === 1 (e.g. 1 pawn on board and 0 in base on 6, or rolled 4 with 1 board pawn):
 *         Auto-move that board piece -> isAutoMove: true, reason: 'auto_single_board_piece'
 *
 * 3. totalActions > 1:
 *    - MULTIPLE distinct strategic choices exist!
 *      e.g. 1 piece on board and pawns in base on roll 6 (Scenario A):
 *      The player can choose between moving the board piece OR bringing a new piece out of base.
 *      DO NOT automatically move the existing pawn!
 *      isAutoMove: false, reason: 'multiple_choices', hasBaseAction: true
 */
export function calculateLegalActions(playerPieces, diceValue, playerColorKey, boardMode, rules) {
  if (!playerPieces || !diceValue) {
    return {
      autoMovePieceId: null,
      selectablePieceIds: [],
      isAutoMove: false,
      reason: 'no_dice',
      hasBaseAction: false,
      basePieceIdToEnter: null,
    };
  }

  const movableBoardPieces = [];
  const movableBasePieces = [];

  playerPieces.forEach((piece) => {
    if (canPieceMove(piece, diceValue, playerColorKey, boardMode, rules)) {
      if (piece.state === PIECE_STATES.BASE) {
        movableBasePieces.push(piece);
      } else {
        movableBoardPieces.push(piece);
      }
    }
  });

  const baseActionAvailable = movableBasePieces.length > 0;
  const distinctStrategicActions = movableBoardPieces.length + (baseActionAvailable ? 1 : 0);

  // Scenario 1: No legal moves exist
  if (distinctStrategicActions === 0) {
    return {
      autoMovePieceId: null,
      selectablePieceIds: [],
      isAutoMove: false,
      reason: 'no_legal_moves',
      hasBaseAction: false,
      basePieceIdToEnter: null,
    };
  }

  // Scenario 2: Exactly one strategic action exists -> Automatic movement!
  if (distinctStrategicActions === 1) {
    if (baseActionAvailable) {
      // Scenario C / Scenario D: Only action is bringing a pawn out of base
      const chosenBasePiece = movableBasePieces[0];
      return {
        autoMovePieceId: chosenBasePiece.id,
        selectablePieceIds: [chosenBasePiece.id],
        isAutoMove: true,
        reason: 'auto_enter_base',
        hasBaseAction: true,
        basePieceIdToEnter: chosenBasePiece.id,
      };
    } else {
      // Scenario D: Exactly one board piece can move and no base entry possible
      const chosenBoardPiece = movableBoardPieces[0];
      return {
        autoMovePieceId: chosenBoardPiece.id,
        selectablePieceIds: [chosenBoardPiece.id],
        isAutoMove: true,
        reason: 'auto_single_board_piece',
        hasBaseAction: false,
        basePieceIdToEnter: null,
      };
    }
  }

  // Scenario 3: Multiple strategic actions exist (distinctStrategicActions > 1)
  // Scenario A: 1 board pawn + base pawns on 6 -> Player chooses between board pawn or base exit!
  // Scenario B: Multiple board pawns + base pawns on 6 -> Player chooses any!
  // Every movable board pawn is selectable, and every base pawn is selectable (clicking any base pawn enters).
  const selectable = [
    ...movableBoardPieces.map((p) => p.id),
    ...movableBasePieces.map((p) => p.id),
  ];

  return {
    autoMovePieceId: null,
    selectablePieceIds: selectable,
    isAutoMove: false,
    reason: 'multiple_choices',
    hasBaseAction: baseActionAvailable,
    basePieceIdToEnter: baseActionAvailable ? movableBasePieces[0].id : null,
  };
}

/**
 * Computes the new state for a piece after moving by diceValue.
 * Supports an optional overrideStart to accurately resolve moves after sequential intermediate stepping.
 */
export function computePieceMove(piece, diceValue, playerColorKey, boardMode, rules, overrideStart) {
  const { path, finishStep } = getPlayerPathInfo(playerColorKey, boardMode);

  const startState = overrideStart?.state ?? piece.state;
  const startStep = overrideStart?.step ?? piece.step;

  // 1. Moving from base onto track
  if (startState === PIECE_STATES.BASE) {
    const sStep = 0;
    const pathCell = path[sStep];
    return {
      ...piece,
      state: PIECE_STATES.TRACK,
      step: sStep,
      trackIndex: pathCell.trackIndex,
      row: pathCell.row,
      col: pathCell.col,
      x: pathCell.x,
      y: pathCell.y,
    };
  }

  // 2. Moving along track or home lane
  const targetStep = startStep + diceValue;

  if (targetStep >= finishStep) {
    const finishCell = path[finishStep];
    return {
      ...piece,
      state: PIECE_STATES.FINISHED,
      step: finishStep,
      trackIndex: null,
      row: finishCell.row,
      col: finishCell.col,
      x: finishCell.x,
      y: finishCell.y,
    };
  }

  const targetCell = path[targetStep];
  const newState = targetCell.isHomeLane ? PIECE_STATES.HOME_LANE : PIECE_STATES.TRACK;

  return {
    ...piece,
    state: newState,
    step: targetStep,
    trackIndex: targetCell.trackIndex,
    row: targetCell.row,
    col: targetCell.col,
    x: targetCell.x,
    y: targetCell.y,
  };
}
