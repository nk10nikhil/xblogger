import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

export function PostsSkeleton({ type = "regular" }: { type?: "regular" | "featured" | "recent" }) {
  const count = type === "featured" ? 3 : 6

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-video" />
          <CardContent className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-5 w-16" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

export function PostDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto">
      <Skeleton className="aspect-video w-full rounded-xl mb-8" />
      <Skeleton className="h-12 w-3/4 mb-4" />
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

export function CommentsSkeleton() {
  return (
    <div className="mt-12 max-w-4xl mx-auto">
      <Skeleton className="h-8 w-32 mb-6" />
      <Skeleton className="h-32 w-full mb-8 rounded-lg" />
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="mb-12">
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
        <Skeleton className="h-32 w-32 rounded-full" />
        <div className="flex-1 text-center md:text-left">
          <Skeleton className="h-8 w-48 mx-auto md:mx-0 mb-2" />
          <Skeleton className="h-4 w-full max-w-2xl mb-1" />
          <Skeleton className="h-4 w-full max-w-md mb-4" />
          <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
            <div className="text-center">
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="text-center">
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
