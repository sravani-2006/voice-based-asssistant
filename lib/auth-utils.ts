"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context";

export function useRequireAuth(redirectUrl = "/auth/signin") {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(redirectUrl);
    }
  }, [user, isLoading, router, redirectUrl]);

  return { user, isLoading };
}

/**
 * This component can be used to wrap protected pages
 * Example:
 * <ProtectedRoute>
 *   <YourProtectedComponent />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  redirectUrl = "/auth/signin",
}: {
  children: React.ReactNode;
  redirectUrl?: string;
}): JSX.Element {
  const { user, isLoading } = useRequireAuth(redirectUrl);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null as unknown as JSX.Element; // The useEffect will redirect
  }

  return <>{children}</>;
}
