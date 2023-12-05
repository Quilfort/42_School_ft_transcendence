<script lang="ts">
	import { Card } from 'flowbite-svelte';
	import { getSocket } from "$lib/functions/sockets";
	
	export let user: any;

	let games: any[] = [];
	
	async function fetchLastThreeGames() {
	  const socket = getSocket();
	  let username = user.name
	  socket.emit('getLastThreeGames', { username }, (response: any) => {
		if (response.error) {
		  console.error("Error fetching games:", response.error);
		  games = [];
		  return;
		}
		games = response;
	  });
	}
	
	function formatDate(dateString: string) {
		const date = new Date(dateString);
		
		const dd = String(date.getDate()).padStart(2, '0');
		const mm = String(date.getMonth() + 1).padStart(2, '0');
		const yy = date.getFullYear().toString();
		const hh = String(date.getHours()).padStart(2, '0');
		const min = String(date.getMinutes()).padStart(2, '0');
    	return `${dd}/${mm}/${yy} ${hh}:${min}`;
	}
	fetchLastThreeGames(); // Fetch games when the component is loaded

</script>
  
<style>
	.winner {
		color: green;
	}

	.loser {
		color: red;
	}
</style>

<div class="justify-center"> 
  <Card padding="xl" size="xl">
    <h5 class="text-xl font-bold leading-none text-gray-900 dark:text-white">Recent Games</h5>
    {#if games.length > 0}
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opponent</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scores</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each games as game}
            {#if game.players.length > 1}
				<tr>
					<td class="px-6 py-4 whitespace-nowrap">{formatDate(game.created_at)}</td>
					<td class="px-6 py-4 whitespace-nowrap">
					<span class={game.winner_id === game.players[0].id ? 'winner' : 'loser'}>{game.players[0].name}</span> vs 
					<span class={game.winner_id === game.players[1].id ? 'winner' : 'loser'}>{game.players[1].name}</span>
					</td>
					<td class="px-6 py-4 whitespace-nowrap">
						{game.score[0]} - {game.score[1]}
					</td>
				</tr>
			{:else if games.length == 2}
				<div class="text-center text-xl font-semibold text-gray-700 dark:text-white">
					You haven't played any games yet.
				</div>
            {/if}
          {/each}
        </tbody>
      </table>
    {:else}
      <div class="text-center text-xl font-semibold text-gray-700 dark:text-white">
        You haven't played any games yet.
      </div>
    {/if}
  </Card>
</div>