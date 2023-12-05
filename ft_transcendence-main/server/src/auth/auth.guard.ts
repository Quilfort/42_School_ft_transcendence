import { Injectable, CanActivate, ExecutionContext, forwardRef } from '@nestjs/common';
import { Inject, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserService } from 'src/user/user.service';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';
import * as JWT from "jsonwebtoken";
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class AuthGuard implements CanActivate {
	@Inject(forwardRef(() => UserService))
	private readonly userService: UserService;

	private readonly logger = new Logger("AuthGuard");


	async canActivate(context: ExecutionContext): Promise<boolean> {
		const client = context.switchToWs().getClient<Socket>();

		try {
			const jwtPayload = JWT.verify(client.handshake.auth.token, process.env.JWT_SECRET);
			const user = await this.validateUser(jwtPayload["user"]);
			const tfa_verified = jwtPayload["tfa_verified"];

			if (!tfa_verified)
				throw new Error("tfa unverified");
			if (user == null)
				throw new Error("user does not exist");

			return Boolean(user);
		} catch (err) {
			this.logger.log(err.toString());
			// return false;
			throw new WsException(err.message);
		}
	}

	public async validateUser(payload: any) {
		try {
			const user = await this.userService.getUserById(payload["id"]);
			return user;
		}
		catch(err){
			throw new Error("db failure");
		}
	}
}
