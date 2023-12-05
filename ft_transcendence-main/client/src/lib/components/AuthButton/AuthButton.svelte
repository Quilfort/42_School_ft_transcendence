<script context="module" lang="ts">
    import { Button, Modal } from 'flowbite-svelte';
    import { onMount } from 'svelte';
    import { handleLogin, handleLogout, sendAuthMessage, verifyTfa } from '$lib/functions/auth';
    import { userStore } from '$lib/stores/userStore';
    import { getSocket } from '$lib/functions/sockets';
</script>

<script lang="ts">
let popupModal: boolean = false;
let isUserLoggedIn: boolean = false
export let authCode: string | null;

  onMount(() => {
	const savedToken = localStorage.getItem("jwt_token");
	console.log("TOKEN", savedToken);
	let socket: any;

	if (savedToken == null)
	{
		if (authCode == null)
		{
			handleLogin();
			return;
		}
		// authCode is present, so get me
		socket = getSocket();

		socket.emit('authenticateUser', authCode, (res: any) => {
			if (JSON.stringify(res).toLowerCase().includes("2fa token"))
			{
				verifyTfa(socket);
				return;
			} else if (JSON.stringify(res).toLowerCase().includes("unauthorized")) {
				handleLogin();
			} else {
				localStorage.setItem('jwt_token', res['token']);
				localStorage.setItem('user', JSON.stringify(res['user']));
				localStorage.setItem('messageSend', "send");

				userStore.set({user: res['user'], loading: false});
				sendAuthMessage('welcome', null);
			}
		})
		isUserLoggedIn = true;
	} else {
		isUserLoggedIn = true;
	}
})

</script>

<div>
  {#if isUserLoggedIn}
    <Button on:click={() => (popupModal = true)}>Logout</Button>
    <Modal bind:open={popupModal} size="xs" autoclose>
      <div class="text-center">
        <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to log out?</h3>
        <Button on:click={() => handleLogout(isUserLoggedIn = false)} color="red" class="mr-2" href="/">Yes, I'm sure</Button>
        <Button on:click={() => popupModal = false} color="alternative" href="/lobby">No, keep playing</Button>
      </div>
    </Modal>
  {:else}
    <Button color="blue" on:click={handleLogin}>Login</Button>
  {/if}
</div>
