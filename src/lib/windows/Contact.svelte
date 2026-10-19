<script lang="ts">
  import { fly } from 'svelte/transition';
  import { contacts, profile } from '../resume';
</script>

<p class="prompt"><b>{profile.handle}@os</b>:~$ ./contact.sh</p>

<ul>
  {#each contacts as contact, i (contact.label)}
    <li in:fly|global={{ y: 8, delay: i * 60, duration: 250 }}>
      <span class="key">{contact.label}</span>
      <a
        href={contact.href}
        target={contact.href.startsWith('http') ? '_blank' : undefined}
        rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {contact.value}
      </a>
    </li>
  {/each}
  <li in:fly|global={{ y: 8, delay: contacts.length * 60, duration: 250 }}>
    <span class="key">LOCATION</span>
    <span>{profile.location}</span>
  </li>
</ul>

<style>
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: grid;
    grid-template-columns: 96px minmax(0, 1fr);
    gap: 10px;
    padding: 7px 0;
    border-bottom: 1px dashed var(--faint);
    overflow-wrap: anywhere;
  }

  .key {
    color: var(--dim);
  }

  /* Narrow screens: label above value, so long URLs get the full width and don't break mid-word. */
  @media (max-width: 480px) {
    li {
      grid-template-columns: minmax(0, 1fr);
      gap: 0;
      padding: 9px 0;
    }

    .key {
      font-size: 12px;
    }
  }
</style>
