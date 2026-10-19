<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cubicOut } from 'svelte/easing';
  import type { AppDef } from './apps';
  import { COMPACT_QUERY, wm, type Win } from './wm.svelte';

  let { win, app, children }: { win: Win; app: AppDef; children: Snippet } = $props();

  let dragging = $state(false);

  /** Grow out of / shrink into the taskbar. Transform and opacity only, so it stays on the compositor. */
  function genie(_node: Element, { duration = 240 } = {}) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return {
      duration: reduced ? 0 : duration,
      easing: cubicOut,
      css: (t: number) =>
        `opacity:${t};transform-origin:50% 100%;` +
        `transform:translate3d(0,${(1 - t) * 30}vh,0) scale(${0.25 + 0.75 * t},${0.05 + 0.95 * t});`,
    };
  }

  /** Any press inside the window brings it to the front. */
  function raiseOnPress(node: HTMLElement) {
    const raise = () => wm.focus(win.id);
    node.addEventListener('pointerdown', raise);
    return { destroy: () => node.removeEventListener('pointerdown', raise) };
  }

  /** Drag by the title bar. Off in compact mode, where windows are full-screen. */
  function draggable(node: HTMLElement) {
    let startX = 0;
    let startY = 0;
    let originX = 0;
    let originY = 0;
    let nextX = 0;
    let nextY = 0;
    let frame = 0;

    function down(e: PointerEvent) {
      if ((e.target as HTMLElement).closest('button')) return;
      if (window.matchMedia(COMPACT_QUERY).matches) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      originX = win.x;
      originY = win.y;
      node.setPointerCapture(e.pointerId);
    }

    function move(e: PointerEvent) {
      if (!dragging) return;
      nextX = originX + e.clientX - startX;
      nextY = originY + e.clientY - startY;
      // Pointer events can fire several times per frame; apply at most one move per frame.
      frame ||= requestAnimationFrame(() => {
        frame = 0;
        wm.move(win.id, nextX, nextY);
      });
    }

    function up() {
      dragging = false;
    }

    node.addEventListener('pointerdown', down);
    node.addEventListener('pointermove', move);
    node.addEventListener('pointerup', up);
    node.addEventListener('pointercancel', up);
    return {
      destroy() {
        cancelAnimationFrame(frame);
        node.removeEventListener('pointerdown', down);
        node.removeEventListener('pointermove', move);
        node.removeEventListener('pointerup', up);
        node.removeEventListener('pointercancel', up);
      },
    };
  }
</script>

<!-- The frame carries the position (a transform, so dragging never triggers layout);
     the window inside carries the open/close animation. Two elements keep the transforms apart. -->
<div
  class="frame"
  class:dragging
  style:transform="translate3d({win.x}px,{win.y}px,0)"
  style:z-index={win.z}
  style:--w="{app.w}px"
  style:--h="{app.h}px"
  use:raiseOnPress
>
  <section class="window" class:active={wm.active === win.id} aria-label={app.title} transition:genie>
    <header use:draggable>
      <span class="name">{app.file}</span>
      <button aria-label="Minimize {app.title}" onclick={() => wm.minimize(win.id)}>_</button>
      <button aria-label="Close {app.title}" onclick={() => wm.close(win.id)}>x</button>
    </header>
    <div class="body">
      {@render children()}
    </div>
  </section>
</div>

<style>
  .frame {
    position: absolute;
    left: 0;
    top: 0;
    width: min(var(--w), calc(100% - 16px));
    height: min(var(--h), calc(100% - var(--taskbar) - 16px));
  }

  .frame.dragging {
    will-change: transform;
    user-select: none;
  }

  .window {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: var(--panel);
    border: 1px solid var(--dim);
    box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.55);
    contain: layout paint;
  }

  .window.active {
    border-color: var(--fg);
    box-shadow:
      6px 6px 0 rgba(0, 0, 0, 0.55),
      0 0 18px rgba(53, 255, 110, 0.18);
  }

  header {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 4px 3px 10px;
    border-bottom: 1px solid var(--dim);
    color: var(--dim);
    cursor: grab;
    user-select: none;
    touch-action: none;
  }

  .dragging header {
    cursor: grabbing;
  }

  .active header {
    background: var(--fg);
    color: var(--bg);
    text-shadow: none;
    border-bottom-color: var(--fg);
  }

  .name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  header button {
    width: 26px;
    height: 22px;
    line-height: 1;
    border: 1px solid currentColor;
  }

  .body {
    flex: 1;
    min-height: 0;
    padding: 16px 18px;
    overflow: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    background: var(--panel);
  }

  /* Compact mode (phones, short landscape screens): one full-screen window at a time.
     Keep this query in sync with COMPACT_QUERY in wm.svelte.ts. */
  @media (max-width: 720px), (max-height: 520px) {
    .frame {
      inset: 0 0 var(--taskbar) 0;
      width: auto;
      height: auto;
      transform: none !important;
    }

    .window {
      border-width: 0;
      box-shadow: none;
    }

    header {
      padding: 6px 6px 6px 12px;
      cursor: default;
      touch-action: auto;
    }

    header button {
      width: 44px;
      height: 34px;
    }

    .body {
      padding: 14px;
    }
  }
</style>
