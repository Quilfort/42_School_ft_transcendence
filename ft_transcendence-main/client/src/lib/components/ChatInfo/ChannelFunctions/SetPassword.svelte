<script context="module">
    import { setChannelPassword } from "$lib/functions/channels";
    import { Button, Input } from "flowbite-svelte";
</script>

<script lang="ts">
    import { Modal } from "flowbite-svelte";

	let modalOpen: boolean = false;
	let	password: string = "";
	export let channelId: number;

	const handleSubmit = (password: string) => {
		setChannelPassword(channelId, password);
	}
</script>


<div>
  <Button color="green" on:click={() => modalOpen = true}>
	Set password for channel
  </Button>
  <Modal title="Set channel password" bind:open={modalOpen} autoclose outsideclose>
	<Input type="password" bind:value={password} placeholder="•••••••••" required />
	<Button color="blue" on:click={() => handleSubmit(password)}>
	  Submit
	</Button>
  </Modal>
</div>