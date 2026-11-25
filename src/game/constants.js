export const PLAYER_COLORS = {
  red: {
    id: 'red',
    name: 'Red',
    hex: '#EF4444',
    bg: '#FEE2E2',
    border: '#DC2626',
    text: '#991B1B',
    accent: '#B91C1C',
  },
  blue: {
    id: 'blue',
    name: 'Blue',
    hex: '#3B82F6',
    bg: '#DBEAFE',
    border: '#2563EB',
    text: '#1E40AF',
    accent: '#1D4ED8',
  },
  green: {
    id: 'green',
    name: 'Green',
    hex: '#22C55E',
    bg: '#DCFCE7',
    border: '#16A34A',
    text: '#166534',
    accent: '#15803D',
  },
  yellow: {
    id: 'yellow',
    name: 'Yellow',
    hex: '#FACC15',
    bg: '#FEF9C3',
    border: '#EAB308',
    text: '#854D0E',
    accent: '#CA8A04',
  },
};

export const CELL_TYPES = {
  EMPTY: 'EMPTY',
  HOME: 'HOME',
  TRACK: 'TRACK',
  START: 'START',
  SAFE: 'SAFE',
  HOME_LANE: 'HOME_LANE',
  CENTER: 'CENTER',
};

export const PIECE_STATES = {
  BASE: 'BASE',
  TRACK: 'TRACK',
  HOME_LANE: 'HOME_LANE',
  FINISHED: 'FINISHED',
};

export const GAME_STATUS = {
  SETUP: 'SETUP',
  WAITING_ROLL: 'WAITING_ROLL',
  ROLLING: 'ROLLING',
  WAITING_MOVE: 'WAITING_MOVE',
  MOVING: 'MOVING',
  GAME_OVER: 'GAME_OVER',
};

export const BOARD_MODES = {
  CLASSIC: 'classic', // 2-4 players
};

export const DEFAULT_RULES = {
  requireSixToLeaveBase: true,
  extraTurnOnSix: true,
  extraTurnOnCapture: true,
  extraTurnOnFinish: true,
  safeSquaresEnabled: true,
  exactFinish: true,
  threeSixesPenalty: false,
};

export const DEFAULT_PLAYERS_CONFIG = {
  2: [
    { id: 1, name: 'Player 1', colorKey: 'red', avatar: '🦁' },
    { id: 2, name: 'Player 2', colorKey: 'yellow', avatar: '🦅' },
  ],
  3: [
    { id: 1, name: 'Player 1', colorKey: 'red', avatar: '🦁' },
    { id: 2, name: 'Player 2', colorKey: 'green', avatar: '🐲' },
    { id: 3, name: 'Player 3', colorKey: 'yellow', avatar: '🦅' },
  ],
  4: [
    { id: 1, name: 'Player 1', colorKey: 'red', avatar: '🦁' },
    { id: 2, name: 'Player 2', colorKey: 'green', avatar: '🐲' },
    { id: 3, name: 'Player 3', colorKey: 'yellow', avatar: '🦅' },
    { id: 4, name: 'Player 4', colorKey: 'blue', avatar: '🐺' },
  ],
};

export const AVAILABLE_AVATARS = ['🦁', '🐺', '🐲', '🦅', '🦄', '🐯', '🐼', '🦊', '🐻', '👑', '⚡', '🔥'];
