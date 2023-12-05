import { Inject, Injectable } from '@nestjs/common';
// import { Role, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
	@Inject(PrismaService)
	private readonly prismaService: PrismaService;

	async register2FA(user_id: number, tfa_token: string) {
		try {
			return await this.prismaService.tfaToken.create({
				data: {
					user_id,
					tfa_token
				}
			});
		} catch (err) {
			throw new Error(`failure creating tfa entry: ${err.toString()}`);
		}
	}

	async remove2FA(user_id: number) {
		try {
			return await this.prismaService.tfaToken.delete({
				where: { user_id }
			});
		} catch (err) {
			throw new Error(`failure removing tfa entry: ${err.toString()}`);
		}
	}
}
