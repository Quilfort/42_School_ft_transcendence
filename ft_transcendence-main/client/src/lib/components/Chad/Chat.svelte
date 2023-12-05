<script context="module">
  import { singleChannelStore } from "$lib/stores/channelStore";
  import { Button } from "flowbite-svelte";
  import MyChannels from "./MyChannels.svelte";
  import PublicChannels from "./PublicChannels.svelte";
  import InviteUserChat from "./ChadFunctions/InviteUserChat.svelte";
  import MessageBox from "./MessageBox.svelte";
</script>

<script lang="ts">
  let singleChatStoreData: any;
  let seeChatBox: boolean = false;
  let checkPublicChannels: boolean = false;

  singleChannelStore.subscribe((data: any) => {
	singleChatStoreData = data.data;
	seeChatBox = data.gotoChat;
  });

  const handleClick = async() => {
	checkPublicChannels = !checkPublicChannels;
  }

  const handleGoBack = async () => {
	singleChannelStore.set({ data: [{ messages: [] }], gotoChat: false, loading: true });
	seeChatBox = false;
  }

</script>

<div class="h-full bg-gray-600 border-0 border-l border-gray-200 shadow-2xl overflow-y-scroll">
	<Button 
	  class="w-full rounded-none rounded-b-[25px] mb-4 focus:outline-none focus:shadow-none" 
	  on:click={() => handleClick()} 
	  color="dark"
	>
	  {#if !checkPublicChannels}
		Check public channels
	  {:else}
		Check my channels
	  {/if}
	</Button>
	{#if seeChatBox === false && checkPublicChannels === false}
	  <div>
	    <MyChannels />
	  </div>
	{:else if seeChatBox === false && checkPublicChannels === true}
	  <div>
		<PublicChannels />
	  </div>
	{:else}
	  <div>
		<div class="flex justify-between px-4">
		  <Button on:click={() => handleGoBack()} color="dark">
		    Go back
	 	  </Button>
		  <InviteUserChat channel={singleChatStoreData} />
		</div>
		<MessageBox />
	  </div>
	{/if}
</div>