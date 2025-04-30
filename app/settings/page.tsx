"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import Image from "next/image"

export default function SettingsPage() {
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [image, setImage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { data: session, status, update } = useSession()

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  useEffect(() => {
    let isMounted = true

    const fetchProfile = async () => {
      if (!session?.user?.id) return

      try {
        const response = await fetch(`/api/users/${session.user.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch profile")
        }

        const data = await response.json()

        if (isMounted) {
          setName(data.user.name || "")
          setBio(data.user.bio || "")
          setImage(data.user.image || "")
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch profile data",
          variant: "destructive",
        })
      } finally {
        if (isMounted) {
          setIsFetching(false)
        }
      }
    }

    if (session?.user?.id) {
      fetchProfile()
    } else if (status !== "loading") {
      setIsFetching(false)
    }

    return () => {
      isMounted = false
    }
  }, [session, status, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name) {
      toast({
        title: "Missing fields",
        description: "Name is required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/users/${session?.user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          bio,
          image,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile")
      }

      // Update the session
      await update({
        ...session,
        user: {
          ...session?.user,
          name: data.user.name,
          image: data.user.image,
        },
      })

      toast({
        title: "Success",
        description: "Your profile has been updated",
      })

      router.push(`/profile/${session?.user?.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while updating your profile",
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
        <Card className="max-w-2xl mx-auto border-2">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Profile Settings</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Profile Image URL</Label>
                <Input
                  id="image"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                {image && (
                  <div className="mt-2">
                    <p className="mb-2 text-sm text-muted-foreground">Preview:</p>
                    <div className="relative w-20 h-20 overflow-hidden rounded-full">
                      <Image src={image || "/placeholder.svg"} alt="Profile preview" fill className="object-cover" />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Saving changes..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/profile/${session?.user?.id}`)}
                  className="flex-1"
                >
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
