"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { ArrowRight, PenSquare } from "lucide-react"

export function HeroSection() {
  const { status } = useSession()

  return (
    <section className="py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Share Your Ideas With The World
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl mt-4">
                Join our community of writers and readers. Create, share, and discover amazing content from around the
                world.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row mt-6">
                {status === "authenticated" ? (
                  <Button asChild size="lg">
                    <Link href="/create">
                      <PenSquare className="mr-2 h-4 w-4" />
                      Start Writing
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="lg">
                    <Link href="/register">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
                <Button variant="outline" size="lg" asChild>
                  <Link href="/posts">Explore Posts</Link>
                </Button>
              </div>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center"
          >
            <div className="relative h-[350px] w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-purple-500/20 to-blue-500/20 p-1">
              <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] dark:bg-grid-white/10"></div>
              <div className="h-full w-full rounded-lg bg-background/80 p-6 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="h-6 w-2/3 rounded-md bg-muted animate-pulse"></div>
                  <div className="h-4 w-full rounded-md bg-muted animate-pulse"></div>
                  <div className="h-4 w-full rounded-md bg-muted animate-pulse"></div>
                  <div className="h-4 w-3/4 rounded-md bg-muted animate-pulse"></div>
                  <div className="h-32 w-full rounded-md bg-muted animate-pulse"></div>
                  <div className="h-4 w-full rounded-md bg-muted animate-pulse"></div>
                  <div className="h-4 w-full rounded-md bg-muted animate-pulse"></div>
                  <div className="h-4 w-2/3 rounded-md bg-muted animate-pulse"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
