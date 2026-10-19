<script lang="ts">
  import { fly } from 'svelte/transition';
  import { profile, skills } from '../resume';
</script>

<p class="prompt"><b>{profile.handle}@os</b>:~$ cat skills.cfg</p>

{#each skills as group, i (group.label)}
  <section in:fly|global={{ y: 8, delay: i * 60, duration: 250 }}>
    <p class="label">[{group.label}]</p>
    <ul class="tags">
      {#each group.items as item (item)}
        <li>{item}</li>
      {/each}
    </ul>
  </section>
{/each}

<style>
  section {
    margin-bottom: 16px;
  }
</style>
