'use client'

import React, { useEffect } from 'react'

// Retry-once lazy loader for code-split views.
//
// Root cause of "URL changes but page doesn't open": after a new Vercel
// deployment, an already-open tab still references OLD hashed chunk URLs.
// Clicking a view then 404s on the stale chunk, the lazy import rejects,
// and the user sees a loader (or a fallback) until they manually refresh.
// This helper retries once (transient network blip) and then hard-reloads
// to fresh HTML (stale deploy) — exactly what a manual refresh would do.
export function lazyView<T extends React.ComponentType<any>>(
  importer: () => Promise<Record<string, T>>,
  exportName: string
) {
  return React.lazy(async (): Promise<{ default: T }> => {
    try {
      const m = await importer()
      return { default: m[exportName] }
    } catch {
      try {
        const m = await importer()
        return { default: m[exportName] }
      } catch {
        if (typeof window !== 'undefined') {
          const last = Number(sessionStorage.getItem('divine-chunk-reload') || 0)
          if (Date.now() - last > 10000) {
            sessionStorage.setItem('divine-chunk-reload', String(Date.now()))
            window.location.reload()
          }
        }
        return { default: (() => null) as unknown as T }
      }
    }
  })
}

function isChunkError(message: string): boolean {
  const m = (message || '').toLowerCase()
  return (
    m.includes('failed to fetch dynamically imported module') ||
    m.includes('loading chunk') ||
    m.includes('chunkloaderror')
  )
}

// Global guard: any uncaught chunk-load failure triggers one self-healing reload.
export function ChunkReloadGuard() {
  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      if (!isChunkError(e.message)) return
      try {
        const last = Number(sessionStorage.getItem('divine-chunk-reload') || 0)
        if (Date.now() - last > 10000) {
          sessionStorage.setItem('divine-chunk-reload', String(Date.now()))
          window.location.reload()
        }
      } catch {
        /* storage unavailable — ignore */
      }
    }
    const onRejection = (e: PromiseRejectionEvent) => {
      const msg = String((e.reason && (e.reason.message || e.reason)) || '')
      if (isChunkError(msg)) onError(new ErrorEvent('error', { message: msg }))
    }
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])
  return null
}
