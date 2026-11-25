import { describe, it, expect } from 'vitest';
import { checkPlayerWon } from '../src/game/turnManager';
import { gameReducer, ACTION_TYPES } from '../src/game/gameReducer';
import { createInitialGameState } from '../src/game/gameUtils';
import { PIECE_STATES } from '../src/game/constants';

describe('Winning Conditions Tests', () => {
  it('detects a win only when all 4 pieces are FINISHED', () => {
    const pieces3Finished = [
      { id: 0, state: PIECE_STATES.FINISHED },
      { id: 1, state: PIECE_STATES.FINISHED },
      { id: 2, state: PIECE_STATES.FINISHED },
      { id: 3, state: PIECE_STATES.HOME_LANE },
    ];
    expect(checkPlayerWon(pieces3Finished)).toBe(false);

    const pieces4Finished = [
      { id: 0, state: PIECE_STATES.FINISHED },
      { id: 1, state: PIECE_STATES.FINISHED },
      { id: 2, state: PIECE_STATES.FINISHED },
      { id: 3, state: PIECE_STATES.FINISHED },
    ];
    expect(checkPlayerWon(pieces4Finished)).toBe(true);
  });

  it('transitions game to GAME_OVER and sets winner when 4th piece finishes', () => {
    const state = createInitialGameState(2);
    // Set Player 1 (Red) to have 3 pieces finished, and 4th piece at step 55 (needs 1 to finish)
    state.pieces[1] = [
      { id: 0, colorKey: 'red', state: PIECE_STATES.FINISHED, step: 56 },
      { id: 1, colorKey: 'red', state: PIECE_STATES.FINISHED, step: 56 },
      { id: 2, colorKey: 'red', state: PIECE_STATES.FINISHED, step: 56 },
      { id: 3, colorKey: 'red', state: PIECE_STATES.HOME_LANE, step: 55 },
    ];
    state.currentPlayerIndex = 0; // Player 1
    state.diceValue = 1;
    state.diceRolled = true;
    state.legalMoves = [3];
    state.gameStatus = 'WAITING_MOVE';

    const endState = gameReducer(state, {
      type: ACTION_TYPES.MOVE_PIECE,
      payload: { pieceId: 3 },
    });

    expect(endState.gameStatus).toBe('GAME_OVER');
    expect(endState.winner.id).toBe(1);
    expect(endState.pieces[1][3].state).toBe(PIECE_STATES.FINISHED);
  });
});
