export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      articles: {
        Row: {
          id: string
          title: string
          description: string | null
          content: string | null
          url: string
          urlToImage: string | null
          source: string
          author: string | null
          publishedAt: string
          category: string | null
          created_at: string
        }
        Insert: {
          id: string
          title: string
          description?: string | null
          content?: string | null
          url: string
          urlToImage?: string | null
          source: string
          author?: string | null
          publishedAt: string
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          content?: string | null
          url?: string
          urlToImage?: string | null
          source?: string
          author?: string | null
          publishedAt?: string
          category?: string | null
          created_at?: string
        }
      }
      bookmarks: {
        Row: {
          id: string
          user_id: string
          article_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          article_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          article_id?: string
          created_at?: string
        }
      }
    }
  }
}

