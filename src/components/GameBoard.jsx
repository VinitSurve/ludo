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
  // Extended 6-Player Deluxe Tabletop Board (Physical Board-Game Architecture)
  // =========================================================================
  return (
    <div className="board-wrapper">
      <div className="extended-board-svg-container">
        <svg
          viewBox="0 0 1000 1000"
          className="extended-svg-root"
        >
          <defs>
            <filter id="boardDropShadow" x="-10%" y="-10%" width="125%" height="125%">
              <feDropShadow dx="0" dy="16" stdDeviation="20" floodColor="#0F172A" floodOpacity="0.22" />
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0F172A" floodOpacity="0.10" />
            </filter>
            <filter id="cardShadow" x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#0F172A" floodOpacity="0.15" />
            </filter>
            <filter id="tileShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.12" />
            </filter>
            <radialGradient id="centerGoldGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="60%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </radialGradient>
            <radialGradient id="boardSurfaceGrad" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="85%" stopColor="#FBFBFD" />
              <stop offset="100%" stopColor="#F1F5F9" />
            </radialGradient>
            <filter id="subtleShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* 1. Tabletop Board Outer Bezel & Solid Surface */}
          <polygon
            points={getPolygonPoints(500, 500, 485, 6, -90)}
            fill="url(#boardSurfaceGrad)"
            stroke="#334155"
            strokeWidth="12"
            filter="url(#boardDropShadow)"
          />
          <polygon
            points={getPolygonPoints(500, 500, 475, 6, -90)}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="2"
          />

          {/* 2. Inlaid Arm Track Beds (recessed channels under tiles) */}
          {Object.entries(EXTENDED_BOARD_DATA.sectorConfigs).map(([colorKey, cfg], sIdx) => (
            <polygon
              key={`arm-bed-${colorKey}`}
              points={getArmBedPoints(sIdx)}
              fill="#E2E8F0"
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />
          ))}

          {/* 3. Central Finish Area (6 colored wedges + golden podium) */}
          <g key="center-finish-group">
            {Object.entries(EXTENDED_BOARD_DATA.sectorConfigs).map(([colorKey, cfg], sIdx) => {
              const player = players.find((p) => p.colorKey === colorKey);
              const isActive = Boolean(player);
              const colorCfg = PLAYER_COLORS[colorKey];
              const a1 = (sIdx * 60 - 90 - 30) * (Math.PI / 180);
              const a2 = (sIdx * 60 - 90 + 30) * (Math.PI / 180);
              const p1 = `${Math.round(500 + 124 * Math.cos(a1))},${Math.round(500 + 124 * Math.sin(a1))}`;
              const p2 = `${Math.round(500 + 124 * Math.cos(a2))},${Math.round(500 + 124 * Math.sin(a2))}`;

              const finishedCount = player
                ? (pieces[player.id] || []).filter((p) => p.state === 'FINISHED').length
                : 0;

              return (
                <g key={`center-wedge-${colorKey}`}>
                  <polygon
                    points={`500,500 ${p1} ${p2}`}
                    fill={isActive ? colorCfg.bg : '#F8FAFC'}
                    stroke={isActive ? colorCfg.border : '#CBD5E1'}
                    strokeWidth="1.5"
                  />
                  {finishedCount > 0 && (
                    <g transform={`translate(${cfg.finishCoord.x}, ${cfg.finishCoord.y})`}>
                      <circle cx="0" cy="0" r="11" fill={colorCfg.hex} stroke="#FFFFFF" strokeWidth="2" filter="url(#subtleShadow)" />
                      <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">
                        {finishedCount}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
            <polygon
              points={getPolygonPoints(500, 500, 124, 6, -90)}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="3"
            />
            <circle
              cx="500"
              cy="500"
              r="36"
              fill="url(#centerGoldGrad)"
              stroke="#B45309"
              strokeWidth="3"
              filter="url(#cardShadow)"
            />
            <circle
              cx="500"
              cy="500"
              r="30"
              fill="none"
              stroke="#FDE68A"
              strokeWidth="1.5"
              strokeDasharray="3 2"
            />
            <text
              x="500"
              y="509"
              textAnchor="middle"
              fontSize="24"
            >
              🏆
            </text>
          </g>

          {/* 4. Home Base Pods (Upright Deluxe Player Quadrants) */}
          {Object.entries(EXTENDED_BOARD_DATA.sectorConfigs).map(([colorKey, cfg]) => {
            const colorCfg = PLAYER_COLORS[colorKey];
            const player = players.find((p) => p.colorKey === colorKey);
            const isActiveSector = Boolean(player);
            const playerPieceList = player ? pieces[player.id] || [] : [];
            const bx = cfg.baseCenter.x;
            const by = cfg.baseCenter.y;
            const hw = 68;

            const isBaseHighlighted = isActiveSector && hasBaseAction && activePlayer?.colorKey === colorKey;

            return (
              <g key={`ext-base-${colorKey}`}>
                {isActiveSector ? (
                  <>
                    {/* Upright Player Base Card */}
                    <rect
                      x={bx - hw}
                      y={by - hw}
                      width={hw * 2}
                      height={hw * 2}
                      rx="18"
                      fill="#FFFFFF"
                      stroke={isBaseHighlighted ? '#F59E0B' : colorCfg.border}
                      strokeWidth={isBaseHighlighted ? '5' : '3.5'}
                      className={isBaseHighlighted ? 'svg-base-highlight-pulse' : ''}
                      filter="url(#cardShadow)"
                    />
                    {/* Header Banner */}
                    <path
                      d={`M ${bx - hw} ${by - hw + 18} C ${bx - hw} ${by - hw + 8}, ${bx - hw + 8} ${by - hw}, ${bx - hw + 18} ${by - hw} L ${bx + hw - 18} ${by - hw} C ${bx + hw - 8} ${by - hw}, ${bx + hw} ${by - hw + 8}, ${bx + hw} ${by - hw + 18} L ${bx + hw} ${by - 32} L ${bx - hw} ${by - 32} Z`}
                      fill={colorCfg.bg}
                      stroke={colorCfg.border}
                      strokeWidth="1"
                    />
                    <line
                      x1={bx - hw}
                      y1={by - 32}
                      x2={bx + hw}
                      y2={by - 32}
                      stroke={colorCfg.border}
                      strokeWidth="1.5"
                    />
                    <text
                      x={bx}
                      y={by - 46}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="bold"
                      fill={colorCfg.text}
                    >
                      {player?.avatar || colorCfg.avatar} {(player?.name || colorCfg.name).toUpperCase()}
                    </text>

                    {/* 4 Inset Pawn Sockets */}
                    {cfg.baseSlots.map((slot, sIdx) => {
                      const pieceInSlot = playerPieceList.find(
                        (p) => p.baseIndex === sIdx && p.state === 'BASE'
                      );
                      const isLegal = pieceInSlot && player.id === activePlayerId && legalMoves.includes(pieceInSlot.id);

                      return (
                        <g key={`slot-${colorKey}-${sIdx}`}>
                          <circle
                            cx={slot.x}
                            cy={slot.y}
                            r="20"
                            fill="#F8FAFC"
                            stroke={isLegal ? colorCfg.hex : '#CBD5E1'}
                            strokeWidth={isLegal ? '3' : '1.5'}
                            strokeDasharray={isLegal ? 'none' : '3 3'}
                          />
                          <circle
                            cx={slot.x}
                            cy={slot.y}
                            r="17"
                            fill="#F1F5F9"
                            stroke="#E2E8F0"
                            strokeWidth="1"
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
                  </>
                ) : (
                  <>
                    {/* 5-Player Mode Neutral Zone Medallion */}
                    <rect
                      x={bx - hw}
                      y={by - hw}
                      width={hw * 2}
                      height={hw * 2}
                      rx="18"
                      fill="#F8FAFC"
                      stroke="#94A3B8"
                      strokeWidth="2.5"
                      strokeDasharray="6 4"
                      filter="url(#cardShadow)"
                    />
                    <path
                      d={`M ${bx - hw} ${by - hw + 18} C ${bx - hw} ${by - hw + 8}, ${bx - hw + 8} ${by - hw}, ${bx - hw + 18} ${by - hw} L ${bx + hw - 18} ${by - hw} C ${bx + hw - 8} ${by - hw}, ${bx + hw} ${by - hw + 8}, ${bx + hw} ${by - hw + 18} L ${bx + hw} ${by - 32} L ${bx - hw} ${by - 32} Z`}
                      fill="#E2E8F0"
                      stroke="#94A3B8"
                      strokeWidth="1"
                    />
                    <line
                      x1={bx - hw}
                      y1={by - 32}
                      x2={bx + hw}
                      y2={by - 32}
                      stroke="#94A3B8"
                      strokeWidth="1.5"
                    />
                    <text
                      x={bx}
                      y={by - 46}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="700"
                      fill="#64748B"
                      letterSpacing="1"
                    >
                      INACTIVE
                    </text>
                    {/* Compass Rose Emblem */}
                    <circle
                      cx={bx}
                      cy={by + 16}
                      r="32"
                      fill="#F1F5F9"
                      stroke="#CBD5E1"
                      strokeWidth="2"
                    />
                    <polygon
                      points={`${bx},${by - 9} ${bx + 6},${by + 11} ${bx + 25},${by + 16} ${bx + 6},${by + 21} ${bx},${by + 41} ${bx - 6},${by + 21} ${bx - 25},${by + 16} ${bx - 6},${by + 11}`}
                      fill="#94A3B8"
                    />
                    <circle
                      cx={bx}
                      cy={by + 16}
                      r="5"
                      fill="#FFFFFF"
                      stroke="#64748B"
                      strokeWidth="1.5"
                    />
                  </>
                )}
              </g>
            );
          })}

          {/* 5. Home Lanes (Center Column of each Arm with inward chevrons) */}
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
                  const rot = coord.armAngleDeg + 90;

                  return (
                    <g key={`hl-${colorKey}-${hIdx}`}>
                      <g
                        transform={`translate(${coord.x}, ${coord.y}) rotate(${rot})`}
                        filter="url(#tileShadow)"
                      >
                        {isActiveSector ? (
                          <>
                            <rect
                              x="-18"
                              y="-23"
                              width="36"
                              height="46"
                              rx="6"
                              fill={colorCfg.hex}
                              stroke={colorCfg.accent}
                              strokeWidth="2"
                            />
                            <path
                              d="M -7 -4 L 0 5 L 7 -4"
                              fill="none"
                              stroke="#FFFFFF"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </>
                        ) : (
                          <>
                            <rect
                              x="-18"
                              y="-23"
                              width="36"
                              height="46"
                              rx="6"
                              fill="#F1F5F9"
                              stroke="#CBD5E1"
                              strokeWidth="1.5"
                            />
                            <circle cx="0" cy="0" r="3" fill="#94A3B8" />
                          </>
                        )}
                      </g>
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

          {/* 6. 66 Connected Movement Track Tiles */}
          {EXTENDED_BOARD_DATA.trackCoords.map((coord, idx) => {
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
            const rot = coord.armAngleDeg + 90;

            return (
              <g key={`track-ext-${idx}`}>
                <g
                  transform={`translate(${coord.x}, ${coord.y}) rotate(${rot})`}
                  filter="url(#tileShadow)"
                >
                  {coord.isStart && isStartActive ? (
                    <>
                      {/* Start Tile with Player Color, dot & directional arrow */}
                      <rect
                        x="-18"
                        y="-23"
                        width="36"
                        height="46"
                        rx="6"
                        fill={cellColor.bg}
                        stroke={cellColor.border}
                        strokeWidth="2.5"
                      />
                      <circle cx="0" cy="-6" r="9" fill={cellColor.hex} stroke="#FFFFFF" strokeWidth="1.5" />
                      <path
                        d="M -5 6 L 0 13 L 5 6"
                        fill="none"
                        stroke={cellColor.border}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  ) : coord.isSafe ? (
                    <>
                      {/* Safe Star Tile */}
                      <rect
                        x="-18"
                        y="-23"
                        width="36"
                        height="46"
                        rx="6"
                        fill="#FEF9C3"
                        stroke="#F59E0B"
                        strokeWidth="2"
                      />
                      <text
                        x="0"
                        y="5"
                        textAnchor="middle"
                        fontSize="16"
                        fontWeight="bold"
                        fill="#D97706"
                      >
                        ★
                      </text>
                    </>
                  ) : coord.col === 'tip' ? (
                    <>
                      {/* Tip Crossover Tile */}
                      <rect
                        x="-18"
                        y="-23"
                        width="36"
                        height="46"
                        rx="8"
                        fill="#FFFFFF"
                        stroke="#CBD5E1"
                        strokeWidth="2"
                      />
                      <path
                        d="M -7 -2 Q 0 -9 7 -2 L 5 -5 M 7 -2 L 3 1"
                        fill="none"
                        stroke="#64748B"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </>
                  ) : (
                    <>
                      {/* Standard Connected Track Tile */}
                      <rect
                        x="-18"
                        y="-23"
                        width="36"
                        height="46"
                        rx="6"
                        fill="#FFFFFF"
                        stroke="#CBD5E1"
                        strokeWidth="1.5"
                      />
                    </>
                  )}
                </g>

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

// Helper: Calculate polygon points for regular polygons
function getPolygonPoints(cx, cy, r, sides = 6, offsetDeg = -90) {
  const points = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i * (360 / sides) + offsetDeg) * (Math.PI / 180);
    points.push(`${Math.round(cx + Math.cos(angle) * r)},${Math.round(cy + Math.sin(angle) * r)}`);
  }
  return points.join(' ');
}

// Helper: Calculate sector arm bed polygon points (inlaid channel)
function getArmBedPoints(s) {
  const theta = (s * 60 - 90) * (Math.PI / 180);
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const hw = 58;
  const rIn = 120;
  const rOut = 390;
  const rTip = 435;
  const p1 = `${Math.round(500 + rIn * cos - (-hw) * sin)},${Math.round(500 + rIn * sin + (-hw) * cos)}`;
  const p2 = `${Math.round(500 + rOut * cos - (-hw) * sin)},${Math.round(500 + rOut * sin + (-hw) * cos)}`;
  const p3 = `${Math.round(500 + rTip * cos)},${Math.round(500 + rTip * sin)}`;
  const p4 = `${Math.round(500 + rOut * cos - hw * sin)},${Math.round(500 + rOut * sin + hw * cos)}`;
  const p5 = `${Math.round(500 + rIn * cos - hw * sin)},${Math.round(500 + rIn * sin + hw * cos)}`;
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
