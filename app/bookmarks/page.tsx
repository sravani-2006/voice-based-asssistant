"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "@/lib/auth-context";
import BookmarkedArticles from "@/components/bookmarked-articles";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function BookmarksPage() {
  const { user, isLoading, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Optional: redirect to login if not authenticated and not loading
    if (!isLoading && !user) {
      // We could redirect, but instead we'll show a sign-in prompt
      // router.push("/auth/signin");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Bookmarked Articles</h1>
        <BookmarksSkeleton />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Bookmarked Articles</h1>
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-xl font-medium">
            Please sign in to view your bookmarks
          </h3>
          <p className="text-muted-foreground mt-2 mb-4">
            You need to be signed in to save and view bookmarked articles
          </p>
          <Button onClick={signIn}>Sign In</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Bookmarked Articles</h1>

      <Suspense fallback={<BookmarksSkeleton />}>
        <BookmarkedArticles />
      </Suspense>
    </main>
  );
}

function BookmarksSkeleton() {
  return (
    <div className="space-y-6">
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <div className="flex gap-4">
              <Skeleton className="h-32 w-32 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
