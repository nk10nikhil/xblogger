import { connectToDatabase } from "@/lib/mongodb"
import { Post, Comment } from "@/lib/models"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import mongoose from "mongoose"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 })
    }

    await connectToDatabase()

    const post = await Post.findById(id).populate("author", "name image").lean()

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 })
    }

    // Get comments for this post
    const comments = await Comment.find({ post: id }).sort({ createdAt: -1 }).populate("author", "name image").lean()

    return NextResponse.json({ post, comments })
  } catch (error) {
    console.error("Error fetching post:", error)
    return NextResponse.json({ message: "An error occurred while fetching the post" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 })
    }

    const { title, content, coverImage, excerpt, tags, featured } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ message: "Title and content are required" }, { status: 400 })
    }

    await connectToDatabase()

    const post = await Post.findById(id)

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 })
    }

    // Check if the user is the author of the post
    if (post.author.toString() !== session.user.id) {
      return NextResponse.json({ message: "You are not authorized to update this post" }, { status: 403 })
    }

    post.title = title
    post.content = content
    post.coverImage = coverImage || post.coverImage
    post.excerpt = excerpt || content.substring(0, 150) + "..."
    post.tags = tags || post.tags
    if (featured !== undefined) post.featured = featured
    post.updatedAt = new Date()

    await post.save()

    return NextResponse.json({ message: "Post updated successfully", post })
  } catch (error) {
    console.error("Error updating post:", error)
    return NextResponse.json({ message: "An error occurred while updating the post" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 })
    }

    await connectToDatabase()

    const post = await Post.findById(id)

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 })
    }

    // Check if the user is the author of the post
    if (post.author.toString() !== session.user.id) {
      return NextResponse.json({ message: "You are not authorized to delete this post" }, { status: 403 })
    }

    await Post.findByIdAndDelete(id)

    // Delete all comments associated with this post
    await Comment.deleteMany({ post: id })

    return NextResponse.json({ message: "Post deleted successfully" })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json({ message: "An error occurred while deleting the post" }, { status: 500 })
  }
}
