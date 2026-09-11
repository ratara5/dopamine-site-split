import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { SessionUser } from "./auth.service";

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SessionUser => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  }
);
