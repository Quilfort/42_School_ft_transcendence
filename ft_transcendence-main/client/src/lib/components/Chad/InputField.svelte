<script context="module">
  import { sendMessage } from "$lib/functions/channels";
  import { Button, Textarea } from "flowbite-svelte";
</script>

<script lang="ts">
  let content: string = "";
  export let channelId: number;
  // export let userId: number;
  // export let username: string;
  export let role: any;

  const handleSubmit = async (channel_id: number, message: string) => {
	content = "";
    const res = await sendMessage(channel_id, message);
	if ("error" in res)
		alert(`there was an error sending your message: ${res['error']}`);
  }

</script>

<div>
  <form>
    <div class="flex my-2">
        <label for="chat" class="sr-only">Your message</label>
          <Textarea 
            id="chat" 
            class="mx-0" 
            rows="1" 
            placeholder="Your message..."
            bind:value={content} 
          />
          {#if role !== "MUTED"}
          <Button 
            type="submit" 
            color="blue" 
            class="font-bold mx-2 rounded-md text-white dark:text-primary-500"
            on:click={() => handleSubmit(channelId, content)}
          >
            Send
          </Button>
          {:else}
            <Button 
              type="submit" 
              color="dark" 
              class="font-bold mx-2 rounded-md text-white dark:text-primary-500"
              disabled
            >
              Send
            </Button>
          {/if}
    </div>
  </form>
</div>