import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import configLoad from '../config';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { AuthModule } from '@/modules/auth/auth.module';
import { AuthController } from '@/modules/auth/auth.controller';
import { UserController } from '@/modules/user/user.controller';
import { UserModule } from '@/modules/user/user.module';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { LoggerMiddleware } from '@/middleware';
import { PostsModule } from '@/modules/posts/posts.module';
import { PrismaModule, GraphQLModuleX, ThrottlerModuleX } from '@/common';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

const config = configLoad();

// https://gitee.com/shenxf1986/juejin-shenblog/blob/master/day12/src/app.module.ts
@Module({
  imports: [
    // base modules
    // https://docs.nestjs.com/techniques/configuration
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configLoad],
    }),
    // https://github.com/nestjs/throttler

    PrismaModule,
    GraphQLModuleX,
    ThrottlerModuleX,
    // business modules
    AuthModule,
    UserModule,
    PostsModule,
  ],
  controllers: [AppController, AuthController],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // global middleware
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
