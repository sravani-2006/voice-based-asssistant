import { createClient } from "@/lib/supabase-server";
import type { Article } from "./types";

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = "https://newsapi.org/v2";

// Sample data to use when API is unavailable
const SAMPLE_ARTICLES: Article[] = [
  {
    id: "sample-1",
    title: "Tech Giants Announce New AI Collaboration",
    description:
      "Major technology companies have joined forces to develop new artificial intelligence standards.",
    content:
      "In a landmark announcement, several leading tech companies revealed plans to collaborate on developing ethical AI standards that will shape the future of the industry...",
    url: "https://example.com/tech-ai-collaboration",
    urlToImage: "https://picsum.photos/id/1/800/600",
    source: "Tech Daily",
    author: "Jane Smith",
    publishedAt: new Date().toISOString(),
    category: "technology",
  },
  {
    id: "sample-2",
    title: "Global Markets React to Economic Policy Changes",
    description:
      "Stock markets worldwide show volatility following new economic policies.",
    content:
      "Investors are closely monitoring market reactions after the announcement of significant changes to economic policies in several major economies...",
    url: "https://example.com/markets-economic-policy",
    urlToImage: "https://picsum.photos/id/20/800/600",
    source: "Financial Times",
    author: "John Doe",
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    category: "business",
  },
  {
    id: "sample-3",
    title: "New Study Reveals Health Benefits of Mediterranean Diet",
    description:
      "Research confirms significant health improvements from following Mediterranean eating patterns.",
    content:
      "A comprehensive study published today has provided further evidence of the numerous health benefits associated with adhering to a Mediterranean diet...",
    url: "https://example.com/mediterranean-diet-benefits",
    urlToImage: "https://picsum.photos/id/30/800/600",
    source: "Health Journal",
    author: "Dr. Maria Rodriguez",
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    category: "health",
  },
  {
    id: "sample-4",
    title: "Scientists Discover New Species in Amazon Rainforest",
    description:
      "Expedition team identifies previously unknown plant and insect species.",
    content:
      "A team of international researchers has announced the discovery of several new species during their recent expedition to remote areas of the Amazon rainforest...",
    url: "https://example.com/amazon-new-species",
    urlToImage: "https://picsum.photos/id/40/800/600",
    source: "Science Today",
    author: "Dr. Robert Chen",
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
    category: "science",
  },
  {
    id: "sample-5",
    title: "Major Sports League Announces Expansion Teams",
    description: "Two new cities will join the league in the upcoming season.",
    content:
      "Sports fans are celebrating the announcement that two additional cities will be home to new professional teams starting next season...",
    url: "https://example.com/sports-league-expansion",
    urlToImage: "https://picsum.photos/id/50/800/600",
    source: "Sports Network",
    author: "Mike Johnson",
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    category: "sports",
  },
];

export async function fetchNewsFromAPI(
  page = 1,
  query?: string,
  category?: string
): Promise<Article[]> {
  // Check if API key is available
  if (!NEWS_API_KEY) {
    console.warn("NEWS_API_KEY is not set. Using sample data instead.");
    return filterSampleArticles(query, category);
  }

  const pageSize = 10;

  let url = `${NEWS_API_URL}/top-headlines?pageSize=${pageSize}&page=${page}&language=en`;

  if (query) {
    url += `&q=${encodeURIComponent(query)}`;
  }

  if (category) {
    url += `&category=${encodeURIComponent(category)}`;
  }

  // If no category or query is provided, default to general category
  if (!category && !query) {
    url += "&category=general";
  }

  try {
    const response = await fetch(url, {
      headers: {
        "X-Api-Key": NEWS_API_KEY,
      },
      next: { revalidate: 600 }, // Cache for 10 minutes
    });

    if (!response.ok) {
      console.error(
        `News API error: ${response.status} - ${response.statusText}`
      );
      // If API request fails, fall back to sample data
      return filterSampleArticles(query, category);
    }

    const data = await response.json();

    console.log(`Fetched ${data.articles.length} articles from News API`);

    return data.articles.map((article: any) => {
      // Generate a unique ID for the article by encoding the URL or using a hash
      const id = encodeURIComponent(article.url);
      // For debugging
      console.log(`Generated ID for article: ${id.substring(0, 30)}...`);

      return {
        id: id, // Use encoded URL as ID
        title: article.title || "No title available",
        description: article.description || "",
        content: article.content || "",
        url: article.url,
        urlToImage: article.urlToImage || "",
        source: article.source?.name || "Unknown",
        author: article.author || "",
        publishedAt: article.publishedAt || new Date().toISOString(),
        category: category || "general",
      };
    });
  } catch (error) {
    console.error("Error fetching from News API:", error);
    // If any error occurs, fall back to sample data
    return filterSampleArticles(query, category);
  }
}

// Helper function to filter sample articles based on query and category
function filterSampleArticles(query?: string, category?: string): Article[] {
  let filteredArticles = [...SAMPLE_ARTICLES];

  if (category) {
    filteredArticles = filteredArticles.filter(
      (article) => article.category?.toLowerCase() === category.toLowerCase()
    );
  }

  if (query) {
    const lowerQuery = query.toLowerCase();
    filteredArticles = filteredArticles.filter(
      (article) =>
        article.title.toLowerCase().includes(lowerQuery) ||
        (article.description &&
          article.description.toLowerCase().includes(lowerQuery))
    );
  }

  return filteredArticles;
}

export async function getNewsArticles(
  page = 1,
  query?: string,
  category?: string
): Promise<Article[]> {
  try {
    const supabase = createClient();

    // Fallback to API directly if there's no query or specific request
    // This prevents excessive Supabase queries that might be failing
    if (!query && !category && page <= 1) {
      console.log("Fetching news directly from API for initial load");
      const articles = await fetchNewsFromAPI(page, query, category);

      // Try to cache the articles in the background
      try {
        if (articles.length > 0) {
          console.log(`Caching ${articles.length} articles in Supabase`);
          await supabase.from("articles").upsert(
            articles.map((article) => ({
              id: article.id,
              title: article.title,
              description: article.description,
              content: article.content,
              url: article.url,
              urlToImage: article.urlToImage,
              source: article.source,
              author: article.author,
              publishedat: article.publishedAt,
              category: article.category,
            })),
            { onConflict: "id" }
          );
        }
      } catch (cacheError) {
        console.error("Error caching articles:", cacheError);
      }

      return articles;
    }

    // Try to get articles from Supabase first
    console.log("Attempting to fetch articles from Supabase cache");
    let supabaseQuery = supabase
      .from("articles")
      .select("*")
      .order("publishedat", { ascending: false })
      .limit(10)
      .range((page - 1) * 10, page * 10 - 1);

    if (query) {
      supabaseQuery = supabaseQuery.ilike("title", `%${query}%`);
    }

    if (category) {
      supabaseQuery = supabaseQuery.eq("category", category);
    }

    const { data: cachedArticles, error } = await supabaseQuery;

    if (error) {
      console.error("Supabase query error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      // If there's an error with Supabase, fall back to API
      console.log("Falling back to News API due to Supabase error");
      return await fetchNewsFromAPI(page, query, category);
    }

    // If we have cached articles and it's not a specific search, return them
    if (cachedArticles && cachedArticles.length > 0 && !query) {
      console.log(`Found ${cachedArticles.length} cached articles in Supabase`);
      try {
        // Get bookmark status for each article
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          return cachedArticles;
        }

        let bookmarkedIds = new Set<string>();

        if (session?.user) {
          const { data: bookmarks, error: bookmarkError } = await supabase
            .from("bookmarks")
            .select("article_id")
            .eq("user_id", session.user.id);

          if (bookmarkError) {
            console.error("Bookmark fetch error:", bookmarkError);
          } else {
            bookmarkedIds = new Set(bookmarks?.map((b) => b.article_id) || []);
          }
        }

        return cachedArticles.map((article) => ({
          ...article,
          isBookmarked: bookmarkedIds.has(article.id),
        }));
      } catch (error) {
        console.error("Error processing cached articles:", error);
        return cachedArticles;
      }
    }

    // Otherwise, fetch from API and cache in Supabase
    console.log("No cached articles found, fetching from News API");
    const articles = await fetchNewsFromAPI(page, query, category);

    // Cache articles in Supabase (upsert to avoid duplicates)
    if (articles.length > 0) {
      try {
        console.log(`Caching ${articles.length} articles in Supabase`);
        await supabase.from("articles").upsert(
          articles.map((article) => ({
            id: article.id,
            title: article.title,
            description: article.description,
            content: article.content,
            url: article.url,
            urlToImage: article.urlToImage,
            source: article.source,
            author: article.author,
            publishedat: article.publishedAt,
            category: article.category,
          })),
          { onConflict: "id" }
        );
      } catch (error) {
        console.error("Error caching articles:", error);
        // Continue even if caching fails
      }
    }

    return articles;
  } catch (error) {
    console.error("Error in getNewsArticles:", error);
    // If all else fails, return sample data
    return filterSampleArticles(query, category);
  }
}

export async function refreshNewsCache(): Promise<void> {
  const supabase = createClient();

  // Fetch fresh articles for each category
  const categories = [
    "business",
    "entertainment",
    "general",
    "health",
    "science",
    "sports",
    "technology",
  ];

  for (const category of categories) {
    try {
      const articles = await fetchNewsFromAPI(1, undefined, category);

      if (articles.length > 0) {
        await supabase.from("articles").upsert(
          articles.map((article) => ({
            id: article.id,
            title: article.title,
            description: article.description,
            content: article.content,
            url: article.url,
            urlToImage: article.urlToImage,
            source: article.source,
            author: article.author,
            publishedat: article.publishedAt,
            category: article.category,
          })),
          { onConflict: "id" }
        );
      }
    } catch (error) {
      console.error(`Error refreshing ${category} news:`, error);
    }
  }
}
