"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Loader2, Edit, Trash2, Calendar, Tag } from "lucide-react"
import { motion } from "framer-motion"

interface PostDetailProps {
  id: string
}

export function PostDetail({ id }: PostDetailProps) {
  const [post, setPost] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch post")
        }

        const data = await response.json()
        setPost(data.post)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load post",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [id, toast])

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete post")
      }

      toast({
        title: "Success",
        description: "Post deleted successfully",
      })

      router.push("/posts")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Post not found</h2>
        <p className="text-muted-foreground mt-2">The post you are looking for does not exist or has been removed.</p>
        <Button asChild className="mt-4">
          <Link href="/posts">Back to Posts</Link>
        </Button>
      </div>
    )
  }

  const isAuthor = session?.user?.id === post.author._id

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      {post.coverImage && (
        <div className="relative aspect-video mb-8 overflow-hidden rounded-xl">
          <Image src={post.coverImage || "/placeholder.svg"} alt={post.title} fill className="object-cover" priority />
        </div>
      )}

      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">{post.title}</h1>

      <div className="flex flex-wrap items-center gap-4 mb-8">
        <Link href={`/profile/${post.author._id}`} className="flex items-center gap-2">
          <div className="relative w-10 h-10 overflow-hidden rounded-full">
            <Image
              src={post.author.image || "/placeholder.svg?height=40&width=40"}
              alt={post.author.name}
              fill
              className="object-cover"
            />
          </div>
          <span className="font-medium">{post.author.name}</span>
        </Link>

        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <time dateTime={new Date(post.createdAt).toISOString()}>{formatDate(post.createdAt)}</time>
        </div>

        {isAuthor && (
          <div className="flex items-center gap-2 ml-auto">
            <Button asChild variant="outline" size="sm">
              <Link href={`/edit/${post._id}`}>
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Link>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isDeleting}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your post and remove it from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="flex items-center gap-2 mb-8">
          <Tag className="w-4 h-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
    </motion.article>
  )
}
