<script lang="ts">
  import { joinQueue } from "$lib/functions/game";
  import { gameQueue } from "$lib/stores/game";
  import { Card, Heading, Spinner } from "flowbite-svelte";
  import { PUBLIC_BACKEND_URL } from "$env/static/public";
  import { onMount } from "svelte";
  
  let userData: any;
  let loading: boolean;

  onMount(async() => {
    await joinQueue();
  });

  gameQueue.subscribe((data) => {
    userData = data.data;
    loading = data.loading;
  });
</script>

<div class="text-center">
  <Heading class="my-4" tag="h2" color="white">
    Looking for opps
  </Heading>
  <div class="my-4">
    <Spinner />
  </div>
  {#if !loading}
  <div class="flex justify-center">
    <Card img={PUBLIC_BACKEND_URL}{userData.user.avatar} class="mb-4">
      <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">User profile</h5>
      <p class="text-lg mb-3 font-normal text-gray-700 leading-tight">name: {userData.user.name}</p>
      <p class="mb-3 font-normal text-gray-700 leading-tight">experience: {userData.user.experience}</p>
      <div class="flex justify-around items-center">
        <p>wins: {userData.user.wins}</p>
        <p>losses: {userData.user.losses}</p>
      </div>
    </Card>
  </div>
  {/if}
</div>
