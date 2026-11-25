import { describe, it, expect } from 'vitest';
import { checkCaptures, isSafeCell } from '../src/game/captures';
import { PIECE_STATES, BOARD_MODES, DEFAULT_RULES } from '../src/game/constants';

describe('Captures Logic Tests', () => {
  it('correctly identifies safe cells', () => {
    // In classic: 0 is Red start (safe), 8 is star (safe), 5 is normal track (not safe)
    expect(isSafeCell(0, BOARD_MODES.CLASSIC, DEFAULT_RULES)).toBe(true);
    expect(isSafeCell(8, BOARD_MODES.CLASSIC, DEFAULT_RULES)).toBe(true);
    expect(isSafeCell(5, BOARD_MODES.CLASSIC, DEFAULT_RULES)).toBe(false);
  });

  it('captures an opponent piece on a non-safe track square', () => {
    const movingPiece = {
      id: 0,
      playerId: 1,
      colorKey: 'red',
      state: PIECE_STATES.TRACK,
      trackIndex: 5, // Not safe
    };

    const allPieces = {
      1: [movingPiece],
      2: [
        {
          id: 0,
          playerId: 2,
          colorKey: 'yellow',
          state: PIECE_STATES.TRACK,
          trackIndex: 5, // Opponent occupying same non-safe cell!
        },
      ],
    };

    const captures = checkCaptures(movingPiece, allPieces, 1, BOARD_MODES.CLASSIC, DEFAULT_RULES);
    expect(captures.length).toBe(1);
    expect(captures[0]).toEqual({
      playerId: 2,
      pieceId: 0,
      trackIndex: 5,
    });
  });

  it('does NOT capture opponent pieces resting on a safe square', () => {
    const movingPiece = {
      id: 0,
      playerId: 1,
      colorKey: 'red',
      state: PIECE_STATES.TRACK,
      trackIndex: 8, // Safe Star Square!
    };

    const allPieces = {
      1: [movingPiece],
      2: [
        {
          id: 0,
          playerId: 2,
          colorKey: 'yellow',
          state: PIECE_STATES.TRACK,
          trackIndex: 8, // Opponent also on safe square
        },
      ],
    };

    const captures = checkCaptures(movingPiece, allPieces, 1, BOARD_MODES.CLASSIC, DEFAULT_RULES);
    expect(captures.length).toBe(0); // Safe from capture!
  });

  it('never captures own pieces on the same square', () => {
    const movingPiece = {
      id: 0,
      playerId: 1,
      colorKey: 'red',
      state: PIECE_STATES.TRACK,
      trackIndex: 5,
    };

    const allPieces = {
      1: [
        movingPiece,
        {
          id: 1,
          playerId: 1,
          colorKey: 'red',
          state: PIECE_STATES.TRACK,
          trackIndex: 5, // Own piece on same cell!
        },
      ],
    };

    const captures = checkCaptures(movingPiece, allPieces, 1, BOARD_MODES.CLASSIC, DEFAULT_RULES);
    expect(captures.length).toBe(0);
  });
});
