import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

export type SessionUser = { id: string; name: string; email: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) {}

  // Byte-equivalent to the original POST /api/v1/auth/register handler.
  async register(dto: RegisterDto): Promise<SessionUser> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException("Email already registered");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, passwordHash },
      select: { id: true, name: true, email: true },
    });

    return user;
  }

  // Byte-equivalent to the original NextAuth Credentials `authorize()`
  // callback: look up by email, bcrypt-compare the password, return
  // null-equivalent (here: throw 401) on any mismatch. No information
  // is leaked about whether the email exists vs the password being
  // wrong, matching the original's single generic failure path.
  async validateCredentials(dto: LoginDto): Promise<SessionUser> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException("Invalid credentials");

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException("Invalid credentials");

    return { id: user.id, name: user.name, email: user.email };
  }

  // Session strategy: JWT (matches the original's `session: { strategy: "jwt" }`).
  // The same token is used both as the cookie value (web) and as the
  // Authorization: Bearer value (mobile) — one token, two transports.
  issueToken(user: SessionUser): string {
    return this.jwt.sign({ sub: user.id, email: user.email, name: user.name });
  }
}
