import { connectToDatabase } from "@/lib/mongodb"
import { Comment } from "@/lib/models"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import mongoose from "mongoose"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid comment ID" }, { status: 400 })
    }

    await connectToDatabase()

    const comment = await Comment.findById(id)

    if (!comment) {
      return NextResponse.json({ message: "Comment not found" }, { status: 404 })
    }

    // Check if the user is the author of the comment
    if (comment.author.toString() !== session.user.id) {
      return NextResponse.json({ message: "You are not authorized to delete this comment" }, { status: 403 })
    }

    await Comment.findByIdAndDelete(id)

    return NextResponse.json({ message: "Comment deleted successfully" })
  } catch (error) {
    console.error("Error deleting comment:", error)
    return NextResponse.json({ message: "An error occurred while deleting the comment" }, { status: 500 })
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
      return NextResponse.json({ message: "Invalid comment ID" }, { status: 400 })
    }

    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ message: "Content is required" }, { status: 400 })
    }

    await connectToDatabase()

    const comment = await Comment.findById(id)

    if (!comment) {
      return NextResponse.json({ message: "Comment not found" }, { status: 404 })
    }

    // Check if the user is the author of the comment
    if (comment.author.toString() !== session.user.id) {
      return NextResponse.json({ message: "You are not authorized to update this comment" }, { status: 403 })
    }

    comment.content = content
    comment.updatedAt = new Date()

    await comment.save()

    return NextResponse.json({ message: "Comment updated successfully", comment })
  } catch (error) {
    console.error("Error updating comment:", error)
    return NextResponse.json({ message: "An error occurred while updating the comment" }, { status: 500 })
  }
}
