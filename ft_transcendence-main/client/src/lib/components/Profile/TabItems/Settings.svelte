<script lang="ts">
  import {Input, Fileupload, Label, Helper, Button, Card, Modal} from 'flowbite-svelte';
  import { changeName } from '$lib/functions/user';
  import { goto } from '$app/navigation';
  import { getSocket } from "$lib/functions/sockets";
  import { userStore } from '$lib/stores/userStore';

  export let user: any;

  let correctName: boolean = true;
  let note: string = "";
  let showNote: boolean = false;

  let username: string = user.name;
  let newUsername = username;
  let newUser: any


  function checkString() {
    const regex = /^[a-zA-Z0-9-]+$/;
    if (regex.test(newUsername) == false || newUsername.length > 30)
      return false;
    return true;
  }

  function showNotification(message: string) {
    note = message;
    showNote = true;
    correctName = false;
  }

  const handleChangeName = async () => {
      correctName = checkString();
      if (correctName) {
        newUser = await changeName(newUsername);
		if ("error" in newUser)
			showNotification(newUser['error']);
		else
			goto(`/profile/${newUsername}`);
      } else {
			showNotification("Username can only contain numbers and letters and be max 30 characters long.");
      }
  }

    let selectedFile: any = null;
    let statusPicture: string = '';
    let fileName: string;
    let fileData: any
    const socket = getSocket()

  const handleFileChange = (event: any) => {
    selectedFile = event.target.files[0];
  };

  const handleUpload = () => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event: any ) => {
        fileData = event.target.result; 
        fileName = selectedFile.name;
        if (fileName.slice(-4) == ".png" || fileName.slice(-4) == ".jpg" || fileName.slice(-5) == ".jpeg") {
          socket.emit('uploadProfilePic', {fileName, fileData}, (res:any) => {
            userStore.set({ user: res, loading: false });
          });
        }
        else {
          statusPicture = "Profile picture must be '.png', '.jpeg' or '.jpg'"
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  socket.on('pictureUploaded', (data) => {
    statusPicture = data.message;
  });

</script>

{#if correctName}
  <Card padding="xl" size="xl">
    <form on:submit|preventDefault={handleUpload}>
      <div>
        <p class="text-sm text-gray-500 dark:text-gray-400">
            <b>Profile Picture:</b>
            <Label for="with_helper" class="pb-2">Upload file</Label>
            <Fileupload id="with_helper" class="mb-2" on:change={handleFileChange} />
            <Helper>
              Image must be PNG, JPEG or JPG.
            </Helper>
        </p>
        <div class="mt-2">
          <Button color="dark" type="submit">Change Profile Picture</Button>
        </div>
      </div>
    </form>
    <div class="text-black mt-2">{statusPicture}</div>
  </Card>

  <Card padding="xl" size="xl" class="mt-4">
    <form on:submit|preventDefault={handleChangeName}>
      <div>
        <p class="text-sm text-gray-500 dark:text-gray-400">
            <Label class="block space-y-2">
            <b>Username:</b>
            <Input type="text" id="name" bind:value={newUsername} />
              <Helper class="text-sm">
                You can change your Username.
              </Helper>
            </Label>
        </p>
        <div class="mt-4">
          <Button outline={true} color="dark" type="submit">Change Username</Button>
        </div>
      </div>
    </form>
  </Card>
{:else}
  <Modal bind:open={showNote} size="xs" autoclose>
    <div class="text-center">
      <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">{note}</h3>
      <Button color="red" class="mr-2" on:click={() => (correctName = true, showNote = false)}>Back</Button>
    </div>
  </Modal>
{/if}
