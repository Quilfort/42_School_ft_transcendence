import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { UserService } from 'src/user/user.service';
import { GameService } from './game.service';

@Module({
  providers: [GameGateway, GameService, UserService],
})
export class GameModule {}
