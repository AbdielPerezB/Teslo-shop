import { Module } from '@nestjs/common';
import { MessageWsService } from './message-ws.service';
import { MessageWsGateway } from './message-ws.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [MessageWsGateway, MessageWsService],
  imports: [AuthModule]
})
export class MessageWsModule {}

/**
 * En imports: [AuthModule]
 * Estamos utilizando el ṕatron repositorio, porque al importar el módulo de Auth, ya se
 * incluye el servicio de tokens, el typeorm y otras cosas 
 */