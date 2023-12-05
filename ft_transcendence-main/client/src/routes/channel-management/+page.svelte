<script context="module">
  import CreateChannel from "$lib/components/ChatInfo/ChannelFunctions/CreateChannel.svelte";
  import ChatInfo from "$lib/components/ChatInfo/ChatInfo.svelte";
  import { TabItem, Tabs } from "flowbite-svelte";
</script>

<div>
  <Tabs>
    <TabItem open title="Info">
      <ChatInfo />
    </TabItem>
    <TabItem title="Create channel">
      <CreateChannel />
    </TabItem>
  </Tabs>
</div>