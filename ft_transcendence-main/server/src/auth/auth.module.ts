import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGateway } from './auth.gateway';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [AuthService, AuthGateway, UserService]
})
export class AuthModule {}
