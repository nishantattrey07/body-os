import { cn } from "@/lib/utils"

/**
 * Skeleton component with shimmer animation
 * 
 * Used for loading states. The shimmer effect makes loading feel
 * more dynamic and responsive compared to static pulse.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md bg-zinc-200/60 relative overflow-hidden",
        // Shimmer effect overlay
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent",
        "before:animate-shimmer",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
