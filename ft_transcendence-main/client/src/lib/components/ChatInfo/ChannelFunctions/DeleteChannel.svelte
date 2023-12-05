<script context="module">
  import { deleteChannel } from "$lib/functions/channels";
  import { Button, ButtonGroup, Modal } from "flowbite-svelte";
</script>

<script lang="ts">
  export let channelId: number;
  let setModalOpen: boolean = false;
</script>

<div>
  <Button color="red" on:click={() => setModalOpen = true}>
	Delete Channel
  </Button>

  <Modal title="Delete Channel" bind:open={setModalOpen} autoclose outsideclose>
	<h2 class="tex-2xl text-black">
	  Are you sure you want to delete the channel?
	</h2>
	<ButtonGroup>
	  <Button color="red" on:click={() => deleteChannel(channelId)}>
		Yes, delete the channel!
	  </Button>
	  <Button outline color="dark" on:click={() => setModalOpen = false }>
		Nevermind
	  </Button>
	</ButtonGroup>
  </Modal>
</div>