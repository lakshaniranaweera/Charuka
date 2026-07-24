'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DropdownContextValue {
  open: boolean
  setOpen: (v: boolean) => void
}
const DropdownContext = React.createContext<DropdownContextValue | null>(null)

function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={ref} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

function DropdownMenuTrigger({
  children,
  asChild: _asChild,
}: {
  children: React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>
  asChild?: boolean
}) {
  const ctx = React.useContext(DropdownContext)!
  return React.cloneElement(children, {
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation()
      ctx.setOpen(!ctx.open)
      children.props.onClick?.(e)
    },
  })
}

function DropdownMenuContent({
  className,
  align = 'end',
  children,
}: {
  className?: string
  align?: 'start' | 'end'
  children: React.ReactNode
}) {
  const ctx = React.useContext(DropdownContext)!
  return (
    <AnimatePresence>
      {ctx.open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -4 }}
          transition={{ duration: 0.12 }}
          className={cn(
            'absolute z-50 mt-2 min-w-[10rem] overflow-hidden rounded-xl border border-border/60 bg-popover p-1 text-popover-foreground shadow-xl',
            align === 'end' ? 'right-0' : 'left-0',
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function DropdownMenuItem({
  className,
  onClick,
  disabled,
  children,
}: {
  className?: string
  onClick?: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  const ctx = React.useContext(DropdownContext)!
  return (
    <button
      disabled={disabled}
      onClick={() => {
        onClick?.()
        ctx.setOpen(false)
      }}
      className={cn(
        'flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4',
        className
      )}
    >
      {children}
    </button>
  )
}

function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-border/60" />
}

function DropdownMenuLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2.5 py-1.5 text-xs font-semibold text-muted-foreground">
      {children}
    </div>
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
}
