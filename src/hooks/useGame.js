import { useReducer, useCallback, useEffect, useRef, useState } from 'react';
import {
  gameReducer,
  ACTION_TYPES,
  createInitialGameState,
  getPlayerPathInfo,
  PIECE_STATES,
} from '../game/gameEngine';

export const SPEED_TIMINGS = {
  slow: { moveMs: 350, pauseMs: 150, jumpSec: '0.35s' },
  normal: { moveMs: 280, pauseMs: 120, jumpSec: '0.28s' },
  fast: { moveMs: 190, pauseMs: 80, jumpSec: '0.19s' },
};

export function useGame(initialPlayerCount = 4, customConfig = {}, onStepMove = null) {
  const [state, dispatch] = useReducer(
    gameReducer,
    { playerCount: initialPlayerCount, customConfig },
    () => createInitialGameState(initialPlayerCount, customConfig)
  );

  // Configurable Movement Speed (slow, normal, fast) with localStorage persistence
  const [movementSpeed, setMovementSpeedState] = useState(() => {
    try {
      const saved = localStorage.getItem('ludo_movement_speed');
      if (saved && SPEED_TIMINGS[saved]) return saved;
    } catch {
      // ignore
    }
    return 'normal';
  });

  const setMovementSpeed = useCallback((speed) => {
    if (SPEED_TIMINGS[speed]) {
      setMovementSpeedState(speed);
      try {
        localStorage.setItem('ludo_movement_speed', speed);
      } catch {
        // ignore
      }
    }
  }, []);

  // Update CSS custom property for jump duration on root
  useEffect(() => {
    const timing = SPEED_TIMINGS[movementSpeed] || SPEED_TIMINGS.normal;
    document.documentElement.style.setProperty('--pawn-jump-duration', timing.jumpSec);
  }, [movementSpeed]);

  const rollTimeoutRef = useRef(null);
  const autoMoveTimeoutRef = useRef(null);
  const autoPassTimeoutRef = useRef(null);
  const isMovingRef = useRef(false);
  const stepTimeoutRef = useRef(null);
  const onStepMoveRef = useRef(onStepMove);

  useEffect(() => {
    onStepMoveRef.current = onStepMove;
  }, [onStepMove]);

  // Trigger Dice Roll animation (600-900ms per requirements)
  const rollDice = useCallback(() => {
    if (
      state.isRolling ||
      state.diceRolled ||
      state.isAutoMoving ||
      state.isMovingPiece ||
      state.gameStatus === 'AUTO_MOVING' ||
      state.gameStatus === 'MOVING' ||
      state.gameStatus === 'GAME_OVER' ||
      isMovingRef.current
    ) {
      return;
    }

    dispatch({ type: ACTION_TYPES.ROLL_DICE_START });

    // 700ms 3D dice roll animation (within 600-900ms requirement)
    if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current);
    rollTimeoutRef.current = setTimeout(() => {
      const randomValue = Math.floor(Math.random() * 6) + 1;
      dispatch({
        type: ACTION_TYPES.ROLL_DICE_COMPLETE,
        payload: { diceValue: randomValue },
      });
    }, 700);
  }, [state.isRolling, state.diceRolled, state.isAutoMoving, state.isMovingPiece, state.gameStatus]);

  // Dev override for specific dice roll
  const devRollDice = useCallback((forcedValue) => {
    if (
      state.gameStatus === 'GAME_OVER' ||
      state.isAutoMoving ||
      state.isMovingPiece ||
      state.gameStatus === 'AUTO_MOVING' ||
      state.gameStatus === 'MOVING' ||
      isMovingRef.current
    ) {
      return;
    }
    dispatch({ type: ACTION_TYPES.ROLL_DICE_START });
    setTimeout(() => {
      dispatch({
        type: ACTION_TYPES.SET_DEV_DICE,
        payload: { diceValue: forcedValue },
      });
    }, 280);
  }, [state.gameStatus, state.isAutoMoving, state.isMovingPiece]);

  // Sleep helper that can be cancelled
  const sleep = useCallback((ms) => {
    return new Promise((resolve) => {
      stepTimeoutRef.current = setTimeout(resolve, ms);
    });
  }, []);

  // Sequential Step-by-Step Movement
  const movePiece = useCallback(async (pieceId) => {
    if (
      isMovingRef.current ||
      (state.gameStatus !== 'WAITING_MOVE' && state.gameStatus !== 'AUTO_MOVING')
    ) {
      return;
    }

    const activePlayer = state.players[state.currentPlayerIndex];
    if (!activePlayer) return;
    const activePieces = state.pieces[activePlayer.id];
    const targetPiece = activePieces?.find((p) => p.id === pieceId);
    if (!targetPiece) return;

    // Check reduced-motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // If reduced-motion is active, execute instantly
    if (prefersReducedMotion) {
      onStepMoveRef.current?.();
      dispatch({
        type: ACTION_TYPES.MOVE_PIECE,
        payload: { pieceId },
      });
      return;
    }

    isMovingRef.current = true;

    // Start movement: snapshot saved, state.isMovingPiece = true
    dispatch({
      type: ACTION_TYPES.MOVE_PIECE_START,
      payload: { pieceId },
    });

    const timing = SPEED_TIMINGS[movementSpeed] || SPEED_TIMINGS.normal;

    try {
      // 1. Moving from base onto track
      if (targetPiece.state === PIECE_STATES.BASE) {
        onStepMoveRef.current?.();
        // Animate pawn exiting base onto start square (step 0)
        dispatch({
          type: ACTION_TYPES.STEP_PIECE_INTERMEDIATE,
          payload: { pieceId, step: 0 },
        });
        await sleep(timing.moveMs);
        dispatch({
          type: ACTION_TYPES.MOVE_PIECE,
          payload: { pieceId },
        });
      } else {
        // 2. Moving along track or home lane square-by-square sequentially
        const pathInfo = getPlayerPathInfo(activePlayer.colorKey, state.boardMode);
        const startStep = targetPiece.step;
        const targetStep = Math.min(startStep + state.diceValue, pathInfo.finishStep);

        for (let s = startStep + 1; s <= targetStep; s++) {
          // Play hop sound
          onStepMoveRef.current?.();

          // Move pawn to intermediate square s
          dispatch({
            type: ACTION_TYPES.STEP_PIECE_INTERMEDIATE,
            payload: { pieceId, step: s },
          });

          // Wait for hop animation to complete
          await sleep(timing.moveMs);

          // If not the destination square, pause between squares
          if (s < targetStep) {
            await sleep(timing.pauseMs);
          }
        }

        // Final arrival: resolve captures, finish, win check, and turn progression
        dispatch({
          type: ACTION_TYPES.MOVE_PIECE,
          payload: { pieceId },
        });
      }
    } finally {
      isMovingRef.current = false;
    }
  }, [
    state.gameStatus,
    state.players,
    state.currentPlayerIndex,
    state.pieces,
    state.diceValue,
    state.boardMode,
    movementSpeed,
    sleep,
  ]);

  // Automatic Move Execution: when exactly one strategic action exists
  useEffect(() => {
    if (
      state.gameStatus === 'AUTO_MOVING' &&
      state.autoMovePieceId !== null &&
      !isMovingRef.current
    ) {
      if (autoMoveTimeoutRef.current) clearTimeout(autoMoveTimeoutRef.current);
      // Brief 450ms pause so the player perceives the rolled dice and auto-move banner
      autoMoveTimeoutRef.current = setTimeout(() => {
        movePiece(state.autoMovePieceId);
      }, 450);
    }
    return () => {
      if (autoMoveTimeoutRef.current) clearTimeout(autoMoveTimeoutRef.current);
    };
  }, [state.gameStatus, state.autoMovePieceId, movePiece]);

  // Pass Turn
  const passTurn = useCallback(() => {
    if (isMovingRef.current) return;
    dispatch({ type: ACTION_TYPES.PASS_TURN });
  }, []);

  // Auto-pass turn after 1.8 seconds if no legal moves
  useEffect(() => {
    if (
      state.diceRolled &&
      state.legalMoves.length === 0 &&
      state.gameStatus === 'WAITING_MOVE' &&
      !isMovingRef.current
    ) {
      if (autoPassTimeoutRef.current) clearTimeout(autoPassTimeoutRef.current);
      autoPassTimeoutRef.current = setTimeout(() => {
        dispatch({ type: ACTION_TYPES.PASS_TURN });
      }, 1600);
    }
    return () => {
      if (autoPassTimeoutRef.current) clearTimeout(autoPassTimeoutRef.current);
    };
  }, [state.diceRolled, state.legalMoves.length, state.gameStatus]);

  // Adjust Score
  const adjustScore = useCallback((playerId, delta) => {
    dispatch({
      type: ACTION_TYPES.ADJUST_SCORE,
      payload: { playerId, delta },
    });
  }, []);

  // Reset Single Player Score
  const resetPlayerScore = useCallback((playerId) => {
    dispatch({
      type: ACTION_TYPES.RESET_PLAYER_SCORE,
      payload: { playerId },
    });
  }, []);

  // Reset All Scores
  const resetAllScores = useCallback(() => {
    dispatch({ type: ACTION_TYPES.RESET_ALL_SCORES });
  }, []);

  // Undo Move
  const undoMove = useCallback(() => {
    if (isMovingRef.current) return;
    dispatch({ type: ACTION_TYPES.UNDO_MOVE });
  }, []);

  // Start New Game
  const startNewGame = useCallback((playerCount, newConfig) => {
    if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
    isMovingRef.current = false;
    dispatch({
      type: ACTION_TYPES.START_GAME,
      payload: { playerCount, customConfig: newConfig },
    });
  }, []);

  // Rematch
  const rematch = useCallback(() => {
    if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
    isMovingRef.current = false;
    dispatch({ type: ACTION_TYPES.REMATCH });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current);
      if (autoMoveTimeoutRef.current) clearTimeout(autoMoveTimeoutRef.current);
      if (autoPassTimeoutRef.current) clearTimeout(autoPassTimeoutRef.current);
      if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
    };
  }, []);

  return {
    state,
    movementSpeed,
    setMovementSpeed,
    rollDice,
    devRollDice,
    movePiece,
    passTurn,
    adjustScore,
    resetPlayerScore,
    resetAllScores,
    undoMove,
    startNewGame,
    rematch,
  };
}
