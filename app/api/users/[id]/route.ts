import { connectToDatabase } from "@/lib/mongodb"
import { User, Post } from "@/lib/models"
import { NextResponse } from "next/server"
import mongoose from "mongoose"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 })
    }

    await connectToDatabase()

    const user = await User.findById(id).select("-password").lean()

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Get post count
    const postCount = await Post.countDocuments({ author: id })

    return NextResponse.json({
      user: {
        ...user,
        postCount,
      },
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ message: "An error occurred while fetching the user" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    if (id !== session.user.id) {
      return NextResponse.json({ message: "You can only update your own profile" }, { status: 403 })
    }

    const { name, bio, image } = await request.json()

    await connectToDatabase()

    const user = await User.findById(id)

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    if (name) user.name = name
    if (bio !== undefined) user.bio = bio
    if (image) user.image = image

    await user.save()

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        bio: user.bio,
      },
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ message: "An error occurred while updating the user" }, { status: 500 })
  }
}
