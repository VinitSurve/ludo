import {
  createInitialGameState,
  initializePlayerPieces,
} from './gameUtils';
import {
  getLegalMoves,
  calculateLegalActions,
  computePieceMove,
  getPlayerPathInfo,
} from './movement';
import {
  checkCaptures,
} from './captures';
import {
  getNextPlayerIndex,
  evaluateBonusTurn,
  checkPlayerWon,
} from './turnManager';
import { PIECE_STATES } from './constants';
import { CLASSIC_COLOR_CONFIG } from './boardLayouts';

export const ACTION_TYPES = {
  START_GAME: 'START_GAME',
  ROLL_DICE_START: 'ROLL_DICE_START',
  ROLL_DICE_COMPLETE: 'ROLL_DICE_COMPLETE',
  MOVE_PIECE_START: 'MOVE_PIECE_START',
  STEP_PIECE_INTERMEDIATE: 'STEP_PIECE_INTERMEDIATE',
  MOVE_PIECE: 'MOVE_PIECE',
  PASS_TURN: 'PASS_TURN',
  ADJUST_SCORE: 'ADJUST_SCORE',
  RESET_PLAYER_SCORE: 'RESET_PLAYER_SCORE',
  RESET_ALL_SCORES: 'RESET_ALL_SCORES',
  UNDO_MOVE: 'UNDO_MOVE',
  REMATCH: 'REMATCH',
  SET_DEV_DICE: 'SET_DEV_DICE',
};

// Snapshot state for Undo
function createSnapshot(state) {
  return {
    players: JSON.parse(JSON.stringify(state.players)),
    currentPlayerIndex: state.currentPlayerIndex,
    diceValue: state.diceValue,
    diceRolled: state.diceRolled,
    consecutiveSixes: state.consecutiveSixes,
    pieces: JSON.parse(JSON.stringify(state.pieces)),
    legalMoves: [...state.legalMoves],
    autoMovePieceId: state.autoMovePieceId,
    isAutoMoving: state.isAutoMoving,
    hasBaseAction: state.hasBaseAction,
    basePieceIdToEnter: state.basePieceIdToEnter,
    gameStatus: state.gameStatus,
    winner: state.winner ? { ...state.winner } : null,
    scores: { ...state.scores },
    gameHistory: [...state.gameHistory],
    lastEvent: state.lastEvent ? { ...state.lastEvent } : null,
  };
}

export function gameReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.START_GAME: {
      const { playerCount = 4, customConfig = {} } = action.payload || {};
      return createInitialGameState(playerCount, customConfig);
    }

    case ACTION_TYPES.ROLL_DICE_START: {
      if (state.isRolling || state.diceRolled || state.isAutoMoving || state.gameStatus === 'GAME_OVER') {
        return state;
      }
      return {
        ...state,
        isRolling: true,
      };
    }

    case ACTION_TYPES.ROLL_DICE_COMPLETE: {
      const diceValue = action.payload.diceValue;
      const activePlayer = state.players[state.currentPlayerIndex];
      const activePieces = state.pieces[activePlayer.id];

      const consecutiveSixes = diceValue === 6 ? state.consecutiveSixes + 1 : 0;

      // Check three consecutive sixes penalty
      if (state.rules.threeSixesPenalty && consecutiveSixes >= 3) {
        const nextPlayerIndex = getNextPlayerIndex(state.currentPlayerIndex, state.players.length);
        const eventMsg = `${activePlayer.name} rolled three 6s in a row! Turn forfeited.`;
        return {
          ...state,
          isRolling: false,
          diceValue,
          diceRolled: true,
          consecutiveSixes: 0,
          legalMoves: [],
          autoMovePieceId: null,
          isAutoMoving: false,
          currentPlayerIndex: nextPlayerIndex,
          gameStatus: 'WAITING_ROLL',
          lastEvent: { type: 'PENALTY', message: eventMsg },
          gameHistory: [
            { id: Date.now(), timestamp: Date.now(), type: 'PENALTY', message: eventMsg },
            ...state.gameHistory,
          ].slice(0, 50),
        };
      }

      // Calculate legal actions & determine automatic movement
      const legalAction = calculateLegalActions(
        activePieces,
        diceValue,
        activePlayer.colorKey,
        state.boardMode,
        state.rules
      );

      // Scenario C: No legal moves available -> prepare to auto-pass turn
      if (legalAction.reason === 'no_legal_moves') {
        const eventMsg = `${activePlayer.name} rolled a ${diceValue}. No legal moves available.`;
        return {
          ...state,
          isRolling: false,
          diceValue,
          diceRolled: true,
          consecutiveSixes,
          legalMoves: [],
          autoMovePieceId: null,
          isAutoMoving: false,
          gameStatus: 'WAITING_MOVE',
          lastEvent: { type: 'NO_MOVE', message: eventMsg },
          gameHistory: [
            { id: Date.now(), timestamp: Date.now(), type: 'ROLL', message: eventMsg },
            ...state.gameHistory,
          ].slice(0, 50),
        };
      }

      // Scenario A: Exactly one legal move -> Automatic movement!
      if (legalAction.isAutoMove) {
        const autoPiece = activePieces.find((p) => p.id === legalAction.autoMovePieceId);
        const isBaseExit = autoPiece?.state === PIECE_STATES.BASE;
        const autoMsg = isBaseExit
          ? `rolled a ${diceValue}. Automatically bringing pawn ${autoPiece.id + 1} onto the track!`
          : `rolled a ${diceValue}. Only one legal move — moving automatically!`;

        const eventMsg = `${activePlayer.name} ${autoMsg}`;

        return {
          ...state,
          isRolling: false,
          diceValue,
          diceRolled: true,
          consecutiveSixes,
          legalMoves: legalAction.selectablePieceIds,
          autoMovePieceId: legalAction.autoMovePieceId,
          isAutoMoving: true,
          hasBaseAction: legalAction.hasBaseAction,
          basePieceIdToEnter: legalAction.basePieceIdToEnter,
          gameStatus: 'AUTO_MOVING',
          lastEvent: {
            type: 'AUTO_MOVE',
            message: eventMsg,
            pieceId: legalAction.autoMovePieceId,
          },
          gameHistory: [
            { id: Date.now(), timestamp: Date.now(), type: 'AUTO_MOVE', message: eventMsg },
            ...state.gameHistory,
          ].slice(0, 50),
        };
      }

      // Scenario B: Multiple distinct legal choices -> player selects
      const eventMsg = legalAction.hasBaseAction
        ? 'Lucky 6! Choose your move: Move an existing pawn or bring a new pawn out.'
        : `${activePlayer.name} rolled a ${diceValue}. Choose a pawn to move ${diceValue} spaces.`;

      return {
        ...state,
        isRolling: false,
        diceValue,
        diceRolled: true,
        consecutiveSixes,
        legalMoves: legalAction.selectablePieceIds,
        autoMovePieceId: null,
        isAutoMoving: false,
        hasBaseAction: legalAction.hasBaseAction,
        basePieceIdToEnter: legalAction.basePieceIdToEnter,
        gameStatus: 'WAITING_MOVE',
        lastEvent: { type: 'ROLL', message: eventMsg },
        gameHistory: [
          { id: Date.now(), timestamp: Date.now(), type: 'ROLL', message: eventMsg },
          ...state.gameHistory,
        ].slice(0, 50),
      };
    }

    case ACTION_TYPES.PASS_TURN: {
      if (state.gameStatus === 'GAME_OVER') return state;
      const nextPlayerIndex = getNextPlayerIndex(state.currentPlayerIndex, state.players.length);
      return {
        ...state,
        currentPlayerIndex: nextPlayerIndex,
        diceValue: null,
        diceRolled: false,
        isRolling: false,
        isAutoMoving: false,
        autoMovePieceId: null,
        hasBaseAction: false,
        basePieceIdToEnter: null,
        isMovingPiece: false,
        movingPieceId: null,
        movingPieceInfo: null,
        preMoveSnapshot: null,
        legalMoves: [],
        gameStatus: 'WAITING_ROLL',
      };
    }

    case ACTION_TYPES.MOVE_PIECE_START: {
      const { pieceId } = action.payload;
      const activePlayer = state.players[state.currentPlayerIndex];
      const activePieces = state.pieces[activePlayer.id];
      const targetPiece = activePieces?.find((p) => p.id === pieceId);

      if (!targetPiece) return state;

      const preMoveSnapshot = createSnapshot(state);

      return {
        ...state,
        isMovingPiece: true,
        movingPieceId: pieceId,
        gameStatus: 'MOVING',
        preMoveSnapshot,
        movingPieceInfo: {
          pieceId,
          originalStep: targetPiece.step,
          originalState: targetPiece.state,
        },
      };
    }

    case ACTION_TYPES.STEP_PIECE_INTERMEDIATE: {
      const { pieceId, step } = action.payload;
      const activePlayer = state.players[state.currentPlayerIndex];
      const activePieces = state.pieces[activePlayer.id];
      const targetPiece = activePieces?.find((p) => p.id === pieceId);

      if (!targetPiece) return state;

      const { path } = getPlayerPathInfo(activePlayer.colorKey, state.boardMode);
      const cell = path[step];
      if (!cell) return state;

      const intermediatePiece = {
        ...targetPiece,
        state: cell.isHomeLane ? PIECE_STATES.HOME_LANE : PIECE_STATES.TRACK,
        step,
        trackIndex: cell.trackIndex,
        row: cell.row,
        col: cell.col,
      };

      return {
        ...state,
        isMovingPiece: true,
        movingPieceId: pieceId,
        gameStatus: 'MOVING',
        pieces: {
          ...state.pieces,
          [activePlayer.id]: activePieces.map((p) => (p.id === pieceId ? intermediatePiece : p)),
        },
      };
    }

    case ACTION_TYPES.MOVE_PIECE: {
      const { pieceId } = action.payload;
      const activePlayer = state.players[state.currentPlayerIndex];
      const activePieces = state.pieces[activePlayer.id];
      const targetPiece = activePieces?.find((p) => p.id === pieceId);

      // Verify piece exists and is in legalMoves (or is designated autoMovePieceId or matching movingPieceInfo)
      if (
        !targetPiece ||
        (!state.legalMoves.includes(pieceId) &&
          state.autoMovePieceId !== pieceId &&
          state.movingPieceInfo?.pieceId !== pieceId)
      ) {
        return state;
      }

      // Save snapshot for Undo (use pre-saved snapshot if intermediate stepping occurred)
      const undoSnapshot = state.preMoveSnapshot || createSnapshot(state);

      // Check if original starting step/state was recorded before intermediate steps
      const overrideStart = state.movingPieceInfo?.pieceId === pieceId
        ? { step: state.movingPieceInfo.originalStep, state: state.movingPieceInfo.originalState }
        : { step: targetPiece.step, state: targetPiece.state };

      // Compute new piece state
      const updatedPiece = computePieceMove(
        targetPiece,
        state.diceValue,
        activePlayer.colorKey,
        state.boardMode,
        state.rules,
        overrideStart
      );

      // Update pieces map
      const newPieces = {
        ...state.pieces,
        [activePlayer.id]: activePieces.map((p) => (p.id === pieceId ? updatedPiece : p)),
      };

      // Check captures
      const captures = checkCaptures(
        updatedPiece,
        newPieces,
        activePlayer.id,
        state.boardMode,
        state.rules
      );

      let captureHistoryMsgs = [];
      if (captures.length > 0) {
        captures.forEach((cap) => {
          const capPlayer = state.players.find((p) => p.id === cap.playerId);
          const capPieceList = newPieces[cap.playerId];

          // Reset captured piece back to base
          newPieces[cap.playerId] = capPieceList.map((p) => {
            if (p.id === cap.pieceId) {
              const cfg = CLASSIC_COLOR_CONFIG[p.colorKey];
              const baseCoord = cfg.baseCoords[p.id];
              return {
                ...p,
                state: PIECE_STATES.BASE,
                step: -1,
                trackIndex: null,
                row: baseCoord.row,
                col: baseCoord.col,
              };
            }
            return p;
          });

          const msg = `💥 ${activePlayer.name} captured ${capPlayer ? capPlayer.name : 'Opponent'}'s pawn!`;
          captureHistoryMsgs.push(msg);
        });
      }

      // Check if finished piece
      const hasFinishedPiece = updatedPiece.state === PIECE_STATES.FINISHED && targetPiece.state !== PIECE_STATES.FINISHED;
      let finishMsg = null;
      if (hasFinishedPiece) {
        finishMsg = `⭐ ${activePlayer.name} finished a pawn!`;
      }

      // Check if active player won
      const hasWon = checkPlayerWon(newPieces[activePlayer.id]);
      if (hasWon) {
        const winMsg = `🏆 ${activePlayer.name} has won the game!`;
        return {
          ...state,
          pieces: newPieces,
          winner: activePlayer,
          gameStatus: 'GAME_OVER',
          isAutoMoving: false,
          autoMovePieceId: null,
          hasBaseAction: false,
          basePieceIdToEnter: null,
          isMovingPiece: false,
          movingPieceId: null,
          movingPieceInfo: null,
          preMoveSnapshot: null,
          legalMoves: [],
          lastEvent: { type: 'WIN', message: winMsg },
          undoStack: [undoSnapshot, ...state.undoStack].slice(0, 20),
          gameHistory: [
            { id: Date.now(), timestamp: Date.now(), type: 'WIN', message: winMsg },
            ...state.gameHistory,
          ].slice(0, 50),
        };
      }

      // Check extra turn bonus
      const bonus = evaluateBonusTurn({
        diceValue: state.diceValue,
        consecutiveSixes: state.consecutiveSixes,
        hasCaptured: captures.length > 0,
        hasFinishedPiece,
        rules: state.rules,
      });

      let moveMsg = `${activePlayer.name} moved pawn ${pieceId + 1}.`;
      if (targetPiece.state === PIECE_STATES.BASE && updatedPiece.state === PIECE_STATES.TRACK) {
        moveMsg = `${activePlayer.name} brought pawn ${pieceId + 1} onto the track!`;
      }

      const newHistoryEntries = [
        ...(finishMsg ? [{ id: Date.now() + 2, timestamp: Date.now(), type: 'FINISH', message: finishMsg }] : []),
        ...captureHistoryMsgs.map((m, i) => ({ id: Date.now() + 1 + i, timestamp: Date.now(), type: 'CAPTURE', message: m })),
        { id: Date.now(), timestamp: Date.now(), type: 'MOVE', message: moveMsg },
      ];

      if (bonus.extraTurn) {
        const bonusMsg = bonus.reason === 'rolled_six'
          ? `${activePlayer.name} rolled a 6! Rolls again.`
          : bonus.reason === 'capture'
          ? `${activePlayer.name} captured an opponent! Rolls again.`
          : `${activePlayer.name} finished a pawn! Rolls again.`;

        return {
          ...state,
          pieces: newPieces,
          diceValue: null,
          diceRolled: false,
          isRolling: false,
          isAutoMoving: false,
          autoMovePieceId: null,
          hasBaseAction: false,
          basePieceIdToEnter: null,
          isMovingPiece: false,
          movingPieceId: null,
          movingPieceInfo: null,
          preMoveSnapshot: null,
          legalMoves: [],
          gameStatus: 'WAITING_ROLL',
          lastEvent: { type: 'EXTRA_TURN', message: bonusMsg },
          undoStack: [undoSnapshot, ...state.undoStack].slice(0, 20),
          gameHistory: [
            { id: Date.now() + 3, timestamp: Date.now(), type: 'BONUS', message: bonusMsg },
            ...newHistoryEntries,
            ...state.gameHistory,
          ].slice(0, 50),
        };
      }

      // Normal turn rotation
      const nextPlayerIndex = getNextPlayerIndex(state.currentPlayerIndex, state.players.length);
      return {
        ...state,
        pieces: newPieces,
        currentPlayerIndex: nextPlayerIndex,
        diceValue: null,
        diceRolled: false,
        isRolling: false,
        isAutoMoving: false,
        autoMovePieceId: null,
        hasBaseAction: false,
        basePieceIdToEnter: null,
        isMovingPiece: false,
        movingPieceId: null,
        movingPieceInfo: null,
        preMoveSnapshot: null,
        consecutiveSixes: 0,
        legalMoves: [],
        gameStatus: 'WAITING_ROLL',
        lastEvent: { type: 'MOVE', message: moveMsg },
        undoStack: [undoSnapshot, ...state.undoStack].slice(0, 20),
        gameHistory: [
          ...newHistoryEntries,
          ...state.gameHistory,
        ].slice(0, 50),
      };
    }

    case ACTION_TYPES.ADJUST_SCORE: {
      const { playerId, delta } = action.payload;
      const current = state.scores[playerId] || 0;
      const newScore = Math.max(0, current + delta);
      return {
        ...state,
        scores: {
          ...state.scores,
          [playerId]: newScore,
        },
      };
    }

    case ACTION_TYPES.RESET_PLAYER_SCORE: {
      const { playerId } = action.payload;
      return {
        ...state,
        scores: {
          ...state.scores,
          [playerId]: 0,
        },
      };
    }

    case ACTION_TYPES.RESET_ALL_SCORES: {
      const resetScores = {};
      state.players.forEach((p) => {
        resetScores[p.id] = 0;
      });
      return {
        ...state,
        scores: resetScores,
      };
    }

    case ACTION_TYPES.UNDO_MOVE: {
      if (state.undoStack.length === 0) return state;
      const [previousState, ...remainingStack] = state.undoStack;
      return {
        ...state,
        ...previousState,
        undoStack: remainingStack,
        lastEvent: { type: 'UNDO', message: 'Last move was undone.' },
        gameHistory: [
          { id: Date.now(), timestamp: Date.now(), type: 'UNDO', message: 'Move undone by player.' },
          ...state.gameHistory,
        ].slice(0, 50),
      };
    }

    case ACTION_TYPES.REMATCH: {
      const initial = createInitialGameState(state.playerCount, {
        players: state.players,
        scores: state.scores,
        rules: state.rules,
      });
      return {
        ...initial,
        gameHistory: [
          { id: Date.now(), timestamp: Date.now(), type: 'SYSTEM', message: 'Rematch started!' },
          ...state.gameHistory,
        ].slice(0, 50),
      };
    }

    case ACTION_TYPES.SET_DEV_DICE: {
      // Direct dice roll set for testing/development
      return gameReducer(state, {
        type: ACTION_TYPES.ROLL_DICE_COMPLETE,
        payload: { diceValue: action.payload.diceValue },
      });
    }

    default:
      return state;
  }
}
