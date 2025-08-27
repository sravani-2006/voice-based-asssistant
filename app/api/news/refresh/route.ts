import { NextResponse } from "next/server"
import { refreshNewsCache } from "@/lib/news-service"

export async function POST() {
  try {
    await refreshNewsCache()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error refreshing news cache:", error)
    return NextResponse.json({ error: "Failed to refresh news cache" }, { status: 500 })
  }
}

