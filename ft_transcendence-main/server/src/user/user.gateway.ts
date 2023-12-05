import { forwardRef, Inject } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  WebSocketServer,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UserService } from './user.service';
import { Logger, UseGuards } from '@nestjs/common';
// import { User } from '@prisma/client';
import { AuthGuard } from 'src/auth/auth.guard';
import * as JWT from "jsonwebtoken";

// normally we do not set origin to *, is unsafe
// however here we don't really have a domain, so we do not care
@WebSocketGateway({ cors: { origin: '*', credentials: false } })
export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@Inject(forwardRef(() => UserService))
	private readonly userService: UserService;

	@WebSocketServer()
	server;

	private logger = new Logger('UserGateway');

	async handleDisconnect(socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);;

			const data = {
				user: sender,
				status: "offline"
			};

			this.server.emit('userStatus', data); // send offline status
		} catch (err) {}
	}

	@SubscribeMessage('me')
	async me(@ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const user = await this.userService.getUserById(jwtPayload["user"]["id"]); // check if user actually exists in db

			const tfa_verified = jwtPayload["tfa_verified"]; // this route doesn't have a guard so we check tfa manually

			if (!tfa_verified)
				return null;

			this.logger.log(`returning ${user}`);
			return user; // doesn't return and call callback for no reason at all but ok
		} catch (err) {
			return null;
			// return { error: err.message };
		}
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('changeName')
	async changeName(@MessageBody('username') username: string, @ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const user = await this.userService.getUserById(jwtPayload["user"]["id"]);
			const checkUser = await this.userService.getUser(username);

			if (checkUser)
				throw new Error('username is taken');
			if (username.length < 3)
				throw new Error('username length must be 3 or more characters long');

			const new_user = await this.userService.setUsername(user['id'], username);

			const data = {
				old_user: user,
				user: new_user
			}

			socket.emit('nameChanged', data); // announce name change including old and new user object
			return new_user;
		} catch (err) {
			return { error: err.message };
		}
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('setStatus')
	async setStatus(@MessageBody('status') status: string, @ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);;

			const data = {
				user: sender,
				status
			};

			this.server.emit('userStatus', data);
		} catch (err) {
			return { error: err.message };
		}
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('getUser')
	async getUser(@MessageBody('username') username: string) {
		try {
			const user = await this.userService.getUser(username);

			if (!user)
				throw new Error(`user '${username}' could not be found`);

			return user;
		} catch (err) {
			return { error: err.message };
		}
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('addFriend')
	async addFriend(@MessageBody('username') username: string, @ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);
			let user = await this.userService.getUser(username);

			if (!user) {
				user = await(this.userService.getUserByIntraName(username))
				if (!user) {
					socket.emit('messageFriend', { message: 'User does not exist' });
					throw new Error("User does not exist");
				}
			}

			if (sender['id'] == user['id']) {
				socket.emit('messageFriend', { message: 'You are already your own best friend' });
				throw new Error("User can't friend self");
			}

			const isUserBlocked = await this.userService.isUserBlocked(sender['id'], user['id']);
			if (isUserBlocked) {
				socket.emit('messageFriend', { message: 'You are already friends' });
				throw new Error("User is already friended");
			}

			const friendship = await this.userService.addFriend(sender['id'], user['id']);
			socket.emit('messageFriend', { message: 'User is added as friend' });
			return friendship;
		} catch (err) {
			return { error: err.message };
		}
	}
	
	@UseGuards(AuthGuard)
	@SubscribeMessage('getFriends')
	async getFriends(@MessageBody('username') username: string) {
		try {
			const user = await this.userService.getUser(username);
			if (!user)
				throw new Error("user does not exist");
			const friendship = await this.userService.getFriends(user['id']);
			return friendship.friends;
		} catch (err) {
			return { error: err.message };
		}
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('blockUser')
	async blockUser(@MessageBody('username') username: string, @ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);
			let user = await this.userService.getUser(username);

			if (!user) {
				user = await(this.userService.getUserByIntraName(username))
				if (!user) {
					socket.emit('statusBlock', { message: 'User does not exist' });
					throw new Error("User does not exist");
				}
			}

			if (sender['id'] == user['id']) {
				socket.emit('statusBlock', { message: 'User cant block self' });
				throw new Error("User can't block self");
			}

			const isUserBlocked = await this.userService.isUserBlocked(sender['id'], user['id']);
			if (isUserBlocked) {
				socket.emit('statusBlock', { message: 'User is already blocked' });
				throw new Error("User is already blocked");
			}

			const block = await this.userService.blockUser(sender['id'], user['id']);
			socket.emit('statusBlock', { message: 'User successfully blocked' });
			return user;
		} catch (err) {
			return { error: err.message };
		}
	}
	
	@UseGuards(AuthGuard)
	@SubscribeMessage('unblockUser')
	async unblockUser(@MessageBody('username') username: string, @ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);
			const user = await this.userService.getUser(username);

			if (!user)
				throw new Error("user does not exist");

			const unblock = await this.userService.unblockUser(sender['id'], user['id']);

			return unblock;
		} catch (err) {
			return { error: err.message };
		}
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('getBlocks')
	async getBlocks(@ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);
			const blocks = await this.userService.getBlocks(sender['id']);

			return blocks.blocked;
		} catch (err) {
			return { error: err.message };
		}
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('getSortedUsersByWins')
	async getSortedUsersByWins() {
		try {
			const sortedUsers = await this.userService.getAllUsersSortedByWins();
			return sortedUsers;
		}catch (err) {
			return { error: err.message };
		}
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('getLastThreeGames')
	async getLastThreeGames(@MessageBody('username') username: string, @ConnectedSocket() socket: Socket) {
	  	try {
			const user = await this.userService.getUser(username);
			const games = await this.userService.getLastThreeGamesOfUser(user['id']);
			return games;
	  } catch (err) {
			return { error: err.message };
	  }
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('uploadProfilePic')
	async uploadProfilePic(@MessageBody('fileName') fileName: any, @MessageBody('fileData') fileData: any,  @ConnectedSocket() socket: Socket) {
		try {
			const fs = require('fs');
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const user = await this.userService.getUserById(jwtPayload["user"]["id"]);

			const extension = fileName.split('.').pop();
			const newFileName = (Math.random() + 1).toString(36).substring(7) + '.' + extension;

			const oldPath = user['avatar'];
			if (oldPath != 'uploads/default.png')
				fs.unlinkSync(oldPath);

			const newUser = await this.userService.changeProfilePicture(user['id'], newFileName);
			fs.writeFileSync(`uploads/${newFileName}`, Buffer.from(fileData));
			socket.emit('pictureUploaded', { message: 'File uploaded successfully' });
			return newUser;
		} catch (error) {
			this.logger.error(error.message);
			socket.emit('fileUploadFailed', { message: 'File upload failed' });
		}
	}

	handleConnection(@ConnectedSocket() _socket: Socket) {
		return _socket;
	}
}