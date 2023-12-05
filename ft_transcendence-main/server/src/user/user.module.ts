import { Global, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserGateway } from './user.gateway';

@Global()
@Module({
  providers: [UserGateway, UserService],
})
export class UserModule {}
