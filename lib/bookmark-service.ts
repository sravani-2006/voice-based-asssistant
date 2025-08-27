"use client";

import { createClient } from "@/lib/supabase-browser";

// Helper functions to encode/decode article IDs
function encodeArticleId(id: string): string {
  // If the ID is already encoded (doesn't contain special characters), return as is
  if (!id.includes("://") && !id.includes("?") && !id.includes("&")) {
    return id;
  }
  // Otherwise, encode it
  return encodeURIComponent(id);
}

function decodeArticleId(id: string): string {
  try {
    return decodeURIComponent(id);
  } catch (error) {
    console.error("Error decoding article ID:", error);
    return id; // Return original if decoding fails
  }
}

export async function saveArticleBookmark(articleId: string): Promise<void> {
  console.log("Saving bookmark for article ID:", articleId);
  const supabase = createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Ensure the article ID is properly encoded for storage
  const encodedArticleId = encodeArticleId(articleId);
  console.log("Encoded article ID for storage:", encodedArticleId);

  // First, check if this article is already bookmarked by the user
  const { data: existingBookmark, error: checkError } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("article_id", encodedArticleId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (checkError) {
    console.error("Error checking existing bookmark:", checkError);
  }

  // If already bookmarked, no need to add again
  if (existingBookmark) {
    console.log("Article already bookmarked, skipping:", articleId);
    return; // Article is already bookmarked, so we can just return
  }

  // If not bookmarked, add it
  console.log("Inserting new bookmark:", {
    article_id: encodedArticleId,
    user_id: user.id,
  });
  const { data, error } = await supabase
    .from("bookmarks")
    .insert({
      article_id: encodedArticleId,
      user_id: user.id,
    })
    .select();

  if (error) {
    // If still getting conflict error, just ignore it (race condition)
    if (error.code === "23505") {
      // Postgres unique violation code
      console.log("Article was already bookmarked (conflict):", articleId);
      return;
    }
    console.error("Error inserting bookmark:", error);
    throw new Error(`Error saving bookmark: ${error.message}`);
  }

  console.log("Bookmark saved successfully:", data);
}

export async function removeArticleBookmark(articleId: string): Promise<void> {
  console.log("Removing bookmark for article ID:", articleId);
  const supabase = createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Ensure the article ID is properly encoded for lookup
  const encodedArticleId = encodeArticleId(articleId);

  const { data, error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("article_id", encodedArticleId)
    .eq("user_id", user.id)
    .select();

  if (error) {
    console.error("Error removing bookmark:", error);
    throw new Error(`Error removing bookmark: ${error.message}`);
  }

  console.log("Bookmark removed successfully:", data);
}

export async function getUserBookmarks(): Promise<string[]> {
  const supabase = createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log("No user found for getUserBookmarks");
    return [];
  }

  console.log("Fetching bookmarks for user:", user.id);
  const { data, error } = await supabase
    .from("bookmarks")
    .select("article_id")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching bookmarks:", error);
    throw new Error(`Error fetching bookmarks: ${error.message}`);
  }

  console.log("Found bookmarks:", data?.length || 0);
  // Decode the article IDs before returning
  return data.map((bookmark) => decodeArticleId(bookmark.article_id));
}
