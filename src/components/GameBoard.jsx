import React, { useMemo } from 'react';
import { BoardCell } from './BoardCell';
import { Piece } from './Piece';
import {
  generateClassicBoardGrid,
  CLASSIC_COLOR_CONFIG,
} from '../game/boardLayouts';
import { CELL_TYPES, PLAYER_COLORS } from '../game/constants';

export function GameBoard({
  players = [],
  activePlayerId,
  pieces = {},
  legalMoves = [],
  hasBaseAction = false,
  onPieceClick,
}) {
  const classicGrid = useMemo(() => generateClassicBoardGrid(), []);
  const activePlayer = useMemo(
    () => players.find((p) => p.id === activePlayerId),
    [players, activePlayerId]
  );
  const activePlayerColor = activePlayer?.colorKey;

  // Map track and home lane cells to pieces currently on them
  const piecesByCoordKey = useMemo(() => {
    const map = {};
    Object.values(pieces).forEach((playerPieceList) => {
      playerPieceList.forEach((piece) => {
        if (piece.state === 'TRACK' || piece.state === 'HOME_LANE') {
          const key = `${piece.row}_${piece.col}`;
          if (!map[key]) map[key] = [];
          map[key].push(piece);
        }
      });
    });
    return map;
  }, [pieces]);

  return (
    <div className="board-wrapper">
      <div className="classic-board-grid">
        {classicGrid.map((rowArr, r) =>
          rowArr.map((cell, c) => {
            // 1. Red Base (Top-Left 6x6)
            if (r === 0 && c === 0) {
              return (
                <div
                  key="base-red"
                  className={`classic-base-corner base-red ${hasBaseAction && activePlayerColor === 'red' ? 'base-highlight-pulse' : ''}`}
                  style={{ gridArea: '1 / 1 / 7 / 7' }}
                >
                  <BaseCornerBox
                    colorKey="red"
                    players={players}
                    pieces={pieces}
                    legalMoves={legalMoves}
                    activePlayerId={activePlayerId}
                    onPieceClick={onPieceClick}
                  />
                </div>
              );
            }
            if (r < 6 && c < 6) return null;

            // 2. Green Base (Top-Right 6x6)
            if (r === 0 && c === 9) {
              return (
                <div
                  key="base-green"
                  className={`classic-base-corner base-green ${hasBaseAction && activePlayerColor === 'green' ? 'base-highlight-pulse' : ''}`}
                  style={{ gridArea: '1 / 10 / 7 / 16' }}
                >
                  <BaseCornerBox
                    colorKey="green"
                    players={players}
                    pieces={pieces}
                    legalMoves={legalMoves}
                    activePlayerId={activePlayerId}
                    onPieceClick={onPieceClick}
                  />
                </div>
              );
            }
            if (r < 6 && c >= 9) return null;

            // 3. Blue Base (Bottom-Left 6x6)
            if (r === 9 && c === 0) {
              return (
                <div
                  key="base-blue"
                  className={`classic-base-corner base-blue ${hasBaseAction && activePlayerColor === 'blue' ? 'base-highlight-pulse' : ''}`}
                  style={{ gridArea: '10 / 1 / 16 / 7' }}
                >
                  <BaseCornerBox
                    colorKey="blue"
                    players={players}
                    pieces={pieces}
                    legalMoves={legalMoves}
                    activePlayerId={activePlayerId}
                    onPieceClick={onPieceClick}
                  />
                </div>
              );
            }
            if (r >= 9 && c < 6) return null;

            // 4. Yellow Base (Bottom-Right 6x6)
            if (r === 9 && c === 9) {
              return (
                <div
                  key="base-yellow"
                  className={`classic-base-corner base-yellow ${hasBaseAction && activePlayerColor === 'yellow' ? 'base-highlight-pulse' : ''}`}
                  style={{ gridArea: '10 / 10 / 16 / 16' }}
                >
                  <BaseCornerBox
                    colorKey="yellow"
                    players={players}
                    pieces={pieces}
                    legalMoves={legalMoves}
                    activePlayerId={activePlayerId}
                    onPieceClick={onPieceClick}
                  />
                </div>
              );
            }
            if (r >= 9 && c >= 9) return null;

            // 5. Center Finish (3x3 area at rows 6..8, cols 6..8)
            if (r === 6 && c === 6) {
              return (
                <div
                  key="center-area"
                  className="classic-center-area"
                  style={{ gridArea: '7 / 7 / 10 / 10' }}
                >
                  <ClassicCenterFinish pieces={pieces} />
                </div>
              );
            }
            if (r >= 6 && r <= 8 && c >= 6 && c <= 8) return null;

            // 6. Regular Track / Home Lane Cell
            const coordKey = `${r}_${c}`;
            const piecesHere = piecesByCoordKey[coordKey] || [];

            return (
              <BoardCell
                key={`cell-${r}-${c}`}
                cell={cell}
                piecesHere={piecesHere}
                legalPieceIds={legalMoves}
                activePlayerId={activePlayerId}
                hasBaseAction={hasBaseAction && activePlayerColor === cell.playerColor}
                onPieceClick={onPieceClick}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

// Base Corner Box for Classic Board
function BaseCornerBox({
  colorKey,
  players,
  pieces,
  legalMoves,
  activePlayerId,
  onPieceClick,
}) {
  const player = players.find((p) => p.colorKey === colorKey);
  const playerPieces = player ? pieces[player.id] || [] : [];

  return (
    <div className="base-inner-box">
      {[0, 1, 2, 3].map((slotIdx) => {
        const pieceInSlot = playerPieces.find(
          (p) => p.baseIndex === slotIdx && p.state === 'BASE'
        );
        const isLegal = pieceInSlot && player.id === activePlayerId && legalMoves.includes(pieceInSlot.id);

        return (
          <div key={`slot-${slotIdx}`} className="base-slot-pocket">
            {pieceInSlot && (
              <Piece
                piece={pieceInSlot}
                isLegal={isLegal}
                onClick={onPieceClick}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Center Finish Triangle for Classic Board
function ClassicCenterFinish({ pieces }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg viewBox="0 0 100 100" className="center-triangle-svg">
        {/* Red Triangle (Left) */}
        <polygon points="0,0 50,50 0,100" fill="#EF4444" />
        {/* Green Triangle (Top) */}
        <polygon points="0,0 50,50 100,0" fill="#22C55E" />
        {/* Yellow Triangle (Right) */}
        <polygon points="100,0 50,50 100,100" fill="#FACC15" />
        {/* Blue Triangle (Bottom) */}
        <polygon points="0,100 50,50 100,100" fill="#3B82F6" />
      </svg>
      <div className="center-trophy-badge" title="Home Center Finish">
        🏆
      </div>
    </div>
  );
}
