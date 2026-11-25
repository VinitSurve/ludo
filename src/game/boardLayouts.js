import { CELL_TYPES, PLAYER_COLORS } from './constants';

/**
 * Classic 15x15 Ludo Board Layout (2 to 4 players)
 * Mathematically generates the complete 15x15 grid, cells, and paths.
 */

// 52-cell main track coordinates in clockwise order starting at Red Start (6, 1)
export const CLASSIC_TRACK_COORDS = [
  // Red arm going east
  { row: 6, col: 1 },  // 0: Red Start (Safe)
  { row: 6, col: 2 },  // 1
  { row: 6, col: 3 },  // 2
  { row: 6, col: 4 },  // 3
  { row: 6, col: 5 },  // 4
  // Up into top arm
  { row: 5, col: 6 },  // 5
  { row: 4, col: 6 },  // 6
  { row: 3, col: 6 },  // 7
  { row: 2, col: 6 },  // 8: Safe Star
  { row: 1, col: 6 },  // 9
  { row: 0, col: 6 },  // 10
  // Top crossover
  { row: 0, col: 7 },  // 11
  // Down top arm
  { row: 0, col: 8 },  // 12
  { row: 1, col: 8 },  // 13: Green Start (Safe)
  { row: 2, col: 8 },  // 14
  { row: 3, col: 8 },  // 15
  { row: 4, col: 8 },  // 16
  { row: 5, col: 8 },  // 17
  // Right into right arm
  { row: 6, col: 9 },  // 18
  { row: 6, col: 10 }, // 19
  { row: 6, col: 11 }, // 20
  { row: 6, col: 12 }, // 21: Safe Star
  { row: 6, col: 13 }, // 22
  { row: 6, col: 14 }, // 23
  // Right crossover
  { row: 7, col: 14 }, // 24
  // Left along right arm
  { row: 8, col: 14 }, // 25
  { row: 8, col: 13 }, // 26: Yellow Start (Safe)
  { row: 8, col: 12 }, // 27
  { row: 8, col: 11 }, // 28
  { row: 8, col: 10 }, // 29
  { row: 8, col: 9 },  // 30
  // Down into bottom arm
  { row: 9, col: 8 },  // 31
  { row: 10, col: 8 }, // 32
  { row: 11, col: 8 }, // 33
  { row: 12, col: 8 }, // 34: Safe Star
  { row: 13, col: 8 }, // 35
  { row: 14, col: 8 }, // 36
  // Bottom crossover
  { row: 14, col: 7 }, // 37
  // Up bottom arm
  { row: 14, col: 6 }, // 38
  { row: 13, col: 6 }, // 39: Blue Start (Safe)
  { row: 12, col: 6 }, // 40
  { row: 11, col: 6 }, // 41
  { row: 10, col: 6 }, // 42
  { row: 9, col: 6 },  // 43
  // Left into left arm
  { row: 8, col: 5 },  // 44
  { row: 8, col: 4 },  // 45
  { row: 8, col: 3 },  // 46
  { row: 8, col: 2 },  // 47: Safe Star
  { row: 8, col: 1 },  // 48
  { row: 8, col: 0 },  // 49
  // Left crossover
  { row: 7, col: 0 },  // 50
  // Up to return to 0
  { row: 6, col: 0 },  // 51
];

// Safe track indices for Classic board
export const CLASSIC_SAFE_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];

// Start track index for each color in classic board
export const CLASSIC_COLOR_CONFIG = {
  red: {
    startTrackIndex: 0,
    baseCoords: [
      { row: 2, col: 2 },
      { row: 2, col: 3 },
      { row: 3, col: 2 },
      { row: 3, col: 3 },
    ],
    baseArea: { startRow: 0, endRow: 5, startCol: 0, endCol: 5 },
    homeLaneCoords: [
      { row: 7, col: 1 },
      { row: 7, col: 2 },
      { row: 7, col: 3 },
      { row: 7, col: 4 },
      { row: 7, col: 5 },
    ],
    finishCoord: { row: 7, col: 6 },
    entryTrackIndex: 50, // Cell before entering home lane
  },
  green: {
    startTrackIndex: 13,
    baseCoords: [
      { row: 2, col: 11 },
      { row: 2, col: 12 },
      { row: 3, col: 11 },
      { row: 3, col: 12 },
    ],
    baseArea: { startRow: 0, endRow: 5, startCol: 9, endCol: 14 },
    homeLaneCoords: [
      { row: 1, col: 7 },
      { row: 2, col: 7 },
      { row: 3, col: 7 },
      { row: 4, col: 7 },
      { row: 5, col: 7 },
    ],
    finishCoord: { row: 6, col: 7 },
    entryTrackIndex: 11,
  },
  yellow: {
    startTrackIndex: 26,
    baseCoords: [
      { row: 11, col: 11 },
      { row: 11, col: 12 },
      { row: 12, col: 11 },
      { row: 12, col: 12 },
    ],
    baseArea: { startRow: 9, endRow: 14, startCol: 9, endCol: 14 },
    homeLaneCoords: [
      { row: 7, col: 13 },
      { row: 7, col: 12 },
      { row: 7, col: 11 },
      { row: 7, col: 10 },
      { row: 7, col: 9 },
    ],
    finishCoord: { row: 7, col: 8 },
    entryTrackIndex: 24,
  },
  blue: {
    startTrackIndex: 39,
    baseCoords: [
      { row: 11, col: 2 },
      { row: 11, col: 3 },
      { row: 12, col: 2 },
      { row: 12, col: 3 },
    ],
    baseArea: { startRow: 9, endRow: 14, startCol: 0, endCol: 5 },
    homeLaneCoords: [
      { row: 13, col: 7 },
      { row: 12, col: 7 },
      { row: 11, col: 7 },
      { row: 10, col: 7 },
      { row: 9, col: 7 },
    ],
    finishCoord: { row: 8, col: 7 },
    entryTrackIndex: 37,
  },
};

/**
 * Generate full path of coordinates for a color in Classic Ludo.
 * Total 57 steps (0..50 on track = 51 steps, 5 home lane steps = 56 steps, 1 finish step = 57th step at index 56).
 */
export function generateClassicPlayerPath(colorKey) {
  const cfg = CLASSIC_COLOR_CONFIG[colorKey];
  if (!cfg) return [];

  const path = [];
  // 51 track steps starting from startTrackIndex
  for (let i = 0; i < 51; i++) {
    const trackIdx = (cfg.startTrackIndex + i) % 52;
    path.push({
      ...CLASSIC_TRACK_COORDS[trackIdx],
      step: i,
      trackIndex: trackIdx,
      isHomeLane: false,
      isFinish: false,
      isSafe: CLASSIC_SAFE_INDICES.includes(trackIdx),
    });
  }

  // 5 home lane steps
  cfg.homeLaneCoords.forEach((coord, idx) => {
    path.push({
      ...coord,
      step: 51 + idx,
      trackIndex: null,
      isHomeLane: true,
      homeLaneIndex: idx,
      isFinish: false,
      isSafe: true,
    });
  });

  // Finish step (step 56)
  path.push({
    ...cfg.finishCoord,
    step: 56,
    trackIndex: null,
    isHomeLane: false,
    homeLaneIndex: 5,
    isFinish: true,
    isSafe: true,
  });

  return path;
}

/**
 * Generates the full 15x15 cell map for Classic Ludo.
 */
export function generateClassicBoardGrid() {
  const grid = Array.from({ length: 15 }, (_, r) =>
    Array.from({ length: 15 }, (_, c) => ({
      row: r,
      col: c,
      type: CELL_TYPES.EMPTY,
      playerColor: null,
      trackIndex: null,
      isSafe: false,
      isStart: false,
      homeLaneIndex: null,
      isCenter: false,
    }))
  );

  // 1. Mark bases
  Object.entries(CLASSIC_COLOR_CONFIG).forEach(([colorKey, cfg]) => {
    const { startRow, endRow, startCol, endCol } = cfg.baseArea;
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        grid[r][c].type = CELL_TYPES.HOME;
        grid[r][c].playerColor = colorKey;
        grid[r][c].isSafe = true;
      }
    }
  });

  // 2. Mark track cells
  CLASSIC_TRACK_COORDS.forEach((coord, idx) => {
    const cell = grid[coord.row][coord.col];
    cell.type = CELL_TYPES.TRACK;
    cell.trackIndex = idx;
    cell.isSafe = CLASSIC_SAFE_INDICES.includes(idx);

    // Check if start square
    Object.entries(CLASSIC_COLOR_CONFIG).forEach(([colorKey, cfg]) => {
      if (cfg.startTrackIndex === idx) {
        cell.type = CELL_TYPES.START;
        cell.playerColor = colorKey;
        cell.isStart = true;
        cell.isSafe = true;
      }
    });
  });

  // 3. Mark home lanes
  Object.entries(CLASSIC_COLOR_CONFIG).forEach(([colorKey, cfg]) => {
    cfg.homeLaneCoords.forEach((coord, laneIdx) => {
      const cell = grid[coord.row][coord.col];
      cell.type = CELL_TYPES.HOME_LANE;
      cell.playerColor = colorKey;
      cell.homeLaneIndex = laneIdx;
      cell.isSafe = true;
    });
  });

  // 4. Mark Center (3x3 rows 6..8, cols 6..8)
  for (let r = 6; r <= 8; r++) {
    for (let c = 6; c <= 8; c++) {
      grid[r][c].type = CELL_TYPES.CENTER;
      grid[r][c].isCenter = true;
      grid[r][c].isSafe = true;
    }
  }

  return grid;
}

/**
 * =========================================================================
 * EXTENDED LUDO BOARD (5 to 6 Players)
 * Symmetrical 6-sector hexagonal geometry with 66 track cells,
 * 6 home bases, 6 starting positions, 6 home lanes, and central finish.
 * =========================================================================
 */

export const EXTENDED_COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
export const EXTENDED_TRACK_LENGTH = 66; // 11 cells per sector x 6 = 66
export const EXTENDED_CELLS_PER_SECTOR = 11;

/**
 * Generates coordinates for 6-player hexagonal board layout in a 1000x1000 SVG space.
 */
export function generateExtendedBoardData() {
  const centerX = 500;
  const centerY = 500;
  const boardRadius = 480;
  const centerRadius = 85;
  const W = 42; // half-width between flanks (arm width ~84px)

  // Track coordinates: 66 points forming a continuous hexagonal star track
  const trackCoords = [];
  const safeIndices = [];
  const sectorConfigs = {};

  // 1. Generate sector configs: base centers, 4 slots, 5 home lane coords, finish coord
  for (let s = 0; s < 6; s++) {
    const colorKey = EXTENDED_COLORS[s];
    const thetaArm = (s * 60 - 90) * (Math.PI / 180);
    const thetaBay = (s * 60 + 30 - 90) * (Math.PI / 180);

    const startTrackIndex = s * EXTENDED_CELLS_PER_SECTOR + 6; // Right flank outer (r = 385, offset = +W)
    const starIndex = s * EXTENDED_CELLS_PER_SECTOR + 2;       // Left flank (r = 265, offset = -W)
    safeIndices.push(startTrackIndex); // Start square is safe
    safeIndices.push(starIndex);       // Star safe square

    // Base circular card located in bay at radius 330 (plenty of clearance from arms and outer hexagon)
    const baseX = Math.round(centerX + Math.cos(thetaBay) * 330);
    const baseY = Math.round(centerY + Math.sin(thetaBay) * 330);

    // 4 piece slots in base card
    const slotOffset = 21;
    const baseSlots = [
      { x: baseX - slotOffset, y: baseY - slotOffset },
      { x: baseX + slotOffset, y: baseY - slotOffset },
      { x: baseX - slotOffset, y: baseY + slotOffset },
      { x: baseX + slotOffset, y: baseY + slotOffset },
    ];

    // 5 home lane coords heading inward along arm centerline (offset = 0)
    // Radii: 340, 285, 230, 175, 120 (spaced by 55px heading straight into center)
    const homeLaneCoords = [];
    for (let h = 0; h < 5; h++) {
      const dist = 340 - h * 55;
      homeLaneCoords.push({
        x: Math.round(centerX + Math.cos(thetaArm) * dist),
        y: Math.round(centerY + Math.sin(thetaArm) * dist),
      });
    }

    // Finish coord inside central trophy area (radius 65 along arm angle)
    const finishCoord = {
      x: Math.round(centerX + Math.cos(thetaArm) * 65),
      y: Math.round(centerY + Math.sin(thetaArm) * 65),
    };

    sectorConfigs[colorKey] = {
      sectorIndex: s,
      colorKey,
      startTrackIndex,
      entryTrackIndex: (startTrackIndex + 64) % EXTENDED_TRACK_LENGTH, // s * 11 + 4 (left flank outer)
      baseCenter: { x: baseX, y: baseY },
      baseSlots,
      homeLaneCoords,
      finishCoord,
      angleDeg: s * 60 - 90,
    };
  }

  // 2. Generate 66 track coordinates forming a continuous 6-pointed star circuit
  // 11 cells per sector:
  // k = 0..4: left flank moving outward towards tip (offset -W)
  // k = 5: arm tip peak (radius 435, offset 0)
  // k = 6..10: right flank moving inward towards valley (offset +W)
  for (let s = 0; s < 6; s++) {
    const thetaArm = (s * 60 - 90) * (Math.PI / 180);
    const cosArm = Math.cos(thetaArm);
    const sinArm = Math.sin(thetaArm);

    const rOut = [145, 205, 265, 325, 385];
    const rIn = [385, 325, 265, 205, 145];

    // Left flank: 0..4 (offset -W)
    for (let k = 0; k < 5; k++) {
      const idx = s * EXTENDED_CELLS_PER_SECTOR + k;
      const x = Math.round(centerX + rOut[k] * cosArm - (-W) * sinArm);
      const y = Math.round(centerY + rOut[k] * sinArm + (-W) * cosArm);
      trackCoords.push({
        x,
        y,
        trackIndex: idx,
        sector: s,
        isSafe: safeIndices.includes(idx),
        isStart: false,
        startColor: null,
      });
    }

    // Tip: 5 (offset 0)
    const tipIdx = s * EXTENDED_CELLS_PER_SECTOR + 5;
    trackCoords.push({
      x: Math.round(centerX + 435 * cosArm),
      y: Math.round(centerY + 435 * sinArm),
      trackIndex: tipIdx,
      sector: s,
      isSafe: safeIndices.includes(tipIdx),
      isStart: false,
      startColor: null,
    });

    // Right flank: 6..10 (offset +W)
    for (let k = 0; k < 5; k++) {
      const idx = s * EXTENDED_CELLS_PER_SECTOR + 6 + k;
      const isStart = (k === 0);
      const x = Math.round(centerX + rIn[k] * cosArm - W * sinArm);
      const y = Math.round(centerY + rIn[k] * sinArm + W * cosArm);
      trackCoords.push({
        x,
        y,
        trackIndex: idx,
        sector: s,
        isSafe: safeIndices.includes(idx),
        isStart,
        startColor: isStart ? EXTENDED_COLORS[s] : null,
      });
    }
  }

  return {
    centerX,
    centerY,
    boardRadius,
    centerRadius,
    trackCoords,
    safeIndices,
    sectorConfigs,
  };
}

export const EXTENDED_BOARD_DATA = generateExtendedBoardData();

/**
 * Generate full path of coordinates for a color in Extended 6-Player Ludo.
 * Total 71 steps (0..64 on track = 65 steps, 5 home lane steps = 70 steps, 1 finish step = 71st step at index 70).
 */
export function generateExtendedPlayerPath(colorKey) {
  const cfg = EXTENDED_BOARD_DATA.sectorConfigs[colorKey];
  if (!cfg) return [];

  const path = [];
  const totalTrackSteps = EXTENDED_TRACK_LENGTH - 1; // 65 steps before home lane

  for (let i = 0; i < totalTrackSteps; i++) {
    const trackIdx = (cfg.startTrackIndex + i) % EXTENDED_TRACK_LENGTH;
    const coord = EXTENDED_BOARD_DATA.trackCoords[trackIdx];
    path.push({
      x: coord.x,
      y: coord.y,
      step: i,
      trackIndex: trackIdx,
      isHomeLane: false,
      isFinish: false,
      isSafe: EXTENDED_BOARD_DATA.safeIndices.includes(trackIdx),
    });
  }

  // 5 home lane steps
  cfg.homeLaneCoords.forEach((coord, idx) => {
    path.push({
      x: coord.x,
      y: coord.y,
      step: totalTrackSteps + idx,
      trackIndex: null,
      isHomeLane: true,
      homeLaneIndex: idx,
      isFinish: false,
      isSafe: true,
    });
  });

  // Finish step (step 70)
  path.push({
    x: cfg.finishCoord.x,
    y: cfg.finishCoord.y,
    step: totalTrackSteps + cfg.homeLaneCoords.length,
    trackIndex: null,
    isHomeLane: false,
    homeLaneIndex: 5,
    isFinish: true,
    isSafe: true,
  });

  return path;
}

/**
 * =========================================================================
 * BOARD VALIDATION FUNCTION (Phase 6 requirement)
 * Validates board dimensions, paths, connectivity, safe squares, home lanes.
 * =========================================================================
 */
export function validateBoardLayouts() {
  const errors = [];

  // 1. Validate Classic Grid
  const classicGrid = generateClassicBoardGrid();
  if (classicGrid.length !== 15 || classicGrid.some(r => r.length !== 15)) {
    errors.push('Classic grid is not 15x15.');
  }

  // Validate Classic Track length
  if (CLASSIC_TRACK_COORDS.length !== 52) {
    errors.push(`Classic track has ${CLASSIC_TRACK_COORDS.length} cells, expected 52.`);
  }

  // Validate Classic Safe Squares (8 safe squares)
  if (CLASSIC_SAFE_INDICES.length !== 8) {
    errors.push(`Classic safe indices count is ${CLASSIC_SAFE_INDICES.length}, expected 8.`);
  }

  // Validate Classic Player Paths (Red, Green, Yellow, Blue)
  ['red', 'green', 'yellow', 'blue'].forEach(color => {
    const path = generateClassicPlayerPath(color);
    // 51 track + 5 home lane + 1 finish = 57 steps (step indices 0..56)
    if (path.length !== 57) {
      errors.push(`Classic path for ${color} has length ${path.length}, expected 57.`);
    }
    if (!path[0].isSafe) {
      errors.push(`Classic starting cell for ${color} must be safe.`);
    }
    const finishStep = path[path.length - 1];
    if (!finishStep.isFinish) {
      errors.push(`Classic finish cell for ${color} is not marked as finish.`);
    }

    // Check connectivity: each step should be on grid
    path.forEach((pt, idx) => {
      if (pt.row < 0 || pt.row > 14 || pt.col < 0 || pt.col > 14) {
        errors.push(`Step ${idx} for ${color} out of bounds: (${pt.row}, ${pt.col})`);
      }
    });
  });

  // 2. Validate Extended Board
  if (EXTENDED_BOARD_DATA.trackCoords.length !== EXTENDED_TRACK_LENGTH) {
    errors.push(`Extended track has ${EXTENDED_BOARD_DATA.trackCoords.length} cells, expected ${EXTENDED_TRACK_LENGTH}.`);
  }

  // Verify track coordinates are all distinct
  const coordSet = new Set();
  EXTENDED_BOARD_DATA.trackCoords.forEach((coord, idx) => {
    const key = `${coord.x}_${coord.y}`;
    if (coordSet.has(key)) {
      errors.push(`Duplicate track coordinate at index ${idx}: (${coord.x}, ${coord.y})`);
    }
    coordSet.add(key);
  });

  // Check pairwise distances across track cells (minimum 40px required to prevent overlapping)
  for (let i = 0; i < EXTENDED_BOARD_DATA.trackCoords.length; i++) {
    for (let j = i + 1; j < EXTENDED_BOARD_DATA.trackCoords.length; j++) {
      const c1 = EXTENDED_BOARD_DATA.trackCoords[i];
      const c2 = EXTENDED_BOARD_DATA.trackCoords[j];
      const d = Math.hypot(c1.x - c2.x, c1.y - c2.y);
      if (d < 40) {
        errors.push(`Track cells ${i} and ${j} overlap! Distance is ${d.toFixed(1)}px (min 40px required).`);
      }
    }
  }

  // Check clearances between home base centers and track cells (minimum 100px)
  Object.entries(EXTENDED_BOARD_DATA.sectorConfigs).forEach(([colorKey, cfg]) => {
    EXTENDED_BOARD_DATA.trackCoords.forEach((tCoord, tIdx) => {
      const d = Math.hypot(cfg.baseCenter.x - tCoord.x, cfg.baseCenter.y - tCoord.y);
      if (d < 100) {
        errors.push(`Home base ${colorKey} center too close to track cell ${tIdx}: ${d.toFixed(1)}px (min 100px).`);
      }
    });

    // Check clearances between home lane cells and track cells (minimum 35px)
    cfg.homeLaneCoords.forEach((hCoord, hIdx) => {
      EXTENDED_BOARD_DATA.trackCoords.forEach((tCoord, tIdx) => {
        const d = Math.hypot(hCoord.x - tCoord.x, hCoord.y - tCoord.y);
        if (d < 35) {
          errors.push(`Home lane ${colorKey} cell ${hIdx} collides with track cell ${tIdx}: ${d.toFixed(1)}px (min 35px).`);
        }
      });
    });
  });

  EXTENDED_COLORS.forEach(color => {
    const path = generateExtendedPlayerPath(color);
    // 65 track + 5 home lane + 1 finish = 71 steps (step indices 0..70)
    if (path.length !== 71) {
      errors.push(`Extended path for ${color} has length ${path.length}, expected 71.`);
    }
    if (!path[0].isSafe) {
      errors.push(`Extended starting cell for ${color} must be safe.`);
    }
    const finishStep = path[path.length - 1];
    if (!finishStep.isFinish) {
      errors.push(`Extended finish cell for ${color} is not marked as finish.`);
    }

    // Verify consecutive step distances are smooth and without jumps
    for (let s = 0; s < path.length - 1; s++) {
      const d = Math.hypot(path[s].x - path[s + 1].x, path[s].y - path[s + 1].y);
      if (d < 40 || d > 90) {
        errors.push(`Irregular step distance on ${color} path from step ${s} to ${s + 1}: ${d.toFixed(1)}px (expected 40-90px).`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
