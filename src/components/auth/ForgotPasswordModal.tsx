'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Key, Lock, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface ForgotPasswordModalProps {
  open: boolean
  onClose: () => void
  onBackToLogin: () => void
}

export function ForgotPasswordModal({ open, onClose, onBackToLogin }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<'email' | 'reset' | 'success'>('email')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { toast.error('Please enter your email'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Something went wrong'); return }
      toast.success('Reset code sent! Check your email.')
      setStep('reset')
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code) { toast.error('Please enter the reset code'); return }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, password }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Something went wrong'); return }
      toast.success('Password reset successful! You can now login.')
      setStep('success')
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep('email')
    setEmail('')
    setCode('')
    setPassword('')
    setConfirmPassword('')
    onClose()
  }

  const handleBack = () => {
    setStep('email')
    setEmail('')
    setCode('')
    setPassword('')
    setConfirmPassword('')
    onBackToLogin()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="bg-gradient-to-r from-brand-dark to-brand-navy p-6 text-white relative">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <h2 className="font-serif text-2xl">Reset Password</h2>
              <p className="text-white/70 text-sm mt-1">
                {step === 'email' && 'Enter your email to receive a reset code'}
                {step === 'reset' && 'Enter the code from your email and set a new password'}
                {step === 'success' && 'Your password has been reset'}
              </p>
            </div>

            {step === 'email' && (
              <form onSubmit={handleSendCode} className="p-6 space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 rounded-lg"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white h-11 rounded-lg text-base"
                >
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-sm text-brand-orange hover:underline inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" /> Back to Login
                  </button>
                </div>
              </form>
            )}

            {step === 'reset' && (
              <form onSubmit={handleReset} className="p-6 space-y-4">
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Reset Code (from email)"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
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
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="text-sm text-brand-orange hover:underline"
                  >
                    Didn't get a code? Resend
                  </button>
                </div>
              </form>
            )}

            {step === 'success' && (
              <div className="p-6 text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <p className="text-brand-dark font-medium">Password reset successful!</p>
                <p className="text-sm text-muted-foreground">You can now login with your new password.</p>
                <Button
                  onClick={handleBack}
                  className="bg-brand-orange hover:bg-brand-orange/90 text-white h-11 px-8 rounded-lg"
                >
                  Back to Login
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
