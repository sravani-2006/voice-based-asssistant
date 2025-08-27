import { Suspense } from "react"
import NewsFeed from "@/components/news-feed"
import SearchBar from "@/components/search-bar"
import CategoryFilter from "@/components/category-filter"
import NewsRefreshButton from "@/components/news-refresh-button"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">News Aggregator</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchBar />
        </div>
        <div className="flex gap-2">
          <CategoryFilter />
          <NewsRefreshButton />
        </div>
      </div>

      <Suspense fallback={<NewsFeedSkeleton />}>
        <NewsFeed />
      </Suspense>
    </main>
  )
}

function NewsFeedSkeleton() {
  return (
    <div className="space-y-6">
      {Array(5)
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
  )
}

