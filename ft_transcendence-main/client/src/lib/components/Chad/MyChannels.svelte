<script lang="ts">
  import { channelStore } from "$lib/stores/channelStore";
  import ChannelCard from "./ChannelCard.svelte";

  let myChannels: any;

  channelStore.subscribe(($data) => {
    myChannels = $data.data
  })
</script>

<div class="px-4">
  <div class="flex justify-between">
    <h2 class="font-bold text-center text-2xl">My Channels</h2>
  </div>
  <div class="flex justify-between flex-wrap">
    {#if myChannels && !myChannels.loading}
      {#each myChannels as channel}
        <ChannelCard channel={channel.channel} />
      {/each}
    {/if}
  </div>
</div>