import { Suspense } from "react"
import { PostsList } from "@/components/posts-list"
import { PostsSkeleton } from "@/components/skeletons"
import { PostsHeader } from "@/components/posts-header"

export default function PostsPage() {
  return (
    <div className="container px-4 py-8 mx-auto">
      <PostsHeader />
      <Suspense fallback={<PostsSkeleton />}>
        <PostsList />
      </Suspense>
    </div>
  )
}
