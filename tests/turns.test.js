import { describe, it, expect } from 'vitest';
import {
  getNextPlayerIndex,
  evaluateBonusTurn,
} from '../src/game/turnManager';
import { gameReducer, ACTION_TYPES } from '../src/game/gameReducer';
import { createInitialGameState } from '../src/game/gameUtils';
import { DEFAULT_RULES, PIECE_STATES } from '../src/game/constants';

describe('Turn Management Tests', () => {
  it('rotates turns in correct circular order for 2, 4, and 6 players', () => {
    // 4 players: 0 -> 1 -> 2 -> 3 -> 0
    expect(getNextPlayerIndex(0, 4)).toBe(1);
    expect(getNextPlayerIndex(1, 4)).toBe(2);
    expect(getNextPlayerIndex(2, 4)).toBe(3);
    expect(getNextPlayerIndex(3, 4)).toBe(0);

    // 6 players: 5 -> 0
    expect(getNextPlayerIndex(5, 6)).toBe(0);
  });

  it('grants a bonus turn when rolling a 6', () => {
    const result = evaluateBonusTurn({
      diceValue: 6,
      consecutiveSixes: 1,
      hasCaptured: false,
      hasFinishedPiece: false,
      rules: DEFAULT_RULES,
    });
    expect(result.extraTurn).toBe(true);
    expect(result.reason).toBe('rolled_six');
  });

  it('grants a bonus turn on capturing an opponent', () => {
    const result = evaluateBonusTurn({
      diceValue: 3,
      consecutiveSixes: 0,
      hasCaptured: true,
      hasFinishedPiece: false,
      rules: DEFAULT_RULES,
    });
    expect(result.extraTurn).toBe(true);
    expect(result.reason).toBe('capture');
  });

  it('grants a bonus turn on finishing a piece', () => {
    const result = evaluateBonusTurn({
      diceValue: 2,
      consecutiveSixes: 0,
      hasCaptured: false,
      hasFinishedPiece: true,
      rules: DEFAULT_RULES,
    });
    expect(result.extraTurn).toBe(true);
    expect(result.reason).toBe('finish_piece');
  });

  it('does NOT grant bonus turn on a normal roll without capture or finish', () => {
    const result = evaluateBonusTurn({
      diceValue: 4,
      consecutiveSixes: 0,
      hasCaptured: false,
      hasFinishedPiece: false,
      rules: DEFAULT_RULES,
    });
    expect(result.extraTurn).toBe(false);
  });

  it('forfeits turn on three consecutive sixes when rule is enabled', () => {
    const rulesWithPenalty = { ...DEFAULT_RULES, threeSixesPenalty: true };
    const result = evaluateBonusTurn({
      diceValue: 6,
      consecutiveSixes: 3,
      hasCaptured: false,
      hasFinishedPiece: false,
      rules: rulesWithPenalty,
    });
    expect(result.extraTurn).toBe(false);
    expect(result.reason).toBe('three_sixes_penalty');
  });

  it('automatically passes turn when no legal moves exist', () => {
    const initialState = createInitialGameState(4);
    // All pieces are in base, roll a 2 (cannot leave base without 6)
    const stateAfterRoll = gameReducer(initialState, {
      type: ACTION_TYPES.ROLL_DICE_COMPLETE,
      payload: { diceValue: 2 },
    });

    expect(stateAfterRoll.legalMoves).toEqual([]);
    // Passing turn advances player
    const stateAfterPass = gameReducer(stateAfterRoll, {
      type: ACTION_TYPES.PASS_TURN,
    });
    expect(stateAfterPass.currentPlayerIndex).toBe(1);
    expect(stateAfterPass.gameStatus).toBe('WAITING_ROLL');
  });
});
