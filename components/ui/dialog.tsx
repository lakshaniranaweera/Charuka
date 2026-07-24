'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DialogContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}
const DialogContext = React.createContext<DialogContextValue | null>(null)

function useDialog() {
  const ctx = React.useContext(DialogContext)
  if (!ctx) throw new Error('Dialog components must be used within <Dialog>')
  return ctx
}

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

function DialogContent({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const { open, onOpenChange } = useDialog()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className={cn(
              'relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border/60 bg-card p-6 shadow-2xl',
              className
            )}
          >
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground opacity-70 transition hover:bg-muted hover:opacity-100"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('mb-4 flex flex-col space-y-1.5 pr-8', className)}
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  return (
    <h2
      className={cn('text-lg font-semibold tracking-tight', className)}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
}
