<script lang="ts">
  import { icons, type IconName } from './icons';

  let { name, size = 16 }: { name: IconName; size?: number } = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 16 16"
  fill="none"
  stroke="currentColor"
  stroke-width="1.2"
  stroke-linejoin="round"
  stroke-linecap="round"
  aria-hidden="true"
>
  <path d={icons[name]} />
</svg>
