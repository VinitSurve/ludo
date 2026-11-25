import { describe, it, expect } from 'vitest';
import { gameReducer, ACTION_TYPES } from '../src/game/gameReducer';
import { createInitialGameState } from '../src/game/gameUtils';

describe('Scoreboard & Undo Tests', () => {
  it('correctly increments and decrements manual scores without going below 0', () => {
    let state = createInitialGameState(4);
    expect(state.scores[1]).toBe(0);

    // +1
    state = gameReducer(state, {
      type: ACTION_TYPES.ADJUST_SCORE,
      payload: { playerId: 1, delta: 1 },
    });
    expect(state.scores[1]).toBe(1);

    // +1 again
    state = gameReducer(state, {
      type: ACTION_TYPES.ADJUST_SCORE,
      payload: { playerId: 1, delta: 1 },
    });
    expect(state.scores[1]).toBe(2);

    // -1
    state = gameReducer(state, {
      type: ACTION_TYPES.ADJUST_SCORE,
      payload: { playerId: 1, delta: -1 },
    });
    expect(state.scores[1]).toBe(1);

    // -5: score must NOT go below 0
    state = gameReducer(state, {
      type: ACTION_TYPES.ADJUST_SCORE,
      payload: { playerId: 1, delta: -5 },
    });
    expect(state.scores[1]).toBe(0);
  });

  it('resets a single player score', () => {
    let state = createInitialGameState(4);
    state.scores[1] = 10;
    state.scores[2] = 5;

    state = gameReducer(state, {
      type: ACTION_TYPES.RESET_PLAYER_SCORE,
      payload: { playerId: 1 },
    });

    expect(state.scores[1]).toBe(0);
    expect(state.scores[2]).toBe(5); // Player 2 intact
  });

  it('resets all player scores to 0', () => {
    let state = createInitialGameState(4);
    state.scores[1] = 10;
    state.scores[2] = 8;
    state.scores[3] = 4;
    state.scores[4] = 2;

    state = gameReducer(state, {
      type: ACTION_TYPES.RESET_ALL_SCORES,
    });

    expect(state.scores[1]).toBe(0);
    expect(state.scores[2]).toBe(0);
    expect(state.scores[3]).toBe(0);
    expect(state.scores[4]).toBe(0);
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
