import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Fetches UserDto from request.
 *
 * @example
 * (@)Get()
 * async getData(@User() user: UserDto) {}
 */
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
