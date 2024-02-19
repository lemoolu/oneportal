import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '@/common';
import { UserController } from './user.controller';

@Module({
  controllers: [UserController],
  providers: [PrismaService, UserService],
  exports: [UserService],
})
export class UserModule { }
