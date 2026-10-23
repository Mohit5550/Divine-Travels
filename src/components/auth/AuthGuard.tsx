'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { LoginModal } from '@/components/landing/LoginModal'
import { toast } from 'sonner'

function tokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    )
    if (typeof payload.exp !== 'number') return false
    return payload.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

function handleExpiredSession(reason: 'expired' | 'rejected') {
  const st = useAppStore.getState()
  if (!st.isAuthenticated && !st.token) return
  st.logout()
  st.setLoginOpen(true)
  toast.error(
    reason === 'expired'
      ? 'Session expired. Please login again.'
      : 'Authentication required. Please login again.'
  )
}

function installFetchGuard() {
  if (typeof window === 'undefined') return
  const w = window as unknown as Record<string, unknown>
  if (w.__divineAuthGuard) return
  w.__divineAuthGuard = true
  const origFetch = window.fetch.bind(window)
  window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const res = await origFetch(input as RequestInfo, init)
    try {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : (input as Request).url || ''
      // Never react to the auth endpoints themselves (wrong password etc.)
      if (res.status === 401 && !url.includes('/api/auth')) {
        handleExpiredSession('rejected')
      }
    } catch {
      /* never break the original call */
    }
    return res
  }) as typeof window.fetch
}

// Global session guard: auto-logout + login popup on 401 anywhere,
// plus expiry check of the stored token on boot.
export function AuthGuard() {
  const token = useAppStore((s) => s.token)
  const loginOpen = useAppStore((s) => s.loginOpen)
  const setLoginOpen = useAppStore((s) => s.setLoginOpen)

  useEffect(() => {
    installFetchGuard()
  }, [])

  useEffect(() => {
    if (token && tokenExpired(token)) {
      handleExpiredSession('expired')
    }
  }, [token])

  return <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} defaultMode="login" />
}
