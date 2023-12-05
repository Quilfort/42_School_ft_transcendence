import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GameService {
	@Inject(PrismaService)
	private readonly prismaService: PrismaService;

	async findLastGame() {
		try {
		return await this.prismaService.game.findFirst({
			orderBy: {
			created_at: 'desc'
			},
		});
		} catch (error) {
		throw new Error(`Failed getting the last game: ${error.toString()}`);
		}
	}


	async finishGame(gameId: number, winner: number, loser: number, score: number[]) {
		try {
			return await this.prismaService.game.update({
				where: {id: gameId},
				data: {
					score: score,
					winner_id: winner,
					loser_id: loser,
					finished_at: new Date()
				}
			})
		} catch (error) {
			throw new Error(`Failured updating Game: ${error.toString()}`);
		}
	}

	async createGame(user_1: number, user_2: number) {
		try {
			return await this.prismaService.game.create({
				data: {
					players: {
						connect: [
							{ id: user_1 },
							{ id: user_2 }
						]
					},
					score: [0, 0],
				}
			})
		} catch (error) {
			throw new Error(`Failured creating Game: ${error.toString()}`);
		}
	}

	async joinGame(gameID: any, userID: any) {
		try {
		return await this.prismaService.game.update({
			where: { 
			id: gameID
			},
			data: {
			players: {
				connect: [
				{
					id: userID
				}
				]
			},
			},
		})
		} catch (error) {
		throw new Error(`Failed joining Game: ${error.toString()}`);
		}
	}

	async statusInProgress(gameID: any) {
		try {
		return await this.prismaService.game.update({
			where: { 
			id: gameID
			},
			data: {
			}
		})
		} catch (error) {
		throw new Error(`Failed Change Status to In Progress: ${error.toString()}`);
		}
	}

	async statusFinished(gameID: any, score_player1: number, score_player2: number) {
		try {
		return await this.prismaService.game.update({
			where: { 
			id: gameID
			},
			data: {
			score: 
				[
				score_player1,
				score_player2
				],
			}
		})
		} catch (error) {
		throw new Error(`Failed Change Status to Finished: ${error.toString()}`);
		}
	}

	async getGameById(gameId: number) {
		try {
			return await this.prismaService.game.findFirst({
				where: { id: gameId },
				include: { players: {} }
			}
			)
		} catch (error) {
		throw new Error(`Failed getting game by id: ${error.toString()}`);
		}
	}
}


