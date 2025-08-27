"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

export default function NewsRefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // Force refresh from API
      await fetch("/api/news/refresh", { method: "POST" })
      router.refresh()
    } catch (error) {
      console.error("Error refreshing news:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing} title="Refresh News">
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
    </Button>
  )
}

