'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { useFormStatus } from 'react-dom'
import { Loader2, Mail } from 'lucide-react'
import { AuthShell } from '@/components/auth/auth-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { forgotPasswordAction, type AuthState } from '../login/actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
      Send reset link
    </Button>
  )
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useActionState<AuthState, FormData>(
    forgotPasswordAction,
    {}
  )

  return (
    <AuthShell
      title="Reset Password"
      subtitle="We'll email you a secure reset link"
      footer={
        <Link href="/admin/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="admin@company.com"
            required
          />
        </div>
        {state.error && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        )}
        {state.success && (
          <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
            {state.success}
          </p>
        )}
        <SubmitButton />
      </form>
    </AuthShell>
  )
}
