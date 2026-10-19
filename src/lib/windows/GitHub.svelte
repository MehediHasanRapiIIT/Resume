<script lang="ts">
  import { fly } from 'svelte/transition';
  import { formatMonth, github, relativeTime } from '../github.svelte';
  import { profile } from '../resume';

  type Sort = 'recent' | 'name' | 'oldest';

  let tab = $state<'repos' | 'activity'>('repos');
  let query = $state('');
  let language = $state('all');
  let sort = $state<Sort>('recent');

  /** Longest bar in the language chart, in characters. */
  const BAR_WIDTH = 18;

  $effect(() => {
    void github.load();
  });

  $effect(() => {
    if (tab === 'activity') void github.loadActivity();
  });

  // filter() returns a new array, so sorting it in place never touches github.repos.
  const shown = $derived.by(() => {
    const q = query.trim().toLowerCase();
    const list = github.repos.filter(
      (r) =>
        (language === 'all' || (r.language ?? 'Other') === language) &&
        (!q || r.name.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)),
    );
    if (sort === 'name') return list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'oldest') return list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return list.sort((a, b) => b.pushedAt.localeCompare(a.pushedAt));
  });

  const topLanguages = $derived(github.languages.slice(0, 8));
  const maxCount = $derived(topLanguages[0]?.count ?? 1);

  function pickLanguage(name: string) {
    language = language === name ? 'all' : name;
  }
</script>

<p class="prompt"><b>{profile.handle}@os</b>:~$ ls github.dir</p>

<div class="tabs" role="group" aria-label="View" in:fly|global={{ y: 8, duration: 250 }}>
  <button aria-pressed={tab === 'repos'} onclick={() => (tab = 'repos')}>Repositories</button>
  <button aria-pressed={tab === 'activity'} onclick={() => (tab = 'activity')}>Activity</button>
  <a class="profile" href="https://github.com/{profile.github}" target="_blank" rel="noopener noreferrer">
    github.com/{profile.github} ↗
  </a>
</div>

{#if github.status === 'loading' || github.status === 'idle'}
  <p class="note">Fetching from GitHub…</p>
{:else if github.status === 'error'}
  <p class="note">
    GitHub can't be reached right now (offline or rate-limited). The repositories are still at
    <a href="https://github.com/{profile.github}" target="_blank" rel="noopener noreferrer">github.com/{profile.github}</a>.
  </p>
{:else if tab === 'repos'}
  <section in:fly|global={{ y: 8, delay: 60, duration: 250 }}>
    <p class="label">Languages · {github.repoCount} public repositories</p>
    <ul class="langs">
      {#each topLanguages as lang (lang.name)}
        <li>
          <button aria-pressed={language === lang.name} onclick={() => pickLanguage(lang.name)}>
            <span class="lang-name">{lang.name}</span>
            <span class="bar" aria-hidden="true">{'█'.repeat(Math.max(1, Math.round((lang.count / maxCount) * BAR_WIDTH)))}</span>
            <span class="lang-count">{lang.count}</span>
          </button>
        </li>
      {/each}
    </ul>
  </section>

  <div class="filters" in:fly|global={{ y: 8, delay: 120, duration: 250 }}>
    <label class="sr-only" for="repo-search">Search repositories</label>
    <input id="repo-search" class="field grow" type="search" placeholder="Search repositories" bind:value={query} />
    <label class="sr-only" for="repo-language">Language</label>
    <select id="repo-language" class="field" bind:value={language}>
      <option value="all">All languages</option>
      {#each github.languages as lang (lang.name)}
        <option value={lang.name}>{lang.name} ({lang.count})</option>
      {/each}
    </select>
    <label class="sr-only" for="repo-sort">Sort</label>
    <select id="repo-sort" class="field" bind:value={sort}>
      <option value="recent">Recently updated</option>
      <option value="name">Name</option>
      <option value="oldest">Oldest first</option>
    </select>
  </div>

  <p class="meta count">Showing {shown.length} of {github.repos.length}</p>
  <ul class="repos">
    {#each shown as repo (repo.name)}
      <li>
        <div class="repo-head">
          <a href={repo.url} target="_blank" rel="noopener noreferrer">{repo.name}</a>
          {#if repo.homepage}
            <a class="live" href={repo.homepage} target="_blank" rel="noopener noreferrer">live ↗</a>
          {/if}
        </div>
        {#if repo.description}<p class="desc">{repo.description}</p>{/if}
        <p class="meta">
          {[repo.language, repo.stars > 0 ? `★ ${repo.stars}` : '', `updated ${formatMonth(repo.pushedAt)}`]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </li>
    {:else}
      <li class="meta">No repositories match.</li>
    {/each}
  </ul>
{:else if github.activityStatus === 'ready'}
  <ol class="activity" in:fly|global={{ y: 8, delay: 60, duration: 250 }}>
    {#each github.activity as item (item.key)}
      <li>
        <span class="when">{relativeTime(item.at)}</span>
        <span>
          {item.label.replace(item.repo, '')}<a href={item.repoUrl} target="_blank" rel="noopener noreferrer">{item.repo}</a>
          {#if item.detail}<small>({item.detail})</small>{/if}
        </span>
      </li>
    {:else}
      <li class="meta">No public activity in the last 90 days.</li>
    {/each}
  </ol>
  <p class="meta">Public events from the last 90 days, newest first.</p>
{:else if github.activityStatus === 'error'}
  <p class="note">GitHub activity can't be loaded right now.</p>
{:else}
  <p class="note">Fetching recent activity…</p>
{/if}

<style>
  .tabs {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--faint);
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

  .profile {
    margin-left: auto;
    font-size: 12.5px;
    overflow-wrap: anywhere;
  }

  .note {
    color: var(--dim);
  }

  .langs {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 2px 18px;
    margin: 0 0 14px;
    padding: 0;
    list-style: none;
  }

  .langs button {
    display: grid;
    grid-template-columns: 110px minmax(0, 1fr) 28px;
    gap: 8px;
    width: 100%;
    padding: 2px 4px;
    text-align: left;
    border: 1px solid transparent;
  }

  .langs button:hover,
  .langs button[aria-pressed='true'] {
    border-color: var(--faint);
  }

  .lang-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .bar {
    overflow: hidden;
    white-space: nowrap;
    letter-spacing: -1px;
  }

  .lang-count {
    color: var(--dim);
    text-align: right;
  }

  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .grow {
    flex: 1 1 180px;
  }

  .filters select {
    flex: 1 1 140px;
  }

  .count {
    margin: 8px 0 4px;
  }

  .repos,
  .activity {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .repos li {
    padding: 8px 0;
    border-bottom: 1px dashed var(--faint);
  }

  .repo-head {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 12px;
    overflow-wrap: anywhere;
  }

  .live {
    font-size: 12.5px;
  }

  .desc {
    margin: 2px 0 0;
  }

  .repos .meta {
    margin: 2px 0 0;
    font-size: 12.5px;
  }

  .activity li {
    display: grid;
    grid-template-columns: 96px minmax(0, 1fr);
    gap: 10px;
    padding: 6px 0;
    border-bottom: 1px dashed var(--faint);
    overflow-wrap: anywhere;
  }

  .when,
  small {
    color: var(--dim);
  }

  small {
    margin-left: 6px;
    font-size: 12px;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  @media (max-width: 720px) {
    .tabs button {
      padding: 8px 12px;
    }

    .profile {
      margin-left: 0;
      flex-basis: 100%;
    }

    .langs {
      grid-template-columns: minmax(0, 1fr);
    }

    .langs button {
      grid-template-columns: 96px minmax(0, 1fr) 28px;
      padding: 5px 4px;
    }

    .activity li {
      grid-template-columns: minmax(0, 1fr);
      gap: 0;
    }
  }
</style>
