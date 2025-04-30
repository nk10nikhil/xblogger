import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { connectToDatabase } from "@/lib/mongodb"
import { Post } from "@/lib/models"

interface ProfilePostsProps {
  id: string
}

export async function ProfilePosts({ id }: ProfilePostsProps) {
  await connectToDatabase()

  const posts = await Post.find({ author: id }).sort({ createdAt: -1 }).limit(12).lean()

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No posts found.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Posts</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
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
                <Badge variant="secondary">{formatDate(post.createdAt)}</Badge>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
