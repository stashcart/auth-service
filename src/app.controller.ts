import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Ping')
export class AppController {
  @Get()
  ping(): string {
    return 'OK';
  }
}
