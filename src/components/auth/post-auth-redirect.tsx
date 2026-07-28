"use client";

import { useAuth } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const AUTH_PATHS = ["/sign-in", "/sign-up"];

/**
 * After email verification on /sign-in or /sign-up, Clerk sometimes leaves
 * the user on the auth page. Push them to the workspace once signed in.
 */
export function PostAuthRedirect({ to = "/workspace" }: { to?: string }) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const onAuthPage = AUTH_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    );
    if (onAuthPage) {
      router.replace(to);
    }
  }, [isLoaded, isSignedIn, pathname, router, to]);

  return null;
}
