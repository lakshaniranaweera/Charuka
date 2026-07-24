'use client'

import * as React from 'react'
import { Check, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckboxProps {
  checked: boolean | 'indeterminate'
  onCheckedChange: (checked: boolean) => void
  className?: string
  'aria-label'?: string
  disabled?: boolean
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked, onCheckedChange, className, disabled, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="checkbox"
      aria-checked={checked === 'indeterminate' ? 'mixed' : checked}
      disabled={disabled}
      onClick={() => onCheckedChange(checked !== true)}
      className={cn(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded border border-input shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',
        checked ? 'border-primary bg-primary text-primary-foreground' : 'bg-background',
        className
      )}
      {...props}
    >
      {checked === 'indeterminate' ? (
        <Minus className="h-3 w-3" />
      ) : checked ? (
        <Check className="h-3 w-3" />
      ) : null}
    </button>
  )
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
