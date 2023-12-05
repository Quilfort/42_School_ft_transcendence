import { 
  channelStore, 
  mutedUserInChannel,
  mutedUsers, 
  publicChannelStore, 
  singleChannelStore 
} from "$lib/stores/channelStore";
import { getSocket } from "./sockets";


async function getAllPublicChannels() {
  const socket = getSocket();

  socket.emit('getAllPublicChannels', (res: any) => {
    publicChannelStore.set({ data: res, loading: false });
  })
}


/**
 * 
 * @param token 
 * The Jsonwebtoken it needs for the AuthGuard()
 * 
 * @returns All the channels you are part of!
 */
async function getMyChannels() {
  const socket = getSocket();

  socket.emit('getMyChannels', (res: any) => {
    channelStore.set({ data: res, loading: false });
  });
}

async function getMyChannelById(channel_id: number) {
  const socket = getSocket();

  socket.emit('getMyChannelsById', { channel_id }, (res: any) => {
    singleChannelStore.set({ data: res, gotoChat: true, loading: false});
  })
}

async function addUserToChannel(channel_id: number, username: string) {
  try {
    const socket = getSocket();

    socket.emit('addUserToChannel', { channel_id, username }, (res: any) => {
      console.log(res);
    });
  } catch (error) {
    console.log("Error adding user to channel", error);
  }
}

async function joinChannel(channel_id: number, channel_name: string, password: string | null) {
  const socket = getSocket();

  return new Promise((resolve, _) => {
    socket.emit('joinChannel', { channel_id, password }, (res: any) => {
      if ("error" in res) {
        resolve(false);
      } else {
        channelStore.update((state: any) => {
          const newState = { ...state };
          newState.data.push({
            role: res.role,
            user_id: res.user_id,
            channel_id,
            channel: {
                id: channel_id,
                name: channel_name,
            },
          });
          return newState;
        })
        resolve(true);
      }
    })
  })

}

async function createChannel(channel_name: string): Promise<any> {
	const socket = getSocket();

	return new Promise((resolve, _) => {
	  socket.emit('createChannel', { channel_name }, (newChannel: any) => {
			if ("error" in newChannel)
				return resolve(newChannel);
			channelStore.update((channels: any) => {
				const updatedChannels = [...channels.data, { role: "OWNER", channel: newChannel }];
				return ({ ...channels, data: updatedChannels });
			});
			resolve(true);
		});
	})
}

async function deleteChannel(channel_id: number) {
  const socket = getSocket();

  socket.emit('deleteChannel', channel_id)
}

async function changePassword(channel_id: number, password: string) {
  const socket = getSocket();

  socket.emit('setChannelPassword', channel_id, { password }, (res: any) => {
    console.log(res);
  })
}

function isUserModerator(channel_id: number) {
  const socket = getSocket();

  socket.emit('isUserModerator', { channel_id }, (res: any) => {
    return (res);
  })
  return false;
}

// Change the channel setChannelPassword function in chat.service.ts later to
// *
// const hashed = password != null ? await bcrypt.hash(password, 12) : null;
// *
// Like that you can remove the channel password later on :)
async function setChannelPassword(id: number, password: string | null) {
  const socket = getSocket();

  socket.emit('setChannelPassword', { id, password });
}

async function sendMessage(channel_id: number, content: string): Promise<any> {
  const socket = getSocket();

  return new Promise((resolve, _) => {
	  socket.emit('sendMessage', { channel_id, content }, (res: any) => {
		resolve(res);
	  })
  })
}

// Gonna need to make a mutedUsersList in server to get all muted users from certain channel
async function getMutedUserList(channel_id: number, user: string) {
  const socket = getSocket();

  socket.emit("getMutedUsers", { channel_id, user }, (res: any) => {
    mutedUsers.set({ data: res, loading: false });
  })
}

async function muteUser(channel_id: number, block_user: string) {
  const socket = getSocket();

  socket.emit('muteUser', { channel_id, block_user }, (res: any) => {
    mutedUserInChannel.set({ data: res, loading: false });
    mutedUsers.update((state: any) => {
      return { ...state, data: [...state.data, res] };
    })
  })
}

async function unmuteUser(channel_id: number, user: string) {
  const socket = getSocket();

  socket.emit('unmuteUser', { channel_id, user }, (res: any) => {
    mutedUsers.update((state: any) => {
      const newState = { ...state };

      const updatedList = newState.data.filter((u: any) => u.user_id !== res.user_id);
      return updatedList;
    })
  });
}

async function changeRole(channel_id: number, username: string) {
  const socket = getSocket();

  socket.emit('changeRole', { channel_id, username }, (res: any) => {
    console.log(res);
  })
}

async function inviteMember(channel_id: number, username: string) {
  const socket = getSocket();

  console.log("The channel id:", channel_id, "and the username:", username);
  socket.emit('inviteMember', { channel_id, username }, (res: any) => {
    console.log(res);
  })
}

async function createDM(user_id: number) {
  const socket = getSocket();

  socket.emit("createDM", { user_id }, (res: any) => {
    console.log(res);
  })
}

async function kickUser(channel_id: number, username: string) {
  const socket = getSocket();

  socket.emit("kickUser", { channel_id, username }, (res: any) => {
    console.log(res);
  })
}

async function banUser(channel_id: number, username: string) {
  const socket = getSocket();

  socket.emit("banUser", { channel_id, username }, (res: any) => {
    console.log(res);
  })
}

async function promoteUser(channel_id: number, username: string) {
  const socket = getSocket();

  socket.emit("changeRole", { channel_id, username, role: 'ADMINISTRATOR' }, (res: any) => {
    console.log(res);
  })
}

export {
  getMyChannels, getMyChannelById, joinChannel, addUserToChannel, createChannel, deleteChannel,
  changePassword, isUserModerator, setChannelPassword, sendMessage, muteUser, unmuteUser, changeRole,
  inviteMember, getAllPublicChannels, getMutedUserList, createDM, kickUser, banUser, promoteUser
}