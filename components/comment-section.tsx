"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Send, Edit, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

interface CommentSectionProps {
  postId: string
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: session, status } = useSession()
  const { toast } = useToast()

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch comments")
        }

        const data = await response.json()
        setComments(data.comments || [])
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load comments",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchComments()
  }, [postId, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim()) return

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          content: newComment,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add comment")
      }

      const data = await response.json()

      setComments([data.comment, ...comments])
      setNewComment("")

      toast({
        title: "Success",
        description: "Comment added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (commentId: string) => {
    if (!editText.trim()) {
      setEditingComment(null)
      return
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: editText,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update comment")
      }

      setComments(comments.map((comment) => (comment._id === commentId ? { ...comment, content: editText } : comment)))

      setEditingComment(null)

      toast({
        title: "Success",
        description: "Comment updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete comment")
      }

      setComments(comments.filter((comment) => comment._id !== commentId))

      toast({
        title: "Success",
        description: "Comment deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  return (
    <section className="mt-12 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Comments</h2>

      {status === "authenticated" ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={session.user.image || ""} alt={session.user.name || "User"} />
              <AvatarFallback>
                {session.user.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-2 resize-none"
                rows={3}
              />
              <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please{" "}
              <Link href="/login" className="text-primary hover:underline">
                log in
              </Link>{" "}
              to leave a comment.
            </p>
          </CardContent>
        </Card>
      )}

      {comments.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to comment!</p>
      ) : (
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Link href={`/profile/${comment.author._id}`}>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={comment.author.image || ""} alt={comment.author.name} />
                        <AvatarFallback>
                          {comment.author.name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <Link href={`/profile/${comment.author._id}`} className="font-medium hover:underline">
                            {comment.author.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</p>
                        </div>
                        {session?.user?.id === comment.author._id && (
                          <div className="flex gap-2">
                            {editingComment === comment._id ? (
                              <Button size="sm" variant="ghost" onClick={() => setEditingComment(null)}>
                                Cancel
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingComment(comment._id)
                                  setEditText(comment.content)
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => handleDelete(comment._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      {editingComment === comment._id ? (
                        <div className="mt-2">
                          <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="mb-2 resize-none"
                            rows={3}
                          />
                          <Button size="sm" onClick={() => handleEdit(comment._id)}>
                            Save
                          </Button>
                        </div>
                      ) : (
                        <p className="mt-2">{comment.content}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </section>
  )
}
