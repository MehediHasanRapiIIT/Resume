<script lang="ts">
  import { fly } from 'svelte/transition';
  import BstVisualizer from '../lab/BstVisualizer.svelte';
  import Connect4 from '../lab/Connect4.svelte';
  import { profile } from '../resume';

  const demos = [
    {
      id: 'connect4',
      label: 'Connect-4',
      component: Connect4,
      repo: 'https://github.com/MehediHasanRapiIIT/Connect-4',
      blurb:
        'Browser port of my JavaFX Connect-4. The computer plays with Minimax and alpha-beta pruning, running in a Web Worker.',
    },
    {
      id: 'bst',
      label: 'BST Visualizer',
      component: BstVisualizer,
      repo: 'https://github.com/MehediHasanRapiIIT/BinarySearchTreeVisualizer',
      blurb: 'Browser version of my Java BST visualizer: insert, delete, search and traverse step by step.',
    },
  ];

  let selected = $state(0);
  const demo = $derived(demos[selected]);
</script>

<p class="prompt"><b>{profile.handle}@os</b>:~$ ls lab.dir</p>

<div class="tabs" role="group" aria-label="Demos" in:fly|global={{ y: 8, duration: 250 }}>
  {#each demos as item, i (item.id)}
    <button aria-pressed={selected === i} onclick={() => (selected = i)}>{item.label}</button>
  {/each}
</div>

{#key selected}
  <div in:fly|global={{ y: 8, delay: 80, duration: 250 }}>
    <p class="blurb">
      {demo.blurb}
      <a href={demo.repo} target="_blank" rel="noopener noreferrer">Source ↗</a>
    </p>
    <demo.component />
  </div>
{/key}

<style>
  .tabs {
    display: flex;
    gap: 6px;
    margin-bottom: 10px;
    border-bottom: 1px solid var(--faint);
    padding-bottom: 10px;
  }

  .tabs button {
    padding: 4px 12px;
    border: 1px solid var(--faint);
  }

  .tabs button[aria-pressed='true'] {
    background: var(--fg);
    color: var(--bg);
    text-shadow: none;
  }

  .blurb {
    margin: 0 0 12px;
    color: var(--dim);
  }

  @media (max-width: 720px) {
    .tabs button {
      padding: 8px 12px;
    }
  }
</style>
