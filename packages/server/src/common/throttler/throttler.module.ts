import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import configLoad from '@/config';

const config = configLoad();

@Global()
@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 1000, limit: config.throttlerLimit }]),
  ],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class ThrottlerModuleX { }
