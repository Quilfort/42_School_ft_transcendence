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

	constructor (socket: Socket, user: User) {
		this.socket = socket;
		this.user = user;
	}
}

export class Matchmaker {
    queue: Entry[];

	@WebSocketServer() server;
	logger: Logger;
	matchmakeDelay: number;
	gameService: GameService;
	globalTicker: GlobalTicker;

    constructor (server: any, matchmakeDelay: number, gameService: GameService, globalTicker: GlobalTicker) {
		this.server = server;
		this.logger = new Logger('Matchmaker');
		this.queue = [];
		this.gameService = gameService;
		this.globalTicker = globalTicker;
		
        this.matchmakeDelay = matchmakeDelay * 1000;
		this.makematch();
    }

	addUser = (socket: Socket, user: User) => {
		this.logger.log(`adding user ${user.name} to matchmake queue`);
		if (this.hasUser(user))
			throw new Error("user is already in queue");

		const entry = new Entry(socket, user);
		this.queue.unshift(entry);
	}

	hasUser = (user: User) => {
		this.queue.forEach((entry: Entry) => {
			if (entry.user.id == user.id)
				return true;
		});
		return false;
	}

	removeUser = (user: User) => {
		this.logger.log(`removing user ${user.name} from matchmake queue (current length: ${this.queue.length})`);
		while (true) // cba
		{
			let user_index = -1;
			let index = 0;
	
			this.queue.forEach((entry: Entry) => {
				if (entry.user.id == user.id)
					user_index = index;
				index++;
			});
	
			if (user_index == -1)
				break;

			this.queue.splice(user_index, 1);
		}
		this.logger.log(`removed user ${user.name} from matchmake queue (current length: ${this.queue.length})`);
	}

	removeSocket = (socket: Socket) => { // doesn't work yet
		this.logger.log(`removing user by socket ${socket.id} from matchmake queue (current length: ${this.queue.length})`);
		while (true)
		{
			let user_index = -1;
			let index = 0;
	
			this.queue.forEach((entry: Entry) => {
				if (entry.socket.id == socket.id)
					user_index = index;
				index++;
			});
	
			if (user_index == -1)
				break;

			this.queue.splice(user_index, 1);
		}
		this.logger.log(`removed user by socket ${socket.id} from matchmake queue (current length: ${this.queue.length})`);
	};

	makematch = async () => {
		if (this.queue.length < 2) return setTimeout(() => { this.makematch(); }, this.matchmakeDelay);

		this.logger.log(`queue has ${this.queue.length} users, making match`);

		try {
			const entry_1 = this.queue.pop();
			const entry_2 = this.queue.pop();

			const game = await this.gameService.createGame(entry_1.user.id, entry_2.user.id);
			const tickerGame = this.globalTicker.registerGame(game, entry_1.user, entry_2.user);

			entry_1.socket.join(tickerGame.gameServerId);
			entry_2.socket.join(tickerGame.gameServerId);

			const data = {
				game: tickerGame.game,
				field: tickerGame.field,
				state: tickerGame.state,
				score: tickerGame.score,
				players: tickerGame.players
			}

			this.server.emit('gameCreated', data);
			this.server.to(tickerGame.gameServerId).emit('openGameView', data);
		} catch (err) {
			this.logger.log(`makematch() : ${err.message}`);
		}

		setTimeout(() => { this.makematch(); }, this.matchmakeDelay); // could be less than 0, when i < 0, setTimeout uses 1ms as default
	}
}

export default Matchmaker