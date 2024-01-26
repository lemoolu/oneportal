import { Controller, Get, Post, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public, TOKEN_KEY } from './constants';
import { User } from '../users/users.model';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller({
  path: 'auth',
})
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('/login')
  async login(@Req() req, @Res({ passthrough: true }) res: Response) {
    const token = await this.authService.getJwtToken(req.user as User);
    const secretData = {
      token: `${token}`,
      // refreshToken,
    };
    res.cookie(TOKEN_KEY, secretData.token, { httpOnly: false });
    return { msg: 'success' };
  }

  @Public()
  @Post('/logout')
  async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('Authorization');
    return;
  }

  @Get('/profile')
  getProfile(@Req() req) {
    return req.user;
  }

  @Public()
  @Get('/getall')
  findAll() {
    return [];
  }
}
