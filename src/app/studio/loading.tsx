import { Skeleton } from '@/components/ui/skeleton'

export default function StudioLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="space-y-2">
        <Skeleton variant="text" className="w-48 h-8" />
        <Skeleton variant="text" className="w-72 h-4" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Skeleton variant="rectangular" className="h-12 rounded-lg" />
          <Skeleton variant="rectangular" className="h-32 rounded-lg" />
          <Skeleton variant="rectangular" className="h-40 rounded-lg" />
          <Skeleton variant="rectangular" className="h-12 rounded-lg" />
        </div>
        <Skeleton variant="rectangular" className="h-80 rounded-xl" />
      </div>
    </div>
  )
}
