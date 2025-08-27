export interface Article {
  id: string
  title: string
  description: string
  content?: string
  url: string
  urlToImage?: string
  source: string
  author?: string
  publishedAt: string
  category?: string
  isBookmarked?: boolean
}

export interface NewsApiResponse {
  articles: Article[]
  totalResults: number
}

