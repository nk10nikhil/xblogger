import { connectToDatabase } from "@/lib/mongodb"
import { Post } from "@/lib/models"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const featured = searchParams.get("featured") === "true"
    const author = searchParams.get("author") || null

    const skip = (page - 1) * limit

    await connectToDatabase()

    const query: any = {}

    if (featured) {
      query.featured = true
    }

    if (author) {
      query.author = author
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name image")
      .lean()

    const total = await Post.countDocuments(query)

    return NextResponse.json({
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ message: "An error occurred while fetching posts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { title, content, coverImage, excerpt, tags } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ message: "Title and content are required" }, { status: 400 })
    }

    await connectToDatabase()

    const newPost = new Post({
      title,
      content,
      coverImage: coverImage || "",
      excerpt: excerpt || content.substring(0, 150) + "...",
      tags: tags || [],
      author: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await newPost.save()

    return NextResponse.json({ message: "Post created successfully", post: newPost }, { status: 201 })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ message: "An error occurred while creating the post" }, { status: 500 })
  }
}
