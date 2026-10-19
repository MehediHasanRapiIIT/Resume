<script lang="ts">
  import Boot from './lib/Boot.svelte';
  import Desktop from './lib/Desktop.svelte';
  import PrintResume from './lib/PrintResume.svelte';
  import { wm } from './lib/wm.svelte';

  let booted = $state(false);

  function reboot() {
    wm.closeAll();
    booted = false;
  }
</script>

<main class="crt">
  {#if booted}
    <Desktop onreboot={reboot} />
  {:else}
    <Boot ondone={() => (booted = true)} />
  {/if}
</main>
<div class="crt-overlay" aria-hidden="true"></div>

<PrintResume />
