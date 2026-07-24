import { Suspense } from 'react'
import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/auth-shell'
import { LoginForm } from './login-form'

export const metadata: Metadata = { title: 'Sign in' }

export default function LoginPage() {
  return (
    <AuthShell
      title="Admin Sign In"
      subtitle="Access the Activation Planner control panel"
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  )
}
