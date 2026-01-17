import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  private apiKeys = [
    'apiKey1',
    'apiKey2',
    'apiKey3',
    'apiKey4',
  ]
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const apiKey = req.headers['api-key'];
    if (!this.apiKeys.includes(apiKey)) {
      throw new UnauthorizedException({
        message: 'Invalid API key!'
      })
    }
    return true;
  }
}
