import React, { useMemo } from 'react';
import { BoardCell } from './BoardCell';
import { Piece } from './Piece';
import {
  generateClassicBoardGrid,
  CLASSIC_COLOR_CONFIG,
  EXTENDED_BOARD_DATA,
} from '../game/boardLayouts';
import { CELL_TYPES, BOARD_MODES, PLAYER_COLORS } from '../game/constants';
import { Trophy, Star } from 'lucide-react';

export function GameBoard({
  boardMode = BOARD_MODES.CLASSIC,
  players = [],
  activePlayerId,
  pieces = {},
  legalMoves = [],
  hasBaseAction = false,
  onPieceClick,
}) {
  const classicGrid = useMemo(() => generateClassicBoardGrid(), []);
  const activePlayer = useMemo(() => players.find((p) => p.id === activePlayerId), [players, activePlayerId]);
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

  // Classic Board rendering (15x15)
  if (boardMode === BOARD_MODES.CLASSIC) {
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
              // Skip other cells in Red Base area
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

  // =========================================================================
  // Extended 6-Player Hexagonal Board (SVG data-driven rendering)
  // =========================================================================
  return (
    <div className="board-wrapper">
      <div className="extended-board-svg-container">
        <svg
          viewBox="0 0 1000 1000"
          className="extended-svg-root"
        >
          <defs>
            <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </radialGradient>
            <filter id="subtleShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Symmetrical Hexagonal Outer Board Outline */}
          <polygon
            points={getHexagonPoints(500, 500, 480)}
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="6"
          />

          {/* Symmetrical Sector Arm Guide Ribbons */}
          {Object.entries(EXTENDED_BOARD_DATA.sectorConfigs).map(([colorKey, cfg], sIdx) => {
            const player = players.find((p) => p.colorKey === colorKey);
            const colorCfg = PLAYER_COLORS[colorKey];
            return (
              <polygon
                key={`arm-guide-${colorKey}`}
                points={getArmGuidePoints(sIdx)}
                fill={player ? colorCfg.bg : '#F8FAFC'}
                opacity={player ? '0.28' : '0.15'}
                stroke="#E2E8F0"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Center Hexagonal Finish Area with 6 sector wedges */}
          <g key="center-finish-group">
            {Object.entries(EXTENDED_BOARD_DATA.sectorConfigs).map(([colorKey, cfg], sIdx) => {
              const v1 = getHexagonVertex(500, 500, 85, sIdx);
              const v2 = getHexagonVertex(500, 500, 85, (sIdx + 1) % 6);
              const player = players.find((p) => p.colorKey === colorKey);
              const colorCfg = PLAYER_COLORS[colorKey];

              // Count finished pieces for this sector
              const finishedCount = player
                ? (pieces[player.id] || []).filter((p) => p.state === 'FINISHED').length
                : 0;

              return (
                <g key={`center-wedge-${colorKey}`}>
                  <polygon
                    points={`500,500 ${v1.x},${v1.y} ${v2.x},${v2.y}`}
                    fill={player ? colorCfg.bg : '#F8FAFC'}
                    stroke="#CBD5E1"
                    strokeWidth="1.5"
                  />
                  {finishedCount > 0 && (
                    <g transform={`translate(${cfg.finishCoord.x}, ${cfg.finishCoord.y})`}>
                      <circle cx="0" cy="0" r="10" fill={colorCfg.hex} stroke="#FFFFFF" strokeWidth="1.5" />
                      <text x="0" y="3.5" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">
                        {finishedCount}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
            <circle cx="500" cy="500" r="28" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" filter="url(#subtleShadow)" />
            <text
              x="500"
              y="507"
              textAnchor="middle"
              fontSize="22"
            >
              🏆
            </text>
          </g>

          {/* Render 6 Base Regions */}
          {Object.entries(EXTENDED_BOARD_DATA.sectorConfigs).map(([colorKey, cfg]) => {
            const colorCfg = PLAYER_COLORS[colorKey];
            const player = players.find((p) => p.colorKey === colorKey);
            const isActiveSector = Boolean(player);
            const playerPieceList = player ? pieces[player.id] || [] : [];

            const isBaseHighlighted = isActiveSector && hasBaseAction && activePlayer?.colorKey === colorKey;

            return (
              <g key={`ext-base-${colorKey}`}>
                {/* Base Outer Circular Card */}
                {isActiveSector ? (
                  <>
                    <circle
                      cx={cfg.baseCenter.x}
                      cy={cfg.baseCenter.y}
                      r="62"
                      fill={colorCfg.hex}
                      stroke={isBaseHighlighted ? '#F59E0B' : '#FFFFFF'}
                      strokeWidth={isBaseHighlighted ? '6' : '3'}
                      className={isBaseHighlighted ? 'svg-base-highlight-pulse' : ''}
                      filter="url(#subtleShadow)"
                    />
                    <circle
                      cx={cfg.baseCenter.x}
                      cy={cfg.baseCenter.y}
                      r="48"
                      fill="#FFFFFF"
                    />
                  </>
                ) : (
                  <>
                    <circle
                      cx={cfg.baseCenter.x}
                      cy={cfg.baseCenter.y}
                      r="62"
                      fill="#F8FAFC"
                      stroke="#CBD5E1"
                      strokeWidth="2"
                      strokeDasharray="5 4"
                    />
                    <circle
                      cx={cfg.baseCenter.x}
                      cy={cfg.baseCenter.y}
                      r="48"
                      fill="#F1F5F9"
                    />
                    <text
                      x={cfg.baseCenter.x}
                      y={cfg.baseCenter.y + 4}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="700"
                      fill="#94A3B8"
                      letterSpacing="1"
                    >
                      INACTIVE
                    </text>
                  </>
                )}

                {/* 4 Base Piece Slots */}
                {cfg.baseSlots.map((slot, sIdx) => {
                  const pieceInSlot = isActiveSector
                    ? playerPieceList.find(
                        (p) => p.baseIndex === sIdx && p.state === 'BASE'
                      )
                    : null;
                  const isLegal = pieceInSlot && player.id === activePlayerId && legalMoves.includes(pieceInSlot.id);

                  return (
                    <g key={`slot-${colorKey}-${sIdx}`}>
                      <circle
                        cx={slot.x}
                        cy={slot.y}
                        r="16"
                        fill={isActiveSector ? '#F8FAFC' : '#E2E8F0'}
                        stroke={isLegal ? colorCfg.hex : '#CBD5E1'}
                        strokeWidth={isLegal ? '3' : '1.5'}
                        strokeDasharray={isLegal ? 'none' : '3 3'}
                      />
                      {pieceInSlot && (
                        <ExtendedPawnSvg
                          cx={slot.x}
                          cy={slot.y}
                          colorKey={colorKey}
                          isLegal={isLegal}
                          onClick={() => isLegal && onPieceClick && onPieceClick(pieceInSlot.id)}
                          step={pieceInSlot.step}
                        />
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Render 6 Home Lanes */}
          {Object.entries(EXTENDED_BOARD_DATA.sectorConfigs).map(([colorKey, cfg]) => {
            const colorCfg = PLAYER_COLORS[colorKey];
            const player = players.find((p) => p.colorKey === colorKey);
            const isActiveSector = Boolean(player);
            const playerPieceList = player ? pieces[player.id] || [] : [];

            return (
              <g key={`home-lane-${colorKey}`}>
                {cfg.homeLaneCoords.map((coord, hIdx) => {
                  const pieceOnLane = isActiveSector
                    ? playerPieceList.find(
                        (p) => p.state === 'HOME_LANE' && p.step === 65 + hIdx
                      )
                    : null;
                  const isLegal = pieceOnLane && player.id === activePlayerId && legalMoves.includes(pieceOnLane.id);

                  return (
                    <g key={`hl-${colorKey}-${hIdx}`}>
                      <circle
                        cx={coord.x}
                        cy={coord.y}
                        r="16"
                        fill={isActiveSector ? colorCfg.bg : '#F1F5F9'}
                        stroke={isActiveSector ? colorCfg.border : '#E2E8F0'}
                        strokeWidth="2"
                      />
                      <text
                        x={coord.x}
                        y={coord.y + 4}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="bold"
                        fill={isActiveSector ? colorCfg.text : '#CBD5E1'}
                        opacity={pieceOnLane ? 0 : 0.6}
                      >
                        •
                      </text>
                      {pieceOnLane && (
                        <ExtendedPawnSvg
                          cx={coord.x}
                          cy={coord.y}
                          colorKey={colorKey}
                          isLegal={isLegal}
                          onClick={() => isLegal && onPieceClick && onPieceClick(pieceOnLane.id)}
                          step={pieceOnLane.step}
                        />
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Render 66 Track Cells */}
          {EXTENDED_BOARD_DATA.trackCoords.map((coord, idx) => {
            // Find pieces on this track index
            const piecesOnCell = [];
            Object.values(pieces).forEach((pList) => {
              pList.forEach((p) => {
                if (p.state === 'TRACK' && p.trackIndex === idx) {
                  piecesOnCell.push(p);
                }
              });
            });

            const topPiece = piecesOnCell[piecesOnCell.length - 1];
            const isLegal = topPiece && topPiece.playerId === activePlayerId && legalMoves.includes(topPiece.id);

            const startColorKey = coord.startColor;
            const startPlayer = startColorKey ? players.find((p) => p.colorKey === startColorKey) : null;
            const isStartActive = Boolean(startPlayer);
            const cellColor = (coord.isStart && isStartActive) ? PLAYER_COLORS[startColorKey] : null;

            return (
              <g key={`track-ext-${idx}`}>
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r="16"
                  fill={cellColor ? cellColor.bg : coord.isSafe ? '#FEF9C3' : '#FFFFFF'}
                  stroke={cellColor ? cellColor.border : '#CBD5E1'}
                  strokeWidth="2"
                />

                {/* Star icon for safe squares */}
                {coord.isSafe && !coord.isStart && (
                  <text
                    x={coord.x}
                    y={coord.y + 5}
                    textAnchor="middle"
                    fontSize="13"
                    fill="#CA8A04"
                  >
                    ★
                  </text>
                )}

                {/* Start indicator dot */}
                {coord.isStart && (
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r="5"
                    fill={cellColor ? cellColor.hex : '#CBD5E1'}
                  />
                )}

                {/* Piece on Track */}
                {topPiece && (
                  <ExtendedPawnSvg
                    cx={coord.x}
                    cy={coord.y}
                    colorKey={topPiece.colorKey}
                    isLegal={isLegal}
                    onClick={() => isLegal && onPieceClick && onPieceClick(topPiece.id)}
                    count={piecesOnCell.length}
                    step={topPiece.step}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// 3D Realistic Ludo Pawn for Extended SVG Board with Jumping Animation
function ExtendedPawnSvg({ cx, cy, colorKey, isLegal, onClick, count = 1, step }) {
  const colorConfig = PLAYER_COLORS[colorKey] || PLAYER_COLORS.red;

  const [isJumping, setIsJumping] = React.useState(false);
  const prevStepRef = React.useRef(step);
  const isInitialMount = React.useRef(true);

  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevStepRef.current = step;
      return;
    }
    if (prevStepRef.current !== step) {
      prevStepRef.current = step;
      setIsJumping(true);
      const timer = setTimeout(() => {
        setIsJumping(false);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <g
      className={`extended-pawn-group ${isJumping ? 'pawn-jumping' : ''}`}
      transform={`translate(${cx - 13}, ${cy - 20}) scale(0.62)`}
      style={{ cursor: isLegal ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      {/* Contact shadow */}
      <ellipse cx="22" cy="55.5" rx="14.5" ry="3.5" fill="rgba(15,23,42,0.3)" />

      {/* Pulsing ring if legal */}
      {isLegal && (
        <circle
          cx="22"
          cy="30"
          r="24"
          fill="none"
          stroke={colorConfig.hex}
          strokeWidth="3.5"
          opacity="0.9"
        >
          <animate attributeName="r" values="22;27;22" dur="1.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.25;1" dur="1.2s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Stepped base pedestal */}
      <path
        d="M 6.5 52 C 6.5 48.5, 37.5 48.5, 37.5 52 C 37.5 55.5, 6.5 55.5, 6.5 52 Z"
        fill={colorConfig.hex}
        stroke={colorConfig.border}
        strokeWidth="1"
      />
      <ellipse cx="22" cy="50.2" rx="13.5" ry="2.8" fill={colorConfig.hex} />
      <path d="M 8.5 50.2 C 9.5 46.5, 34.5 46.5, 35.5 50.2 Z" fill={colorConfig.hex} />

      {/* Bell body */}
      <path
        d="M 17 23.5 C 17 31, 8.5 42, 8.5 50 C 13.5 52, 30.5 52, 35.5 50 C 35.5 42, 27 31, 27 23.5 Z"
        fill={colorConfig.hex}
        stroke={colorConfig.border}
        strokeWidth="1"
      />
      {/* Gloss curve */}
      <path
        d="M 18 24.5 C 18 30, 11.5 41, 11 48 C 13 48, 14.5 43, 16.5 34 C 18 29, 20.5 26, 20.5 24.5 Z"
        fill="#FFFFFF"
        opacity="0.4"
      />

      {/* Collar ring */}
      <ellipse cx="22" cy="22.8" rx="6.5" ry="2.2" fill={colorConfig.hex} stroke={colorConfig.border} strokeWidth="0.8" />
      <ellipse cx="21" cy="22.2" rx="4.2" ry="1.1" fill="#FFFFFF" opacity="0.4" />

      {/* Spherical head */}
      <circle cx="22" cy="12.8" r="9.5" fill={colorConfig.hex} stroke={colorConfig.border} strokeWidth="1" />
      <ellipse cx="18.5" cy="9.5" rx="3.2" ry="2" transform="rotate(-25 18.5 9.5)" fill="#FFFFFF" opacity="0.85" />

      {/* Stack Count Badge */}
      {count > 1 && (
        <g transform="translate(26, 2)">
          <circle cx="0" cy="0" r="9" fill="#0F172A" stroke="#FFFFFF" strokeWidth="1.5" />
          <text x="0" y="3.5" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">
            {count}
          </text>
        </g>
      )}
    </g>
  );
}

// Helper: Calculate polygon points for regular hexagon
function getHexagonPoints(cx, cy, r) {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60 - 90) * (Math.PI / 180);
    const x = Math.round(cx + Math.cos(angle) * r);
    const y = Math.round(cy + Math.sin(angle) * r);
    points.push(`${x},${y}`);
  }
  return points.join(' ');
}

// Helper: Calculate a specific vertex of regular hexagon
function getHexagonVertex(cx, cy, r, index) {
  const angle = (index * 60 - 90) * (Math.PI / 180);
  return {
    x: Math.round(cx + Math.cos(angle) * r),
    y: Math.round(cy + Math.sin(angle) * r),
  };
}

// Helper: Calculate sector arm guide polygon points
function getArmGuidePoints(s) {
  const theta = (s * 60 - 90) * (Math.PI / 180);
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const p1 = `${Math.round(500 + 85 * cos - (-56) * sin)},${Math.round(500 + 85 * sin + (-56) * cos)}`;
  const p2 = `${Math.round(500 + 410 * cos - (-56) * sin)},${Math.round(500 + 410 * sin + (-56) * cos)}`;
  const p3 = `${Math.round(500 + 458 * cos)},${Math.round(500 + 458 * sin)}`;
  const p4 = `${Math.round(500 + 410 * cos - 56 * sin)},${Math.round(500 + 410 * sin + 56 * cos)}`;
  const p5 = `${Math.round(500 + 85 * cos - 56 * sin)},${Math.round(500 + 85 * sin + 56 * cos)}`;
  return `${p1} ${p2} ${p3} ${p4} ${p5}`;
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
  // Count finished pieces per color
  const finishedCounts = useMemo(() => {
    const counts = { red: 0, green: 0, yellow: 0, blue: 0 };
    Object.values(pieces).forEach((pList) => {
      pList.forEach((p) => {
        if (p.state === 'FINISHED' && counts[p.colorKey] !== undefined) {
          counts[p.colorKey]++;
        }
      });
    });
    return counts;
  }, [pieces]);

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
