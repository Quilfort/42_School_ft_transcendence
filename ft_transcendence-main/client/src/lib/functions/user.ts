import { getSocket } from "./sockets";
import userFind from '$lib/stores/userFind';
import { userStore } from '$lib/stores/userStore';
import { blockedUsers } from "$lib/stores/userStore";
import { friendUsers } from "$lib/stores/userStore";

async function getUser(username: string) {
	return new Promise((resolve, reject) => {
		const socket = getSocket();

		socket.emit('getUser', { username }, (res: any) => {
			if ("error" in res) {
				userFind.set({ user: null, loading: false });
				return;
			}
			userFind.set({ user: res, loading: false });
			resolve(res);
		});
	});
}

function addFriend(username: string) {
	const socket = getSocket();

	socket.emit('addFriend', { username }, (user: any) => {
		if ("error" in user) {
			console.error("Error:", user);
		} else {
			friendUsers.update((state: any) => {
				const newState = { ...state };
				newState.friendUsers.push({
				name: username
				});
			return newState;
			});
		}
	});
}

// Blocked user functions
async function getBlockedUsers() {
	const socket = getSocket();

	socket.emit('getBlocks', (res: any) => {
		blockedUsers.set({ blockedUsers: res, loading: false, blocked: true })
	})
}

async function blockUser(username: string) {
	const socket = getSocket();

	socket.emit('blockUser', { username }, (res: any) => {
		console.log('bloc', res);
		if ("error" in res) {
			console.log("Error:", res);
		} else {
			blockedUsers.update((state: any) => {
				const newState = { ...state };
				newState.blockedUsers.push(res);
			return newState;
			});
		}
	});
}

// blockedUsers
async function unblockUser(username: string) {
  const socket = getSocket();

  socket.emit("unblockUser", { username }, (res: any) => {
		if ("error" in res) {
				console.error("Error:", res);
		} else {
			blockedUsers.update((state: any) => {
			const newState = { ...state };
			const updatedUserList = newState.blockedUsers.filter((user: any) => user.name !== username);
			return { ...state, blockedUsers: updatedUserList};
			});
		}
  });
}

async function changeName(username: string) {
	return new Promise((resolve, reject) => {
		const socket = getSocket();
		socket.emit('changeName', { username }, (res: any) => {
			if ("error" in res) {
				return resolve(res); // return to prevent userstore from being written to
			}
			userStore.set({ user: res, loading: false });
			resolve(res);
		});
	});
}

async function getFriends(username: string) {
	const socket = getSocket();

	socket.emit('getFriends', { username },  (res: any) => {
		friendUsers.set({ friendUsers: res, loading: false, friends: true })
	})
}

export { getUser, blockUser, unblockUser, getBlockedUsers, changeName, getFriends, addFriend}