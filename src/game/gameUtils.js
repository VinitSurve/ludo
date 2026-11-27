import { PIECE_STATES, BOARD_MODES, DEFAULT_PLAYERS_CONFIG, DEFAULT_RULES } from './constants';
import { CLASSIC_COLOR_CONFIG } from './boardLayouts';

/**
 * Initialize 4 pieces for a player with initial base coordinates.
 */
export function initializePlayerPieces(player) {
  const pieces = [];
  const colorKey = player.colorKey;
  const cfg = CLASSIC_COLOR_CONFIG[colorKey];

  for (let i = 0; i < 4; i++) {
    const baseCoord = cfg?.baseCoords[i] || { row: 0, col: 0 };
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

  return pieces;
}

/**
 * Creates initial game state for a given player count and options.
 */
export function createInitialGameState(playerCount = 4, customConfig = {}) {
  const validPlayerCount = [2, 3, 4].includes(playerCount) ? playerCount : 4;
  const boardMode = BOARD_MODES.CLASSIC;
  const defaultPlayers = DEFAULT_PLAYERS_CONFIG[validPlayerCount] || DEFAULT_PLAYERS_CONFIG[4];

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
    pieces[p.id] = customConfig.pieces?.[p.id] || initializePlayerPieces(p);
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
    currentPlayerIndex: customConfig.currentPlayerIndex ?? 0,
    diceValue: customConfig.diceValue ?? null,
    diceRolled: customConfig.diceRolled ?? false,
    isRolling: false,
    consecutiveSixes: 0,
    pieces,
    legalMoves: customConfig.legalMoves || [],
    autoMovePieceId: null,
    isAutoMoving: false,
    hasBaseAction: customConfig.hasBaseAction ?? false,
    basePieceIdToEnter: customConfig.basePieceIdToEnter ?? null,
    isMovingPiece: false,
    movingPieceId: null,
    movingPieceInfo: null,
    preMoveSnapshot: null,
    gameStatus: customConfig.gameStatus || 'WAITING_ROLL',
    winner: customConfig.winner || null,
    rules,
    scores,
    gameHistory: [
      {
        id: 'init',
        timestamp: Date.now(),
        type: 'SYSTEM',
        message: `Game started with ${validPlayerCount} players in Classic mode.`,
      },
    ],
    lastEvent: null,
    undoStack: [],
  };
}
