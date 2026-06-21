import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  const ref = React.useRef<HTMLTextAreaElement>(null)

  React.useLayoutEffect(() => {
    const target = ref.current
    if (!target) return
    target.style.height = 'auto'
    target.style.height = target.scrollHeight + 'px'
  }, [props.value])

  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "resize-y overflow-auto",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
