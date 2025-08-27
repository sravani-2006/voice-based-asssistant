"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Newspaper, Bookmark } from "lucide-react";
import { AuthButton } from "@/components/auth-button";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Newspaper className="h-6 w-6" />
          <span className="font-bold text-xl">News Aggregator</span>
        </Link>

        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-2">
            <Button variant={pathname === "/" ? "default" : "ghost"} asChild>
              <Link href="/">Home</Link>
            </Button>
            <Button
              variant={pathname === "/bookmarks" ? "default" : "ghost"}
              asChild
            >
              <Link href="/bookmarks" className="flex items-center gap-2">
                <Bookmark className="h-4 w-4" />
                Bookmarks
              </Link>
            </Button>
          </nav>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  );
}
