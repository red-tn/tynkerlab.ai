import { Logo } from '@/components/brand/logo'

export default function RootLoading() {
  return (
    <div className="min-h-screen relative z-[1] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-pulse">
          <Logo size={48} />
        </div>
        <div className="h-1 w-32 bg-nyx-border rounded-full overflow-hidden">
          <div className="h-full w-1/2 gradient-primary rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  )
}
