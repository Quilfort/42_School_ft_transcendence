import { goto } from '$app/navigation';
import { PUBLIC_INTRA_API_UID, PUBLIC_INTRA_REDIRECT_URL } from '$env/static/public';
import { fetchToken } from '$lib/stores/token';
import { userStore } from '$lib/stores/userStore';
import { getSocket } from './sockets';

const handleLogin = async () => {
	const params = new URLSearchParams({
		client_id: PUBLIC_INTRA_API_UID,
		redirect_uri: PUBLIC_INTRA_REDIRECT_URL,
		response_type: "code",
		scope: "public"
	})
	goto(`https://api.intra.42.fr/oauth/authorize?${params.toString()}`, {
		replaceState: true
	});
}

const handleLogout = (isUserLoggedIn: boolean) => {
	localStorage.removeItem("jwt_token");
	localStorage.removeItem("user");
	localStorage.removeItem('messageSend');
	isUserLoggedIn = false;

	userStore.set({ user: null, loading: false})

	getSocket().disconnect();
}

const sendAuthMessage = (message: string, name: any) => {
	if (name) {
		alert(`${message}: ${JSON.stringify(name)}`);
		return;
	}

	alert(`${message}`);
	return;
}

async function getAuthenticatedUser() {
	const isMessageSend = localStorage.getItem("messageSend") === "send";
	
	const socket = getSocket();

	// return new Promise((resolve) => {
		socket.emit('me', (user: any) => { // for some reason, the callback does not get called so we handle the error through an exception event
			if (user == null)
			{
				localStorage.removeItem('jwt_token');
				localStorage.removeItem('messageSend');
				handleLogin();
				return;
			} else if (!isMessageSend) {
				localStorage.setItem('messageSend', "send");
				sendAuthMessage('welcome', user.name);
			}
			userStore.set({ user: user, loading: false });
		});
	// })
}

async function hasTFA(): Promise<boolean> {
	const socket = getSocket();

	return new Promise((resolve, _) => {
		socket.emit('hasTfa', (res: boolean) => {
			resolve(res);
		});
	});
}

async function generateSecret(): Promise<any> {
	const socket = getSocket();

	return new Promise((resolve, _) => {
		socket.emit('generateSecret', (res: object) => {
			resolve(res);
		});
	});
}

async function enableTFA(secret: string, token: string): Promise<any> {
	const socket = getSocket(); 

	return new Promise((resolve, _) => {
		socket.emit('addTfa', {secret, token}, (res: any) => {
			resolve(res);
		})
	})
}

async function disableTFA(): Promise<any> {
	const socket = getSocket(); 

	return new Promise((resolve, _) => {
		socket.emit('removeTfa', (res: any) => {
			resolve(res);
		})
	})
}

const verifyTfa = (socket: any) => {
	const tfa = prompt('what is ur tfa token?');
					
	socket.emit('verifyTfa', tfa, (res: any) => {
		if (res instanceof Object && "error" in res)
			sendAuthMessage('error in tfa, try again', null);
		else if (res == false)
			sendAuthMessage('invalid tfa token, try again', null);
		else
		{
			localStorage.setItem('jwt_token', res['token']);
			localStorage.setItem('user', JSON.stringify(res['user']));
			localStorage.setItem('messageSend', "send");
			sendAuthMessage('welcome', res.name);
			fetchToken();
			return;
		}
		verifyTfa(socket);
	})
}

export { generateSecret, hasTFA, handleLogin, handleLogout, sendAuthMessage, getAuthenticatedUser, enableTFA, verifyTfa, disableTFA };