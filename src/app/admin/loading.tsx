import { Skeleton } from '@/components/ui/skeleton'

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <Skeleton variant="text" className="w-48 h-8" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton variant="rectangular" className="h-72 rounded-xl" />
        <Skeleton variant="rectangular" className="h-72 rounded-xl" />
      </div>
    </div>
  )
}
