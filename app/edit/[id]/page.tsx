"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Editor } from "@/components/editor"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

export default function EditPostPage({ params }: { params: { id: string } }) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [tags, setTags] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { status } = useSession()
  const id = params.id

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  useEffect(() => {
    let isMounted = true

    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch post")
        }

        const data = await response.json()

        if (isMounted) {
          setTitle(data.post.title)
          setContent(data.post.content)
          setCoverImage(data.post.coverImage || "")
          setTags(data.post.tags ? data.post.tags.join(", ") : "")
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch post data",
          variant: "destructive",
        })
        router.push("/posts")
      } finally {
        if (isMounted) {
          setIsFetching(false)
        }
      }
    }

    if (id) {
      fetchPost()
    }

    return () => {
      isMounted = false
    }
  }, [id, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !content) {
      toast({
        title: "Missing fields",
        description: "Title and content are required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          coverImage,
          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update post")
      }

      toast({
        title: "Success",
        description: "Your post has been updated",
      })

      router.push(`/posts/${id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while updating the post",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="border-2">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Edit post</CardTitle>
            <CardDescription>Update your post content</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a captivating title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverImage">Cover Image URL (optional)</Label>
                <Input
                  id="coverImage"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated, optional)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="technology, programming, web development"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Editor value={content} onChange={setContent} placeholder="Write your post content here..." />
              </div>
              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Updating post..." : "Update Post"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push(`/posts/${id}`)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
