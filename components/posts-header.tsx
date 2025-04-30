"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { PenSquare } from "lucide-react"
import { motion } from "framer-motion"

export function PostsHeader() {
  const { status } = useSession()

  return (
    <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold tracking-tight">All Posts</h1>
        <p className="text-muted-foreground">Discover interesting articles from our community</p>
      </motion.div>
      {status === "authenticated" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Button asChild>
            <Link href="/create">
              <PenSquare className="mr-2 h-4 w-4" />
              Write a Post
            </Link>
          </Button>
        </motion.div>
      )}
    </div>
  )
}
