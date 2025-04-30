"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Settings } from "lucide-react"
import { motion } from "framer-motion"

interface ProfileHeaderProps {
  id: string
}

export function ProfileHeader({ id }: ProfileHeaderProps) {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { data: session } = useSession()
  const { toast } = useToast()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch user")
        }

        const data = await response.json()
        setUser(data.user)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [id, toast])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">User not found</h2>
        <p className="text-muted-foreground mt-2">The user you are looking for does not exist or has been removed.</p>
        <Button asChild className="mt-4">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    )
  }

  const isOwnProfile = session?.user?.id === id

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-12"
    >
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
        <div className="relative w-32 h-32 overflow-hidden rounded-full border-4 border-background shadow-lg">
          <Image
            src={user.image || "/placeholder.svg?height=128&width=128"}
            alt={user.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold">{user.name}</h1>

          {user.bio ? (
            <p className="mt-2 text-muted-foreground max-w-2xl">{user.bio}</p>
          ) : (
            <p className="mt-2 text-muted-foreground italic">
              {isOwnProfile ? "Add a bio to tell people about yourself" : "This user hasn't added a bio yet"}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-4 justify-center md:justify-start">
            <div className="text-center">
              <p className="text-2xl font-bold">{user.postCount}</p>
              <p className="text-sm text-muted-foreground">Posts</p>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold">{new Date(user.createdAt).getFullYear()}</p>
              <p className="text-sm text-muted-foreground">Joined</p>
            </div>
          </div>
        </div>

        {isOwnProfile && (
          <Button asChild variant="outline">
            <Link href="/settings">
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </Link>
          </Button>
        )}
      </div>
    </motion.div>
  )
}
