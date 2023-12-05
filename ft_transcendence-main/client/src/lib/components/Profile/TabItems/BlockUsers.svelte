<script context="module">
  import { blockedUsers } from "$lib/stores/userStore";
  import { Input, Label, Heading, Button, Card  } from "flowbite-svelte";
  import { onMount } from "svelte";
  import { blockUser, getBlockedUsers, unblockUser} from "$lib/functions/user";
  import { getSocket } from "$lib/functions/sockets";
</script>

<script lang="ts">
  
  let name: string = ""
  let myBlockedUsers: any;
  let statusBlock: string = "";
  const socket = getSocket()

  blockedUsers.subscribe((data: any) => {
      myBlockedUsers = data.blockedUsers;  
  });

  onMount(async () => {
    await getBlockedUsers();
  })

  const handleBlock = async (username: string) => {
    await blockUser(username);
    await getBlockedUsers();
    name = "";
  }

  const handleUnblock = async (username: string) => {
    await unblockUser(username);
  }

  socket.on('statusBlock', (data) => {
    statusBlock= data.message;
  });

</script>

<div>
  <Heading tag="h2" class="mb-4">Block a user here</Heading>
  <Card padding="xl" size="xl">
    <form>
      <Label>Username</Label>
      <Input type="text" id="name" bind:value={name} />
      <div class="mt-2">
        <Button on:click={() => handleBlock(name)}>Submit</Button>
      </div>
    </form>
    
    <div class="mt-4">
      <h3 class="text-black">{statusBlock}</h3>
    </div>
  </Card>

  <div class="text-black mt-5">
    <Heading tag="h2" class="mb-4">List with Blocked users</Heading>
    <Card padding="xl" size="xl">
      {#if myBlockedUsers && !myBlockedUsers.loading}
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unblock</th>
            </tr>
          </thead>
        <tbody class="bg-white divide-y divide-gray-200">
      {#each myBlockedUsers as u}
        <tr>
          <td class="px-6 py-4 whitespace-nowrap">{u.name}</td>
          <td class="px-6 py-4 whitespace-nowrap"> <Button on:click={() => handleUnblock(u.name)} color="yellow" size="xs">Unblock</Button></td>
        </tr>
      {/each}
          </tbody>
        </table>
      {/if}
    </Card>
  </div>
</div>