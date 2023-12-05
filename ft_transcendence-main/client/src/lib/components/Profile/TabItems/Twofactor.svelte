<script lang="ts">
    import { Button, Modal } from 'flowbite-svelte';
    import { onMount } from 'svelte';
    import { disableTFA, enableTFA, hasTFA, generateSecret } from '$lib/functions/auth';

    let popupModal: boolean = false;
    let _2FA_Activated: boolean = false;
    let message: string = "";

    let token: string = '';
    let secret: string = '';
	let src: string = '';

    onMount(() => {
        checkIfTFA();
    });

    async function checkIfTFA() {
		_2FA_Activated = await hasTFA();

		if (!_2FA_Activated) // no need for this tbh
			await loadSecret();
    }

	async function loadSecret() {
		const obj: any = await generateSecret();
		secret = obj['secret'];
		src = obj['image'];

	}

    async function handleEnableTFA() {
        const res = await enableTFA(secret, token);

		if ('error' in res)
			alert(res['error']);
		else {
			alert('2FA is enabled');
			checkIfTFA();
		}
    }
    async function handleDisableTFA() {
        const res = await disableTFA();
	
		if ('error' in res)
			alert(res['error']);
		else {
			alert('2FA is disabled');
			checkIfTFA();
		}
    }

</script>

<div class="tracking-wide font-bold text-black">
    {#if _2FA_Activated == false}
        <h1>Add Two Factor Authentication </h1>
    {:else}
        <h1>Remove Two Factor Authentication </h1>
    {/if}
</div>

<div class="mt-4">
    {#if _2FA_Activated == false}
        <div class="mt-4 text-black">
			<img {src} alt="code" />
            <form class= "mt-4" on:submit|preventDefault={handleEnableTFA}>
                <div class="mb-4">
                    <label for="secret" class="block">Secret:</label>
                    <input type="password" id="secret" disabled bind:value={secret} class="w-full" />
                </div>
                <div class="mb-4">
                    <label for="token" class="block">Token:</label>
                    <input type="text" id="token" bind:value={token} class="w-full" />
                </div>
                <div class="mt-2">
                    <Button color="red" type="submit">Enable 2FA</Button>
                </div>
            </form>
        </div>
    {:else}
        <div>
        <Button on:click={() => (popupModal = true)}>Disable 2FA </Button>
        </div>
    
        <Modal bind:open={popupModal} size="xs" autoclose>
            <div class="text-center">
                <div class="mb-4">
                    <h2 class="mb-5 text-lg font-bold text-gray-500 dark:text-gray-400">
                        Do you want to disable 2FA?
                    </h2>
                    <p class="text-red-500">
                        Your token in your App will become invalid. Please rescan the QR code when enabling 2FA again.
                    </p>
                </div>
                <Button color="red" class="mr-2" on:click={() => (handleDisableTFA(), popupModal = false)}>Yes, I'm sure</Button>
                <Button color="alternative" on:click={() => (popupModal = false)}>No, Keep profile protected</Button>
            </div>
        </Modal>
    {/if}
</div>
<div class="mt-4 text-black">
    <p>{message}</p>
</div>


