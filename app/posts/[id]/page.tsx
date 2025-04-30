import { Suspense } from "react"
import { PostDetail } from "@/components/post-detail"
import { CommentSection } from "@/components/comment-section"
import { PostDetailSkeleton, CommentsSkeleton } from "@/components/skeletons"
import { notFound } from "next/navigation"
import { connectToDatabase } from "@/lib/mongodb"
import { Post } from "@/lib/models"
import mongoose from "mongoose"

export async function generateMetadata({ params }: { params: { id: string } }) {
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return {
      title: "Post Not Found",
      description: "The requested post could not be found",
    }
  }

  try {
    await connectToDatabase()
    const post = await Post.findById(params.id).populate("author", "name").lean()

    if (!post) {
      return {
        title: "Post Not Found",
        description: "The requested post could not be found",
      }
    }

    return {
      title: post.title,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        images: post.coverImage ? [{ url: post.coverImage }] : [],
      },
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Blog Post",
      description: "Read our latest blog post",
    }
  }
}

export default async function PostPage({ params }: { params: { id: string } }) {
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    notFound()
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <Suspense fallback={<PostDetailSkeleton />}>
        <PostDetail id={params.id} />
      </Suspense>
      <Suspense fallback={<CommentsSkeleton />}>
        <CommentSection postId={params.id} />
      </Suspense>
    </div>
  )
}
