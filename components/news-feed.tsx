import { getNewsArticles } from "@/lib/news-service";
import NewsFeedClient from "./news-feed-client";

export default async function NewsFeed() {
  try {
    const initialArticles = await getNewsArticles();
    return <NewsFeedClient initialArticles={initialArticles} />;
  } catch (error) {
    console.error("Error fetching initial articles:", error);
    // Return empty array as fallback
    return <NewsFeedClient initialArticles={[]} />;
  }
}
