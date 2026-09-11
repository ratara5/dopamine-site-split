import { Body, Controller, Get, HttpCode, Post, Req, Res } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { extractToken, SESSION_COOKIE_NAME } from "./extract-token";

const COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days, matches NextAuth's JWT default

function cookieOptions() {
  // Cross-origin by design (frontend and backend are separate domains
  // on the same VPS) — this is the new failure mode called out in the
  // migration notes: it requires HTTPS everywhere (Secure cannot be
  // sent over plain HTTP) and browsers with third-party-cookie
  // blocking enabled (e.g. Safari ITP, some privacy extensions) may
  // silently drop this cookie. Mobile sidesteps this entirely via the
  // Bearer token path below.
  //
  // Dev-mode relaxation: `Secure` cookies are refused by browsers over
  // plain http://, which is what local dev uses. Rather than forcing
  // every contributor to set up local HTTPS just to test login, we
  // fall back to a same-site-lax, non-secure cookie outside
  // production. This only ever affects local development — production
  // always gets the strict cross-origin settings.
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: (isProd ? "none" : "lax") as "none" | "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_MS,
  };
}

@Controller("v1/auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwt: JwtService
  ) {}

  // POST /v1/auth/register — byte-equivalent to the original route.
  @Post("register")
  @HttpCode(201)
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    return { user };
  }

  // POST /v1/auth/login — replaces the old NextAuth
  // /api/auth/callback/credentials flow that next-auth/react's
  // signIn() called implicitly. Sets the session cookie for web AND
  // returns the raw token for the mobile app to store and send as
  // `Authorization: Bearer <token>`.
  @Post("login")
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateCredentials(dto);
    const token = this.authService.issueToken(user);

    res.cookie(SESSION_COOKIE_NAME, token, cookieOptions());

    return { user, token };
  }

  // POST /v1/auth/logout
  @Post("logout")
  @HttpCode(200)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
    return { ok: true };
  }

  // GET /v1/auth/session — replaces next-auth/react's useSession().
  // Never throws on a missing/invalid token; returns { user: null }
  // instead, matching useSession's "unauthenticated" status semantics
  // so the frontend can poll this on mount without try/catch.
  @Get("session")
  async session(@Req() req: Request) {
    const token = extractToken(req);
    if (!token) return { user: null };

    try {
      const payload = this.jwt.verify(token);
      return {
        user: { id: payload.sub, email: payload.email, name: payload.name },
      };
    } catch {
      return { user: null };
    }
  }
}
