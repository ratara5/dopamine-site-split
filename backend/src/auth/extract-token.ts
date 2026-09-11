import { Request } from "express";

export const SESSION_COOKIE_NAME = "session_token";

// Web sends the JWT as an httpOnly cookie (set at login, SameSite=None;
// Secure since frontend and backend are on separate domains). Mobile
// has no reliable cross-platform cookie jar, so it sends the same JWT
// as `Authorization: Bearer <token>` instead. Business logic never
// branches on which transport was used — same guard, same user shape.
export function extractToken(req: Request): string | null {
  const cookieToken = (req as any).cookies?.[SESSION_COOKIE_NAME];
  if (cookieToken) return cookieToken;

  const authHeader = req.headers["authorization"];
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length);
  }

  return null;
}
