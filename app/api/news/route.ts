import { type NextRequest, NextResponse } from "next/server"
import { getNewsArticles } from "@/lib/news-service"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = Number.parseInt(searchParams.get("page") || "1")
  const query = searchParams.get("q") || undefined
  const category = searchParams.get("category") || undefined

  try {
    const articles = await getNewsArticles(page, query, category)
    return NextResponse.json(articles)
  } catch (error) {
    console.error("Error in news API route:", error)
    return NextResponse.json({ error: "Failed to fetch news articles" }, { status: 500 })
  }
}

