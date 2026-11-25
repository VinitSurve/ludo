import { describe, it, expect } from 'vitest';
import {
  generateClassicBoardGrid,
  CLASSIC_TRACK_COORDS,
  CLASSIC_SAFE_INDICES,
  generateClassicPlayerPath,
  validateBoardLayouts,
} from '../src/game/boardLayouts';

describe('Classic Board Layout and Geometry Tests', () => {
  it('validates entire classic board layout using validateBoardLayouts() without errors', () => {
    const result = validateBoardLayouts();
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('generates a 15x15 classic grid with all required cell types', () => {
    const grid = generateClassicBoardGrid();
    expect(grid.length).toBe(15);
    expect(grid.every((row) => row.length === 15)).toBe(true);

    let homeCount = 0;
    let trackCount = 0;
    let homeLaneCount = 0;
    let centerCount = 0;

    grid.forEach((row) => {
      row.forEach((cell) => {
        if (cell.type === 'HOME') homeCount++;
        if (cell.type === 'TRACK' || cell.type === 'START') trackCount++;
        if (cell.type === 'HOME_LANE') homeLaneCount++;
        if (cell.type === 'CENTER') centerCount++;
      });
    });

    expect(homeCount).toBe(4 * 36); // 144 base cells
    expect(trackCount).toBe(52); // 52 main track squares
    expect(homeLaneCount).toBe(4 * 5); // 20 home lane cells
    expect(centerCount).toBe(9); // 3x3 center
  });

  it('has exactly 52 track coordinates and 8 safe squares in Classic mode', () => {
    expect(CLASSIC_TRACK_COORDS.length).toBe(52);
    expect(CLASSIC_SAFE_INDICES.length).toBe(8);
  });

  it('generates connected valid paths for all 4 classic players', () => {
    ['red', 'green', 'yellow', 'blue'].forEach((color) => {
      const path = generateClassicPlayerPath(color);
      expect(path.length).toBe(57); // 51 track + 5 home lane + 1 finish
      expect(path[0].isSafe).toBe(true);
      expect(path[56].isFinish).toBe(true);

      // Verify no coordinates are out of grid bounds (0..14)
      path.forEach((pt) => {
        expect(pt.row).toBeGreaterThanOrEqual(0);
        expect(pt.row).toBeLessThanOrEqual(14);
        expect(pt.col).toBeGreaterThanOrEqual(0);
        expect(pt.col).toBeLessThanOrEqual(14);
      });
    });
  });
});
