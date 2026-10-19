import type { AppId } from './apps';

/** Screens this small show one full-screen window at a time. Mirrored in Window.svelte's CSS. */
export const COMPACT_QUERY = '(max-width: 720px), (max-height: 520px)';

const TASKBAR = 40;
const MARGIN = 8;

/** What the window manager and the terminal need to know about an app; no component reference,
 *  so window bodies can import `wm` without importing `apps.ts` back (a circular import). */
export interface AppMeta {
  id: AppId;
  file: string;
  title: string;
  w: number;
  h: number;
}

export interface Win {
  id: AppId;
  x: number;
  y: number;
  z: number;
  minimized: boolean;
}

/** Window manager: which windows are open, where they sit and which one is on top. */
class WindowManager {
  windows = $state<Win[]>([]);
  #top = 10;

  /** Installed apps, in desktop order. Filled once by Desktop.svelte before anything opens. */
  catalog: AppMeta[] = [];

  register(defs: AppMeta[]): void {
    this.catalog = defs.map(({ id, file, title, w, h }) => ({ id, file, title, w, h }));
  }

  /** The focused window: the highest one that is not minimized. */
  active = $derived.by(() => {
    const visible = this.windows.filter((w) => !w.minimized);
    if (visible.length === 0) return null;
    return visible.reduce((a, b) => (a.z > b.z ? a : b)).id;
  });

  open(id: AppId): void {
    const existing = this.windows.find((w) => w.id === id);
    if (existing) {
      existing.minimized = false;
      existing.z = ++this.#top;
      return;
    }
    // Cascade new windows so each title bar stays reachable, but never start one
    // hanging off the right or bottom edge of a smaller screen.
    const app = this.catalog.find((a) => a.id === id) ?? { w: 600, h: 440 };
    const n = this.windows.length % 6;
    const maxX = Math.max(MARGIN, window.innerWidth - app.w - MARGIN);
    const maxY = Math.max(MARGIN, window.innerHeight - TASKBAR - app.h - MARGIN);
    this.windows.push({
      id,
      x: Math.min(150 + n * 30, maxX),
      y: Math.min(28 + n * 26, maxY),
      z: ++this.#top,
      minimized: false,
    });
  }

  close(id: AppId): void {
    this.windows = this.windows.filter((w) => w.id !== id);
  }

  closeAll(): void {
    this.windows = [];
  }

  focus(id: AppId): void {
    const win = this.windows.find((w) => w.id === id);
    if (win && win.z !== this.#top) win.z = ++this.#top;
  }

  minimize(id: AppId): void {
    const win = this.windows.find((w) => w.id === id);
    if (win) win.minimized = true;
  }

  /** Taskbar behaviour: focused window minimizes, anything else comes to the front. */
  toggle(id: AppId): void {
    if (this.active === id) this.minimize(id);
    else this.open(id);
  }

  move(id: AppId, x: number, y: number): void {
    const win = this.windows.find((w) => w.id === id);
    if (!win) return;
    // Keep a strip of the title bar on screen so the window can always be grabbed again.
    win.x = Math.min(Math.max(x, -200), window.innerWidth - 80);
    win.y = Math.min(Math.max(y, 0), window.innerHeight - TASKBAR - 40);
  }

  /** Pull every window back on screen after the viewport changes size or rotates. */
  refit(): void {
    for (const win of this.windows) this.move(win.id, win.x, win.y);
  }
}

export const wm = new WindowManager();
