import { describe, it, expect } from 'vitest';
import {
  generateClassicBoardGrid,
  CLASSIC_TRACK_COORDS,
  CLASSIC_SAFE_INDICES,
  generateClassicPlayerPath,
  generateExtendedBoardData,
  generateExtendedPlayerPath,
  validateBoardLayouts,
} from '../src/game/boardLayouts';

describe('Board Layout and Geometry Tests', () => {
  it('validates entire board layout using validateBoardLayouts() without errors', () => {
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

    // 4 bases of 6x6 = 144 max, minus overlapping parts
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

  it('generates symmetrical 6-sector geometry for Extended mode', () => {
    const extData = generateExtendedBoardData();
    expect(extData.trackCoords.length).toBe(66);
    expect(extData.safeIndices.length).toBe(12); // 2 per sector (start square and star square)

    ['red', 'blue', 'green', 'yellow', 'purple', 'orange'].forEach((color) => {
      const path = generateExtendedPlayerPath(color);
      expect(path.length).toBe(71); // 65 track + 5 home lane + 1 finish
      expect(path[0].isSafe).toBe(true);
      expect(path[70].isFinish).toBe(true);
    });
  });

  it('verifies that no track cells or board elements overlap in Extended mode', () => {
    const extData = generateExtendedBoardData();

    // 1. Verify track coordinates are distinct and have pairwise distance >= 40px
    const trackSet = new Set();
    extData.trackCoords.forEach((coord, idx) => {
      const key = `${coord.x}_${coord.y}`;
      expect(trackSet.has(key)).toBe(false);
      trackSet.add(key);
    });

    for (let i = 0; i < extData.trackCoords.length; i++) {
      for (let j = i + 1; j < extData.trackCoords.length; j++) {
        const d = Math.hypot(
          extData.trackCoords[i].x - extData.trackCoords[j].x,
          extData.trackCoords[i].y - extData.trackCoords[j].y
        );
        expect(d).toBeGreaterThanOrEqual(40);
      }
    }

    // 2. Verify all board elements (track, home lane, base slots) have pairwise distance >= 40px
    const allCells = [];
    extData.trackCoords.forEach((t) => allCells.push({ x: t.x, y: t.y, name: `track_${t.trackIndex}` }));
    Object.entries(extData.sectorConfigs).forEach(([color, cfg]) => {
      cfg.homeLaneCoords.forEach((h, idx) => allCells.push({ x: h.x, y: h.y, name: `hl_${color}_${idx}` }));
      cfg.baseSlots.forEach((b, idx) => allCells.push({ x: b.x, y: b.y, name: `slot_${color}_${idx}` }));
    });

    for (let i = 0; i < allCells.length; i++) {
      for (let j = i + 1; j < allCells.length; j++) {
        const d = Math.hypot(allCells[i].x - allCells[j].x, allCells[i].y - allCells[j].y);
        expect(d).toBeGreaterThanOrEqual(40);
      }
    }

    // 3. Verify home base centers maintain at least 100px clearance from all track cells
    Object.entries(extData.sectorConfigs).forEach(([color, cfg]) => {
      extData.trackCoords.forEach((tCoord) => {
        const d = Math.hypot(cfg.baseCenter.x - tCoord.x, cfg.baseCenter.y - tCoord.y);
        expect(d).toBeGreaterThanOrEqual(100);
      });
    });
  });

  it('verifies smooth and continuous 71-step path progression for all extended players', () => {
    ['red', 'blue', 'green', 'yellow', 'purple', 'orange'].forEach((color) => {
      const path = generateExtendedPlayerPath(color);
      expect(path.length).toBe(71);

      // Verify each consecutive step is between 40px and 90px (no teleportation or jump bugs)
      for (let i = 0; i < path.length - 1; i++) {
        const d = Math.hypot(path[i].x - path[i + 1].x, path[i].y - path[i + 1].y);
        expect(d).toBeGreaterThanOrEqual(40);
        expect(d).toBeLessThanOrEqual(90);
      }
    });
  });
});
