import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

// Augment NextAuth types so `session.user.role` / `.id` are typed everywhere.
declare module "next-auth" {
  interface User {
    role: Role;
  }
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
