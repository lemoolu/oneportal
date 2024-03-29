// https://github.com/Naveen512/nestjs-jwt-cookie-auth/blob/master/src/users/refresh.strategy.ts

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable } from '@nestjs/common';
import { TOKEN_KEY, jwtConstants } from './constants';
import { Request } from 'express';

// get token from cookies
function cookieExtractor(req: Request) {
  let token = null;
  if (req && req.cookies) {
    token = req.signedCookies[TOKEN_KEY];
  }
  return token;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor, // from cookie: token=xxxx
        ExtractJwt.fromHeader('authorization'), // from header Authorization: xxxx
        // ExtractJwt.fromAuthHeaderAsBearerToken(), // 和fromHeader的会冲突 from header Authorization: Bearer xxxx
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    if (!payload) {
      throw new BadRequestException('invalid jwt token');
    }

    return { userId: payload.sub, username: payload.username };
  }
}
