<script lang="ts">
  import { fly } from 'svelte/transition';
  import { downloadResume } from '../download';
  import { github } from '../github.svelte';
  import { education, experience, profile, projects } from '../resume';
  import { wm } from '../wm.svelte';

  const current = experience[0];
</script>

<p class="prompt"><b>{profile.handle}@os</b>:~$ cat about.txt</p>

<h1 class="h1" in:fly|global={{ y: 8, duration: 250 }}>{profile.name}</h1>
<p class="meta" in:fly|global={{ y: 8, delay: 60, duration: 250 }}>
  {profile.title} · {profile.location}
</p>

<p class="tagline" in:fly|global={{ y: 8, delay: 120, duration: 250 }}>{profile.tagline}</p>

<dl in:fly|global={{ y: 8, delay: 180, duration: 250 }}>
  <dt>NOW</dt>
  <dd>{current.role}, {current.company}</dd>
  <dt>SINCE</dt>
  <dd>{current.period}</dd>
  <dt>STACK</dt>
  <dd>{profile.stack.join(' · ')}</dd>
  <dt>PROJECTS</dt>
  <dd>{projects.length} built, {projects[0].name} the largest</dd>
  <dt>DEGREE</dt>
  <dd>{education.degree}, {education.school}</dd>
  {#if github.status === 'ready'}
    <dt>GITHUB</dt>
    <dd>{github.repoCount} public repositories</dd>
  {/if}
</dl>

<div class="actions" in:fly|global={{ y: 8, delay: 240, duration: 250 }}>
  <button onclick={downloadResume}>[ Download resume ]</button>
  <button onclick={() => wm.open('projects')}>[ View projects ]</button>
  <button onclick={() => wm.open('contact')}>[ Contact ]</button>
</div>

<style>
  .tagline {
    margin: 16px 0;
    max-width: 56ch;
  }

  dl {
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
    gap: 5px 14px;
    margin: 0 0 18px;
  }

  dt {
    color: var(--dim);
  }

  dd {
    margin: 0;
    overflow-wrap: anywhere;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
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
    .actions button {
      padding: 9px 8px;
    }
  }
</style>
