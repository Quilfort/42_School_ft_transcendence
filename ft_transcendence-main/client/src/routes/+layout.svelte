<script context="module" lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { Spinner } from "flowbite-svelte";
  import { fetchToken, getToken } from "$lib/stores/token";
  import { getSocket } from "$lib/functions/sockets";
  import type { Socket } from "socket.io-client";
  import { userStore } from "$lib/stores/userStore";
  import { goto } from "$app/navigation";
  import { gameField, gamePlayers, gameScore, gameState } from "$lib/stores/game";
  import Sidebar from "$lib/components/Sidebar/Sidebar.svelte";
  import Chad from '$lib/components/Chad/Chat.svelte';
  import "../app.postcss";
    import { handleLogin } from "$lib/functions/auth";
  import { blockUser, getBlockedUsers, unblockUser} from "$lib/functions/user";
</script>

<script lang="ts">
  let authCode: string | null = $page.url.searchParams.get("code");
  let authUser: any;
  let socket: Socket;
  let interval: any;
  let loading: boolean = false;
  const searchParams = new URLSearchParams(window.location.search);
  
  function removeQueryParam(paramName: string) {
    searchParams.delete(paramName);
    const newURL = `${window.location.pathname}`;
    history.pushState({}, '', newURL);
  }
  /**
   * Inside the onMount callback, you can now await fetchToken() to ensure that the token is retrieved before proceeding with any other code that depends on it.
   * This should ensure that the token is available before running other functions and that any errors during token retrieval or other operations are properly handled. 
   * Make sure to also check for any additional asynchronous operations
   */
  onMount(async () => {
    await fetchToken();
    socket = getSocket();

    clearInterval(interval);
    interval = setInterval(() => {
      let location = window.location.href.split(':5173')[1];
      if (location.includes('code') || location == '/')
        location = 'home';
      socket.emit('setStatus', {status: `@ ${location}`});
    }, 5000);

    if (authCode !== null) {
      removeQueryParam('code');
    }

	socket.on('exception', (res: any) => {
		if (res['message'] == "user does not exist" || res['message'].includes('malformed')) {
			localStorage.clear();
			handleLogin();
		}
	})

    socket.on('openGameView', (res: any) => {
      gameField.set({ data: res.field, loading: false });
      gameState.set({ data: res.game, loading: false });
      gamePlayers.set({ data: res.players, loading: false });
      gameScore.set({ data: res.score, loading: false });

      goto(`/game-test`)
    });

    getBlockedUsers();
  });
  
  // Subscribe to userStore
  userStore.subscribe(($data) => {
    authUser = $data.user;
    loading = $data.loading;
  });


</script>

<div class="bg-gray-900 h-screen">  
  <div class="h-full">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-8 gap-3 h-full">
      <div class="sidebar xl:col-span-1 order-1">
        <Sidebar authCode={authCode} test={authUser} />
      </div>
      {#if authUser && !loading}
        <div class="pong-game order-3 lg:order-2 xl:col-span-5">
          <slot />
        </div>
      {:else if !authUser && loading}
        <div class="pong-game order-3 lg:order-2 xl:col-span-5">
          <div class="text-center">
            <div>
              <p>Hold on tight, your data is loading!</p>
            </div>
            <div class="mt-4">
              <Spinner color="gray" />
            </div>
          </div>
        </div>
      {:else}
        <div class="pong-game order-3 lg:order-2 xl:col-span-5">
          <div class="text-center">
            <div>
              <p>You are logged out!</p>
            </div>
          </div>
        </div>
      {/if}
      <div class="chat order-2 lg:order-3 xl:col-span-2">
        <Chad />
      </div>
    </div>
  </div>
</div>