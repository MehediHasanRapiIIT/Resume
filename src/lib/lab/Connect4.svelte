<script lang="ts">
  import { onDestroy } from 'svelte';
  import { beep } from '../sound';
  import {
    bestMove,
    COLS,
    CPU,
    emptyBoard,
    HUMAN,
    indexOf,
    isFull,
    openRow,
    ROWS,
    winningLine,
    type Board,
  } from './connect4';
  import type { MoveReply, MoveRequest } from './connect4.worker';

  const LEVELS = [
    { label: 'Easy', depth: 2 },
    { label: 'Normal', depth: 4 },
    { label: 'Hard', depth: 7 },
  ];
  const COLUMNS = [...Array(COLS).keys()];
  const ROW_LIST = [...Array(ROWS).keys()];
  /** Lets the dropped disc land before the computer answers. */
  const CPU_DELAY_MS = 380;

  let board = $state<Board>(emptyBoard());
  let turn = $state<'human' | 'cpu' | 'over'>('human');
  let level = $state(1);
  let winLine = $state<number[]>([]);
  let lastIndex = $state(-1);
  let message = $state('Your move: pick a column.');
  let score = $state({ you: 0, cpu: 0, draw: 0 });

  /** Bumped on every new game so a late reply from an abandoned game is ignored. */
  let game = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  // The search runs in a worker so the board stays smooth on Hard; inline fallback otherwise.
  let worker: Worker | null = null;
  try {
    worker = new Worker(new URL('./connect4.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent<MoveReply>) => {
      if (e.data.game === game && turn === 'cpu') drop(e.data.col, CPU);
    };
  } catch {
    worker = null;
  }

  onDestroy(() => {
    clearTimeout(timer);
    worker?.terminate();
  });

  function drop(col: number, player: typeof HUMAN | typeof CPU) {
    const row = openRow(board, col);
    if (row < 0) return;
    const i = indexOf(row, col);
    board[i] = player;
    lastIndex = i;
    beep(player === HUMAN ? 520 : 380, 0.05);

    const line = winningLine(board, i);
    if (line) {
      winLine = line;
      turn = 'over';
      if (player === HUMAN) {
        score.you += 1;
        message = 'You win! Four in a row.';
      } else {
        score.cpu += 1;
        message = 'The computer wins this one.';
      }
      return;
    }
    if (isFull(board)) {
      turn = 'over';
      score.draw += 1;
      message = 'Board full: a draw.';
      return;
    }

    if (player === HUMAN) {
      turn = 'cpu';
      message = 'Computer is thinking…';
      askComputer();
    } else {
      turn = 'human';
      message = 'Your move.';
    }
  }

  function askComputer() {
    const current = game;
    const request: MoveRequest = {
      game: current,
      board: $state.snapshot(board) as Board,
      depth: LEVELS[level].depth,
    };
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (current !== game) return;
      if (worker) worker.postMessage(request);
      else drop(bestMove(request.board, request.depth), CPU);
    }, CPU_DELAY_MS);
  }

  function newGame(computerStarts: boolean) {
    game += 1;
    clearTimeout(timer);
    board = emptyBoard();
    winLine = [];
    lastIndex = -1;
    if (computerStarts) {
      turn = 'cpu';
      message = 'Computer is thinking…';
      askComputer();
    } else {
      turn = 'human';
      message = 'Your move: pick a column.';
    }
  }

  function setLevel(i: number) {
    level = i;
    newGame(false);
  }
</script>

<div class="c4">
  <div class="bar">
    <div class="levels" role="group" aria-label="Difficulty">
      {#each LEVELS as item, i (item.label)}
        <button aria-pressed={level === i} onclick={() => setLevel(i)}>{item.label}</button>
      {/each}
    </div>
    <p class="score">YOU {score.you} · CPU {score.cpu} · DRAW {score.draw}</p>
  </div>

  <p class="status" aria-live="polite">{message}</p>

  <div class="board" role="group" aria-label="Connect-4 board, 7 columns">
    {#each COLUMNS as col (col)}
      <button
        class="col"
        aria-label="Drop a disc in column {col + 1}"
        disabled={turn !== 'human' || openRow(board, col) < 0}
        onclick={() => drop(col, HUMAN)}
      >
        {#each ROW_LIST as row (row)}
          {@const i = indexOf(row, col)}
          <span class="cell">
            {#if board[i]}
              <span
                class="disc"
                class:cpu={board[i] === CPU}
                class:win={winLine.includes(i)}
                class:last={i === lastIndex && turn !== 'over'}
                style:--fall={row + 1}
              ></span>
            {/if}
          </span>
        {/each}
      </button>
    {/each}
  </div>

  <div class="legend">
    <span><i class="swatch"></i> you</span>
    <span><i class="swatch cpu"></i> computer</span>
  </div>

  <div class="actions">
    <button onclick={() => newGame(false)}>[ New game: you start ]</button>
    <button onclick={() => newGame(true)}>[ Computer starts ]</button>
  </div>
</div>

<style>
  .c4 {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: min(100%, 440px);
  }

  .levels {
    display: flex;
    gap: 4px;
  }

  .levels button {
    padding: 3px 10px;
    border: 1px solid var(--faint);
  }

  .levels button[aria-pressed='true'] {
    background: var(--fg);
    color: var(--bg);
    text-shadow: none;
  }

  .score,
  .status {
    margin: 0;
  }

  .score {
    color: var(--dim);
    font-size: 12.5px;
  }

  .status {
    min-height: 1.55em;
  }

  .board {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 4px;
    width: min(100%, 440px);
    padding: 6px;
    border: 1px solid var(--dim);
    background: rgba(53, 255, 110, 0.03);
  }

  .col {
    display: grid;
    grid-template-rows: repeat(6, auto);
    gap: 4px;
    padding: 2px;
    border: 1px solid transparent;
  }

  .col:not(:disabled):hover,
  .col:focus-visible {
    border-color: var(--faint);
    background: rgba(53, 255, 110, 0.06);
  }

  .col:disabled {
    cursor: default;
  }

  .cell {
    position: relative;
    aspect-ratio: 1;
    border: 1px solid var(--faint);
    border-radius: 50%;
  }

  .disc {
    position: absolute;
    inset: 3px;
    border-radius: 50%;
    background: var(--fg);
    box-shadow: 0 0 8px rgba(53, 255, 110, 0.55);
    animation: fall 0.32s cubic-bezier(0.4, 0, 0.7, 1);
  }

  .disc.cpu {
    background: radial-gradient(circle, var(--fg) 0 22%, transparent 24%);
    border: 3px solid var(--fg);
  }

  .disc.last {
    outline: 1px dashed var(--fg);
    outline-offset: 2px;
  }

  .disc.win {
    animation: blink 0.8s steps(1) infinite;
  }

  /* Starts above the board by as many cells as it falls; percentages are of the disc itself. */
  @keyframes fall {
    from {
      transform: translateY(calc(var(--fall) * -118%));
    }
  }

  @keyframes blink {
    50% {
      opacity: 0.25;
    }
  }

  .legend {
    display: flex;
    gap: 16px;
    color: var(--dim);
    font-size: 12.5px;
  }

  .legend span {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .swatch {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--fg);
  }

  .swatch.cpu {
    background: none;
    border: 2px solid var(--fg);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }

  .actions button {
    padding: 4px 6px;
    border: 1px solid var(--fg);
  }

  .actions button:hover {
    background: var(--fg);
    color: var(--bg);
    text-shadow: none;
  }

  @media (max-width: 720px) {
    .levels button,
    .actions button {
      padding: 8px 10px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .disc,
    .disc.win {
      animation: none;
    }
  }
</style>
