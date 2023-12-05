<script context="module">
    import { setChannelPassword } from "$lib/functions/channels";
    import { Button } from "flowbite-svelte";
</script>

<script lang="ts">
	export let channelId: number;
</script>

<div>
  <Button color="red" on:click={() => setChannelPassword(channelId, null)}>
	  Remove channel password
  </Button>
</div>