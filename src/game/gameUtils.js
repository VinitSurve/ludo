import { PIECE_STATES, BOARD_MODES, DEFAULT_PLAYERS_CONFIG, DEFAULT_RULES } from './constants';
import { CLASSIC_COLOR_CONFIG, EXTENDED_BOARD_DATA } from './boardLayouts';

/**
 * Initialize 4 pieces for a player with initial base coordinates.
 */
export function initializePlayerPieces(player, boardMode) {
  const pieces = [];
  const colorKey = player.colorKey;

  if (boardMode === BOARD_MODES.EXTENDED) {
    const secCfg = EXTENDED_BOARD_DATA.sectorConfigs[colorKey];
    for (let i = 0; i < 4; i++) {
      const slot = secCfg.baseSlots[i];
      pieces.push({
        id: i,
        playerId: player.id,
        colorKey,
        state: PIECE_STATES.BASE,
        step: -1,
        trackIndex: null,
        baseIndex: i,
        x: slot.x,
        y: slot.y,
      });
    }
  } else {
    const cfg = CLASSIC_COLOR_CONFIG[colorKey];
    for (let i = 0; i < 4; i++) {
      const baseCoord = cfg.baseCoords[i];
      pieces.push({
        id: i,
        playerId: player.id,
        colorKey,
        state: PIECE_STATES.BASE,
        step: -1,
        trackIndex: null,
        baseIndex: i,
        row: baseCoord.row,
        col: baseCoord.col,
      });
    }
  }

  return pieces;
}

/**
 * Creates initial game state for a given player count and options.
 */
export function createInitialGameState(playerCount = 4, customConfig = {}) {
  const boardMode = playerCount >= 5 ? BOARD_MODES.EXTENDED : BOARD_MODES.CLASSIC;
  const defaultPlayers = DEFAULT_PLAYERS_CONFIG[playerCount] || DEFAULT_PLAYERS_CONFIG[4];

  // Merge custom player names/avatars/colors if provided
  const players = defaultPlayers.map((defP, idx) => {
    const custom = customConfig.players?.[idx] || {};
    return {
      ...defP,
      name: custom.name || defP.name,
      avatar: custom.avatar || defP.avatar,
      colorKey: custom.colorKey || defP.colorKey,
    };
  });

  const pieces = {};
  const scores = {};

  players.forEach((p) => {
    pieces[p.id] = initializePlayerPieces(p, boardMode);
    scores[p.id] = customConfig.scores?.[p.id] ?? 0;
  });

  const rules = {
    ...DEFAULT_RULES,
    ...(customConfig.rules || {}),
  };

  return {
    playerCount,
    boardMode,
    players,
    currentPlayerIndex: 0,
    diceValue: null,
    diceRolled: false,
    isRolling: false,
    consecutiveSixes: 0,
    pieces,
    legalMoves: [],
    autoMovePieceId: null,
    isAutoMoving: false,
    hasBaseAction: false,
    basePieceIdToEnter: null,
    isMovingPiece: false,
    movingPieceId: null,
    movingPieceInfo: null,
    preMoveSnapshot: null,
    gameStatus: 'WAITING_ROLL',
    winner: null,
    rules,
    scores,
    gameHistory: [
      {
        id: 'init',
        timestamp: Date.now(),
        type: 'SYSTEM',
        message: `Game started with ${playerCount} players in ${boardMode === BOARD_MODES.EXTENDED ? 'Extended' : 'Classic'} mode.`,
      },
    ],
    lastEvent: null,
    undoStack: [],
  };
}
