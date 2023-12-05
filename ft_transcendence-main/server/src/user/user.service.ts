import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
// import { User } from '@prisma/client';


@Injectable()
export class UserService {
	@Inject(PrismaService)
	private readonly prismaService: PrismaService;

	async create(intra_id: number, name: string, intra_name: string) {
		return this.prismaService.user.upsert({
			where: { intra_id: intra_id },
			update: {},
			create: {
				intra_id,
				name,
				intra_name
			},
			include: {
				tfa_token: true
			}
		})
	}

	async addWin(userId: number) {
		return this.prismaService.user.update({
			where: { id: userId },
			data: {
				wins: {
					increment: 1
				},
				experience: {
					increment: 23 // * 3 hihi
				}
			}
		})
	}

	async addLoss(userId: number) {
		return this.prismaService.user.update({
			where: { id: userId },
			data: {
				losses: {
					increment: 1
				}
			}
		})
	}

	async setUsername(userId: number, username: string) {
		return this.prismaService.user.update({
			where: { id: userId },
			data: { name: username }
		})
	}

	async getUserWithToken(userId: number) {
		return this.prismaService.user.findUnique({
			where: { id: userId },
			include: { tfa_token: true }
		});
	}

	async getUser(userName: string) {
		return this.prismaService.user.findUnique({
			where: { name: userName },
		});
	}


	async getUserByIntraName(userName: string) {
		return this.prismaService.user.findUnique({
			where: { intra_name: userName },
		});
	}

	async getUserById(userId: number) {
		return this.prismaService.user.findUnique({
			where: { id: userId },
		});
	}

	async getUserByIntraId(userId: number) {
		return this.prismaService.user.findUnique({
			where: { intra_id: userId },
		});
	}

	// unused i think?
	// async updateAvatar(userId: number, newAvatarPath: string): Promise<void> {
	// 	await this.prismaService.user.update({
	// 		where: { id: userId },
	// 		data: { avatar: `http://localhost:3000/${newAvatarPath}` }
	// 	});
	// }

	async addFriend(userId: number, friendId: number) {
		return this.prismaService.user.update({
			where: { id: userId },
			data: {
				friends: {
					connect: {
						id: friendId
					}
				}
			}
		})
	}
	
	async removeFriend(userId: number, friendId: number) {
		return this.prismaService.user.update({
			where: { id: userId },
			data: {
				friends: {
					disconnect: {
						id: friendId
					}
				}
			}
		})
	}

	async getFriends(userId: number) {
		return this.prismaService.user.findUnique({
			where: { id: userId },
			include: {
				friends: true
			}
		})
	}


	async blockUser(userId: number, friendId: number) {
		return this.prismaService.user.update({
			where: { id: userId },
			data: {
				blocked: {
					connect: {
						id: friendId
					}
				}
			}
		})
	}

	async isUserBlocked(userId: number, friendId: number): Promise<boolean> {
	const user = await this.prismaService.user.findUnique({
		where: { id: userId },
		select: {
		blocked: {
			where: {
			id: friendId
			}
		}
		}
	});
		return user && user.blocked.length > 0;
	}
	
	async unblockUser(userId: number, friendId: number) {
		return this.prismaService.user.update({
			where: { id: userId },
			data: {
				blocked: {
					disconnect: {
						id: friendId
					}
				}
			}
		})
	}

	async getBlocks(userId: number) {
		return this.prismaService.user.findUnique({
			where: { id: userId },
			include: {
				blocked: true
			}
		})
	}
	async getAllUsersSortedByWins() {
		const users = await this.prismaService.user.findMany({
		  	select: {
				name: true,
				wins: true
			}
		});
		return users.sort((a: any, b: any) => b.wins - a.wins);
	}

	async getLastThreeGamesOfUser(userId: number) {
		const lastThreeGames = await this.prismaService.game.findMany({
			where: {
				players: {
					some: {
						id: userId
					}
				}
			},
			orderBy: {
				created_at: 'desc'
			},
			take: 3,
			include: {
				players: true
			}
		});
		return lastThreeGames;
	}

	async	changeProfilePicture(userID: number, fileName: string) {
		return this.prismaService.user.update({
			where: { id: userID },
			data: { avatar: `uploads/${fileName}` }
		})
	}
}
