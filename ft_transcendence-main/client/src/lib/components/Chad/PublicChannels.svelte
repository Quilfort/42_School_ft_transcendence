<script context="module">
  import { getAllPublicChannels } from "$lib/functions/channels";
  import { publicChannelStore } from "$lib/stores/channelStore";
  import { onMount } from "svelte";
  import ChannelCard from "./ChannelCard.svelte";
</script>

<script lang="ts">
  let publicChannels: any;

  onMount(async () => {
    await getAllPublicChannels();
  })

  publicChannelStore.subscribe((data: any) => {
    publicChannels = data.data;
  })

</script>

<div class="px-4">
  {#each publicChannels as channel}
    {#if channel.name[0] !== "d" && channel.name[1] !== "m" && channel.name[2] !== "_"}
      <ChannelCard channel={channel} />
    {/if}
  {/each}
</div>