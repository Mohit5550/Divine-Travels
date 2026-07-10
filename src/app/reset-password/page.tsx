'use client'

import { useState, useEffect, use } from 'react'
import { Lock, Key, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const params = use(searchParams)
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (params.token) setToken(params.token)
  }, [params.token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!token) { setError('Reset token is missing'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong'); return }
      setSuccess(true)
      toast.success('Password reset successful!')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-dark to-brand-navy flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-brand-dark to-brand-navy p-6 text-white text-center">
          <h1 className="font-serif text-2xl">Divine Travels</h1>
          <p className="text-white/70 text-sm mt-1">Reset Your Password</p>
        </div>

        {success ? (
          <div className="p-6 text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <p className="text-brand-dark font-medium text-lg">Password Reset Complete!</p>
            <p className="text-sm text-muted-foreground">You can now login with your new password.</p>
            <a href={process.env.NEXT_PUBLIC_BASE_URL || '/'}>
              <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white h-11 px-8 rounded-lg">
                Go to Login
              </Button>
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Reset Token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="pl-10 h-11 rounded-lg"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="New Password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-11 rounded-lg"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 h-11 rounded-lg"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white h-11 rounded-lg text-base"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
