import { describe, it, expect } from 'vitest';
import { gameReducer, ACTION_TYPES } from '../src/game/gameReducer';
import { createInitialGameState } from '../src/game/gameUtils';
import { calculatePlayerPieceStats } from '../src/game/turnManager';

describe('Scoreboard & Undo Tests', () => {
  it('correctly calculates player piece statistics for scoreboard', () => {
    const pieces = [
      { id: 0, state: 'BASE', position: -1 },
      { id: 1, state: 'TRACK', position: 5 },
      { id: 2, state: 'HOME_LANE', position: 53 },
      { id: 3, state: 'FINISHED', position: 56 },
    ];
    const stats = calculatePlayerPieceStats(pieces);
    expect(stats.inBase).toBe(1);
    expect(stats.onBoard).toBe(2);
    expect(stats.finished).toBe(1);
  });

  it('correctly tracks all pieces in base initially', () => {
    const state = createInitialGameState(4);
    const p1Stats = calculatePlayerPieceStats(state.pieces[1]);
    expect(p1Stats.inBase).toBe(4);
    expect(p1Stats.onBoard).toBe(0);
    expect(p1Stats.finished).toBe(0);
  });

  it('faithfully restores previous state using Undo', () => {
    let state = createInitialGameState(2);
    // Player 1 rolls 6 and moves piece 0 from base to track
    state.diceValue = 6;
    state.diceRolled = true;
    state.legalMoves = [0];
    state.gameStatus = 'WAITING_MOVE';

    const movedState = gameReducer(state, {
      type: ACTION_TYPES.MOVE_PIECE,
      payload: { pieceId: 0 },
    });

    expect(movedState.pieces[1][0].state).toBe('TRACK');
    expect(movedState.undoStack.length).toBe(1);

    // Trigger UNDO
    const undoneState = gameReducer(movedState, {
      type: ACTION_TYPES.UNDO_MOVE,
    });

    expect(undoneState.pieces[1][0].state).toBe('BASE');
    expect(undoneState.undoStack.length).toBe(0);
  });
});
