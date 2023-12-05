<script lang="ts">
  import { userStore } from "$lib/stores/userStore";

  let user: any;
  // Subscribe to userStore
  userStore.subscribe(($user) => {
    user = $user.user;
  });
</script>


{#if user && !user.loading}
    <div class="text-center tracking-wide font-bold ">
      <div class="text-white text-3xl">
          <h1>Welcome {user.name}</h1>
        </div>
    </div>
{:else}
    <p>Loading...</p>
{/if}
