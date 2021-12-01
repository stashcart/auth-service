import { AmqpConnection, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AmqpService } from './amqp.service';

@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('AMQP_URL', ''),
        exchanges: [
          {
            name: 'user',
            type: 'topic',
          },
          {
            name: 'profile',
            type: 'topic',
          },
        ],
        connectionInitOptions: { wait: false },
      }),
    }),
  ],
  providers: [
    {
      provide: AmqpService,
      useExisting: AmqpConnection,
    },
  ],
  exports: [AmqpService],
})
export class AmqpModule {}
