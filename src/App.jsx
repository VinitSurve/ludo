import React, { useState, useEffect } from 'react';
import { useGame } from './hooks/useGame';
import { useSound } from './hooks/useSound';
import { Header } from './components/Header';
import { GameStatus } from './components/GameStatus';
import { GameBoard } from './components/GameBoard';
import { PlayerCard } from './components/PlayerCard';
import { Dice } from './components/Dice';
import { RecentMoves } from './components/RecentMoves';
import { PlayerSetupModal } from './components/PlayerSetupModal';
import { RulesModal } from './components/RulesModal';
import { SettingsModal } from './components/SettingsModal';
import { WinnerModal } from './components/WinnerModal';

import './styles/global.css';
import './styles/board.css';
import './styles/components.css';
import './styles/responsive.css';

export function App() {
  const {
    muted: soundMuted,
    toggleMute: onToggleSound,
    playDiceRoll,
    playPieceMove,
    playCapture,
    playBonusChime,
    playFinishPiece,
    playVictory,
  } = useSound(false);

  const {
    state,
    movementSpeed,
    setMovementSpeed,
    rollDice,
    movePiece,
    passTurn,
    startNewGame,
    rematch,
  } = useGame(4, {}, playPieceMove);

  // Modal Visibility States
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const activePlayer = state.players[state.currentPlayerIndex];

  // Sound triggering on game events
  useEffect(() => {
    if (state.lastEvent) {
      if (state.lastEvent.type === 'CAPTURE') {
        playCapture();
      } else if (state.lastEvent.type === 'FINISH') {
        playFinishPiece();
      } else if (state.lastEvent.type === 'EXTRA_TURN' || state.lastEvent.type === 'BONUS') {
        playBonusChime();
      } else if (state.lastEvent.type === 'WIN') {
        playVictory();
      }
    }
  }, [state.lastEvent, playCapture, playFinishPiece, playBonusChime, playVictory]);

  const handleRollDice = () => {
    playDiceRoll();
    rollDice();
  };

  const handlePieceClick = (pieceId) => {
    movePiece(pieceId);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__LUDO_APP__ = {
        state,
        startNewGame,
        rollDice,
        movePiece,
        setShowSetupModal,
      };
    }
  }, [state, startNewGame, rollDice, movePiece]);

  return (
    <div className="ludo-app-root">
      {/* Top Header */}
      <Header
        playerCount={state.playerCount}
        soundMuted={soundMuted}
        onToggleSound={onToggleSound}
        onOpenRules={() => setShowRulesModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenNewGame={() => setShowSetupModal(true)}
      />

      {/* Dynamic Status Banner */}
      <GameStatus
        activePlayer={activePlayer}
        gameStatus={state.gameStatus}
        diceRolled={state.diceRolled}
        diceValue={state.diceValue}
        legalMoves={state.legalMoves}
        hasBaseAction={state.hasBaseAction}
        basePieceIdToEnter={state.basePieceIdToEnter}
        onPieceClick={handlePieceClick}
        lastEvent={state.lastEvent}
      />

      {/* Main 3-Column Layout */}
      <main className="main-game-layout">
        {/* Left Column: Player Cards & Scoreboard */}
        <div className="sidebar-left">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B' }}>
              Scoreboard ({state.playerCount}P)
            </h2>
          </div>

          <div className="player-cards-container">
            {state.players.map((player, idx) => (
              <PlayerCard
                key={player.id}
                player={player}
                isActive={idx === state.currentPlayerIndex && state.gameStatus !== 'GAME_OVER'}
                pieces={state.pieces[player.id]}
              />
            ))}
          </div>
        </div>

        {/* Center Column: The Central Ludo Board */}
        <div className="board-center-column">
          <GameBoard
            players={state.players}
            activePlayerId={activePlayer?.id}
            pieces={state.pieces}
            legalMoves={state.legalMoves}
            hasBaseAction={state.hasBaseAction}
            onPieceClick={handlePieceClick}
          />
        </div>

        {/* Right Column: Dice Panel & Recent Moves Log */}
        <div className="sidebar-right">
          <Dice
            diceValue={state.diceValue}
            isRolling={state.isRolling}
            diceRolled={state.diceRolled}
            activePlayer={activePlayer}
            onRoll={handleRollDice}
            canRoll={!state.diceRolled && !state.isRolling && !state.isAutoMoving && !state.isMovingPiece && state.gameStatus === 'WAITING_ROLL'}
            hasBaseAction={state.hasBaseAction}
            basePieceIdToEnter={state.basePieceIdToEnter}
            onPieceClick={handlePieceClick}
          />

          <RecentMoves history={state.gameHistory} />
        </div>
      </main>

      {/* Modals */}
      <PlayerSetupModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        initialPlayerCount={state.playerCount}
        onStartGame={startNewGame}
      />

      <RulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        soundMuted={soundMuted}
        onToggleSound={onToggleSound}
        movementSpeed={movementSpeed}
        onSetMovementSpeed={setMovementSpeed}
        rules={state.rules}
      />

      <WinnerModal
        isOpen={state.gameStatus === 'GAME_OVER' && !!state.winner}
        winner={state.winner}
        onRematch={rematch}
        onNewGame={() => setShowSetupModal(true)}
      />
    </div>
  );
}

export default App;
