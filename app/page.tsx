import { FeaturedPosts } from "@/components/featured-posts"
import { HeroSection } from "@/components/hero-section"
import { RecentPosts } from "@/components/recent-posts"
import { Suspense } from "react"
import { PostsSkeleton } from "@/components/skeletons"

export default function Home() {
  return (
    <div className="container px-4 py-8 mx-auto space-y-16">
      <HeroSection />
      <Suspense fallback={<PostsSkeleton type="featured" />}>
        <FeaturedPosts />
      </Suspense>
      <Suspense fallback={<PostsSkeleton type="recent" />}>
        <RecentPosts />
      </Suspense>
    </div>
  )
}
