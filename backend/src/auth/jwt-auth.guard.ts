import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { extractToken } from "./extract-token";
import { SessionUser } from "./auth.service";

// Equivalent to the original inline check in POST /api/v1/orders:
//   const session = await auth();
//   if (!session?.user?.id) return 401 "Unauthorized"
// Attaches req.user so controllers can read the caller's identity.
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const token = extractToken(req);
    if (!token) throw new UnauthorizedException("Unauthorized");

    try {
      const payload = this.jwt.verify(token);
      const user: SessionUser = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
      };
      (req as any).user = user;
      return true;
    } catch {
      throw new UnauthorizedException("Unauthorized");
    }
  }
}
