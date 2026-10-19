<script lang="ts">
  import { fly } from 'svelte/transition';
  import { formatMonth, github } from '../github.svelte';
  import { moreProjects, profile, projects } from '../resume';

  const all = [...projects, ...moreProjects];

  let selected = $state(0);
  const project = $derived(all[selected]);
  const repo = $derived(github.repoFor(project.href));
</script>

<p class="prompt"><b>{profile.handle}@os</b>:~$ ls projects.dir</p>

<div class="md">
  <ul class="md-list">
    {#each all as item, i (item.name)}
      {#if i === 0 || i === projects.length}
        <li class="group">{i === 0 ? 'Featured' : 'More'}</li>
      {/if}
      <li in:fly|global={{ x: -8, delay: Math.min(i, 8) * 50, duration: 250 }}>
        <button aria-current={selected === i} onclick={() => (selected = i)}>{item.name}</button>
      </li>
    {/each}
  </ul>

  {#key selected}
    <article in:fly|global={{ y: 8, delay: 120, duration: 250 }}>
      <h2 class="h2">{project.name}</h2>
      <p class="meta">
        <a href={project.href} target="_blank" rel="noopener noreferrer">
          {project.href.replace('https://', '')}
        </a>
      </p>
      {#if repo}
        <!-- A zero star count adds nothing, so it is left out. -->
        <p class="meta live">
          {[
            repo.stars > 0 ? `★ ${repo.stars}` : '',
            repo.language ?? '',
            `updated ${formatMonth(repo.pushedAt)}`,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      {/if}

      {#if project.stats}
        <ul class="stats">
          {#each project.stats as stat (stat.label)}
            <li>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </li>
          {/each}
        </ul>
      {/if}

      <ul class="bullets">
        {#each project.bullets as bullet (bullet)}
          <li>{bullet}</li>
        {/each}
      </ul>
      <p class="label stack">Technologies</p>
      <ul class="tags">
        {#each project.tech as tech (tech)}
          <li>{tech}</li>
        {/each}
      </ul>
    </article>
  {/key}
</div>

<style>
  .group {
    padding: 8px 8px 2px;
    color: var(--dim);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .group:first-child {
    padding-top: 0;
  }

  .meta {
    overflow-wrap: anywhere;
  }

  .live {
    font-size: 12.5px;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
    gap: 6px;
    margin: 14px 0 4px;
    padding: 0;
    list-style: none;
  }

  .stats li {
    padding: 6px 8px;
    border: 1px solid var(--faint);
    background: rgba(53, 255, 110, 0.05);
  }

  .stats strong {
    display: block;
    font-family: var(--display);
    font-size: 30px;
    font-weight: 400;
    line-height: 1;
  }

  .stats span {
    color: var(--dim);
    font-size: 12px;
  }

  .stack {
    margin-top: 16px;
  }

  /* In the phone's swipeable tab row the group names sit inline between the tabs. */
  @media (max-width: 720px) {
    .group,
    .group:first-child {
      display: flex;
      align-items: center;
      padding: 0 2px 0 6px;
    }
  }
</style>
