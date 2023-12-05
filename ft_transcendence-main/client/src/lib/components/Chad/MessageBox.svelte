<script context="module">
  import { channelStore, singleChannelStore } from "$lib/stores/channelStore";
  import { blockedUsers, userStore } from "$lib/stores/userStore";
  import InputField from "./InputField.svelte";
  import { getSocket } from "$lib/functions/sockets";
  import { onMount } from "svelte";
  import { getMyChannelById, getMyChannels, sendMessage } from "$lib/functions/channels";
  import { Button, Modal } from "flowbite-svelte";
  import ChatUserButtons from "./ChadFunctions/ChatUserButtons.svelte";
  import { getUser } from "$lib/functions/user";
  import userFind from "$lib/stores/userFind";
  import { createInvite, joinInvite } from "$lib/functions/game";
</script>

<script lang="ts">
  let channelData: any;
  let username: string;
  let loading: boolean = false;
  let userId: number;
  let modalUserData: any;
  
  const socket = getSocket();
  let channelMessages: any[];
  let eventMsg: string | null;
  let modalOpen: boolean = false;
  let invite: number;
  let myChannels: any;
  let usersBlocked: any;

  const clearEventMsg = () => {
    eventMsg = null;
  };
  
  userStore.subscribe((data: any) => {
    username = data.user.name
    userId = data.user.id
  });

  singleChannelStore.subscribe((data: any) => {
    channelData = data.data
    loading = data.loading
  });

  channelStore.subscribe(($data) => {
    myChannels = $data.data
  })

  blockedUsers.subscribe((data) => {
    console.log(data);
    usersBlocked = data.blockedUsers;
  })

  channelMessages = channelData.channel.messages;
  onMount(() => {
    socket.on("dm", (res: any) => {
      getMyChannelById(res.channel.id)
      getMyChannels();
      channelMessages = res.channel.messages;
    });
    
    if (!socket.hasListeners('message')) {
      socket.on('message', (res: any) => {
        // channelMessages = [...channelData.channel.messages, res];
        //   channelMessages = channelMessages.sort((a: any, b: any) => {
        //     return b.created_at.localeCompare(a.created_at);
        //   });

        singleChannelStore.update((state: any) => {
          const newState = { ...state };

          const newMessage = {
            content: res.content,
            created_at: new Date().toISOString(),
            sender: {
              id: res.sender_id,
              name: res.sender.name,
            }
          };

          newState.data.channel.messages = [...newState.data.channel.messages, newMessage];

          newState.data.channel.messages.sort((a: any, b: any) => {
            return b.created_at.localeCompare(a.created_at);
          });

          return newState;
        });
      });
    }
    
    socket.on("mute", (res: any) => {
      eventMsg = res.content
      
      setTimeout(clearEventMsg, 5000);
    });

    socket.on("invite", (res: any) => {
      console.log("INVITE event fired: ", res);
    });

    socket.on("kick", (res: any) => {
      eventMsg = res.content

      if (res.user_id === userId) {
        singleChannelStore.update((state: any) => {
          const newState = { ...state }
  
          newState.gotoChat = false;
          return newState;
        })
        channelStore.update((state: any) => {
          const newState = { ...state };
          
          const updatedChannelList =  newState.data.filter((ch: any) => ch.channel_id !== res.channel_id);

          return { ...state, data: updatedChannelList };
        });
      }

      setTimeout(clearEventMsg, 5000);
    });


    socket.on("ban", (res: any) => {
      eventMsg = res.content

      if (res.user_id === userId) {
        singleChannelStore.update((state: any) => {
          const newState = { ...state }
  
          newState.gotoChat = false;
          return newState;
        })
        channelStore.update((state: any) => {
          const newState = { ...state };
          
          const updatedChannelList =  newState.data.filter((ch: any) => ch.channel_id !== res.channel_id);

          return { ...state, data: updatedChannelList };
        });
      }

      setTimeout(clearEventMsg, 5000);
    });

  });

  const handleOpen = async(name: string) => {
    await getUser(name)
    userFind.subscribe((data: any) => {
      modalUserData = data.user;
    });

    modalOpen = true
  }

  const isBlocked = (uid: number) => {
    let ret = false;
    usersBlocked.forEach((element: any) => {
      if (uid == element.id && ret == false) ret = true;
    });
    return ret;
  }

  const handleInvite = async( variation: boolean ) => {
    invite = await createInvite(variation);
    const res = await sendMessage(channelData.channel.id, `gameinvite:${invite}`);
    if ("error" in res)
      alert(`there was an error sending your message: ${res['error']}`);
  }

  const handleJoin = (invite_id: number) => {
    joinInvite(invite_id);
  }

</script>

<div>
  <div class="flex justify-between my-4 text-center">
    <div class="mx-2">
        <Button
          on:click={() => handleInvite(false)}
          color="primary"
        >
        invite members for NORMAL game!
      </Button>
    </div>
    <div class="mx-2">
      <Button 
        on:click={() => handleInvite(true)}
        color="primary"
        >
        invite members for CUSTOM game!
      </Button>
    </div>
  </div>
  {#if channelData && !loading}
    <h2 class="text-2xl font-bold my-2 text-center">{channelData.channel.name}</h2>
    <div class="h-[50vh] p-4 bg-gray-400 rounded-md overflow-y-scroll">
      {#if eventMsg}
        <p class="font-bold text-black text-sm pt-4">{eventMsg}</p>
      {/if}
      {#if channelData.channel.messages}
        {#each channelData.channel.messages as message}
          {#if username == message.sender.name}
            <div class="flex justify-end break-words">
              <div class="bg-gray-200 w-1/2 mt-4 text-black p-2 rounded-lg shadow-xl">
                <h4 class="text-green-400 font-bold">{message.sender.name}</h4>
                <p class="text-sm">{message.content}</p>
              </div>
            </div>
            {:else}
            <div class="flex justify-start break-words">
              <div class="flex flex-wrap bg-white w-1/2 mt-4 text-black p-2 rounded-lg shadow-xl">
                <h4 class="w-8/12 text-blue-400 font-bold">{message.sender.name}</h4>
                <Button
                class="w-4/12 border-none py-0 px-1" 
                color="alternative" 
                on:click={() => handleOpen(message.sender.name)}
                >
                ...
              </Button>
                  {#if modalUserData}
                    <Modal title={`${modalUserData.name}`} bind:open={modalOpen} outsideclose>
                      <ChatUserButtons
                        userId={modalUserData.id}
                        channelId={channelData.channel.id}
                        name={modalUserData.name}
                        channelData={channelData}
                      />
                    </Modal>
                    {/if}
                    <div class="mt-1 w-full">
                    {#if message.content.startsWith('gameinvite:')}
                      <Button
                        color="green"
                        on:click={() => handleJoin(message.content.split(':')[1])}
                      >
                        Join game
                      </Button>
                    {:else}
                    <p class="text-sm">
                      {#if isBlocked(message.sender.id)}
                        <i>blocked user</i>
                      {:else}
                        {message.content}
                      {/if}
                    </p>
                  {/if}
                </div>
              </div>
            </div>
          {/if}
        {/each}
      {/if}
    </div>
    <InputField
      channelId={channelData.channel_id}
      role={channelData.role}
    />
  {/if}
</div>