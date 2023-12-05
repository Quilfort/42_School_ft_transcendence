import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { Global } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Global()
@Module({
  providers: [ChatGateway, ChatService, UserService]
})
export class ChatModule {}
