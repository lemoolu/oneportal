import { Controller, Get, Post, UseGuards, Req, Res } from '@nestjs/common';
import { Public } from '@/common';
import { UserService } from './user.service';

@Controller({
  path: 'user',
})
export class UserController {
  constructor(private userService: UserService) { }

  @Public()
  @Get('/:id')
  async login(@Req() req) {
    return await this.userService.testOne();
    // return '3333';
  }
}
