<script context="module">
  import { getSocket } from "$lib/functions/sockets";
  import { gameField, gamePlayers, gameScore, gameState } from "$lib/stores/game";
  import { onMount } from "svelte";
  import { Spinner } from "flowbite-svelte";
  import { Card } from 'flowbite-svelte';
  import { Button } from 'flowbite-svelte';
</script>

<script lang="ts">

    const socket = getSocket();

    let in_game: boolean = false;
    let game_id: number = 0;
    let direction: number = 0; // NONE, UP, DOWN
    let fieldData: any;
    let fieldDataLoad: boolean;
    let scoreData: any;
    let playerData: any;


    gameField.subscribe((data) => {
      fieldData = data.data
      fieldDataLoad = data.loading;
    })

    gameScore.subscribe((data) => {
      scoreData = data.data;
    })

    gamePlayers.subscribe((data) => {
        playerData = data.data
    })

    const registerGameListener = () => {
        socket.on('game', (res) => {
            const {game, field, state, score, players} = res;
            game_id = game['id'];
            in_game = true;

            renderField(field);
            renderPaddles(field);
            renderBall(field);

            gameField.update((state: any) => {
                const newState = { ...state };

                newState.data = res.field;
                return newState;
            });
            
            gameScore.update((state: any) => {
              const newState = { ...state };

              newState.data = res.score;
              return newState;
            })

            // gameState.update((state: any) => {
            //     console.log("the game state:  ", state);

            //     return state;
            // })
        });

        document.body.addEventListener("keydown", (event) => {
            const key = event.key.toLowerCase();
            if (!in_game) return;

            if (key == "p" && direction != 1)
                direction = 1;
            else if (key == "l" && direction != 2)
                direction = 2;
            else
                return;

            socket.emit('movePaddle', {game_id, direction});
        });

        document.body.addEventListener("keyup", (event) => {
            const key = event.key.toLowerCase();
            if (!in_game) return;

            if (key == "p" && direction == 1)
                direction = 0;
            else if (key == "l" && direction == 2)
                direction = 0;
            else
                return;

            socket.emit('movePaddle', {game_id, direction});
        });
    }

    const renderField = (field: any) => {
        const fieldElement = document.getElementById('field');
        if (!fieldElement) return console.log('where da field at?');

        const fieldWidth = field.width;
        const fieldHeight = field.height;

        fieldElement.style.width = `${fieldWidth}px`;
        fieldElement.style.height = `${fieldHeight}px`;
    }

    const renderPaddles = (field: any) => {
        const fieldWidth = field.width;
        const paddleWidth = field.paddleWidth;
        const paddles = field.paddles;

        let paddleIndex = 0;
        paddles.forEach((paddle: any) => {
            const paddleName = paddleIndex == 0 ? 'paddle-left' : 'paddle-right';
            const paddleElement = document.getElementById(paddleName);
            if (!paddleElement) return console.log('where da paddle at?');

            const paddleY = paddle.y;
            const paddleHeight = paddle.height;

            paddleElement.style.marginTop = `${paddleY - (paddleHeight / 2)}px`;
            paddleElement.style.width = `${paddleWidth}px`;
            paddleElement.style.height = `${paddleHeight}px`;

            let margin_left = paddle.x;
            if (paddleIndex)
                margin_left = fieldWidth - paddleWidth - paddle.x;

            paddleElement.style.marginLeft = `${margin_left}px`;

            paddleIndex++;
        });
    }

    const renderBall = (field: any) => {
        const ballElement = document.getElementById('ball');
        if (!ballElement) return console.log('where da ball at?');

        const ball = field.ball;
        const ballWidth = ball.width;
        const ballX = ball.x;
        const ballY = ball.y;

        ballElement.style.width = `${ballWidth}px`;
        ballElement.style.height = `${ballWidth}px`;
        ballElement.style.marginTop = `${ballY - (ballWidth / 2)}px`;
        ballElement.style.marginLeft = `${ballX - (ballWidth / 2)}px`;
    }

    onMount(async () => {
      registerGameListener();
    });
</script>


<div class='mt-4'>
    {#if fieldData && !fieldDataLoad}
    <div class='bg-black' id="field" style={`width: ${fieldData.width}px; height: ${fieldData.height}px;`}>
        <div class='bg-white' id="paddle-left"  style={`position: absolute; width: ${fieldData.paddleWidth}px; height: ${fieldData.paddles[0].height}px; margin-left: 10px; margin-top: calc(250px / 2 - 50px / 2);`}></div>
        <div class='bg-white' id="paddle-right" style={`position: absolute; width: ${fieldData.paddleWidth}px; height: ${fieldData.paddles[1].height}px; margin-left: calc(500px - 10px - 10px); margin-top: calc(250px / 2 - 50px / 2);`}></div>
        <div class='bg-white' id="ball" style={`position: absolute; width: ${fieldData.ball.width}px; height: 10px; margin-left: calc(250px - (10px / 2)); margin-top: calc(250px / 2 - 10px / 2);`}></div>
    </div>

    <div class="mt-4">
        <Card padding="xl" size="xl">
            <div class="flex justify-between">
            {#if playerData}
                {#each Object.keys(playerData) as playerId (playerId)}
                    <p class="text-xl font-bold">{playerData[playerId].user.name}</p>
                {/each}
            {:else}
                <p class="text-xl font-bold">Player 1</p>
                <p class="text-xl font-bold">Player 2</p>
            {/if}
            </div>
            <div class="flex justify-between">
                <div>
                    <p class="text-xl font-bold">{scoreData[0]}</p>
                </div>
                <div>
                    <p class="text-xl font-bold">{scoreData[1]}</p>
                </div>
            </div>
        </Card>
    </div>

    <div class="mt-4">   
        {#if scoreData[0] == 3 || scoreData[1] == 3}
            <Card padding="xl" size="xl">
                <div class="flex justify-between">
                    <p class="text-xl font-bold">Game Over!</p>
                    <Button class="w-fit" href="/game/lobby">Back to Lobby</Button>
                </div>
            </Card>
        {/if}   
    </div>
    {:else}
      <div>
        <p class="my-4">Rendering the field for you</p>
        <Spinner />
      </div>
    {/if}
</div>


