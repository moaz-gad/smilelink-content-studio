import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Use the edge-safe config (no Prisma/bcrypt) for the middleware. The
// `authorized` callback in authConfig gates every matched route.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Run on everything except API routes, Next internals, and the logo asset.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|smilelink-logo.png).*)",
  ],
};
