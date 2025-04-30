import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { connectToDatabase } from "@/lib/mongodb"
import { Post } from "@/lib/models"

export async function FeaturedPosts() {
  await connectToDatabase()

  const featuredPosts = await Post.find({ featured: true })
    .sort({ createdAt: -1 })
    .limit(3)
    .populate("author", "name image")
    .lean()

  if (featuredPosts.length === 0) {
    return null
  }

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Featured Posts</h2>
        <Link href="/posts" className="text-primary hover:underline">
          View all posts
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {featuredPosts.map((post) => (
          <Link key={post._id} href={`/posts/${post._id}`}>
            <Card className="overflow-hidden h-full transition-all hover:shadow-md">
              <div className="relative aspect-video">
                <Image
                  src={post.coverImage || "/placeholder.svg?height=400&width=600"}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-xl line-clamp-2">{post.title}</h3>
                  <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 overflow-hidden rounded-full">
                    <Image
                      src={post.author.image || "/placeholder.svg?height=32&width=32"}
                      alt={post.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-sm">{post.author.name}</span>
                </div>
                <Badge variant="secondary">{formatDate(post.createdAt)}</Badge>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
