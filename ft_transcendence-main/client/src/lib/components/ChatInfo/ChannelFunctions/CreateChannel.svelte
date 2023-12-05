<script context="module">
    import { createChannel } from "$lib/functions/channels";
    import { Button, Input, Label } from "flowbite-svelte";
</script>

<script lang="ts">
  let channel_name: string = "";

  const handleSubmit = async (channel_name: string) => {
	const res = await createChannel(channel_name);
	if (res == true)
		alert("channel has been created!");
	else
		alert(`failure creating channel: ${res['error']}`);
  }
</script>

<div>
  <h2 class="text-black text-2xl mb-5 border-b-2">Create your own channel here!</h2>
  <form>
	<div>
	  <Label>Channel name</Label>
	  <Input bind:value={channel_name} type="text" placeholder="channel name" required />
	</div>
	<div class="mt-4">
	  <Button color="blue" on:click={() => handleSubmit(channel_name)}>
		Submit
	  </Button>
	</div>
  </form>
</div>