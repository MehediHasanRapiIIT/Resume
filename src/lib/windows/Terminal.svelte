<script lang="ts">
  import { tick } from 'svelte';
  import { fly } from 'svelte/transition';
  import { downloadResume } from '../download';
  import { profile } from '../resume';
  import { run } from '../terminal';
  import { wm } from '../wm.svelte';

  interface Line {
    id: number;
    kind: 'in' | 'out';
    text: string;
  }

  /** Old output is dropped past this, so a long session never slows scrolling. */
  const MAX_LINES = 300;
  /** One-tap commands, mainly for phones where typing is slow. */
  const quick = ['help', 'neofetch', 'projects', 'github', 'play', 'contact'];

  let nextId = 0;
  let lines = $state<Line[]>([
    {
      id: nextId++,
      kind: 'out',
      text: `${profile.handle.toUpperCase()}-OS terminal. Type 'help' for commands.`,
    },
  ]);
  let value = $state('');
  let input = $state<HTMLInputElement>();
  let screen = $state<HTMLElement>();

  const history: string[] = [];
  let cursor = 0;

  async function submit(raw: string) {
    const text = raw.trim();
    value = '';
    if (!text) return;

    history.push(text);
    cursor = history.length;

    // About 52 characters fit side by side; below that, neofetch stacks its output.
    const result = run(text, wm.catalog, { narrow: (screen?.clientWidth ?? 600) < 470 });
    if (result.clear) {
      lines = [];
    } else {
      lines.push({ id: nextId++, kind: 'in', text });
      for (const out of result.lines) lines.push({ id: nextId++, kind: 'out', text: out });
      if (lines.length > MAX_LINES) lines.splice(0, lines.length - MAX_LINES);
    }

    if (result.open) wm.open(result.open);
    if (result.download) void downloadResume();

    await tick();
    screen?.scrollTo({ top: screen.scrollHeight });
  }

  function onKey(e: KeyboardEvent) {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    cursor = Math.min(Math.max(cursor + (e.key === 'ArrowUp' ? -1 : 1), 0), history.length);
    value = history[cursor] ?? '';
  }

  /** Clicking anywhere on the screen focuses the prompt, unless the visitor is selecting text. */
  function focusOnClick(node: HTMLElement) {
    const focus = () => {
      if (!window.getSelection()?.toString()) input?.focus({ preventScroll: true });
    };
    node.addEventListener('click', focus);
    return { destroy: () => node.removeEventListener('click', focus) };
  }

  $effect(() => {
    // Ready to type on open, but not on touch devices: that would pop the keyboard up unasked.
    if (!window.matchMedia('(hover: none)').matches) input?.focus({ preventScroll: true });
  });
</script>

<div class="term">
  <p class="prompt"><b>{profile.handle}@os</b>:~$ ./terminal.exe</p>

  <div class="screen" bind:this={screen} use:focusOnClick aria-live="polite">
    {#each lines as line (line.id)}
      <p class={line.kind}>{line.text}</p>
    {/each}
  </div>

  <ul class="quick">
    {#each quick as command, i (command)}
      <li in:fly|global={{ y: 8, delay: i * 40, duration: 250 }}>
        <button onclick={() => submit(command)}>{command}</button>
      </li>
    {/each}
  </ul>

  <form
    onsubmit={(e) => {
      e.preventDefault();
      void submit(value);
    }}
  >
    <label for="terminal-input">{profile.handle}@os:~$</label>
    <input
      id="terminal-input"
      bind:this={input}
      bind:value
      onkeydown={onKey}
      autocomplete="off"
      autocapitalize="off"
      autocorrect="off"
      spellcheck="false"
      enterkeyhint="go"
    />
  </form>
</div>

<style>
  .term {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }

  .prompt {
    margin-bottom: 8px;
  }

  .screen {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    cursor: text;
  }

  .screen p {
    margin: 0;
    min-height: 1.55em;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .in {
    margin-top: 8px;
    color: var(--dim);
  }

  .in::before {
    content: '$ ';
  }

  .quick {
    display: flex;
    gap: 6px;
    margin: 10px 0 8px;
    padding: 0;
    list-style: none;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .quick li {
    flex: 0 0 auto;
  }

  .quick button {
    padding: 3px 10px;
    border: 1px solid var(--faint);
  }

  .quick button:hover {
    border-color: var(--fg);
  }

  form {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--faint);
  }

  label {
    color: var(--dim);
    white-space: nowrap;
  }

  input {
    flex: 1;
    min-width: 0;
    padding: 2px 0;
    font: inherit;
    color: inherit;
    text-shadow: inherit;
    background: none;
    border: 0;
    outline: none;
    caret-color: var(--fg);
  }

  @media (max-width: 720px) {
    .quick button {
      padding: 8px 12px;
    }

    /* iOS zooms the page when a focused input is under 16px. */
    input {
      font-size: 16px;
    }
  }
</style>
