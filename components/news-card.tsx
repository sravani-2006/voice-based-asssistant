"use client";

import type { Article } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Bookmark, BookmarkCheck, BookmarkX } from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import {
  saveArticleBookmark,
  removeArticleBookmark,
} from "@/lib/bookmark-service";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export default function NewsCard({
  article,
  onBookmarkChange,
}: {
  article: Article;
  onBookmarkChange?: (articleId: string, isBookmarked: boolean) => void;
}) {
  const [isBookmarked, setIsBookmarked] = useState<boolean>(
    !!article.isBookmarked
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const { user, signIn } = useAuth();

  // Log article ID to help diagnose issues
  useEffect(() => {
    if (
      article.id &&
      (article.id.includes("://") ||
        article.id.includes("?") ||
        article.id.includes("&"))
    ) {
      console.log("Article with special characters in ID:", {
        id: article.id,
        title: article.title,
        isBookmarked: article.isBookmarked,
      });
    }
  }, [article]);

  // Update bookmark state if article.isBookmarked changes
  useEffect(() => {
    setIsBookmarked(article.isBookmarked || false);
  }, [article.isBookmarked]);

  const handleBookmarkToggle = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to bookmark articles",
        variant: "destructive",
      });
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isBookmarked) {
        await removeArticleBookmark(article.id);
        setIsBookmarked(false);
        toast({
          title: "Bookmark removed",
          description: "Article removed from your bookmarks",
        });
      } else {
        await saveArticleBookmark(article.id);
        setIsBookmarked(true);
        toast({
          title: "Bookmark added",
          description: "Article saved to your bookmarks",
        });
      }

      // Notify parent component if callback exists
      if (onBookmarkChange) {
        onBookmarkChange(article.id, !isBookmarked);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      toast({
        title: "Error",
        description: "Failed to update bookmark. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Unknown date";
    }
  };

  // Handle missing image
  const imageUrl = article.urlToImage || "/placeholder-image.png";

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{article.source}</Badge>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(article.publishedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <CardTitle className="text-xl">{article.title}</CardTitle>
          </div>
          {user ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBookmarkToggle}
              disabled={isLoading}
            >
              {isBookmarked ? (
                <BookmarkX className="h-5 w-5 text-primary" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={signIn}
              title="Sign in to bookmark"
            >
              <Bookmark className="h-5 w-5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          {imageUrl && (
            <div className="md:w-1/3 h-48 relative rounded-md overflow-hidden">
              <Image
                src={imageUrl}
                alt={article.title}
                fill
                className="object-cover"
                unoptimized={imageUrl.startsWith("https://picsum.photos")}
                onError={(e) => {
                  // Handle broken images
                  (e.target as HTMLImageElement).src = "/placeholder-image.png";
                }}
              />
            </div>
          )}
          <div className={imageUrl ? "md:w-2/3" : "w-full"}>
            <CardDescription className="text-base">
              {article.description}
            </CardDescription>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="ml-auto" asChild>
          <Link
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            Read Full Article <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
