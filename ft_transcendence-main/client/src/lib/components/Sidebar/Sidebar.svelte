<script context="module" lang="ts">
  import { Sidebar, SidebarGroup, SidebarItem, SidebarWrapper } from 'flowbite-svelte';
  import { getUser } from '$lib/functions/user';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { handleLogin, handleLogout, sendAuthMessage, verifyTfa } from '$lib/functions/auth';
  import { userStore } from '$lib/stores/userStore';
  import { getSocket } from '$lib/functions/sockets';
</script>

<script lang="ts">
  export let authCode: string | null;
  export let test: any;

  let isUserLoggedIn: boolean = false

  onMount(() => {
    const savedToken = localStorage.getItem("jwt_token");
    let socket: any;

    if (savedToken == null)
    {
      if (authCode == null)
      {
        handleLogin();
        isUserLoggedIn = true;
        return;
      }
      // authCode is present, so get me
      socket = getSocket();
      socket.emit('authenticateUser', authCode, (res: any) => {
        if (JSON.stringify(res).toLowerCase().includes("2fa token"))
        {
          verifyTfa(socket);
          isUserLoggedIn = true;
          return;
        } else if (JSON.stringify(res).toLowerCase().includes("unauthorized")) {
          handleLogin();
          isUserLoggedIn = true;
        } else {
          localStorage.setItem('jwt_token', res['token']);
          localStorage.setItem('user', JSON.stringify(res['user']));
          localStorage.setItem('messageSend', "send");

          userStore.set({user: res['user'], loading: false});
          isUserLoggedIn = true;
          sendAuthMessage('Welcome to our website', null);

          goto(`/profile/${res['user']['name']}`)
        }
      })
      isUserLoggedIn = false;
    } else {
      isUserLoggedIn = true;
    }
  })
  
  const handleClick = async () => {
    await getUser(test.name);

    goto(`/profile/${test.name}`)
  }

</script>

<Sidebar asideClass='w-full h-full'>
<SidebarWrapper divClass='h-full p-4 bg-gray-600 dark:text-gray-300 border-0 border-r border-gray-200 shadow-2xl'>
  <SidebarGroup>
    <SidebarItem 
      aClass="flex items-center p-2 text-base font-normal text-white rounded-lg dark:text-white hover:font-bold" 
      label="Home" 
      href="/"
    />
    <SidebarItem 
      aClass="flex items-center p-2 text-base font-normal text-white rounded-lg dark:text-white hover:font-bold" 
      label="Play Game" 
      href="/game/lobby"
    />
    {#if test && !test.loading}
      <SidebarItem 
        on:click={() => handleClick()} 
        aClass="flex items-center p-2 text-base font-normal text-white rounded-lg dark:text-white hover:font-bold" 
        label="Profile" 
        href="/profile/{test.name}"
      />
    {:else}
      <SidebarItem 
        aClass="flex items-center p-2 text-base font-normal text-white rounded-lg dark:text-white hover:font-bold" 
        label="Profile"
      />
    {/if}
    <SidebarItem 
      aClass="flex items-center p-2 text-base font-normal text-white rounded-lg dark:text-white hover:font-bold" 
      label="Leaderboard" 
      href="/leaderboard"
    />
    <SidebarItem 
      aClass="flex items-center p-2 text-base font-normal text-white rounded-lg dark:text-white hover:font-bold" 
      label="Channel Management" 
      href="/channel-management"
    />
    {#if isUserLoggedIn}
      <SidebarItem 
        aClass="bg-red-500 hover:bg-red-700 flex items-center p-2 text-base font-normal text-white rounded-lg dark:text-white hover:font-bold"
        label="logout" 
        on:click={() => handleLogout(isUserLoggedIn = false)}
      />
      {:else}
      <SidebarItem 
        aClass="bg-blue-500 hover:bg-blue-700 flex items-center p-2 text-base font-normal text-white rounded-lg dark:text-white hover:font-bold"
        label="login" 
        on:click={handleLogin}
      />
    {/if}
  </SidebarGroup>
</SidebarWrapper>
</Sidebar>
