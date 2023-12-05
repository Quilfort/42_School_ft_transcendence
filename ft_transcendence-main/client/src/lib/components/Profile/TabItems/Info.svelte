<script lang="ts">
  import { Img, Heading, Button, Card  } from "flowbite-svelte";
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import userFind from '$lib/stores/userFind';
  import { getUser, addFriend, getFriends  } from "$lib/functions/user";
  import { PUBLIC_BACKEND_URL } from '$env/static/public';
  import { userStore } from '$lib/stores/userStore';
  import { friendUsers } from '$lib/stores/userStore';
  
  export let user: any;

  let find_user: any = null;
  let myUser: any;
  let name: string;
  let Wins: number = 0;
  let Losses: number = 0;
  let Total: number = 0;
  let ProfilePic: string = '';
  let myFriendsUsers: any;

  userFind.subscribe(($data) => {
    find_user = $data.user;
  })

  userStore.subscribe(($data) => {
      myUser = $data.user;
  })

  friendUsers.subscribe((data: any) => {
      myFriendsUsers = data.friendUsers;  
  });

  onMount(async () => {
    const newUserData = await getUser(user.name);
    find_user = newUserData;
    name = find_user.name;
    ProfilePic = find_user.avatar;
    Wins = find_user.wins;
    Losses = find_user.losses;
    Total = Wins + Losses;
    await getFriends(myUser.name)
  });

  const handleAddFriends = async (username: string) => {
    await addFriend(username);
    await getFriends(myUser.name)
    goto(`/profile/${myUser.name}`)
  }
</script>

{#if user}
  <div class="text-sm text-gray-500">
      <b>Profile:</b>
      <Card padding="sm">
        <div class="flex flex-col items-center pb-4">
          <Img src={PUBLIC_BACKEND_URL}{ProfilePic} size="max-w-xs" alt={name} />
          <h5 class="mt-4 mb-1 text-xl font-medium tracking-wide text-gray-900 dark:text-white">
            {name}
          </h5>
        </div>
      </Card>
  </div>

  <div class="mt-4 text-sm text-gray-500 dark:text-gray-400">
      <b>Win/Lose Ratio:</b>
      <Card padding="sm">
        <div class="flex flex-col items-center pb-4">
          <p>Wins: {Wins}</p>
          <p>Losses: {Losses}</p>
          <p>Total: {Total}</p>
        </div>
      </Card>
  </div>
{:else}
  <div class="text-sm text-gray-500">
    <Card padding="sm">
      <h1>User was unable to load</h1>
    </Card>
  </div>
{/if}

{#if find_user.name != myUser.name}
    <Card padding="xl" size="xl" class="mt-4">
      <div>
        <Heading tag="h3" class="mb-4">Add {find_user.name} as Friend</Heading>
      </div>
      <div>
        <Button on:click={() => handleAddFriends(find_user.name)}>Press This Button and look at your Friends list</Button>
      </div>
    </Card>
{/if}