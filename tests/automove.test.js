import { describe, it, expect } from 'vitest';
import { calculateLegalActions } from '../src/game/movement';
import { gameReducer, ACTION_TYPES } from '../src/game/gameReducer';
import { createInitialGameState } from '../src/game/gameUtils';
import { PIECE_STATES, BOARD_MODES, DEFAULT_RULES } from '../src/game/constants';

describe('Automatic Move Selection — 8 Required Scenarios', () => {
  // Scenario 1: Player has 1 piece on board, roll 3 -> moves automatically 3 squares
  it('Scenario 1: executes automatically when player has exactly 1 piece on board', () => {
    const pieces = [
      { id: 0, colorKey: 'red', state: PIECE_STATES.TRACK, step: 10, trackIndex: 10 },
      { id: 1, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
      { id: 2, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
      { id: 3, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
    ];

    const result = calculateLegalActions(pieces, 3, 'red', BOARD_MODES.CLASSIC, DEFAULT_RULES);
    expect(result.isAutoMove).toBe(true);
    expect(result.autoMovePieceId).toBe(0);
    expect(result.selectablePieceIds).toEqual([0]);
  });

  // Scenario 2: Player has 2 movable pieces on board, roll 3 -> player selects
  it('Scenario 2: requires player selection when multiple movable pieces exist on board', () => {
    const pieces = [
      { id: 0, colorKey: 'red', state: PIECE_STATES.TRACK, step: 10, trackIndex: 10 },
      { id: 1, colorKey: 'red', state: PIECE_STATES.TRACK, step: 20, trackIndex: 20 },
      { id: 2, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
      { id: 3, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
    ];

    const result = calculateLegalActions(pieces, 3, 'red', BOARD_MODES.CLASSIC, DEFAULT_RULES);
    expect(result.isAutoMove).toBe(false);
    expect(result.autoMovePieceId).toBe(null);
    expect(result.selectablePieceIds).toContain(0);
    expect(result.selectablePieceIds).toContain(1);
    expect(result.selectablePieceIds.length).toBe(2);
  });

  // Scenario 3: Player has 3 pieces on board, but only 1 can legally move -> executes automatically
  it('Scenario 3: executes automatically when 3 pieces are on board but only 1 can legally move', () => {
    const pieces = [
      { id: 0, colorKey: 'red', state: PIECE_STATES.TRACK, step: 10, trackIndex: 10 },
      // Pieces 1 and 2 are near finish and would overshoot with roll 4 (finish is 56)
      { id: 1, colorKey: 'red', state: PIECE_STATES.HOME_LANE, step: 54 }, // 54 + 4 = 58 > 56
      { id: 2, colorKey: 'red', state: PIECE_STATES.HOME_LANE, step: 55 }, // 55 + 4 = 59 > 56
      { id: 3, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
    ];

    const result = calculateLegalActions(pieces, 4, 'red', BOARD_MODES.CLASSIC, DEFAULT_RULES);
    expect(result.isAutoMove).toBe(true);
    expect(result.autoMovePieceId).toBe(0);
    expect(result.selectablePieceIds).toEqual([0]);
  });

  // Scenario 4: Player has no pieces on board and rolls 6 -> base piece enters automatically
  it('Scenario 4: automatically brings a base piece out when rolling 6 with no pieces on board', () => {
    const pieces = [
      { id: 0, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
      { id: 1, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
      { id: 2, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
      { id: 3, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
    ];

    const result = calculateLegalActions(pieces, 6, 'red', BOARD_MODES.CLASSIC, DEFAULT_RULES);
    expect(result.isAutoMove).toBe(true);
    // Unambiguously picks next available base piece (id: 0)
    expect(result.autoMovePieceId).toBe(0);
    expect(result.selectablePieceIds).toEqual([0]);
  });

  // Scenario 5: Player has no legal moves -> no auto-move, auto-pass triggered
  it('Scenario 5: flags no_legal_moves when no piece can move', () => {
    const pieces = [
      { id: 0, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
      { id: 1, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
      { id: 2, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
      { id: 3, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
    ];

    const result = calculateLegalActions(pieces, 4, 'red', BOARD_MODES.CLASSIC, DEFAULT_RULES);
    expect(result.isAutoMove).toBe(false);
    expect(result.autoMovePieceId).toBe(null);
    expect(result.selectablePieceIds).toEqual([]);
    expect(result.reason).toBe('no_legal_moves');
  });

  // Scenario 6: Automatic move captures an opponent
  it('Scenario 6: automatic move correctly executes capture, sends opponent to base, and records history', () => {
    let state = createInitialGameState(2);

    // Player 1 has 1 piece on track at index 2 (step 2)
    state.pieces[1] = [
      { id: 0, playerId: 1, colorKey: 'red', state: PIECE_STATES.TRACK, step: 2, trackIndex: 2 },
      { id: 1, playerId: 1, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
      { id: 2, playerId: 1, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
      { id: 3, playerId: 1, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
    ];

    // Player 2 has a piece at index 5 (step 5 from Red's perspective, not a safe square)
    state.pieces[2] = [
      { id: 0, playerId: 2, colorKey: 'yellow', state: PIECE_STATES.TRACK, step: 31, trackIndex: 5 },
      { id: 1, playerId: 2, colorKey: 'yellow', state: PIECE_STATES.BASE, step: -1 },
      { id: 2, playerId: 2, colorKey: 'yellow', state: PIECE_STATES.BASE, step: -1 },
      { id: 3, playerId: 2, colorKey: 'yellow', state: PIECE_STATES.BASE, step: -1 },
    ];

    state.currentPlayerIndex = 0; // Player 1
    // Roll 3: Red pawn 0 will move from trackIndex 2 + 3 = 5 (capturing Yellow pawn 0!)
    const rollState = gameReducer(state, {
      type: ACTION_TYPES.ROLL_DICE_COMPLETE,
      payload: { diceValue: 3 },
    });

    expect(rollState.isAutoMoving).toBe(true);
    expect(rollState.autoMovePieceId).toBe(0);

    // Execute the automatic move
    const movedState = gameReducer(rollState, {
      type: ACTION_TYPES.MOVE_PIECE,
      payload: { pieceId: 0 },
    });

    // Check capture results
    expect(movedState.pieces[1][0].trackIndex).toBe(5);
    expect(movedState.pieces[2][0].state).toBe(PIECE_STATES.BASE); // Yellow captured back to base!
    expect(movedState.gameHistory.some((h) => h.type === 'CAPTURE')).toBe(true);
    // Extra turn awarded on capture
    expect(movedState.currentPlayerIndex).toBe(0); // Player 1 rolls again!
  });

  // Scenario 7: Automatic move finishes a piece and triggers win evaluation
  it('Scenario 7: automatic move finishes a piece and awards bonus roll or win', () => {
    let state = createInitialGameState(2);

    // Player 1 has only 1 piece not yet finished, positioned at step 54 (needs 2 to finish)
    state.pieces[1] = [
      { id: 0, playerId: 1, colorKey: 'red', state: PIECE_STATES.FINISHED, step: 56 },
      { id: 1, playerId: 1, colorKey: 'red', state: PIECE_STATES.FINISHED, step: 56 },
      { id: 2, playerId: 1, colorKey: 'red', state: PIECE_STATES.FINISHED, step: 56 },
      { id: 3, playerId: 1, colorKey: 'red', state: PIECE_STATES.HOME_LANE, step: 54 },
    ];

    state.currentPlayerIndex = 0;
    // Roll 2: exactly finishes the 4th piece!
    const rollState = gameReducer(state, {
      type: ACTION_TYPES.ROLL_DICE_COMPLETE,
      payload: { diceValue: 2 },
    });

    expect(rollState.isAutoMoving).toBe(true);
    expect(rollState.autoMovePieceId).toBe(3);

    const finishState = gameReducer(rollState, {
      type: ACTION_TYPES.MOVE_PIECE,
      payload: { pieceId: 3 },
    });

    expect(finishState.pieces[1][3].state).toBe(PIECE_STATES.FINISHED);
    expect(finishState.gameStatus).toBe('GAME_OVER');
    expect(finishState.winner.id).toBe(1);
    expect(finishState.gameHistory.some((h) => h.type === 'WIN')).toBe(true);
  });

  // Scenario 8: Multiple legal pieces exist -> No automatic movement, player selects
  it('Scenario 8: ensures no auto-move occurs when player has multiple legal choices', () => {
    const pieces = [
      { id: 0, colorKey: 'red', state: PIECE_STATES.TRACK, step: 5 },
      { id: 1, colorKey: 'red', state: PIECE_STATES.TRACK, step: 15 },
      { id: 2, colorKey: 'red', state: PIECE_STATES.TRACK, step: 25 },
      { id: 3, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
    ];

    const result = calculateLegalActions(pieces, 3, 'red', BOARD_MODES.CLASSIC, DEFAULT_RULES);
    expect(result.isAutoMove).toBe(false);
    expect(result.autoMovePieceId).toBe(null);
    expect(result.selectablePieceIds.length).toBe(3);
  });

  // =========================================================================
  // Rolling a 6: Strategic Choice Tests (Scenarios A, B, C, D)
  // =========================================================================

  it('Rolling 6 Scenario A: 1 pawn outside + pawns in base does NOT auto-move; player chooses between moving board pawn or entering from base', () => {
    const pieces = [
      { id: 0, colorKey: 'red', state: PIECE_STATES.TRACK, step: 10, trackIndex: 10 },
      { id: 1, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
      { id: 2, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
      { id: 3, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
    ];

    const result = calculateLegalActions(pieces, 6, 'red', BOARD_MODES.CLASSIC, DEFAULT_RULES);
    // MUST NOT automatically move the existing pawn!
    expect(result.isAutoMove).toBe(false);
    expect(result.autoMovePieceId).toBe(null);
    expect(result.hasBaseAction).toBe(true);
    // Board piece (0) and base pieces (1, 2, 3) must be selectable
    expect(result.selectablePieceIds).toContain(0);
    expect(result.selectablePieceIds).toContain(1);
    expect(result.basePieceIdToEnter).toBe(1);
  });

  it('Rolling 6 Scenario B: 2 pawns outside + 2 pawns in base allows choosing any valid action', () => {
    const pieces = [
      { id: 0, colorKey: 'red', state: PIECE_STATES.TRACK, step: 5, trackIndex: 5 },
      { id: 1, colorKey: 'red', state: PIECE_STATES.TRACK, step: 15, trackIndex: 15 },
      { id: 2, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
      { id: 3, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
    ];

    const result = calculateLegalActions(pieces, 6, 'red', BOARD_MODES.CLASSIC, DEFAULT_RULES);
    expect(result.isAutoMove).toBe(false);
    expect(result.hasBaseAction).toBe(true);
    expect(result.selectablePieceIds).toContain(0);
    expect(result.selectablePieceIds).toContain(1);
    expect(result.selectablePieceIds).toContain(2);
    expect(result.basePieceIdToEnter).toBe(2);
  });

  it('Rolling 6 Scenario C: 0 pawns outside + 4 pawns in base automatically brings out next base piece', () => {
    const pieces = [
      { id: 0, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
      { id: 1, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
      { id: 2, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
      { id: 3, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
    ];

    const result = calculateLegalActions(pieces, 6, 'red', BOARD_MODES.CLASSIC, DEFAULT_RULES);
    expect(result.isAutoMove).toBe(true);
    expect(result.autoMovePieceId).toBe(0);
    expect(result.hasBaseAction).toBe(true);
  });

  it('Rolling 6 Scenario D1: 1 pawn outside + 0 pawns in base automatically moves that sole pawn', () => {
    const pieces = [
      { id: 0, colorKey: 'red', state: PIECE_STATES.TRACK, step: 10, trackIndex: 10 },
      { id: 1, colorKey: 'red', state: PIECE_STATES.FINISHED, step: 56 },
      { id: 2, colorKey: 'red', state: PIECE_STATES.FINISHED, step: 56 },
      { id: 3, colorKey: 'red', state: PIECE_STATES.FINISHED, step: 56 },
    ];

    const result = calculateLegalActions(pieces, 6, 'red', BOARD_MODES.CLASSIC, DEFAULT_RULES);
    expect(result.isAutoMove).toBe(true);
    expect(result.autoMovePieceId).toBe(0);
    expect(result.hasBaseAction).toBe(false);
  });

  it('Scenario D2: roll is not 6 and only 1 pawn on board automatically moves that pawn', () => {
    const pieces = [
      { id: 0, colorKey: 'red', state: PIECE_STATES.TRACK, step: 10, trackIndex: 10 },
      { id: 1, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
      { id: 2, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
      { id: 3, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
    ];

    const result = calculateLegalActions(pieces, 4, 'red', BOARD_MODES.CLASSIC, DEFAULT_RULES);
    expect(result.isAutoMove).toBe(true);
    expect(result.autoMovePieceId).toBe(0);
    expect(result.hasBaseAction).toBe(false);
  });

  it('Rolling 6 Scenario D3: board pawn cannot move (overshoot), but base has pawns -> auto-enters base pawn', () => {
    const pieces = [
      // Step 54 + 6 = 60 > 56 (overshoots finish)
      { id: 0, colorKey: 'red', state: PIECE_STATES.HOME_LANE, step: 54 },
      { id: 1, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
      { id: 2, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
      { id: 3, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
    ];

    const result = calculateLegalActions(pieces, 6, 'red', BOARD_MODES.CLASSIC, DEFAULT_RULES);
    expect(result.isAutoMove).toBe(true);
    expect(result.autoMovePieceId).toBe(1);
    expect(result.hasBaseAction).toBe(true);
  });

  // =========================================================================
  // Sequential Step-by-Step Movement Transitions
  // =========================================================================

  it('Sequential movement: intermediate stepping updates coordinates square-by-square and final move computes destination accurately', () => {
    let state = createInitialGameState(2);

    state.pieces[1] = [
      { id: 0, playerId: 1, colorKey: 'red', state: PIECE_STATES.TRACK, step: 10, trackIndex: 10, row: 6, col: 4 },
      { id: 1, playerId: 1, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
      { id: 2, playerId: 1, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
      { id: 3, playerId: 1, colorKey: 'red', state: PIECE_STATES.BASE, step: -1 },
    ];
    state.currentPlayerIndex = 0;
    state.diceValue = 3;
    state.diceRolled = true;
    state.legalMoves = [0];

    // 1. Movement starts
    const startState = gameReducer(state, {
      type: ACTION_TYPES.MOVE_PIECE_START,
      payload: { pieceId: 0 },
    });
    expect(startState.isMovingPiece).toBe(true);
    expect(startState.movingPieceId).toBe(0);
    expect(startState.movingPieceInfo.originalStep).toBe(10);

    // 2. Intermediate step 11
    const step1State = gameReducer(startState, {
      type: ACTION_TYPES.STEP_PIECE_INTERMEDIATE,
      payload: { pieceId: 0, step: 11 },
    });
    expect(step1State.pieces[1][0].step).toBe(11);
    expect(step1State.pieces[1][0].trackIndex).toBe(11);

    // 3. Intermediate step 12
    const step2State = gameReducer(step1State, {
      type: ACTION_TYPES.STEP_PIECE_INTERMEDIATE,
      payload: { pieceId: 0, step: 12 },
    });
    expect(step2State.pieces[1][0].step).toBe(12);
    expect(step2State.pieces[1][0].trackIndex).toBe(12);

    // 4. Final step: MOVE_PIECE executes
    const finalState = gameReducer(step2State, {
      type: ACTION_TYPES.MOVE_PIECE,
      payload: { pieceId: 0 },
    });

    // 10 + 3 = 13
    expect(finalState.pieces[1][0].step).toBe(13);
    expect(finalState.pieces[1][0].trackIndex).toBe(13);
    expect(finalState.isMovingPiece).toBe(false);
    expect(finalState.movingPieceInfo).toBe(null);
  });
});
