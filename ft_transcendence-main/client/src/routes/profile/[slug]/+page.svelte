<script context="module" lang="ts">
  import { goto } from '$app/navigation';
  import { Tabs, TabItem } from 'flowbite-svelte';
  import { ButtonGroup, Button } from 'flowbite-svelte';
  import { getUser } from "$lib/functions/user";
  import { page } from '$app/stores';
  import { userStore } from '$lib/stores/userStore';
  
  import Friends from '$lib/components/Profile/TabItems/Friends.svelte';
  import userFind from '$lib/stores/userFind';
  import Info from '$lib/components/Profile/TabItems/Info.svelte';
  import MatchHistory from '$lib/components/Profile/TabItems/MatchHistory.svelte';
  import Settings from '$lib/components/Profile/TabItems/Settings.svelte';
  import Twofactor from '$lib/components/Profile/TabItems/Twofactor.svelte';
  import BlockUsers from '$lib/components/Profile/TabItems/BlockUsers.svelte';
</script>

<script lang="ts">

  let user: any;
  let find_user: any = null;
  let name: string;
  let ProfilePic: string = '';
  let slug: string;
  let id: number;

  userStore.subscribe(($data) => {
      user = $data.user;
    })

  userFind.subscribe(($data) => {
    find_user = $data.user;
  })

  $: {
    loadUserData($page.params.slug);
  }

  const loadUserData = async (newSlug: string) => {
    try {
      const newUserData = await getUser(newSlug);
      find_user = newUserData;
      name = find_user.name;
      ProfilePic = find_user.avatar;
      slug = find_user.slug;
      id = find_user.id;
    } catch (error) {
      console.error(`Failed to fetch user data: ${error}`);
    }
  }

  const handleSubmit = async (username: string) => {
    await getUser(username);
    goto(`/profile/${username}`)
  }
</script>

{#if find_user}
  {#if find_user.id === user.id}
    <div>
      <Tabs>
        <TabItem open title="Info">
          <Info user={user}/>
        </TabItem>
        <TabItem title="Friends">
          <Friends friend={user}/>
        </TabItem>
        <TabItem title="Block users">
          <BlockUsers />
        </TabItem>
        <TabItem title="Match History">
          <MatchHistory user={user}/>
        </TabItem>
        <TabItem title="Settings">
          <Settings user={user}/>
        </TabItem>
        <TabItem title="2FA">
          <Twofactor />
        </TabItem>
      </Tabs>
    </div>
  {:else}
    <Tabs>
      <TabItem open title="Info">
        <Info user={find_user}/>
      </TabItem>
      <TabItem title="Match History">
        <MatchHistory user={find_user}/>
      </TabItem>
    </Tabs>
  {/if}
{:else}
    <div class="text-center tracking-wide font-bold ">
      <div class="text-3xl">
          <h1>{$page.params.slug} is not an user</h1>
      </div>
      <div class="mt-2">
          <h2>What do you want to do?</h2>
      </div>
      <div class="py-4">
          <ButtonGroup class="space-x-px">
              <Button pill href="/game/lobby">Play Game</Button>
              <Button pill href="/leaderboard">Leaderboard</Button>
              <Button pill on:click={() => handleSubmit(user.name)}>My Profile</Button>
          </ButtonGroup>
      </div>
    </div>
{/if}