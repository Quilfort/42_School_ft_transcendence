<script lang="ts">
  import { getMyChannelById, joinChannel } from "$lib/functions/channels";
  import { Button, Input, Label, Modal } from "flowbite-svelte";
  
  export let channel: any;
  export let joinedChannel: boolean;
  let value: string;
  let modalOpen: boolean = false;

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

{#if joinedChannel}
<Button size="xs" on:click={() => handleClick(channel.id)} color="green">
  View messages
</Button>
{:else}
<Button size="xs" color="red" on:click={() => modalOpen = !modalOpen}>
  Join Channel
</Button>
<Modal title={`Password for ${channel.name}`} bind:open={modalOpen} autoclose outsideclose>
  <form>
    <Label>Password</Label>
    <Input
      placeholder="...."
      type="password"
      bind:value={value}
    />
    <Button 
      on:click={() => handleJoin(channel.id, channel.name, value)}
      class="mt-2" 
      color="blue"
    >
      Submit
    </Button>
  </form>
</Modal>
{/if}