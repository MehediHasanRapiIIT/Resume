<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { appById, apps, type AppId } from './apps';
  import { downloadResume } from './download';
  import { github } from './github.svelte';
  import Icon from './Icon.svelte';
  import { profile } from './resume';
  import { beep, isSoundOn, setSound } from './sound';
  import Window from './Window.svelte';
  import { wm } from './wm.svelte';

  let { onreboot }: { onreboot: () => void } = $props();

  // Before any window renders: sizes for placement, file names for the terminal.
  wm.register(apps);

  let menuOpen = $state(false);
  let soundOn = $state(isSoundOn());
  let now = $state(new Date());

  const clock = $derived(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const visible = $derived(wm.windows.filter((w) => !w.minimized));

  onMount(() => {
    // Land on something readable rather than an empty desktop.
    if (wm.windows.length === 0) wm.open('about');
    void github.load();
    const timer = setInterval(() => (now = new Date()), 15_000);
    return () => clearInterval(timer);
  });

  function open(id: AppId) {
    wm.open(id);
    beep(720);
    menuOpen = false;
  }

  function toggleSound() {
    soundOn = !soundOn;
    setSound(soundOn);
    beep(880);
  }

  function download() {
    menuOpen = false;
    void downloadResume();
  }

  let resizeFrame = 0;

  function onResize() {
    // Resize fires continuously while dragging the browser edge; refit once per frame.
    resizeFrame ||= requestAnimationFrame(() => {
      resizeFrame = 0;
      wm.refit();
    });
  }

  function onKey(e: KeyboardEvent) {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Escape') {
      if (menuOpen) menuOpen = false;
      else if (wm.active) wm.close(wm.active);
      return;
    }

    // Digits typed into the terminal prompt are text, not shortcuts.
    const target = e.target as HTMLElement | null;
    if (target?.closest('input, textarea, [contenteditable]')) return;

    const index = Number(e.key) - 1;
    if (Number.isInteger(index) && index >= 0 && index < apps.length) open(apps[index].id);
  }
</script>

<svelte:window onkeydown={onKey} onresize={onResize} />

<div class="desktop" in:fade={{ duration: 300 }}>
  <ul class="icons">
    {#each apps as app, i (app.id)}
      <li in:fly={{ x: -12, delay: i * 50, duration: 250 }}>
        <button class="icon" onclick={() => open(app.id)}>
          <Icon name={app.icon} size={30} />
          <span>{app.file}</span>
        </button>
      </li>
    {/each}
  </ul>

  <p class="hint">1–9 open · Esc close · drag title bars to move</p>

  {#each visible as win (win.id)}
    {@const app = appById(win.id)}
    {@const Body = app.component}
    <Window {win} {app}>
      <Body />
    </Window>
  {/each}

  {#if menuOpen}
    <div class="menu" transition:fly={{ y: 10, duration: 150 }}>
      <p class="menu-head">{profile.name}</p>
      {#each apps as app, i (app.id)}
        <button onclick={() => open(app.id)}>
          <Icon name={app.icon} />
          <span>{app.title}</span>
          <kbd>{i + 1}</kbd>
        </button>
      {/each}
      <hr />
      <button onclick={download}>
        <Icon name="save" />
        <span>Download resume</span>
      </button>
      <button onclick={onreboot}>
        <Icon name="power" />
        <span>Reboot</span>
      </button>
    </div>
  {/if}

  <footer class="taskbar">
    <button class="start" aria-expanded={menuOpen} onclick={() => (menuOpen = !menuOpen)}>
      <Icon name="term" />
      <span>START</span>
    </button>

    <div class="tasks">
      {#each wm.windows as win (win.id)}
        {@const app = appById(win.id)}
        <button class="task" class:active={wm.active === win.id} onclick={() => wm.toggle(win.id)}>
          {app.file}
        </button>
      {/each}
    </div>

    <button class="tray" aria-pressed={soundOn} onclick={toggleSound}>
      SND {soundOn ? 'ON' : 'OFF'}
    </button>
    <time class="tray">{clock}</time>
  </footer>
</div>

<style>
  .desktop {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .icons {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-content: flex-start;
    gap: 6px;
    height: calc(100% - var(--taskbar));
    margin: 0;
    padding: 14px;
    list-style: none;
  }

  .icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    width: 116px;
    padding: 6px 4px;
    border: 1px solid transparent;
    font-size: 12.5px;
  }

  .icon:hover,
  .icon:focus-visible {
    border-color: var(--dim);
    background: rgba(53, 255, 110, 0.06);
  }

  .hint {
    position: absolute;
    right: 14px;
    bottom: calc(var(--taskbar) + 8px);
    margin: 0;
    color: var(--dim);
    font-size: 12px;
  }

  .menu {
    position: absolute;
    left: 0;
    bottom: var(--taskbar);
    z-index: 5000;
    display: flex;
    flex-direction: column;
    width: 250px;
    padding: 6px;
    background: var(--panel);
    border: 1px solid var(--fg);
  }

  .menu-head {
    margin: 0 0 4px;
    padding: 4px 8px;
    font-family: var(--display);
    font-size: 22px;
  }

  .menu button {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 8px;
    text-align: left;
  }

  .menu button span {
    flex: 1;
  }

  .menu button:hover,
  .menu button:focus-visible {
    background: var(--fg);
    color: var(--bg);
    text-shadow: none;
  }

  .menu hr {
    width: 100%;
    margin: 4px 0;
    border: 0;
    border-top: 1px solid var(--faint);
  }

  kbd {
    font: inherit;
    opacity: 0.7;
  }

  .taskbar {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 5000;
    display: flex;
    align-items: center;
    gap: 6px;
    height: var(--taskbar);
    padding: 0 6px;
    background: var(--panel);
    border-top: 1px solid var(--fg);
  }

  .start {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border: 1px solid var(--fg);
    font-weight: 600;
  }

  .start[aria-expanded='true'] {
    background: var(--fg);
    color: var(--bg);
    text-shadow: none;
  }

  .tasks {
    flex: 1;
    display: flex;
    gap: 4px;
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .task {
    flex: 0 1 150px;
    min-width: 0;
    padding: 4px 8px;
    border: 1px solid var(--faint);
    color: var(--dim);
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .task.active {
    border-color: var(--fg);
    color: var(--fg);
  }

  .tray {
    padding: 4px 8px;
    color: var(--dim);
    font-size: 12.5px;
    white-space: nowrap;
  }

  /* Keyboard and drag hints mean nothing on a touch screen or in full-screen windows. */
  @media (max-width: 720px), (max-height: 520px), (hover: none) {
    .hint {
      display: none;
    }
  }

  @media (max-width: 720px) {
    .icons {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
      align-content: start;
      gap: 8px;
      padding: 12px;
      overflow-y: auto;
    }

    .icon {
      width: 100%;
      padding: 12px 4px;
    }

    .menu {
      width: min(280px, 100vw);
    }

    .menu button {
      padding: 11px 10px;
    }

    kbd {
      display: none;
    }

    .taskbar {
      align-items: stretch;
      padding: 5px 6px calc(5px + env(safe-area-inset-bottom, 0px));
    }

    .start,
    .task,
    .tray {
      display: flex;
      align-items: center;
    }

    .task {
      flex: 0 0 auto;
      max-width: 140px;
    }
  }

  @media (max-width: 420px) {
    time.tray {
      display: none;
    }
  }
</style>
