import { Suspense } from "react"
import { ProfileHeader } from "@/components/profile-header"
import { ProfilePosts } from "@/components/profile-posts"
import { ProfileSkeleton, PostsSkeleton } from "@/components/skeletons"
import { notFound } from "next/navigation"
import { connectToDatabase } from "@/lib/mongodb"
import { User } from "@/lib/models"
import mongoose from "mongoose"

export async function generateMetadata({ params }: { params: { id: string } }) {
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return {
      title: "Profile Not Found",
      description: "The requested profile could not be found",
    }
  }

  try {
    await connectToDatabase()
    const user = await User.findById(params.id).select("name bio").lean()

    if (!user) {
      return {
        title: "Profile Not Found",
        description: "The requested profile could not be found",
      }
    }

    return {
      title: `${user.name}'s Profile`,
      description: user.bio || `Check out ${user.name}'s posts on Blogger`,
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "User Profile",
      description: "View user profile and posts",
    }
  }
}

export default async function ProfilePage({ params }: { params: { id: string } }) {
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    notFound()
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileHeader id={params.id} />
      </Suspense>
      <Suspense fallback={<PostsSkeleton />}>
        <ProfilePosts id={params.id} />
      </Suspense>
    </div>
  )
}
