<script lang="ts">
  import { fly } from 'svelte/transition';
  import { education, profile } from '../resume';
</script>

<p class="prompt"><b>{profile.handle}@os</b>:~$ cat education.dat</p>

<article in:fly|global={{ y: 8, duration: 250 }}>
  <h2 class="h2">{education.degree}</h2>
  <p class="meta">{education.school}</p>
  <p class="meta">{education.period} · {education.result}</p>
</article>

{#if education.earlier.length > 0}
  <p class="label earlier" in:fly|global={{ y: 8, delay: 60, duration: 250 }}>Earlier</p>
  <ol>
    {#each education.earlier as item, i (item.degree)}
      <li in:fly|global={{ y: 8, delay: 120 + i * 60, duration: 250 }}>
        <span class="year">{item.period}</span>
        <span>
          <strong>{item.degree}</strong> · {item.school}
          <span class="result">{item.result}</span>
        </span>
      </li>
    {/each}
  </ol>
{/if}

<style>
  .earlier {
    margin-top: 22px;
  }

  ol {
    margin: 0;
    padding: 0;
    list-style: none;
    border-left: 1px solid var(--faint);
  }

  li {
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr);
    gap: 10px;
    padding: 4px 0 8px 12px;
  }

  .year,
  .result {
    color: var(--dim);
  }

  .result {
    display: block;
  }

  strong {
    font-weight: 600;
  }
</style>
