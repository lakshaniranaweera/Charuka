'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import { Loader2, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { signInAction, type AuthState } from './actions'
import { useState } from 'react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogIn className="h-4 w-4" />
      )}
      Sign in
    </Button>
  )
}

export function LoginForm() {
  const params = useSearchParams()
  const redirectedFrom = params.get('redirectedFrom') ?? '/admin'
  const [state, formAction] = useActionState<AuthState, FormData>(
    signInAction,
    {}
  )
  const [remember, setRemember] = useState(true)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirectedFrom" value={redirectedFrom} />

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="admin@company.com"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/admin/forgot-password"
            className="text-xs text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          checked={remember}
          onCheckedChange={setRemember}
          aria-label="Remember me"
        />
        <input type="hidden" name="remember" value={remember ? 'on' : 'off'} />
        <Label className="cursor-pointer">Remember me</Label>
      </div>

      {state.error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  )
}
