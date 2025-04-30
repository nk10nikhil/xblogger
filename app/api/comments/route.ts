import { connectToDatabase } from "@/lib/mongodb"
import { Comment, Post } from "@/lib/models"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import mongoose from "mongoose"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { postId, content } = await request.json()

    if (!postId || !content) {
      return NextResponse.json({ message: "Post ID and content are required" }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 })
    }

    await connectToDatabase()

    // Check if post exists
    const post = await Post.findById(postId)
    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 })
    }

    const newComment = new Comment({
      post: postId,
      author: session.user.id,
      content,
      createdAt: new Date(),
    })

    await newComment.save()

    // Populate author information
    const populatedComment = await Comment.findById(newComment._id).populate("author", "name image").lean()

    return NextResponse.json({ message: "Comment added successfully", comment: populatedComment }, { status: 201 })
  } catch (error) {
    console.error("Error adding comment:", error)
    return NextResponse.json({ message: "An error occurred while adding the comment" }, { status: 500 })
  }
}
