import { describe, it, expect } from 'vitest';
import {
  canPieceMove,
  getLegalMoves,
  computePieceMove,
} from '../src/game/movement';
import { PIECE_STATES, BOARD_MODES, DEFAULT_RULES } from '../src/game/constants';

describe('Movement Logic Tests', () => {
  const basePiece = {
    id: 0,
    playerId: 1,
    colorKey: 'red',
    state: PIECE_STATES.BASE,
    step: -1,
  };

  it('does not allow a piece to leave base without rolling a 6', () => {
    for (let roll = 1; roll <= 5; roll++) {
      expect(canPieceMove(basePiece, roll, 'red', BOARD_MODES.CLASSIC, DEFAULT_RULES)).toBe(false);
    }
  });

  it('allows a piece in base to leave when rolling a 6', () => {
    expect(canPieceMove(basePiece, 6, 'red', BOARD_MODES.CLASSIC, DEFAULT_RULES)).toBe(true);
    const moved = computePieceMove(basePiece, 6, 'red', BOARD_MODES.CLASSIC, DEFAULT_RULES);
    expect(moved.state).toBe(PIECE_STATES.TRACK);
    expect(moved.step).toBe(0);
    expect(moved.trackIndex).toBe(0); // Red start index
  });

  it('moves an active piece by the correct number of steps', () => {
    const trackPiece = {
      id: 1,
      playerId: 1,
      colorKey: 'red',
      state: PIECE_STATES.TRACK,
      step: 10,
      trackIndex: 10,
    };

    const moved = computePieceMove(trackPiece, 4, 'red', BOARD_MODES.CLASSIC, DEFAULT_RULES);
    expect(moved.step).toBe(14);
    expect(moved.trackIndex).toBe(14);
  });

  it('prevents overshooting the finish square when exactFinish is enabled', () => {
    // Finish step in classic is 56
    const nearFinishPiece = {
      id: 2,
      playerId: 1,
      colorKey: 'red',
      state: PIECE_STATES.HOME_LANE,
      step: 54, // needs exact 2 to finish (54 + 2 = 56)
    };

    // Rolling 3 would overshoot (54 + 3 = 57 > 56)
    expect(canPieceMove(nearFinishPiece, 3, 'red', BOARD_MODES.CLASSIC, DEFAULT_RULES)).toBe(false);
    // Rolling 2 lands exactly on finish
    expect(canPieceMove(nearFinishPiece, 2, 'red', BOARD_MODES.CLASSIC, DEFAULT_RULES)).toBe(true);
    // Rolling 1 moves deeper into home lane
    expect(canPieceMove(nearFinishPiece, 1, 'red', BOARD_MODES.CLASSIC, DEFAULT_RULES)).toBe(true);
  });

  it('marks a piece as FINISHED when it lands exactly on the finish step', () => {
    const piece = {
      id: 0,
      playerId: 1,
      colorKey: 'red',
      state: PIECE_STATES.HOME_LANE,
      step: 54,
    };

    const moved = computePieceMove(piece, 2, 'red', BOARD_MODES.CLASSIC, DEFAULT_RULES);
    expect(moved.state).toBe(PIECE_STATES.FINISHED);
    expect(moved.step).toBe(56);
  });

  it('does not allow finished pieces to move again', () => {
    const finishedPiece = {
      id: 0,
      playerId: 1,
      colorKey: 'red',
      state: PIECE_STATES.FINISHED,
      step: 56,
    };

    expect(canPieceMove(finishedPiece, 6, 'red', BOARD_MODES.CLASSIC, DEFAULT_RULES)).toBe(false);
    expect(canPieceMove(finishedPiece, 1, 'red', BOARD_MODES.CLASSIC, DEFAULT_RULES)).toBe(false);
  });

  it('returns all legal piece IDs for a player', () => {
    const pieces = [
      { id: 0, state: PIECE_STATES.BASE, step: -1 },
      { id: 1, state: PIECE_STATES.TRACK, step: 20 },
      { id: 2, state: PIECE_STATES.FINISHED, step: 56 },
      { id: 3, state: PIECE_STATES.HOME_LANE, step: 54 },
    ];

    // On roll 6: base piece (0) and track piece (1) can move, but 3 overshoots (54+6=60)
    const legalOn6 = getLegalMoves(pieces, 6, 'red', BOARD_MODES.CLASSIC, DEFAULT_RULES);
    expect(legalOn6).toContain(0);
    expect(legalOn6).toContain(1);
    expect(legalOn6).not.toContain(2);
    expect(legalOn6).not.toContain(3);

    // On roll 2: base cannot move, track piece can move, near-finish piece (3) can move to finish!
    const legalOn2 = getLegalMoves(pieces, 2, 'red', BOARD_MODES.CLASSIC, DEFAULT_RULES);
    expect(legalOn2).not.toContain(0);
    expect(legalOn2).toContain(1);
    expect(legalOn2).not.toContain(2);
    expect(legalOn2).toContain(3);
  });
});
