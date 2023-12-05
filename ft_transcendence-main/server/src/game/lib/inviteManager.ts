// import { GameState, Direction } from './gameState';
import { Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import { WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';

import { GameService } from './../game.service';
import { GlobalTicker } from './../lib/globalTicker';


class Entry {
	socket: Socket;
	user: User;
	variation: boolean;

	constructor (socket: Socket, user: User, variation: boolean) {
		this.socket = socket;
		this.user = user;
		this.variation = variation;
	}
}

export class InviteManager {
    invites: { [uid: number]: Entry };

	@WebSocketServer() server;
	logger: Logger;
	matchmakeDelay: number;
	gameService: GameService;
	globalTicker: GlobalTicker;

    constructor (server: any, gameService: GameService, globalTicker: GlobalTicker) {
		this.server = server;
		this.logger = new Logger('InviteManager');
		this.invites = {};
		this.gameService = gameService;
		this.globalTicker = globalTicker;
    }

	addInvite = (socket: Socket, user: User, isVariation: boolean = false) => {
		this.logger.log(`adding user ${user.name} to invite manager`);
		if (this.hasInvite(user))
			throw new Error("user is already in invite manager");

		const entry = new Entry(socket, user, isVariation);
		this.invites[user['id']] = entry;
	}

	hasInvite = (user: User) => {
		for (const uid in this.invites) {
			if (uid == user['id'].toString())
				return true;
		}
		return false;
	}

	hasInviteId = (id: number) => {
		for (const uid in this.invites) {
			if (uid == id.toString())
				return true;
		}
		return false;
	}

	removeInvite = (user: User) => {
		this.logger.log(`removing user ${user.name} from invite manager`);
		delete this.invites[user['id']];
	}

	removeSocket = (socket: Socket) => { // doesn't work yet
		this.logger.log(`removing user by socket ${socket.id} from invite manager`);
		for (const uid in this.invites) {
			const invite = this.invites[uid];
			if (invite.socket.id == socket.id)
				delete this.invites[uid];
		}
		this.logger.log(`removed user by socket ${socket.id} from invite manager`);
	}

	joinInvite = async (socket: Socket, user: User, id: number) => {
		if (!this.hasInviteId(id)) {
			throw new Error('invite does not exist');
		}
		const entry = this.invites[id];
		if (user['id'] == entry['user']['id']) {
			throw new Error('why u join ur own invite?')
		}
		this.removeInvite(entry['user']); // make sure joined invite is deleted
		this.removeInvite(user); // make sure joiner has no invites open anymore

		try {
			const game = await this.gameService.createGame(entry.user['id'], user['id']);
			const tickerGame = this.globalTicker.registerGame(game, entry.user, user, entry.variation);

			socket.join(tickerGame.gameServerId);
			entry.socket.join(tickerGame.gameServerId);

			const data = {
				game: tickerGame.game,
				field: tickerGame.field,
				state: tickerGame.state,
				score: tickerGame.score,
				players: tickerGame.players
			}

			this.server.emit('gameCreated', data);
			this.server.to(tickerGame.gameServerId).emit('openGameView', data);
			return data;
		} catch (err) {
			this.logger.log(`joinInvite() : ${err.message}`);
			throw new Error(err);
		}
	}

	// CheckInvite = async () => {
	// 	if (this.queue.length < 2) return setTimeout(() => { this.makematch(); }, this.matchmakeDelay);

	// 	this.logger.log(`queue has ${this.queue.length} users, making match`);

	// 	try {
	// 		const entry_1 = this.queue.pop();
	// 		const entry_2 = this.queue.pop();

	// 		const game = await this.gameService.createGame(entry_1.user.id, entry_2.user.id);
	// 		const tickerGame = this.globalTicker.registerGame(game, entry_1.user, entry_2.user);

	// 		entry_1.socket.join(tickerGame.gameServerId);
	// 		entry_2.socket.join(tickerGame.gameServerId);

	// 		const data = {
	// 			game: tickerGame.game,
	// 			field: tickerGame.field,
	// 			state: tickerGame.state,
	// 			score: tickerGame.score,
	// 			players: tickerGame.players
	// 		}

	// 		this.server.emit('gameCreated', data);
	// 		this.server.to(tickerGame.gameServerId).emit('openGameView', data);
	// 	} catch (err) {
	// 		this.logger.log(`makematch() : ${err.message}`);
	// 	}

	// 	setTimeout(() => { this.makematch(); }, this.matchmakeDelay); // could be less than 0, when i < 0, setTimeout uses 1ms as default
	// }
}

export default InviteManager