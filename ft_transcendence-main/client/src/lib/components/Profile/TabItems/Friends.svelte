<script lang="ts">
  import { Input, Label, Heading, Button, Card  } from "flowbite-svelte";
  import { getUser, getFriends, addFriend } from '$lib/functions/user';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { userStore } from '$lib/stores/userStore';
  import { friendUsers } from '$lib/stores/userStore';
  import { getSocket } from "$lib/functions/sockets";

  export let friend: any;

  let friendname: string = friend.name;
  let name: string = ""
  let username: string;
  let messageAddFriend: string = "";
  let myFriendsUsers: any;
  let statusUsers: any = {};
  const socket = getSocket();
  
  friendUsers.subscribe((data: any) => {
      myFriendsUsers = data.friendUsers;  
  });

  onMount(async () => {
    userStore.subscribe((data: any) => {
      if (!data.user) return;
      username = data.user.name;
    })
    await getFriends(friendname);
  });

  const handleSubmit = async (username: string) => {
    if (username == friendname)
      return ;
    goto(`/profile/${username}`)    
    await getUser(username);
  }

  const handleAddFriends = async (username: string) => {
    await addFriend(username);
    await getFriends(friendname);
    name = "";
  }

  socket.on('userStatus', (data) => {
    statusUsers[data['user']['id']] = data;
  });

  socket.on('messageFriend', (data) => {
    messageAddFriend = data.message;
  });

</script>

<div>
  {#if friendname == username}
    <div>
      <Heading tag="h2" class="mb-4">Add your friend here</Heading>
        <Card padding="xl" size="xl">
          <form>
            <Label>Username</Label>
            <Input type="text" id="name" bind:value={name} />
            <div class="mt-2">
              <Button on:click={() => handleAddFriends(name)}>Submit</Button>
            </div>
          </form>
          
          <div class="mt-4">
            <h3 class="text-black">{messageAddFriend}</h3>
          </div>
        </Card>
    </div>
  {/if}
  
  {#if friend}
    <div class="text-black mt-4">
      <Card padding="xl" size="xl">
        <h2 class="text-2xl tracking-wide text-center text-black font-bold">Friends of {friendname}</h2>
        {#if myFriendsUsers && !myFriendsUsers.loading && myFriendsUsers.length > 0}
          <table class="min-w-full divide-y divide-gray-200 mt-4">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit Profile</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each myFriendsUsers as item (item.id)}
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap">{item.name}</td>
                  {#if item.id in statusUsers}
                    <td class="px-6 py-4 whitespace-nowrap">{statusUsers[item.id].status}</td>
                  {:else}
                    <td class="px-6 py-4 whitespace-nowrap">Offline</td>
                  {/if}
                  <td class="px-6 py-4 whitespace-nowrap"><Button color="blue" on:click={() => handleSubmit(item.name)}>Go to Profile</Button></td>
                </tr>
              {/each}
            </tbody>
          </table>
        {:else}
          <div class="text-center text-xl font-semibold text-gray-700 dark:text-white">
            I have no friends, but I'm always open to making new ones!
          </div>
        {/if}
      </Card>
    </div>
  {:else}
    <div class="text-sm text-gray-500">
      <Card padding="sm">
        <h1>User was unable to load</h1>
      </Card>
    </div>
  {/if}
</div>