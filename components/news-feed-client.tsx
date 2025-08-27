"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { Article } from "@/lib/types";
import NewsCard from "./news-card";
import { Button } from "@/components/ui/button";

export default function NewsFeedClient({
  initialArticles,
}: {
  initialArticles: Article[];
}) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q");
  const category = searchParams.get("category");

  useEffect(() => {
    // Reset to first page when search or category changes
    setPage(1);

    const fetchArticles = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/news?page=1${searchQuery ? `&q=${searchQuery}` : ""}${
            category ? `&category=${category}` : ""
          }`
        );
        const data = await res.json();
        setArticles(data);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();

    // Set up auto-refresh every 10 minutes
    const refreshInterval = setInterval(fetchArticles, 10 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [searchQuery, category]);

  const loadMore = async () => {
    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(
        `/api/news?page=${nextPage}${searchQuery ? `&q=${searchQuery}` : ""}${
          category ? `&category=${category}` : ""
        }`
      );
      const newArticles = await res.json();

      setArticles((prev) => [...prev, ...newArticles]);
      setPage(nextPage);
    } catch (error) {
      console.error("Error loading more articles:", error);
    } finally {
      setLoading(false);
    }
  };

  if (articles.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium">No articles found</h3>
        <p className="text-muted-foreground mt-2">
          Try changing your search or category filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}

      {articles.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="outline"
            className="min-w-[200px]"
          >
            {loading ? "Loading..." : "Load More News"}
          </Button>
        </div>
      )}
    </div>
  );
}
