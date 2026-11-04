import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

/**
 * Returns the user attached to the request by JwtAuthGuard.
 * Only valid on protected routes: @Public() routes have no user.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const { user } = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!user) {
      throw new Error(
        '@CurrentUser() used on a route without an authenticated user',
      );
    }
    return user;
  },
);
