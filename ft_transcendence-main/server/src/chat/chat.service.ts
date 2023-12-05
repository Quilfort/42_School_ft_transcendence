import { Inject, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
// import { messages } from 'src/prisma/seeders/messages/messages';

@Injectable()
export class ChatService {
	@Inject(PrismaService)
	private readonly prismaService: PrismaService;


	/* channel functions */
	async createChannel(name: string, user_id: any, role: Role = Role.OWNER) {
		try {
			if (name.startsWith('dm_'))
				throw new Error("channel name may not start with 'dm_'");
			return await this.prismaService.channel.create({
				data: {
					name,
					users: {
						create: [ // this *should* also create a new ChannelMembership with the channel_id set
							{
								role,
								user_id
							}
						]
					}
				}
			});
		} catch (err) {
			throw new Error(`failure creating channel: ${err.toString()}`);
		}
	}

	async makeDM(user_id_1: number, user_id_2: number) {
		try {
			const channelName = `dm_${user_id_1 > user_id_2 ? user_id_1 : user_id_2}_${user_id_1 > user_id_2 ? user_id_2 : user_id_1}`; // lmao

			return await this.prismaService.channel.create({
				data: {
					name: channelName,
					users: {
						create: [
							{
								role: Role.MEMBER,
								user_id: user_id_1,
							},
							{
								role: Role.MEMBER,
								user_id: user_id_2
							}
						]
					}
				}
			})
		} catch (err) {
			throw new Error(`failure creating DM: ${err.toString()}`);
		}
	}

	async getDM(user_id_1: number, user_id_2: number) {
		try {
			const channelName = `dm_${user_id_1 > user_id_2 ? user_id_1 : user_id_2}_${user_id_1 > user_id_2 ? user_id_2 : user_id_1}`; // lmao

			return await this.prismaService.channel.findFirst({
				where: {
					name: channelName
				},
				select: {
					id: true,
					messages: {
						include: {
							sender:{
								select: {
									id: true,
									name: true
								}
							}
						}
					},
					name: true,
					password: true,
				}
			})
		} catch (err) {
			throw new Error(`failure getting DM: ${err.toString()}`);
		}
	}
	
	async deleteChannel(channel_id: number) {
		try {
			return await this.prismaService.channel.delete({
				where: {
					id: channel_id
				}
			});
		} catch (err) {
			throw new Error(`failure deleting channel: ${err.toString()}`);
		}
	}

	async getChannelById(channel_id: number) {
		try {
			return this.prismaService.channel.findFirst({
				where: {
					id: channel_id
				}
			})
		} catch (err) {
			throw new Error(`failure resolving channel: ${err.toString()}`);
		}
	}

	async getChannelsForUser(user_id: number) {
		try {
			return this.prismaService.channelMembership.findMany({
				where: {
					user_id,
					NOT: {
						role: {
							equals: Role.BANNED
						}
					}
				},
				include: {
					channel: {
						include: {
							messages: {
								orderBy: {
									created_at: 'desc'
								},
								take: 1 // take one message from the channel for the message preview
							}
						}
					}
				}
			})
		} catch (err) {
			throw new Error(`failure getting channels: ${err.toString()}`);
		}
	}

	async getChannelForUserById(channel_id: number, user_id: number) {
		try {
		  return this.prismaService.channelMembership.findFirst({
			where: {
			  channel_id: channel_id,
			  user_id: user_id,
			  NOT: {
				role: {
					equals: Role.BANNED
				}
			  }
			},
			include: {
			  channel: {
				include: {
				  messages: {
					include: { 
						sender: {
							select: {
								id: true,
								name: true,
							}
						} 
					},
					orderBy: {
					  created_at: 'desc'
					}
				  }
				}
			  },
			}
		  });
		} catch (error) {
		}
	  }

	  async getAllChannelsWithoutPassword() {
		try {
			return this.prismaService.channel.findMany({
			  select: {
				id: true,
				name: true,
				password: true,
				messages: {
					orderBy: {
						created_at: 'desc'
					},
					take: 1 // take one message from the channel for the message preview
				}
			  }
			})
		} catch (err) {
			throw new Error(`failure getting channels: ${err.toString()}`);
		}
	}

	async setChannelPassword(channel_id: number, password: string) {
		try {
			const hashed = password != null ? await bcrypt.hash(password, 12) : null;
			return await this.prismaService.channel.update({
				where: {
					id: channel_id
				},
				data: {
					password: hashed
				}
			});
		} catch (err) {
			throw new Error(`failure setting password: ${err.toString()}`);
		}
	}

	/* channel memberships */
	async addUserToChannel(channel_id: number, user_id: number) {
		try {
			return await this.prismaService.channelMembership.create({
				data: {
					role: Role.MEMBER, channel_id, user_id
				}
			});
		} catch (err) {
			throw new Error(`failure creating channelMembership: ${err.toString()}`);
		}
	}

	async getChannelMembership(channel_id: number, user_id: number) {
		try {
			return this.prismaService.channelMembership.findFirst({
				where: {
					channel_id, user_id
				}
			})
		} catch (err) {
			throw new Error(`failure resolving channelMembership: ${err.toString()}`);
		}
	}

	async getChannelMemberships(channel_id: number) {
		try {
			return this.prismaService.channelMembership.findMany({
				where: {
					channel_id
				}
			})
		} catch (err) {
			throw new Error(`failure resolving channelMemberships: ${err.toString()}`);
		}
	}

	async removeUserFromChannel(channel_id: number, user_id: number) {
		try {
			return this.prismaService.channelMembership.delete({
				where: {
					user_id_channel_id: {
						user_id, channel_id
					}
				}
			})
		} catch (err) {
			throw new Error(`failure removing channelMembership: ${err.toString()}`);
		}
	}

	async inviteMember(channel_id: number, user_id: number) {
		try {
			return this.prismaService.channelMembership.upsert({
				where: {
					user_id_channel_id: {
						user_id, channel_id
					}
				},
				update: {},
				create: {
					user_id,
					channel_id,
					role: Role.INVITED
				}
			})
		} catch (err) {
			throw new Error(`failure adding INVITED role: ${err.toString()}`);
		}

	}

	async changeRole(channel_id: number, user_id: number, role: Role) {
		try {
			return this.prismaService.channelMembership.update({
				where: {
					user_id_channel_id: {
						user_id, channel_id
					}
				},
				data: {
					role
				}
			})
		} catch (err) {
			throw new Error(`failure changing role: ${err.toString()}`);
		}
	}


	async getMutedUsers(channel_id: number, user_id: number, role: Role) {
		try {
			return this.prismaService.channelMembership.findMany({
				where: {
					channel_id,
					role: "MUTED"
				},
			})
		} catch (err) {
			throw new Error(`failure changing role: ${err.toString()}`);
		}
	}

	async removeMembership(channel_id, user_id) {
		try {
			return this.prismaService.channelMembership.delete({
				where: {
					user_id_channel_id: {
						user_id,
						channel_id
					}
				}
			});
		} catch (err) {
			throw new Error(`failure removing membership: ${err.toString()}`);
		}
	}

	/* messages */
	async getMessages(channel_id: number, page: number = 0) {
		try {
			return this.prismaService.message.findMany({
				where: {
					channel_id
				},
				orderBy: {
					created_at: 'desc'
				},
				take: 25,
				skip: page * 25 // start at page 0 :D
			})
		} catch (err) {
			throw new Error(`failure resolving messages: ${err.toString()}`);
		}
	}

	async sendMessage(channel_id: number, sender_id: number, content: string) {
		try {
			return this.prismaService.message.create({
				data: {
					channel_id, sender_id, content
				},
				include: {
					sender: {
						select: {
							id: true,
							name: true,
						}
					},
				}
			})
		} catch (err) {
			throw new Error(`failure sending message: ${err.toString()}`);
		}
	}
}
