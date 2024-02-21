import { Controller, Get } from '@nestjs/common';
import { Public } from '@/modules/auth';

@Controller()
export class AppController {
  constructor() {}

  @Public()
  @Get()
  getHello(): string {
    return 'Hello World!';
  }
}
