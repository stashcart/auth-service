import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672'),
        exchanges: [
          {
            name: 'user',
            type: 'topic',
          },
        ],
        connectionInitOptions: { wait: false },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
