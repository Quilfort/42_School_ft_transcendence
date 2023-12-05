import { WebSocketServer } from "@nestjs/websockets";
import { Game, User } from "@prisma/client";
// import { Socket } from 'socket.io';
import { Field } from './game/field';
import { Logger } from '@nestjs/common';

const MAX_SCORE = 3;
const GLOBAL_MULTIPLIER = 0.15;	// global movement multiplier
const PADDLE_SPEED = 1;			// * GLOBAL_MULTIPLIER * deltaTime    = move distance
const BALL_SPEED = 2;			// * GLOBAL_MULTIPLIER * deltaTime    = move distance		ball moving twice as fast as the paddle seems legit

export enum State {
	PRE,
	SCORED,
	PLAYING,
	FINISHED
}

export enum Direction {
	NONE,
	UP,
	DOWN
}

export enum Side { // left index = 0, right index = 1; ezpz for paddle array in the field obj eg. movePaddle(LEFT or RIGHT, direction)
	LEFT,
	RIGHT
}

class Player {
	id: number; // user['id'] but easily accessible
	user: User;

	side: Side;
	score: number;
	desiredDirection: Direction;

	constructor (user: User, side: Side) {
		this.id = user['id'];
		this.user = user;
		this.score = 0;
		this.desiredDirection = Direction.NONE;
		this.side = side;
	}
}

export class GameState {
	@WebSocketServer() server;
	logger: Logger;

    players:  {
        [playerId: number]: Player;
    } = {};

	game: Game;
	gameServerId: string;
	lastTick: number;
	timeout: number;
	state: State;
	score: number[];
	field: Field;
	winner: number;
	loser: number;
	isVariation: boolean;

	constructor (server: any, game: Game, isVariation: boolean = false) {
		this.logger = new Logger(`game-${game['id']}`);
		this.server = server;
		this.state = State.PRE;
		this.game = game;
		this.lastTick = Date.now();
		this.gameServerId = `g${game['id']}`; // both users should join this channel
		this.score = [0, 0];
		this.field = new Field;
		this.timeout = Date.now() + 5000; // game starts 5 sec after its made
		this.winner = -1;
		this.loser = -1;
		this.isVariation = isVariation;
	}

	getPlayer = (side: Side) => {
		for(const property in this.players)
		{
			if (this.players[property].side == side)
				return this.players[property];
		}
		return null;
	}

	setPlayerDirection = (user: User, direction: Direction) => {
		if (!this.isPlayer(user))
			throw new Error("user is not a player");

		this.players[user['id']].desiredDirection = direction;
	}

	isPlayer = (user: User) => {
		for(const property in this.players)
		{
			if (this.players[property]['id'] == user['id'])
				return true;
		}
		return false;
	}

	addPlayer = (user: User) => {
		if (Object.keys(this.players).length >= 2)
			throw new Error("this game is full");

		if (this.isPlayer(user))
			throw new Error("user is already a player");

		let side = Side.LEFT;
		if (Object.keys(this.players).length == 1)
			side = Side.RIGHT;

		this.players[user['id']] = new Player(user, side);
	}

	startRound = () => {
		this.state = State.PLAYING;
		this.field.reset();
		return true;
	}

	tick = () => {
		// this.logger.log('tick!');
		const currentTime = Date.now();
		const deltaTime = currentTime - this.lastTick;

		this.lastTick = currentTime;

		if (this.timeout > currentTime) // timer before state in case of ending screen when the game is done
			return true;

		if (this.state == State.FINISHED)
			return false; // false means, remove from game ticker

		if (this.state != State.PLAYING)
			return this.startRound();

		// move paddles
		for (const property in this.players) {
			const player = this.players[property];
			const moveSize = GLOBAL_MULTIPLIER * PADDLE_SPEED * deltaTime;

			this.field.movePaddle(player.side, player.desiredDirection, moveSize);
		}

		// move ball
		const moveSize = GLOBAL_MULTIPLIER * BALL_SPEED * deltaTime;
		this.field.moveBall(moveSize);


		// check collisions, change ball direction, handle score etc.
		const scoringPaddle = this.field.checkCollisions();
		if (scoringPaddle >= 0) {
			this.score[scoringPaddle]++;
			if (this.score[scoringPaddle] >= MAX_SCORE) {
				this.state = State.FINISHED;
				this.timeout = currentTime + 5000;
				this.winner = scoringPaddle;
				this.loser = scoringPaddle == 0 ? 1 : 0;
			} else {
				this.state = State.SCORED;
				this.timeout = currentTime + 3000;
			}
			if (this.isVariation)
				this.field.paddles[scoringPaddle].height *= 0.6;
			this.field.reset();
		}

		const data = {
			game: this.game,
			field: this.field,
			state: this.state,
			score: this.score,
			players: this.players
		}
		this.server.to(this.gameServerId).emit('game', data);
		return true;
	}
}

export default GameState;