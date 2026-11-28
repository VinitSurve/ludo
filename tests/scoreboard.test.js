import { describe, it, expect } from 'vitest';
import { createInitialGameState } from '../src/game/gameUtils';
import { calculatePlayerPieceStats } from '../src/game/turnManager';

describe('Scoreboard Tests', () => {
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
});
