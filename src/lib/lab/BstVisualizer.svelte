<script lang="ts">
  import { onDestroy } from 'svelte';
  import { beep } from '../sound';
  import {
    height,
    insert,
    layout,
    MAX_LEVELS,
    remove,
    search,
    traverse,
    type OpResult,
    type TraversalKind,
    type TreeNode,
  } from './bst';

  const WIDTH = 800;
  const TOP = 34;
  const LEVEL_GAP = 72;
  const VIEW_HEIGHT = TOP * 2 + LEVEL_GAP * (MAX_LEVELS - 1);
  const STEP_MS = 360;
  const TRAVERSALS: { kind: TraversalKind; label: string }[] = [
    { kind: 'inorder', label: 'In-order' },
    { kind: 'preorder', label: 'Pre-order' },
    { kind: 'postorder', label: 'Post-order' },
    { kind: 'levelorder', label: 'Level-order' },
  ];

  let root = $state.raw<TreeNode | null>(seed([50, 30, 70, 20, 40, 60, 80]));
  let value = $state<number | null>(null);
  let message = $state('Type a number from 0 to 999, then Insert, Delete or Search.');
  let visited = $state.raw<number[]>([]);
  let active = $state<number | null>(null);
  let hit = $state<number | null>(null);
  let sequence = $state.raw<number[]>([]);

  const nodes = $derived(layout(root, WIDTH, TOP, LEVEL_GAP));
  const count = $derived(nodes.length);
  const levels = $derived(height(root));

  let canvas = $state<HTMLElement>();

  // On phones the drawing is wider than the screen; start scrolled to the middle, where the root is.
  $effect(() => {
    if (canvas) canvas.scrollLeft = (canvas.scrollWidth - canvas.clientWidth) / 2;
  });

  /** Bumped by each operation; a running animation stops when it no longer matches. */
  let run = 0;
  onDestroy(() => (run += 1));

  function seed(values: number[]): TreeNode | null {
    let tree: TreeNode | null = null;
    for (const v of values) tree = insert(tree, v).root;
    return tree;
  }

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  /** Walks the highlight along the given node ids. Resolves false if another operation took over. */
  async function walk(ids: number[], token: number): Promise<boolean> {
    for (const id of ids) {
      if (token !== run) return false;
      active = id;
      visited = [...visited, id];
      beep(600, 0.03);
      await sleep(STEP_MS);
    }
    return token === run;
  }

  function reset() {
    run += 1;
    visited = [];
    active = null;
    hit = null;
    sequence = [];
    return run;
  }

  function readValue(): number | null {
    if (value === null || !Number.isInteger(value) || value < 0 || value > 999) {
      message = 'Enter a whole number from 0 to 999.';
      return null;
    }
    return value;
  }

  async function apply(op: 'insert' | 'remove' | 'search') {
    const v = readValue();
    if (v === null) return;
    const token = reset();
    const result: OpResult = op === 'insert' ? insert(root, v) : op === 'remove' ? remove(root, v) : search(root, v);

    message = `${op === 'insert' ? 'Inserting' : op === 'remove' ? 'Deleting' : 'Searching for'} ${v}…`;
    if (!(await walk(result.path, token))) return;
    active = null;

    if (result.error) {
      message = result.error;
      return;
    }
    if (op === 'search') {
      hit = result.targetId ?? null;
      message = `Found ${v} after ${result.path.length} comparison${result.path.length === 1 ? '' : 's'}.`;
    } else {
      root = result.root;
      hit = op === 'insert' ? (result.targetId ?? null) : null;
      message = op === 'insert' ? `Inserted ${v}.` : `Deleted ${v}.`;
    }
    value = null;
  }

  function randomInsert() {
    const taken = new Set(nodes.map((n) => n.value));
    for (let attempt = 0; attempt < 40; attempt++) {
      const candidate = Math.floor(Math.random() * 100);
      if (taken.has(candidate)) continue;
      const result = insert(root, candidate);
      if (result.error) continue;
      value = candidate;
      void apply('insert');
      return;
    }
    message = 'No room for another random value at this depth.';
  }

  function clearTree() {
    reset();
    root = null;
    message = 'Tree cleared. Insert a value to start again.';
  }

  async function showTraversal(kind: TraversalKind, label: string) {
    const token = reset();
    const order = traverse(root, kind);
    message = `${label} traversal`;
    for (const node of order) {
      if (token !== run) return;
      active = node.id;
      visited = [...visited, node.id];
      sequence = [...sequence, node.value];
      await sleep(STEP_MS - 120);
    }
    if (token === run) {
      active = null;
      if (kind === 'inorder') message = 'In-order traversal of a BST visits the values in sorted order.';
    }
  }
</script>

<div class="bst">
  <form
    class="controls"
    onsubmit={(e) => {
      e.preventDefault();
      void apply('insert');
    }}
  >
    <label class="sr-only" for="bst-value">Value</label>
    <input
      id="bst-value"
      class="field"
      type="number"
      inputmode="numeric"
      min="0"
      max="999"
      placeholder="0–999"
      bind:value
    />
    <button type="submit">Insert</button>
    <button type="button" onclick={() => apply('remove')}>Delete</button>
    <button type="button" onclick={() => apply('search')}>Search</button>
    <button type="button" onclick={randomInsert}>Random</button>
    <button type="button" onclick={clearTree}>Clear</button>
  </form>

  <p class="status" aria-live="polite">{message}</p>

  <div class="canvas" bind:this={canvas}>
    <svg viewBox="0 0 {WIDTH} {VIEW_HEIGHT}" role="img" aria-label="Binary search tree with {count} nodes">
      {#each nodes as node (node.id)}
        {#if node.parent}
          <line x1={node.parent.x} y1={node.parent.y} x2={node.x} y2={node.y} />
        {/if}
      {/each}
      {#each nodes as node (node.id)}
        <g
          class="node"
          class:visited={visited.includes(node.id)}
          class:active={active === node.id}
          class:hit={hit === node.id}
          style:transform="translate({node.x}px, {node.y}px)"
        >
          <circle r="20" />
          <text dy="5">{node.value}</text>
        </g>
      {/each}
    </svg>
    {#if count === 0}
      <p class="empty">Empty tree</p>
    {/if}
  </div>

  <p class="meta">{count} nodes · height {levels} of {MAX_LEVELS}</p>

  <div class="traversals" role="group" aria-label="Traversals">
    {#each TRAVERSALS as t (t.kind)}
      <button onclick={() => showTraversal(t.kind, t.label)} disabled={count === 0}>{t.label}</button>
    {/each}
  </div>
  {#if sequence.length}
    <p class="sequence">{sequence.join(' → ')}</p>
  {/if}
</div>

<style>
  .bst {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .controls,
  .traversals {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .controls input {
    width: 96px;
  }

  .controls button,
  .traversals button {
    padding: 3px 10px;
    border: 1px solid var(--faint);
  }

  .controls button:hover,
  .traversals button:not(:disabled):hover {
    border-color: var(--fg);
  }

  .controls button[type='submit'] {
    border-color: var(--fg);
  }

  .traversals button:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .status,
  .meta,
  .sequence {
    margin: 0;
  }

  .status {
    min-height: 1.55em;
  }

  .meta {
    color: var(--dim);
    font-size: 12.5px;
  }

  .sequence {
    overflow-wrap: anywhere;
  }

  .canvas {
    position: relative;
    border: 1px solid var(--faint);
    background: rgba(53, 255, 110, 0.03);
    overflow-x: auto;
    overscroll-behavior-x: contain;
  }

  svg {
    display: block;
    width: 100%;
    height: auto;
  }

  line {
    stroke: var(--dim);
    stroke-width: 2;
  }

  /* Position is a CSS transform so nodes glide when the tree reshapes after a delete. */
  .node {
    transition: transform 0.35s ease;
    animation: pop 0.3s ease-out;
  }

  .node circle {
    fill: var(--panel);
    stroke: var(--fg);
    stroke-width: 2;
    transition:
      fill 0.15s,
      stroke-width 0.15s;
  }

  .node text {
    fill: var(--fg);
    font-family: var(--font);
    font-size: 16px;
    text-anchor: middle;
  }

  .node.visited circle {
    fill: var(--faint);
  }

  .node.active circle,
  .node.hit circle {
    fill: var(--fg);
    stroke-width: 4;
  }

  .node.active text,
  .node.hit text {
    fill: var(--bg);
  }

  @keyframes pop {
    from {
      opacity: 0;
    }
  }

  .empty {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    margin: 0;
    color: var(--dim);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  /* Phones: keep the nodes legible and let the drawing scroll sideways instead of shrinking. */
  @media (max-width: 720px) {
    svg {
      min-width: 560px;
    }

    .controls button,
    .traversals button {
      padding: 8px 10px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .node {
      transition: none;
      animation: none;
    }
  }
</style>
