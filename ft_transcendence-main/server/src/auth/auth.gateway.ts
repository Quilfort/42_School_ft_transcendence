import { forwardRef, Inject } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  WebSocketServer,
} from '@nestjs/websockets';
import { authenticator } from 'otplib';
import { Socket } from 'socket.io';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { Logger } from '@nestjs/common';
// import { User } from '@prisma/client';
import * as JWT from 'jsonwebtoken';
import fetch from "node-fetch";
import * as dotenv from 'dotenv';
import { toDataURL } from 'qrcode';


dotenv.config();

// normally we do not set origin to *, is unsafe
// however here we don't really have a domain, so we do not care
@WebSocketGateway({ cors: { origin: '*', credentials: false } })
export class AuthGateway implements OnGatewayConnection {
	@Inject(forwardRef(() => AuthService))
	private readonly authService: AuthService;
	@Inject(forwardRef(() => UserService))
	private readonly userService: UserService;

	@WebSocketServer()
	server;

	private logger = new Logger('AuthGateway');


	@SubscribeMessage('hasTfa')
	async hasTfa(@ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserWithToken(jwtPayload["user"]["id"]);

			return sender['tfa_token'] != null;
		} catch (err) {
			return { error: err.toString() }
		}
	}


	@SubscribeMessage('generateSecret')
	async generateSecret(@ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);

			const secret = authenticator.generateSecret();
			const uri = authenticator.keyuri(String(sender['id']), 'pong', secret);
			const image = await toDataURL(uri);

			const obj = { secret, image };
			
			return obj;
		} catch (err) {
			return { error: err.toString() }
		}
	}
	
	@SubscribeMessage('addTfa')
	async addTfa(@MessageBody('secret') secret: string, @MessageBody('token') token: string, @ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);
	
			if (!authenticator.verify({token, secret}))
				throw new Error("secret does not match the token provided");

			return await this.authService.register2FA(sender['id'], secret); // success
		} catch (err) {
			this.logger.log(err);
			return { error: err.toString() }
		}
	}

	@SubscribeMessage('removeTfa')
	async removeTfa(@ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);
	
			return await this.authService.remove2FA(sender['id']); // success
		} catch (err) {
			this.logger.log(err);
			return { error: err.toString() }
		}
	}

	@SubscribeMessage('verifyTfa')
	async verifyTfa(@MessageBody() token: string, @ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const user_token = await this.userService.getUserWithToken(jwtPayload["user"]["id"]);
			const secret = user_token["tfa_token"]["tfa_token"];
	
			if (!authenticator.verify({token, secret}))
				return false;

			const user = await this.userService.getUserById(jwtPayload["user"]["id"]);

			const jwt_data = {
				user: user,
				tfa_verified: true
			}

			const jwtToken = JWT.sign(jwt_data, process.env.JWT_SECRET, { expiresIn: process.env.JWT_DURATION });
			socket.handshake.auth = { token: jwtToken };
			return {
				token: jwtToken,
				user: user
			}; 
		} catch (err) {
			this.logger.log(err);
			return { error: err.toString() }
		}
	}

	@SubscribeMessage('authenticateUser')
	async authenticateUser(@MessageBody() token: string, @ConnectedSocket() socket: Socket) {
		try {
			const body = new URLSearchParams({
				grant_type: "authorization_code",
				client_id: process.env.INTRA_API_UID,
				client_secret: process.env.INTRA_API_SECRET,
				code: token,
				state: '',
				redirect_uri: process.env.INTRA_REDIRECT_URL
			});

			const res = await fetch("https://api.intra.42.fr/oauth/token", {
				method: "POST",
				body,
				headers: {
					"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
				}
			});

			if (!res.ok) {
				this.logger.log(`authentication failed: ${res.status} : ${res.statusText}`);
				return { error: res.statusText }
			}

			const authRes = await res.json();
			this.logger.log(`authRes: ${authRes}`);
		
			const userRes = await fetch("https://api.intra.42.fr/v2/me", {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${authRes["access_token"]}`,
					"Content-Type": "application/json"
				}
			});

			const userJson = await userRes.json();
			const user = await this.userService.getUserByIntraId(userJson['id']);

			if (!user)
				this.logger.log(`user ${userJson['login']} does not exist yet`);
			else
				this.logger.log(`user ${userJson['login']} already exists`);
			

			const genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

			let username = userJson['login'];
			let existing = null;
			existing = await this.userService.getUser(username);
			while (existing)
			{
				username = `${userJson['login']}_${genRanHex(8)}`;
				existing = await this.userService.getUser(username);
			}

			const ourUser = await this.userService.create(userJson['id'], username, userJson['login']);
			// const ourUser = await this.userService.create(userJson['id'], userJson['login'] + '-Pong', userJson['login']);
			const tfaEnabled = ourUser.tfa_token != null;
			delete ourUser.tfa_token; // exclude the actual tfa token


			const jwt_data = {
				user: ourUser,
				tfa_verified: !tfaEnabled
			}

			const jwtToken = JWT.sign(jwt_data, process.env.JWT_SECRET, { expiresIn: process.env.JWT_DURATION });
			socket.handshake.auth = { token: jwtToken };

			if (tfaEnabled)
				return {"error": "please verify your 2fa token"};

			return {
				token: jwtToken,
				user: ourUser
			}; 
		} catch (err) {
			this.logger.log(err);
			return { error: err.message }
		}
	}

	handleConnection(@ConnectedSocket() _socket: Socket) {
		return _socket;
	}
}
