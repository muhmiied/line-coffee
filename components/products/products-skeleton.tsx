export function ProductsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Skeleton */}
        <aside className="lg:w-64 shrink-0">
          <div className="space-y-6">
            <div className="h-6 w-24 bg-muted rounded animate-pulse" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded animate-pulse" style={{ width: `${70 + Math.random() * 30}%` }} />
              ))}
            </div>
          </div>
        </aside>

        {/* Products Grid Skeleton */}
        <main className="flex-1">
          <div className="h-4 w-32 bg-muted rounded mb-6 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-xl overflow-hidden border border-border/50"
              >
                <div className="aspect-square bg-muted animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-muted rounded w-1/4 animate-pulse" />
                  <div className="h-5 bg-muted rounded w-3/4 animate-pulse" />
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-muted rounded w-16 animate-pulse" />
                    <div className="h-3 bg-muted rounded w-12 animate-pulse" />
                  </div>
                  <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
