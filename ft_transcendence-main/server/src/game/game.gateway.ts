import { Inject, Logger, UseGuards, forwardRef } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { AuthGuard } from 'src/auth/auth.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { Socket } from 'socket.io';
import { GameService } from './game.service';
import { GlobalTicker } from './lib/globalTicker';
import { Matchmaker } from './lib/matchmaker';
import { InviteManager } from './lib/inviteManager';

import * as JWT from "jsonwebtoken";
import { UserService } from 'src/user/user.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
	@Inject(PrismaService)
	private readonly prismaService: PrismaService;
	@Inject(forwardRef(() => GameService))
	private readonly gameService: GameService;
	@Inject(forwardRef(() => UserService))
	private readonly userService: UserService;

	private readonly logger = new Logger('GameGateway');

	@WebSocketServer() server;
	globalTicker: GlobalTicker;
	matchmaker: Matchmaker;
	inviteManager: InviteManager;

	afterInit(server: any) {
		this.globalTicker = new GlobalTicker(this.gameService, this.userService, server, 30); // 30 tps is enough
		this.matchmaker = new Matchmaker(server, 3, this.gameService, this.globalTicker); // try to make a match every 3 sec
		this.inviteManager = new InviteManager(server, this.gameService, this.globalTicker);
	}

	handleConnection(client: Socket) {
	}

	async handleDisconnect(socket: Socket) {
		this.matchmaker.removeSocket(socket);
		this.inviteManager.removeSocket(socket);
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('createInvite')
	async createInvite(@MessageBody('variation') isVariation: boolean = false, @ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);

			this.inviteManager.addInvite(socket, sender, isVariation);
			return { inviteId: sender.id }; // client should send a message with this id next
		} catch (err) {
			this.logger.log(err.message);
			return { error: err.message };
		}
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('deleteInvite')
	async deleteInvite(@ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);

			this.inviteManager.removeInvite(sender);
			return { user: sender };
		} catch (err) {
			this.logger.log(err.message);
			return { error: err.message };
		}
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('joinInvite')
	async joinInvite(@MessageBody('invite_id') invite_id: number, @ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);

			const inv = await this.inviteManager.joinInvite(socket, sender, invite_id);
			return inv;
		} catch (err) {
			this.logger.log(err.message);
			return { error: "the invite is no longer valid" };
		}
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('joinQueue')
	async joinQueue(@ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);

			this.matchmaker.addUser(socket, sender);
			return { user: sender };
		} catch (err) {
			this.logger.log(err.message);
			return { error: err.message };
		}
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('leaveQueue')
	async leaveQueue(@ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);

			this.matchmaker.removeUser(sender);
			return { user: sender };
		} catch (err) {
			this.logger.log(err.message);
			return { error: err.message };
		}
	}
	

	@UseGuards(AuthGuard)
	@SubscribeMessage('spectateGame')
	async spectateGame(@MessageBody('game_id') game_id: number, @ConnectedSocket() socket: Socket) {
		try {
			const game = this.globalTicker.getGame(game_id);

			if (!game)
				throw new Error("game does not exist");


			const data = {
				game: game.game,
				field: game.field,
				state: game.state,
				score: game.score,
				players: game.players
			}

			socket.join(game.gameServerId);
			socket.emit('openGameView', data);

			return data;
		} catch (err) {
			this.logger.log(err.message);
			return { error: err.message };
		}
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('stopSpectatingGame') // or leaveGame since it simply tells the socket server to stop receiving data about this game id
	async stopSpectatingGame(@MessageBody('game_id') game_id: number, @ConnectedSocket() socket: Socket) {
		try {
			const game = this.globalTicker.getGame(game_id);

			if (!game)
				throw new Error("game does not exist");


			const data = {
				game: game.game,
				field: game.field,
				state: game.state,
				score: game.score,
				players: game.players
			}

			socket.leave(game.gameServerId);
			return data;
		} catch (err) {
			this.logger.log(err.message);
			return { error: err.message };
		}
	}

	@UseGuards(AuthGuard)
	@SubscribeMessage('movePaddle')
	async movePaddle(@MessageBody('game_id') game_id: number, @MessageBody('direction') direction: number, @ConnectedSocket() socket: Socket) {
		try {
			const jwtPayload = JWT.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
			const sender = await this.userService.getUserById(jwtPayload["user"]["id"]);
			const game = this.globalTicker.getGame(game_id);

			if (!game)
				throw new Error("game does not exist");
			if (!game.isPlayer(sender))
				throw new Error("you are not a player in this game");
			if (direction < 0 || direction > 2)
				throw new Error("invalid direction");

			this.globalTicker.setPlayerDirection(game_id, sender, direction);
		} catch (err) {
			this.logger.log(err.message);
			return { error: err.message };
		}
	}
}