<script lang="ts">
    import { goto } from '$app/navigation';
    import { Button } from 'flowbite-svelte';
    import { Card } from 'flowbite-svelte';

  const handleJoin = async () => {
    goto(`/game/matchmaking`)
  }
</script>

<div class="text-2xl tracking-wide text-center font-bold">
    <h2>Choose Your PlayStyle</h2>
</div>

<div class="flex flex-col space-y-4 items-center">
    <div class="mt-16 flex space-x-4 items-center">
        <div class="w-2/3 p-4">
            <Card class="h-2/3"> <!-- Adjust the height as needed -->
                <h5 class="mb-2 text-xl font-bold tracking-tight text-gray-700 dark:text-white text-center">🏓 Ready to Show Your Skills? Play Pong and Beat Your Friends!</h5>
                <p class="mb-3 font-normal text-gray-700 dark:text-gray-200 leading-tight text-center">Challenge your pals to an epic game of Pong right here on our website. It's time to test your reflexes and prove who's the ultimate Pong champion! Get your paddle ready, aim for victory, and see who can score the most points. Are you up for the challenge? Click the buttons below to start the game and claim bragging rights!</p>
                <div class="flex justify-between">
                    <Button class="w-fit" on:click={() => handleJoin()}>Play Original</Button>
                </div>
            </Card>
        </div>
        <div class="w-2/3 p-4">
            <Card class="h-2/3"> 
            <h5 class="mb-2 text-xl font-bold tracking-tight text-gray-700 dark:text-white text-center">🏆 Check the Leaderboards and Claim Your Spot at the Top!</h5>
            <p class="mb-3 font-normal text-gray-700 dark:text-gray-200 leading-tight text-center">Want to see how you stack up against the competition? Explore our leaderboards and discover where you rank among the Pong elite. Compete with players from around the world and strive to reach the number one spot. Are you ready to become a Pong legend? Click the button below to view the leaderboards and start your journey to glory!</p>
            <div class="flex justify-between">
                <Button class="w-fit" href="/leaderboard">Leaderboard</Button>
            </div>
            </Card>
        </div>
    </div>
</div>
