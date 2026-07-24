'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, forgotPasswordSchema } from '@/lib/validators'

export interface AuthState {
  error?: string
  success?: string
}

export async function signInAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    remember: formData.get('remember') === 'on',
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) return { error: error.message }

  const redirectTo = (formData.get('redirectedFrom') as string) || '/admin'
  redirect(redirectTo)
}

export async function forgotPasswordAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get('email'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid email' }
  }

  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    { redirectTo: `${origin}/admin/reset-password` }
  )

  if (error) return { error: error.message }
  return { success: 'Check your inbox for a password reset link.' }
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
