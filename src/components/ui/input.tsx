import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  const ref = React.useRef<HTMLInputElement>(null)
  return (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.shiftKey) {
          e.preventDefault()
          const target = e.target as HTMLInputElement
          const start = target.selectionStart
          const end = target.selectionEnd
          const currentValue = target.value
          const newValue = currentValue.substring(0, start) + '\n' + currentValue.substring(end)
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
          if (nativeInputValueSetter) {
            nativeInputValueSetter.call(target, newValue)
            target.dispatchEvent(new Event('input', { bubbles: true }))
          }
          setTimeout(() => {
            target.selectionStart = target.selectionEnd = start + 1
          }, 0)
        }
        props.onKeyDown?.(e)
      }}
      {...props}
    />
  )
}

export { Input }
