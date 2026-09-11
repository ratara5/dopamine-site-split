// Resolves the backend base URL depending on execution context:
//
// - Server-side (React Server Components, e.g. the home/provider/
//   product pages that used to call Prisma directly): use
//   INTERNAL_API_URL, the backend's Docker-internal hostname
//   (http://backend:3001). Faster and avoids an unnecessary hairpin
//   through the public internet/Caddy for server-to-server calls.
//
// - Client-side (browser fetch, e.g. login, checkout, order
//   tracking polling): use NEXT_PUBLIC_API_URL, the backend's public
//   HTTPS domain. This one MUST be the real public origin — it's
//   also the value that has to appear in the backend's
//   CORS_ALLOWED_ORIGINS-adjacent allowlist story (the frontend's own
//   origin is what goes in that allowlist; this constant is what the
//   frontend calls).
//
// If you only run one backend URL in your setup, set both env vars to
// the same value — this still works, just skips the internal-network
// optimization.
export function apiUrl(path: string): string {
  const base =
    typeof window === "undefined"
      ? process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL
      : process.env.NEXT_PUBLIC_API_URL;

  if (!base) {
    throw new Error(
      "Missing API base URL. Set INTERNAL_API_URL and/or NEXT_PUBLIC_API_URL."
    );
  }

  return `${base.replace(/\/$/, "")}${path}`;
}
