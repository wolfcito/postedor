import { Suspense } from "react"
import { HomeContent } from "@/components/home-content"

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomeContent />
    </Suspense>
  )
}

function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-16 animate-pulse">
          <div className="h-12 w-64 bg-muted rounded-lg mx-auto mb-4" />
          <div className="h-6 w-96 bg-muted rounded-lg mx-auto" />
        </div>
      </div>
    </div>
  )
}
