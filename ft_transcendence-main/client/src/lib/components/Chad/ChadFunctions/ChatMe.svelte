<script lang="ts">
  export let message: any;
</script>

<div class="flex justify-end">
  <div class="bg-gray-200 w-1/2 mt-4 text-black p-2 rounded-lg shadow-xl">
    <h4 class="text-green-400 font-bold">{message.sender.name}</h4>
    <p class="text-sm">{message.content}</p>
  </div>
</div>