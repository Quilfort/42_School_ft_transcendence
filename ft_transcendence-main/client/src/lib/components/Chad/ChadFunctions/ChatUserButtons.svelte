<script context="module">
  import { mutedUserInChannel, mutedUsers } from "$lib/stores/channelStore";
  import { banUser, createDM, getMutedUserList, kickUser, muteUser, promoteUser, unmuteUser } from "$lib/functions/channels";
  import { blockUser, getUser } from "$lib/functions/user";
  import { Button, Dropdown, DropdownItem, Label, Modal, Select } from "flowbite-svelte";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
    import { blockedUsers } from "$lib/stores/userStore";
</script>

<script lang="ts">
  export let userId: number;
  export let channelId: number;
  export let name: string;
  export let channelData: any;
  
  let isUserMuted: any;
  let mutedUserList: any;
  let isMuted: boolean = false;

  onMount(async() => {
    await getMutedUserList(channelId, name);
    mutedUsers.subscribe((data: any) => {
      if (data !== null) {
        mutedUserList = data.data;
      }
    });

    if (mutedUserList) {
      for (const userMuted of mutedUserList) {
        if (userMuted.user_id === userId) {
          if (userMuted.role === "MUTED") {
            isMuted = true;
            break ;
          }
          else
            isMuted = false;
        }
      }
    }
  });

  mutedUserInChannel.subscribe((data) => {
    isUserMuted = data;
  })

  const handleBlock = async(username: string) => {
    blockedUsers.update((state: any) => {
      const newState = { ...state };
      newState.blockedUsers.push({
        id: userId,
		name: username
      })
      return newState;
    });
    await blockUser(username);
  }

  const handleMute = async(channelId: number, username: string) => {
    await muteUser(channelId, username);

    await getMutedUserList(channelId, name);

  }

  const handleUnmute = async(channelId: number, username: string) => {
    await unmuteUser(channelId, username);

    await getMutedUserList(channelId, name);
  }

  const handleMuteForTime = async(channelId: number, username: string, time: number) => {
    await muteUser(channelId, username);

    await getMutedUserList(channelId, name);

    setTimeout(async() => {
      await unmuteUser(channelId, username);

      await getMutedUserList(channelId, name);
    }, time)
  }

  const handleDM = async() => {
    await createDM(userId)
  }

  const handleProfile = async() => {
    await getUser(name);

    goto(`/profile/${name}`)
  }
</script>

<div>
  <Button
    color="blue"
    on:click={() => handleProfile()}
  >
    View Profile
  </Button>
  {#if channelData.role === "OWNER"}
    <Button 
      color="blue"
      on:click={() => promoteUser(channelId, name)}
    >
      Set as ADMIN
    </Button>
  {/if}
  <Button
    color="dark"
    on:click={handleDM}
  >
    Send DM
  </Button>
  {#if isMuted}
    <Button
      outline
      color="yellow"
      on:click={() => handleUnmute(channelId, name)}
    >
      Unmute user
    </Button>
  {:else}
    <Button
      color="yellow"
      on:click={() => handleMute(channelId, name)}
    >
      Mute user
    </Button>
  {/if}
  <Button 
    color="red"
    on:click={() => handleBlock(name)}
  >
    Block user
  </Button>
  {#if channelData.role === "OWNER" || channelData.role === "ADMINISTRATOR"}
  <div class="my-3">
    <Button
      color="yellow"
    >
      Mute for limited time
    </Button>
    <Dropdown>
      <DropdownItem on:click={() => handleMuteForTime(channelId, name, 5000)}>5 seconds</DropdownItem>
      <DropdownItem on:click={() => handleMuteForTime(channelId, name, 15 * 60 * 1000)}>15 minutes</DropdownItem>
      <DropdownItem on:click={() => handleMuteForTime(channelId, name, 30 * 60 * 1000)}>30 minutes</DropdownItem>
      <DropdownItem on:click={() => handleMuteForTime(channelId, name, 60 * 60 * 1000)}>1 hour</DropdownItem>
      <DropdownItem on:click={() => handleMuteForTime(channelId, name, 24 * 60 * 60 * 1000)}>1 day</DropdownItem>
    </Dropdown>
      <Button
        on:click={() => kickUser(channelId, name)}
      >
        Kick
      </Button>
      <Button
        on:click={() => banUser(channelId, name)}
      >
        Ban
      </Button>
    </div>
  {/if}
</div>