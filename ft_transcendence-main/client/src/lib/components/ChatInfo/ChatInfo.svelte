<script context="module">
  import { channelStore } from "$lib/stores/channelStore";
  import SetPassword from "./ChannelFunctions/SetPassword.svelte";
  import RemovePassword from "./ChannelFunctions/RemovePassword.svelte";
</script>

<script lang="ts">
  let channels: any;

  channelStore.subscribe((data) => {
    channels = data.data;
  })

  // function checkIfUserIsMod(channel_id: number) {
  //   return isUserModerator(channel_id);
  // }
</script>

<div class="text-black">
  <h2 class="text-2xl mb-4 border-b">Channel Info</h2>
  {#each channels as myChannels}
  <div class="flex flex-wrap bg-gray-500 text-white p-4 rounded-lg mb-4">
    <div class="w-1/2">
      <h3 class="text-xl font-bold">Channel Name:</h3>
      <p class="mb-3">{myChannels.channel.name}</p>
    </div>
    <div class="w-1/2">
      <h3 class="text-xl font-bold">Channel Role</h3>
      <p>{myChannels.role}</p>
    </div>
    {#if myChannels.channel.password == null && myChannels.role == "OWNER"}
        <div class="w-1/2">
          <p class="mt-4 text-red-700">No password set for this channel</p>
          <SetPassword channelId={myChannels.channel.id} />
        </div>
    {/if}
    {#if myChannels.channel.password != null && myChannels.role == "OWNER"}
        <div class="w-1/2">
          <p class="mt-4 text-green-700">password is set for this channel</p>
          <RemovePassword channelId={myChannels.channel.id} />
        </div>
      {/if}
      <!-- <div class="w/1/2">
        <DeleteChannel channelId={myChannels.channel.id} />
      </div> -->
    </div>
  {/each}
</div>