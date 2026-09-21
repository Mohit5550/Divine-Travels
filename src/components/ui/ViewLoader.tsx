import { cn } from "@/lib/utils"

export function ViewLoader({ className }: { className?: string }) {
  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-gray-50/80", className)}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin" />
        <div className="flex flex-col gap-2 w-64">
          <div className="h-4 bg-accent animate-pulse rounded w-3/4" />
          <div className="h-3 bg-accent animate-pulse rounded w-1/2" />
        </div>
        <p className="text-xs text-muted-foreground mt-2">Loading...</p>
      </div>
    </div>
  )
}