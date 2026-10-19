<script lang="ts">
  import { fly } from 'svelte/transition';
  import { experience, profile } from '../resume';

  let selected = $state(0);
  const job = $derived(experience[selected]);
</script>

<p class="prompt"><b>{profile.handle}@os</b>:~$ tail experience.log</p>

<div class="md">
  <ul class="md-list">
    {#each experience as item, i (item.company)}
      <li in:fly|global={{ x: -8, delay: i * 60, duration: 250 }}>
        <button aria-current={selected === i} onclick={() => (selected = i)}>
          {item.company}
          <small>{item.period}</small>
        </button>
      </li>
    {/each}
  </ul>

  {#key selected}
    <article in:fly|global={{ y: 8, delay: 120, duration: 250 }}>
      <h2 class="h2">{job.role}</h2>
      <p class="meta">{job.company} · {job.period}</p>
      <ul class="bullets">
        {#each job.bullets as bullet (bullet)}
          <li>{bullet}</li>
        {/each}
      </ul>
      <p class="label stack">Stack</p>
      <ul class="tags">
        {#each job.tech as tech (tech)}
          <li>{tech}</li>
        {/each}
      </ul>
    </article>
  {/key}
</div>

<style>
  .stack {
    margin-top: 16px;
  }
</style>
