import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import configLoad from '../config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '@/modules/auth/auth.module';
import { AuthController } from '@/modules/auth/auth.controller';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';

const config = configLoad();

// https://gitee.com/shenxf1986/juejin-shenblog/blob/master/day12/src/app.module.ts
@Module({
  imports: [
    // https://docs.nestjs.com/techniques/configuration
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configLoad],
    }),
    // https://github.com/nestjs/throttler
    ThrottlerModule.forRoot([{ ttl: 1000, limit: config.throttlerLimit }]),
    // authentication global
    AuthModule,
  ],
  controllers: [AppController, AuthController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
