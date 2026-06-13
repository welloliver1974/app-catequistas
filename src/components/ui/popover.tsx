"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface PopoverProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface PopoverTriggerProps {
  children: React.ReactNode
  asChild?: boolean
  className?: string
}

interface PopoverContentProps {
  children: React.ReactNode
  className?: string
  align?: "start" | "center" | "end"
}

const PopoverContext = React.createContext<{
  open: boolean
  setOpen: (v: boolean) => void
}>({ open: false, setOpen: () => {} })

export function Popover({ children, open: controlledOpen, onOpenChange }: PopoverProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = (v: boolean) => {
    if (onOpenChange) onOpenChange(v)
    else setInternalOpen(v)
  }

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">
        {children}
      </div>
    </PopoverContext.Provider>
  )
}

export function PopoverTrigger({ children, asChild, className }: PopoverTriggerProps) {
  const { setOpen } = React.useContext(PopoverContext)
  const child = asChild && React.isValidElement(children)
    ? React.cloneElement(children, { onClick: () => setOpen(true) } as React.HTMLAttributes<HTMLElement>)
    : (
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
    )
  return child
}

export function PopoverContent({ children, className, align = "center" }: PopoverContentProps) {
  const { open, setOpen } = React.useContext(PopoverContext)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-1 rounded-lg border border-border bg-popover text-popover-foreground shadow-lg outline-none",
        align === "center" && "left-1/2 -translate-x-1/2",
        align === "start" && "left-0",
        align === "end" && "right-0",
        className
      )}
    >
      {children}
    </div>
  )
}
