<script lang="ts">
  import { getMyChannelById, joinChannel } from "$lib/functions/channels";
  import { channelStore } from "$lib/stores/channelStore";
  import { Button } from "flowbite-svelte";
  import { onMount } from "svelte";
  import JoinChannelWithPassword from "./ChadFunctions/JoinChannelWithPassword.svelte";
  import { getSocket } from "$lib/functions/sockets";

  export let channel: any;

  let myChannels: any;
  let joinedChannel: boolean;
  const socket = getSocket();

  channelStore.subscribe((data) =>{
    myChannels = data.data
  })
  
  onMount(() => {
    myChannels.forEach((mChannel: any) => {
      if (mChannel.channel.id === channel.id) {
        joinedChannel = true;
      }
    });

    socket.on("join", () => {});
  });

  const handleClick = async(channel_id: number) => {
    await getMyChannelById(channel_id);
  }

  const handleJoin = async(channel_id: number, channel_name: string, password: string | null) => {
    const res = await joinChannel(channel_id, channel_name, password);
    if (res)
      joinedChannel = true;
    else
      alert('there was an error joining this channel, you are probably banned');
  }

</script>

<div class="flex justify-between items-center bg-gray-400 rounded-md px-4 py-2 mt-4 w-full">
  <div>
    <figure class="relative overflow-hidden h-[40px] w-[40px] rounded-full animate-spin">
      <img src="/images/Dababy_BabyOnBaby.png" alt="channel" />
    </figure>
  </div>
  <div class="relative overflow-hidden w-1/2">
    <h2 class="ml-5 text-2xl truncate">{channel.name}</h2>
  </div>
  <div>
    {#if joinedChannel === true}
      <Button size="xs" on:click={() => handleClick(channel.id)} color="green">
        View messages
      </Button>
    {:else if channel.password !== null && !joinedChannel}
      <JoinChannelWithPassword channel={channel} joinedChannel={joinedChannel} />
    {:else}
      <Button size="xs" color="blue" on:click={() => handleJoin(channel.id, channel.name, null)}>
        Join Channel
      </Button>  
    {/if}
  </div>
</div>