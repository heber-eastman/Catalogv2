import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.headers.authorization;

    const token = this.authService.extractTokenFromHeader(authorization);
    const claims = this.authService.verifyToken(token);
    const user = await this.authService.getOrCreateUserFromClaims(claims);

    if (!user) {
      throw new UnauthorizedException('Unable to resolve user');
    }

    request.user = user;
    return true;
  }
}
