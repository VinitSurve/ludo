import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const screenshotsDir = path.join(projectRoot, 'docs', 'screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Classical cell coords lookup helper
const CLASSIC_TRACK_COORDS = [
  { row: 6, col: 1 }, { row: 6, col: 2 }, { row: 6, col: 3 }, { row: 6, col: 4 }, { row: 6, col: 5 },
  { row: 5, col: 6 }, { row: 4, col: 6 }, { row: 3, col: 6 }, { row: 2, col: 6 }, { row: 1, col: 6 }, { row: 0, col: 6 },
  { row: 0, col: 7 },
  { row: 0, col: 8 }, { row: 1, col: 8 }, { row: 2, col: 8 }, { row: 3, col: 8 }, { row: 4, col: 8 }, { row: 5, col: 8 },
  { row: 6, col: 9 }, { row: 6, col: 10 }, { row: 6, col: 11 }, { row: 6, col: 12 }, { row: 6, col: 13 }, { row: 6, col: 14 },
  { row: 7, col: 14 },
  { row: 8, col: 14 }, { row: 8, col: 13 }, { row: 8, col: 12 }, { row: 8, col: 11 }, { row: 8, col: 10 }, { row: 8, col: 9 },
  { row: 9, col: 8 }, { row: 10, col: 8 }, { row: 11, col: 8 }, { row: 12, col: 8 }, { row: 13, col: 8 }, { row: 14, col: 8 },
  { row: 14, col: 7 },
  { row: 14, col: 6 }, { row: 13, col: 6 }, { row: 12, col: 6 }, { row: 11, col: 6 }, { row: 10, col: 6 }, { row: 9, col: 6 },
  { row: 8, col: 5 }, { row: 8, col: 4 }, { row: 8, col: 3 }, { row: 8, col: 2 }, { row: 8, col: 1 }, { row: 8, col: 0 },
  { row: 7, col: 0 }, { row: 6, col: 0 }
];

async function captureAll() {
  console.log('Launching Chrome for screenshot capture...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // 1. Main Game 4-Player
  console.log('1. Capturing main-game-4-player.png...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
  await page.waitForSelector('.classic-board-grid');
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({
    path: path.join(screenshotsDir, 'main-game-4-player.png'),
    fullPage: false,
  });

  // 2. New Game / Player Setup Modal
  console.log('2. Capturing new-game-setup.png...');
  await page.evaluate(() => {
    window.__LUDO_APP__?.setShowSetupModal(true);
  });
  await page.waitForSelector('.modal-content');
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({
    path: path.join(screenshotsDir, 'new-game-setup.png'),
    fullPage: false,
  });

  // 3. 2-Player Game
  console.log('3. Capturing game-2-player.png...');
  await page.evaluate(() => {
    window.__LUDO_APP__?.startNewGame(2, {});
    window.__LUDO_APP__?.setShowSetupModal(false);
  });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({
    path: path.join(screenshotsDir, 'game-2-player.png'),
    fullPage: false,
  });

  // 4. 3-Player Game
  console.log('4. Capturing game-3-player.png...');
  await page.evaluate(() => {
    window.__LUDO_APP__?.startNewGame(3, {});
    window.__LUDO_APP__?.setShowSetupModal(false);
  });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({
    path: path.join(screenshotsDir, 'game-3-player.png'),
    fullPage: false,
  });

  // 5. Gameplay in Progress (4-Player with active pawns across the board)
  console.log('5. Capturing gameplay-in-progress.png...');
  await page.evaluate((trackCoords) => {
    const pieces = {
      1: [
        { id: 0, playerId: 1, colorKey: 'red', state: 'TRACK', step: 16, trackIndex: 16, row: trackCoords[16].row, col: trackCoords[16].col },
        { id: 1, playerId: 1, colorKey: 'red', state: 'TRACK', step: 4, trackIndex: 4, row: trackCoords[4].row, col: trackCoords[4].col },
        { id: 2, playerId: 1, colorKey: 'red', state: 'BASE', step: -1, trackIndex: null, baseIndex: 2, row: 3, col: 2 },
        { id: 3, playerId: 1, colorKey: 'red', state: 'BASE', step: -1, trackIndex: null, baseIndex: 3, row: 3, col: 3 },
      ],
      2: [
        { id: 0, playerId: 2, colorKey: 'green', state: 'TRACK', step: 8, trackIndex: 21, row: trackCoords[21].row, col: trackCoords[21].col },
        { id: 1, playerId: 2, colorKey: 'green', state: 'BASE', step: -1, trackIndex: null, baseIndex: 1, row: 2, col: 12 },
        { id: 2, playerId: 2, colorKey: 'green', state: 'BASE', step: -1, trackIndex: null, baseIndex: 2, row: 3, col: 11 },
        { id: 3, playerId: 2, colorKey: 'green', state: 'BASE', step: -1, trackIndex: null, baseIndex: 3, row: 3, col: 12 },
      ],
      3: [
        { id: 0, playerId: 3, colorKey: 'yellow', state: 'TRACK', step: 7, trackIndex: 33, row: trackCoords[33].row, col: trackCoords[33].col },
        { id: 1, playerId: 3, colorKey: 'yellow', state: 'BASE', step: -1, trackIndex: null, baseIndex: 1, row: 11, col: 12 },
        { id: 2, playerId: 3, colorKey: 'yellow', state: 'BASE', step: -1, trackIndex: null, baseIndex: 2, row: 12, col: 11 },
        { id: 3, playerId: 3, colorKey: 'yellow', state: 'BASE', step: -1, trackIndex: null, baseIndex: 3, row: 12, col: 12 },
      ],
      4: [
        { id: 0, playerId: 4, colorKey: 'blue', state: 'TRACK', step: 6, trackIndex: 45, row: trackCoords[45].row, col: trackCoords[45].col },
        { id: 1, playerId: 4, colorKey: 'blue', state: 'BASE', step: -1, trackIndex: null, baseIndex: 1, row: 11, col: 3 },
        { id: 2, playerId: 4, colorKey: 'blue', state: 'BASE', step: -1, trackIndex: null, baseIndex: 2, row: 12, col: 2 },
        { id: 3, playerId: 4, colorKey: 'blue', state: 'BASE', step: -1, trackIndex: null, baseIndex: 3, row: 12, col: 3 },
      ],
    };

    window.__LUDO_APP__?.startNewGame(4, {
      pieces,
      currentPlayerIndex: 0,
      diceValue: 4,
      diceRolled: true,
      legalMoves: [0, 1],
      gameStatus: 'WAITING_MOVE',
      scores: { 1: 2, 2: 1, 3: 0, 4: 1 },
    });
  }, CLASSIC_TRACK_COORDS);

  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({
    path: path.join(screenshotsDir, 'gameplay-in-progress.png'),
    fullPage: false,
  });

  // 6. Piece Selection (Strategic choice on rolling 6: move board pawn or bring pawn out)
  console.log('6. Capturing piece-selection.png...');
  await page.evaluate((trackCoords) => {
    const pieces = {
      1: [
        { id: 0, playerId: 1, colorKey: 'red', state: 'TRACK', step: 8, trackIndex: 8, row: trackCoords[8].row, col: trackCoords[8].col },
        { id: 1, playerId: 1, colorKey: 'red', state: 'BASE', step: -1, trackIndex: null, baseIndex: 1, row: 2, col: 3 },
        { id: 2, playerId: 1, colorKey: 'red', state: 'BASE', step: -1, trackIndex: null, baseIndex: 2, row: 3, col: 2 },
        { id: 3, playerId: 1, colorKey: 'red', state: 'BASE', step: -1, trackIndex: null, baseIndex: 3, row: 3, col: 3 },
      ],
      2: [
        { id: 0, playerId: 2, colorKey: 'green', state: 'BASE', step: -1, trackIndex: null, baseIndex: 0, row: 2, col: 11 },
        { id: 1, playerId: 2, colorKey: 'green', state: 'BASE', step: -1, trackIndex: null, baseIndex: 1, row: 2, col: 12 },
        { id: 2, playerId: 2, colorKey: 'green', state: 'BASE', step: -1, trackIndex: null, baseIndex: 2, row: 3, col: 11 },
        { id: 3, playerId: 2, colorKey: 'green', state: 'BASE', step: -1, trackIndex: null, baseIndex: 3, row: 3, col: 12 },
      ],
      3: [
        { id: 0, playerId: 3, colorKey: 'yellow', state: 'BASE', step: -1, trackIndex: null, baseIndex: 0, row: 11, col: 11 },
        { id: 1, playerId: 3, colorKey: 'yellow', state: 'BASE', step: -1, trackIndex: null, baseIndex: 1, row: 11, col: 12 },
        { id: 2, playerId: 3, colorKey: 'yellow', state: 'BASE', step: -1, trackIndex: null, baseIndex: 2, row: 12, col: 11 },
        { id: 3, playerId: 3, colorKey: 'yellow', state: 'BASE', step: -1, trackIndex: null, baseIndex: 3, row: 12, col: 12 },
      ],
      4: [
        { id: 0, playerId: 4, colorKey: 'blue', state: 'BASE', step: -1, trackIndex: null, baseIndex: 0, row: 11, col: 2 },
        { id: 1, playerId: 4, colorKey: 'blue', state: 'BASE', step: -1, trackIndex: null, baseIndex: 1, row: 11, col: 3 },
        { id: 2, playerId: 4, colorKey: 'blue', state: 'BASE', step: -1, trackIndex: null, baseIndex: 2, row: 12, col: 2 },
        { id: 3, playerId: 4, colorKey: 'blue', state: 'BASE', step: -1, trackIndex: null, baseIndex: 3, row: 12, col: 3 },
      ],
    };

    window.__LUDO_APP__?.startNewGame(4, {
      pieces,
      currentPlayerIndex: 0,
      diceValue: 6,
      diceRolled: true,
      legalMoves: [0, 1, 2, 3],
      hasBaseAction: true,
      basePieceIdToEnter: 1,
      gameStatus: 'WAITING_MOVE',
    });
  }, CLASSIC_TRACK_COORDS);

  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({
    path: path.join(screenshotsDir, 'piece-selection.png'),
    fullPage: false,
  });

  // 7. Winner / Game Completed Screen
  console.log('7. Capturing winner-screen.png...');
  await page.evaluate(() => {
    const finishedPieces = [
      { id: 0, playerId: 1, colorKey: 'red', state: 'FINISHED', step: 56, trackIndex: null, row: 7, col: 6 },
      { id: 1, playerId: 1, colorKey: 'red', state: 'FINISHED', step: 56, trackIndex: null, row: 7, col: 6 },
      { id: 2, playerId: 1, colorKey: 'red', state: 'FINISHED', step: 56, trackIndex: null, row: 7, col: 6 },
      { id: 3, playerId: 1, colorKey: 'red', state: 'FINISHED', step: 56, trackIndex: null, row: 7, col: 6 },
    ];
    window.__LUDO_APP__?.startNewGame(4, {
      pieces: {
        1: finishedPieces,
      },
      gameStatus: 'GAME_OVER',
      winner: { id: 1, name: 'Player 1', colorKey: 'red', avatar: '🦁' },
      scores: { 1: 5, 2: 1, 3: 0, 4: 2 },
    });
  });

  await page.waitForSelector('.modal-content');
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({
    path: path.join(screenshotsDir, 'winner-screen.png'),
    fullPage: false,
  });

  console.log('All 7 screenshots successfully captured!');
  await browser.close();
}

captureAll().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
