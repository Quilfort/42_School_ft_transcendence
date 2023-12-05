import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger, UseGuards, Inject, forwardRef } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AuthGuard } from 'src/auth/auth.guard';
import { ChatService } from './chat.service';
import { UserService } from 'src/user/user.service';
import * as JWT from "jsonwebtoken";
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// This code defines a WebSocket gateway named ChatGateway with a WebSocket server instance.
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@Inject(forwardRef(() => ChatService))
	private readonly chatService: ChatService;
	@Inject(forwardRef(() => UserService))
	private readonly userService: UserService;

	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('ChatGateway');

	handleConnection(client: Socket) {
		// Handle connection event
		this.logger.log(`Client Connected: ${client.id}`);
	}

	handleDisconnect(client: Socket) {
		// Handle disconnect event
		this.logger.log(`Client Disconnected: ${client.id}`);
	}
	afterInit() {
		this.logger.log('Init');
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('createChannel')
	async createChannel(@MessageBody('channel_name') channel_name: string, @ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);

			if (channel_name.length < 3)
				throw new Error('channel name length cannot be less than 3 characters long');

			const channel = await this.chatService.createChannel(channel_name, sender['id']);

			socket.join(`c${channel['id']}`);

			return channel;
		} catch (error) {
			return { error: error.message };	
		}
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('setChannelPassword')
	async setChannelPassword(@MessageBody('id') channel_id: number, @MessageBody('password') password: string, @ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);
			const channel = await this.chatService.getChannelById(channel_id);
			const membership = await this.chatService.getChannelMembership(channel_id, sender['id']);

			if (!channel)
				throw new Error("channel does not exist");
			if (!membership)
				throw new Error("you are not a member");
			if (membership.role != 'OWNER')
				throw new Error("you are not the channel administrator");

			return await this.chatService.setChannelPassword(channel_id, password);
		} catch (error) {
			return { error: error.message };
		}
	}

	// subject doesn't require channel deletion
	// @UseGuards(AuthGuard)
	// @SubscribeMessage('deleteChannel')
	// async deleteChannel(@MessageBody('channel_id') channel_id: number, @ConnectedSocket() socket: Socket) {
	// 	try {
	// 		const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
	// 		const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);

	// 		const channel = await this.chatService.getChannelById(channel_id);
	// 		const membership = await this.chatService.getChannelMembership(channel_id, sender['id']);

	// 		if (!channel)
	// 			throw new Error("channel does not exist");
	// 		if (!membership)
	// 			throw new Error("you are not a member");
	// 		if (membership.role != 'OWNER')
	// 			throw new Error("you are not a channel administrator");

	// 		const deletion = await this.chatService.deleteChannel(channel_id);
	// 		// notify channel members
	// 		return deletion;
	// 	} catch (error) {
	// 		return { error: error.message };	
	// 	}
	// }

	@UseGuards(AuthGuard)
	@SubscribeMessage('getMyChannels') // we expect the client to ALWAYS send this on socket connection, this way we subscribe them to all channels they are in
	async getMyChannels(@ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);

			const channels = await this.chatService.getChannelsForUser(sender['id']);

			// join all channel rooms
			channels.forEach(channel => {
				if (!socket.rooms.has(`c${channel['channel']['id']}`))
					socket.join(`c${channel['channel']['id']}`);
			});

			return channels;
		} catch (error) {
			this.logger.log(`failure: ${error.message}`);
			return { error: error.message };	
		}
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('getMyChannelsById') // we expect the client to ALWAYS send this on socket connection, this way we subscribe them to all channels they are in
	async getMyChannelsById(@MessageBody('channel_id') channel_id: number, @ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);

			const channels = await this.chatService.getChannelForUserById(channel_id, sender['id']);

			return channels;
		} catch (error) {
			return { error: error.message };	
		}
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('getAllPublicChannels') // we expect the client to ALWAYS send this on socket connection, this way we subscribe them to all channels they are in
	async getAllPublicChannels(@ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);
			const channels = await this.chatService.getAllChannelsWithoutPassword();

			// join all channel rooms
			// channels.forEach(channel => {
			// 	if (!socket.rooms.has(`c${channel['id']}`))
			// 		socket.join(`c${channel['id']}`);
			// });

			return channels;
		} catch (error) {
			return { error: error.message };	
		}
	}


	@UseGuards(AuthGuard)
	@SubscribeMessage('getChannelMessages')
	async getChannelMessages(@MessageBody('channel_id') channel_id: number, @MessageBody('page') page: number = 0, @ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);
			const channel = await this.chatService.getChannelById(channel_id);
			const sender_membership = await this.chatService.getChannelMembership(channel_id, sender['id']);

			if (!channel)
				throw new Error("channel does not exist");
			if (!sender_membership)
				throw new Error("user is not a channel member");

			const messages = await this.chatService.getMessages(channel_id, page);

			return messages;
		} catch (error) {
			return { error: error.message };	
		}
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('isUserModerator')
	async isUserModerator(@MessageBody('channel_id') channel_id: number, @ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);
			const channel = await this.chatService.getChannelById(channel_id);
			const membership = await this.chatService.getChannelMembership(channel_id, sender['id']);

			if (!channel)
				throw new Error("channel does not exist");
			if (!membership)
				throw new Error("you are not a member");
			if (membership.role != 'OWNER' && membership.role != 'ADMINISTRATOR')
				return false;
			else
				return true;
		} catch (error) {
			return { error: error.message };	
		}
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('muteUser')
	async muteUser(@MessageBody('channel_id') channel_id: number, @MessageBody('block_user') block_user: string, @ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);
			const blockUser = await this.userService.getUser(block_user);
			const channel = await this.chatService.getChannelById(channel_id);
			const membership = await this.chatService.getChannelMembership(channel_id, sender['id']);
			const userMembership = await this.chatService.getChannelMembership(channel_id, blockUser['id']);

			if (!channel)
				throw new Error("channel does not exist");
			if (!membership)
				throw new Error("you are not a member");
			if (!userMembership)
				throw new Error("user you are trying to mute is not a member of this channel");
			if (membership.role != 'OWNER' && membership.role != 'ADMINISTRATOR')
				throw new Error("you are not a channel administrator");

			const new_status = await this.chatService.changeRole(channel_id, blockUser['id'], 'MUTED');

			const message = {
				channel_id: channel['id'],
				content: `${blockUser['name']} has been muted by ${sender['name']}`
			};
			// notify members
			socket.join(`c${channel['id']}`);
			this.server.to(`c${channel['id']}`).emit('mute', message);

			return new_status;
		} catch (error) {
			return { error: error.message };	
		}
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('unmuteUser')
	async unmuteUser(@MessageBody('channel_id') channel_id: number, @MessageBody('user') block_user: string, @ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);
			const blockUser = await this.userService.getUser(block_user);
			const channel = await this.chatService.getChannelById(channel_id);
			const membership = await this.chatService.getChannelMembership(channel_id, sender['id']);
			const userMembership = await this.chatService.getChannelMembership(channel_id, blockUser['id']);

			if (!channel)
				throw new Error("channel does not exist");
			if (!membership)
				throw new Error("you are not a member");
			if (!userMembership)
				throw new Error("user you are trying to unmute is not a member of this channel");
			if (membership.role != 'OWNER' && membership.role != 'ADMINISTRATOR')
				throw new Error("you are not a channel administrator");

			const new_status = await this.chatService.changeRole(channel_id, blockUser['id'], 'MEMBER');

			const message = {
				channel_id: channel['id'],
				content: `${blockUser['name']} has been unmuted by ${sender['name']}`
			};

			// The reason we need to use socket.join() in our function here is because we are emitting the 'mute' event 
			// to a specific room (c${channel['id']}) using socket.to(c${channel['id']}).emit('mute', message);. 
			// In order for this to work, the client must be a member of that room, and the room must exist. socket.join() 
			// is used to add the client to the specified room, and it's a necessary step to ensure that the client receives 
			// events specific to that room.
			socket.join(`c${channel['id']}`);
			// notify members
			this.server.to(`c${channel['id']}`).emit('mute', message);

			return new_status;
		} catch (error) {
			return { error: error.message };	
		}
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('getMutedUsers')
	async getMutedUsers(@MessageBody('channel_id') channel_id: number, @MessageBody('user') block_user: string, @ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);
			const blockUser = await this.userService.getUser(block_user);
			const channel = await this.chatService.getChannelById(channel_id);
			const membership = await this.chatService.getChannelMembership(channel_id, sender['id']);
			const userMembership = await this.chatService.getChannelMembership(channel_id, blockUser['id']);

			if (!channel)
				throw new Error("channel does not exist");
			if (!membership)
				throw new Error("you are not a member");
			if (!userMembership)
				throw new Error("user you are trying to mute is not a member of this channel");

			const muted_users = await this.chatService.getMutedUsers(channel_id, blockUser['id'], 'MUTED');

			return muted_users;
		} catch (error) {
			return { error: error.message };	
		}
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('changeRole')
	async changeRole(@MessageBody('channel_id') channel_id: number, @MessageBody('username') username: string, @MessageBody('role') role: Role, @ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);

			const channel = await this.chatService.getChannelById(channel_id);
			const user = await this.userService.getUser(username);
			const sender_membership = await this.chatService.getChannelMembership(channel_id, sender['id']);
			const membership = await this.chatService.getChannelMembership(channel_id, user['id']);

			if (!channel)
				throw new Error("channel does not exist");
			if (!user)
				throw new Error("specified user does not exist");
			if (sender_membership.role != 'ADMINISTRATOR' && sender_membership.role != 'OWNER')
				throw new Error("you are not a channel administrator");
			if (membership.role == 'OWNER')
				throw new Error("you cannot promote someone to the channel owner");

			const new_membership = await this.chatService.changeRole(channel_id, user['id'], role);
			
			const message = {
				channel_id: channel['id'],
				content: `${user['name']} ( ${user['id']} ) received role ${role}`
			};

			this.server.to(`c${channel['id']}`).emit('role', message);

			return new_membership;
		} catch (error) {
			return { error: error.message };
		}
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('inviteMember')
	async inviteMember(@MessageBody('channel_id') channel_id: number, @MessageBody('username') username: string, @ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);

			const channel = await this.chatService.getChannelById(channel_id);
			const user = await this.userService.getUser(username);
			const sender_membership = await this.chatService.getChannelMembership(channel_id, sender['id']);
			
			if (!channel)
				throw new Error("channel does not exist");
			if (!user)
				throw new Error("specified user does not exist");

			const membership = await this.chatService.getChannelMembership(channel_id, user['id']);

			if (sender_membership.role != 'ADMINISTRATOR' && sender_membership.role != 'OWNER')
				throw new Error("you are not a channel administrator");
			if (membership)
				throw new Error("user is already a channel member");

			const new_membership = await this.chatService.inviteMember(channel_id, user['id']);

			const message = {
				invited: user['id'],
				channel: channel
			};

			// notify invited member , this notifies everyone but boeie
			this.server.emit('invite', message);

			return new_membership;
		} catch (error) {
			return { error: error.message };
		}
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('joinChannel')
	async joinChannel(@MessageBody('channel_id') channel_id: number, @MessageBody('password') password: string = null, @ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);

			const channel = await this.chatService.getChannelById(channel_id);
			const sender_membership = await this.chatService.getChannelMembership(channel_id, sender['id']);

			if (!channel)
				throw new Error("channel does not exist");
			if (sender_membership && sender_membership.role == 'BANNED')
				throw new Error('you are banned from this channel');
			if (sender_membership && sender_membership.role != 'INVITED')
				throw new Error("already a member");
			if (channel.password)
			{
				if (password == null && !sender_membership)
					throw new Error("no password specified and user is not invited");
				if (password == null)
					throw new Error("no password specified");

				const match = await bcrypt.compare(password, channel.password);
				if (!match)
					throw new Error("invalid password");
			}

			let new_membership;

			if (sender_membership)
				new_membership = await this.chatService.changeRole(channel_id, sender['id'], Role.MEMBER);
			else
				new_membership = await this.chatService.addUserToChannel(channel_id, sender['id']);
			
			const message = {
				channel_id: channel['id'],
				membership: new_membership
			}

			socket.join(`c${channel['id']}`);
			this.server.to(`c${channel['id']}`).emit('join', message);

			return new_membership;
		} catch (error) {
			return { error: error.message };
		}
	}


	@UseGuards(AuthGuard)
	@SubscribeMessage('sendMessage')
	async sendMessage(@MessageBody('channel_id') channel_id: number, @MessageBody('content') content: string, @ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);

			const channel = await this.chatService.getChannelById(channel_id);
			const sender_membership = await this.chatService.getChannelMembership(channel_id, sender['id']);

			if (!channel)
				throw new Error("channel does not exist");
			if (!sender_membership)
				throw new Error("you are not a member");
			if (sender_membership.role == 'BANNED')
				throw new Error("you are banned from talking in this channel");
			if (sender_membership.role == 'MUTED')
				throw new Error("you are currently muted in this channel");
			if (sender_membership.role == 'INVITED')
				throw new Error("you have to join this channel first before being able to send messages");
			if (content.length == 0)
				throw new Error("you cannot send empty messages");

			const message = await this.chatService.sendMessage(channel['id'], sender['id'], content);

			// notify channel members
			this.server.to(`c${channel['id']}`).emit('message', message);

			return message; // this returns the message to the sender but should be rendered since the message will be broadcasted to all members causing the msg to be rendered twice on the senders screen
		} catch (error) {
			return { error: error.message };
		}
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('connectToChannel') // all this does is tell the server to join the room server side, only really needed for createDMs receiving end
	async connectToChannel(@MessageBody('channel_id') channel_id: number, @ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);
			const channel = await this.chatService.getChannelById(channel_id);
			const sender_membership = await this.chatService.getChannelMembership(channel_id, sender['id']);

			if (!channel)
				throw new Error("channel does not exist")
			if (!sender_membership)
				throw new Error("you are not a channel member")
			if (sender_membership.role == 'BANNED')
				throw new Error("you are banned from this channel");

			socket.join(`c${channel['id']}`);
			return channel;
		} catch (error) {
			return { error: error.message };
		}
	}


	@UseGuards(AuthGuard)
	@SubscribeMessage('createDM')
	async createDM(@MessageBody('user_id') user_id: number, @ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);
			const user = await this.userService.getUserById(user_id);
			let channel;
			
			if (!user)
				throw new Error("user does not exist");

			channel = await this.chatService.getDM(sender['id'], user['id']);
			if (!channel)
				channel = await this.chatService.makeDM(sender['id'], user['id']);

			const message = {
				users: [user['id'], sender['id']],
				channel
			};

			// socket.join(`c${channel['id']}`);
			this.server.emit('dm', message); // announce a dm has been created (globally lol) , this should trigger a connectToChannel on the clientside
			// the client should check if their id in the users array. if so, connectToChannel(channel)
			return channel;
		} catch (error) {
			return { error: error.message };
		}
	}

	

	@UseGuards(AuthGuard)
	@SubscribeMessage('kickUser')
	async kickUser(@MessageBody('channel_id') channel_id: number, @MessageBody('username') username: string, @ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);

			const channel = await this.chatService.getChannelById(channel_id);
			const user = await this.userService.getUser(username);
			const sender_membership = await this.chatService.getChannelMembership(channel_id, sender['id']);
			const membership = await this.chatService.getChannelMembership(channel_id, user['id']);

			if (!channel)
				throw new Error("channel does not exist");
			if (!user)
				throw new Error("specified user does not exist");
			if (sender_membership.role != 'ADMINISTRATOR' && sender_membership.role != 'OWNER')
				throw new Error("you are not a channel administrator");
			if (membership.role == 'OWNER')
				throw new Error("you cannot promote someone to the channel owner");

			const new_membership = await this.chatService.removeMembership(channel_id, user['id']);
			
			const message = {
				channel_id: channel['id'],
				user_id: user.id,
				content: `${user['name']} ( ${user['id']} ) has been kicked`
			};

			this.server.to(`c${channel['id']}`).emit('kick', message);

			return new_membership;
		} catch (error) {
			return { error: error.message };
		}
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('banUser')
	async banUser(@MessageBody('channel_id') channel_id: number, @MessageBody('username') username: string, @ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);

			const channel = await this.chatService.getChannelById(channel_id);
			const user = await this.userService.getUser(username);
			const sender_membership = await this.chatService.getChannelMembership(channel_id, sender['id']);
			const membership = await this.chatService.getChannelMembership(channel_id, user['id']);

			if (!channel)
				throw new Error("channel does not exist");
			if (!user)
				throw new Error("specified user does not exist");
			if (sender_membership.role != 'ADMINISTRATOR' && sender_membership.role != 'OWNER')
				throw new Error("you are not a channel administrator");
			if (membership.role == 'OWNER')
				throw new Error("you cannot promote someone to the channel owner");

			const new_membership = await this.chatService.changeRole(channel_id, user['id'], Role.BANNED);

			const message = {
				channel_id: channel['id'],
				user_id: user.id,
				content: `${user['name']} ( ${user['id']} ) has been banned`
			};

			this.server.to(`c${channel['id']}`).emit('ban', message);

			return new_membership;
		} catch (error) {
			return { error: error.message };
		}
	}
}
