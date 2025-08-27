"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const categories = [
  { value: "all", label: "All Categories" }, // Changed from empty string to 'all'
  { value: "business", label: "Business" },
  { value: "entertainment", label: "Entertainment" },
  { value: "general", label: "General" },
  { value: "health", label: "Health" },
  { value: "science", label: "Science" },
  { value: "sports", label: "Sports" },
  { value: "technology", label: "Technology" },
]

export default function CategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams)

    if (value && value !== "all") {
      // Updated to check for 'all' instead of empty string
      params.set("category", value)
    } else {
      params.delete("category")
    }

    router.push(`/?${params.toString()}`)
  }

  return (
    <Select
      defaultValue={searchParams.get("category") || "all"} // Updated default value to 'all'
      onValueChange={handleCategoryChange}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Category" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.value} value={category.value}>
            {category.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

