"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";

// Called by the login form. On success signIn throws a redirect to /dashboard
// (which must propagate); on bad credentials it throws an AuthError we surface.
export async function authenticate(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Invalid email or password.";
    }
    throw error; // re-throw redirect and everything else
  }
  return undefined;
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
