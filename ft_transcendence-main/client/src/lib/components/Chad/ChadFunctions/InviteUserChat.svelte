<script lang="ts">
    import { inviteMember } from "$lib/functions/channels";
    import { Button, Heading, Input, Label, Modal } from "flowbite-svelte";
    export let channel: any;
    let modalOpen: boolean = false;
    let value: string = "";

    const handleInvite = async(channel_id: number, username: string) => {
        await inviteMember(channel_id, username);
        value = "";
    }
</script>

<Button on:click={() => modalOpen = !modalOpen} color="green">
  Invite user for channel
</Button>
<Modal title={`${channel.channel.name}`} bind:open={modalOpen} autoclose outsideclose>
  <Heading tag="h5">
    Invite a user for this channel here!
  </Heading>
  <form>
    <Label>Username</Label>
    <Input
      placeholder="username"
      type="text"
      bind:value={value}
    />
    <Button 
      on:click={() => handleInvite(channel.channel.id, value)}
      class="mt-2" 
      color="blue"
    >
        Submit
    </Button>
  </form>
</Modal>