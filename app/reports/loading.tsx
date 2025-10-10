export default function ReportsLoading() {
  return (
    <div className="page-shell py-8">
      <div className="mb-8">
        <div className="h-9 w-64 bg-muted animate-pulse rounded mb-2" />
        <div className="h-5 w-96 bg-muted animate-pulse rounded" />
      </div>
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
