import type { NextAuthConfig } from "next-auth";

// Edge-safe auth config: NO Prisma or bcrypt here so it can run in the
// middleware (Edge runtime). The Credentials provider itself lives in auth.ts.
export const authConfig = {
  // Trust the reverse-proxy host in production (fixes "UntrustedHost").
  // Set here in the shared config so BOTH the middleware's NextAuth instance
  // and the main auth.ts instance trust the forwarded host.
  trustHost: true,
  pages: {
    signIn: "/",
  },
  providers: [],
  callbacks: {
    // Runs on every request matched by the middleware. Decides who may see what.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLoginPage = nextUrl.pathname === "/";

      if (isOnLoginPage) {
        // Signed-in users should never see the login page — send them in.
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true; // allow signed-out users to view the login page
      }

      // Every other matched route requires a session. Returning false makes
      // NextAuth redirect to the signIn page ("/").
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
