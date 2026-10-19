// Connect-4 rules and a Minimax AI with alpha-beta pruning. Pure functions, so the AI can run
// in a Web Worker without touching the UI thread.

export const ROWS = 6;
export const COLS = 7;
export const HUMAN = 1;
export const CPU = 2;

/** 0 = empty, 1 = human, 2 = computer. Row 0 is the top. */
export type Cell = 0 | 1 | 2;
export type Board = Cell[];

export const emptyBoard = (): Board => Array<Cell>(ROWS * COLS).fill(0);

export const indexOf = (row: number, col: number): number => row * COLS + col;

/** Lowest empty row in a column, or -1 when the column is full. */
export function openRow(board: Board, col: number): number {
  for (let row = ROWS - 1; row >= 0; row--) if (board[indexOf(row, col)] === 0) return row;
  return -1;
}

export const isFull = (board: Board): boolean => board.slice(0, COLS).every((cell) => cell !== 0);

const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
] as const;

/** The cells of a four-in-a-row through `index`, if the disc there completes one. */
export function winningLine(board: Board, index: number): number[] | null {
  const player = board[index];
  if (!player) return null;
  const row0 = Math.floor(index / COLS);
  const col0 = index % COLS;

  for (const [dr, dc] of DIRECTIONS) {
    const line = [index];
    for (const sign of [1, -1]) {
      let row = row0 + dr * sign;
      let col = col0 + dc * sign;
      while (row >= 0 && row < ROWS && col >= 0 && col < COLS && board[indexOf(row, col)] === player) {
        line.push(indexOf(row, col));
        row += dr * sign;
        col += dc * sign;
      }
    }
    if (line.length >= 4) return line;
  }
  return null;
}

/** Every group of four cells that could form a line: 69 on a 6x7 board. */
const WINDOWS: number[][] = (() => {
  const windows: number[][] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      for (const [dr, dc] of DIRECTIONS) {
        const endRow = row + dr * 3;
        const endCol = col + dc * 3;
        if (endRow < 0 || endRow >= ROWS || endCol < 0 || endCol >= COLS) continue;
        windows.push([0, 1, 2, 3].map((k) => indexOf(row + dr * k, col + dc * k)));
      }
    }
  }
  return windows;
})();

/** Heuristic for a position with no winner yet: positive favours the computer. */
function evaluate(board: Board): number {
  let score = 0;
  // The centre column takes part in the most lines.
  for (let row = 0; row < ROWS; row++) {
    const cell = board[indexOf(row, 3)];
    if (cell === CPU) score += 3;
    else if (cell === HUMAN) score -= 3;
  }
  for (const window of WINDOWS) {
    let cpu = 0;
    let human = 0;
    for (const i of window) {
      if (board[i] === CPU) cpu++;
      else if (board[i] === HUMAN) human++;
    }
    if (cpu > 0 && human > 0) continue; // blocked, worth nothing to either side
    if (cpu === 3) score += 5;
    else if (cpu === 2) score += 2;
    if (human === 3) score -= 4;
    else if (human === 2) score -= 2;
  }
  return score;
}

/** Centre-first move order makes alpha-beta prune far more branches. */
const MOVE_ORDER = [3, 2, 4, 1, 5, 0, 6];
const WIN = 1_000_000;

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  cpuToMove: boolean,
  lastIndex: number,
): number {
  // The previous move may have ended the game. Adding depth prefers quicker wins and slower losses.
  if (winningLine(board, lastIndex)) return cpuToMove ? -(WIN + depth) : WIN + depth;
  if (depth === 0 || isFull(board)) return evaluate(board);

  let best = cpuToMove ? -Infinity : Infinity;
  for (const col of MOVE_ORDER) {
    const row = openRow(board, col);
    if (row < 0) continue;
    const i = indexOf(row, col);
    board[i] = cpuToMove ? CPU : HUMAN;
    const value = minimax(board, depth - 1, alpha, beta, !cpuToMove, i);
    board[i] = 0;

    if (cpuToMove) {
      best = Math.max(best, value);
      alpha = Math.max(alpha, best);
    } else {
      best = Math.min(best, value);
      beta = Math.min(beta, best);
    }
    if (alpha >= beta) break;
  }
  return best;
}

/** The computer's column for this position, searching `depth` moves ahead. */
export function bestMove(board: Board, depth: number): number {
  const work = board.slice();
  let bestCol = -1;
  let bestValue = -Infinity;
  for (const col of MOVE_ORDER) {
    const row = openRow(work, col);
    if (row < 0) continue;
    const i = indexOf(row, col);
    work[i] = CPU;
    const value = minimax(work, depth - 1, -Infinity, Infinity, false, i);
    work[i] = 0;
    if (value > bestValue) {
      bestValue = value;
      bestCol = col;
    }
  }
  return bestCol;
}
