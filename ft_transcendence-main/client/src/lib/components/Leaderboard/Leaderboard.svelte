<script lang="ts">
    import { Card, Listgroup } from 'flowbite-svelte';
    import { getSocket } from "$lib/functions/sockets";

    let sortedList: any = [];

    async function getAllUsersSortedByWins() {
        const socket = getSocket();

        socket.emit('getSortedUsersByWins', (response: any) => {
            if (response.error) { 
                console.error("Error fetching users:", response.error);
                sortedList = [];
                return;
            }
            sortedList = response.slice(0, 5);
        });
    }
    getAllUsersSortedByWins();
</script>

<div class="justify-center"> 
    <Card padding="xl" size="md">
        <div class="flex justify-between items-center mb-4">
            <h5 class="text-xl font-bold leading-none text-gray-900 dark:text-white">Top Players</h5>
        </div>
        {#if sortedList.length > 0}
            <Listgroup let:item={item} class="border-0 dark:!bg-transparent">
                {#each sortedList as item}
                    <div class="flex items-center space-x-4">
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate dark:text-white">
                          {item.name} <!-- Player's name -->
                        </p>
                      </div>
                      <div class="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                        {item.wins} <!-- Player's wins -->
                      </div>
                    </div>
                {/each}
            </Listgroup>
        {:else}
            <div>
                <h1>No players to display.</h1>
            </div>
        {/if}
    </Card>
</div>
