'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Logo } from '@/components/brand/dynamic-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  // Supabase sends a type=recovery fragment, which triggers onAuthStateChange
  // If the URL has access_token (from email link), Supabase auto-sets the session
  const [mode, setMode] = useState<'request' | 'update'>(
    searchParams.get('type') === 'recovery' ? 'update' : 'request'
  )

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password?type=recovery`,
      })
      if (resetError) throw resetError
      setSuccess('Check your email for a password reset link.')
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      setSuccess('Password reset successful! You can now sign in.')
    } catch (err: any) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <Link href="/" className="inline-flex items-center justify-center mb-6">
          <Logo size={48} />
        </Link>
        <h1 className="text-2xl font-bold text-white">Reset Password</h1>
        <p className="text-gray-400 mt-2">
          {mode === 'update' ? 'Enter your new password' : 'Enter your email to receive a reset link'}
        </p>
      </div>

      <div className="bg-nyx-surface border border-nyx-border rounded-xl p-6">
        {success ? (
          <div className="text-center space-y-4">
            <p className="text-success">{success}</p>
            <Link href="/login">
              <Button variant="secondary" className="w-full">Back to Sign In</Button>
            </Link>
          </div>
        ) : mode === 'update' ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            {error && <p className="text-sm text-error bg-error/10 border border-error/20 rounded-lg p-3">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">Reset Password</Button>
          </form>
        ) : (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            {error && <p className="text-sm text-error bg-error/10 border border-error/20 rounded-lg p-3">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">Send Reset Link</Button>
          </form>
        )}
      </div>

      <p className="text-center text-sm text-gray-500">
        <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium">
          Back to Sign In
        </Link>
      </p>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative z-[1] px-4">
      <Suspense fallback={
        <div className="w-full max-w-md text-center">
          <Logo size={48} className="mx-auto animate-pulse mb-4" />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
