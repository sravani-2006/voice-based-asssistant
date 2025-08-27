"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import NewsCard from "./news-card";
import type { Article } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

// Helper function to decode article IDs if they're encoded
function decodeArticleId(id: string): string {
  if (!id) return id;
  try {
    // Only decode if it looks like an encoded string
    if (id.includes("%")) {
      return decodeURIComponent(id);
    }
    return id;
  } catch (error) {
    console.error("Error decoding article ID:", error);
    return id;
  }
}

export default function BookmarkedArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchBookmarkedArticles = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // First fetch all bookmarked article IDs
      const { data: bookmarks, error: bookmarksError } = await supabase
        .from("bookmarks")
        .select("article_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (bookmarksError) {
        console.error("Error fetching bookmarks:", bookmarksError);
        throw bookmarksError;
      }

      if (!bookmarks || bookmarks.length === 0) {
        setArticles([]);
        return;
      }

      console.log("Found bookmarks:", bookmarks.length);

      // Try to find the articles in our table
      const foundArticles: Article[] = [];

      for (const bookmark of bookmarks) {
        const articleId = bookmark.article_id;
        console.log(`Looking up article with ID: ${articleId}`);

        try {
          // Try to fetch the article from the database
          const { data: articleData, error: articleError } = await supabase
            .from("articles")
            .select("*")
            .eq("id", articleId)
            .maybeSingle();

          if (articleError) {
            console.error(`Error fetching article ${articleId}:`, articleError);
            continue;
          }

          if (articleData) {
            console.log(`Found article in database: ${articleData.title}`);
            // Create an article object from the database data
            foundArticles.push({
              id: articleData.id,
              title: articleData.title,
              description: articleData.description || "",
              content: articleData.content || "",
              url: articleData.url || decodeArticleId(articleData.id), // Use ID as URL if URL is missing
              urlToImage: articleData.urlToImage || "",
              source: articleData.source || "Unknown",
              author: articleData.author || "",
              publishedAt: articleData.publishedat || new Date().toISOString(),
              category: articleData.category || "",
              isBookmarked: true,
            });
          } else {
            // If the article isn't in the database, create a placeholder
            const decodedId = decodeArticleId(articleId);
            console.log(
              `Article not found in database. Creating placeholder for: ${decodedId}`
            );

            // Check if the ID is a URL
            const isUrl = decodedId.startsWith("http");

            foundArticles.push({
              id: articleId,
              title: isUrl
                ? "Article from " + new URL(decodedId).hostname
                : "Bookmarked Article",
              description:
                "This article may no longer be available in the database.",
              content: "",
              url: isUrl ? decodedId : "#",
              urlToImage: "",
              source: "Unknown",
              author: "",
              publishedAt: new Date().toISOString(),
              category: "",
              isBookmarked: true,
            });
          }
        } catch (err) {
          console.error(`Error processing article ${articleId}:`, err);
        }
      }

      console.log(
        `Successfully found ${foundArticles.length} articles out of ${bookmarks.length} bookmarks`
      );
      setArticles(foundArticles);
    } catch (err) {
      console.error("Error fetching bookmarked articles:", err);
      setError("Failed to load bookmarks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarkedArticles();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
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

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-destructive">
          Error loading bookmarks
        </h3>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={fetchBookmarkedArticles}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium">No bookmarked articles</h3>
        <p className="text-muted-foreground mt-2">
          Bookmark articles from the home page to see them here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}
    </div>
  );
}
