import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { PUBLIC_BACKEND_URL } from '$env/static/public';


let socket: Socket | null = null;
const serverUrl: string = PUBLIC_BACKEND_URL;

export function getSocket(): Socket {
	if (!socket)
		socket = io(serverUrl, { auth: { token: localStorage.getItem('jwt_token') }});

	return socket;
}
