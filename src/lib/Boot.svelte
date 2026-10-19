<script lang="ts">
  import { fade } from 'svelte/transition';

  let { ondone }: { ondone: () => void } = $props();

  const lines = [
    'HASAN BIOS v1.0 (C) 2026',
    'CPU: Java 21 / Spring Boot / Angular',
    'Memory test ........ 640K OK',
    'Detecting drives ... experience.log projects.dir skills.cfg',
    'Mounting /home/mehedi ... OK',
    'Loading MEHEDI-OS kernel ...',
    'Starting window manager ... OK',
  ];

  let shown = $state(0);
  let finished = false;

  function finish() {
    if (finished) return;
    finished = true;
    ondone();
  }

  $effect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = setInterval(
      () => {
        shown += 1;
        if (shown > lines.length) {
          clearInterval(timer);
          finish();
        }
      },
      reduced ? 40 : 260,
    );
    return () => clearInterval(timer);
  });
</script>

<svelte:window onkeydown={finish} onpointerdown={finish} />

<div class="boot" out:fade={{ duration: 150 }}>
  {#each lines.slice(0, shown) as line (line)}
    <p>{line}</p>
  {/each}
  <p class="cursor" aria-hidden="true">_</p>
  <p class="skip">Press any key or tap to skip</p>
</div>

<style>
  .boot {
    position: absolute;
    inset: 0;
    padding: clamp(16px, 5vw, 32px);
    font-family: var(--display);
    font-size: clamp(17px, 4.6vw, 22px);
    line-height: 1.3;
  }

  p {
    margin: 0;
    overflow-wrap: anywhere;
  }

  .cursor {
    animation: blink 1s steps(1) infinite;
  }

  .skip {
    position: absolute;
    left: clamp(16px, 5vw, 32px);
    bottom: calc(24px + env(safe-area-inset-bottom, 0px));
    color: var(--dim);
    font-family: var(--font);
    font-size: 13px;
  }

  @keyframes blink {
    50% {
      opacity: 0;
    }
  }
</style>
