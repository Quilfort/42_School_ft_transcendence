import { GameState, Direction } from './gameState';
import { Logger } from '@nestjs/common';
import { Game, User } from '@prisma/client';
import { WebSocketServer } from '@nestjs/websockets';
import { GameService } from './../game.service';
import { UserService } from 'src/user/user.service';

export class GlobalTicker {
    games:  {
        [gameID: number] : GameState;
    } = {};

	@WebSocketServer() server;
	gameService: GameService;
	userService: UserService;
	logger: Logger;
    tickRate: number;
	lastTick: number;

    constructor (gameService: GameService, userService: UserService, server: any, tickrate: number) {
		this.gameService = gameService;
		this.userService = userService;
		this.server = server;
		this.logger = new Logger('Ticker');
		
        this.tickRate = 1000 / tickrate;
		this.lastTick = Date.now();
		this.tick();
    }

	getGame = (game_id: number) => {
		if (game_id in this.games)
			return this.games[game_id];
		return null;
	}

    registerGame = (game: Game, user_1: User, user_2: User, variation: boolean = false) => {
        const g = new GameState(this.server, game, variation);

		g.addPlayer(user_1);
		g.addPlayer(user_2);

		this.games[game['id']] = g;
		return g;
    }

	setPlayerDirection = (game_id: number, user: User, direction: Direction) => {
		try {
			if (!this.getGame(game_id))
				throw new Error("invalid game");

			this.games[game_id].setPlayerDirection(user, direction);
		} catch (err) {
			this.logger.log(`setPlayerDir failed for game ${game_id} (player: ${user['id']}, direction: ${direction})`);
		}
	}

	tick = async () => {
		const currentTime = Date.now();
		const deltaTime = currentTime - this.lastTick;

		if (deltaTime < this.tickRate)
			return setTimeout(() => { this.tick(); }, this.tickRate - deltaTime); // too fast

		this.lastTick = currentTime;

		try {
			for (const property in this.games) {
				const game = this.games[property];
				
				if (!game.tick()) { // game is finished
					// store game data in db
					const winner = game.getPlayer(game.winner);
					const loser = game.getPlayer(game.loser);
					if (winner && loser) {
						await this.gameService.finishGame(game.game.id, winner.id, loser.id, game.score);
						await this.userService.addWin(winner['id']);
						await this.userService.addLoss(loser['id']);
					}

					// remove game from ticker
					delete this.games[game.game.id];
					
					// all clients subscribed to the room should leave
					this.server.to(game.gameServerId).emit('gameDone', { id: game.game.id, winner, loser, score: game.score});
					this.server.in(game.gameServerId).socketsLeave(game.gameServerId);
				}
			}
		} catch (err) {
			this.logger.log(`tick failed: ${err.message}`);
		}

		const elapsed = Date.now() - currentTime;
		if (elapsed > this.tickRate)
			this.logger.log(`Oops! ${elapsed - this.tickRate} ms behind tickRate (${this.tickRate}ms)`);

		setTimeout(() => { this.tick(); }, this.tickRate - elapsed); // could be less than 0, when i < 0, setTimeout uses 1ms as default
	}
}

export default GlobalTicker