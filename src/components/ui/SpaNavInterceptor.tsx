'use client'

import { useEffect } from 'react'
import { navigateFromPath } from '@/lib/store'

/**
 * Global SPA link interceptor.
 *
 * This app is a client-side SPA rendered by the shell in src/app/page.tsx /
 * [...slug]/page.tsx. Links that render a plain `<a href="/rafting">` (or a
 * next/link) change the URL but do NOT call store.navigate(), so currentView
 * stays 'landing' and the user sees the home page while the URL shows
 * /rafting. This capture-phase click listener converts clicks on internal
 * links into store.navigate() calls so URL and view always stay in sync.
 */
export function SpaNavInterceptor() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const target = e.target as HTMLElement | null
      const a = (target?.closest?.('a') as HTMLAnchorElement | null) || null
      if (!a) return
      const href = a.getAttribute('href')
      if (!href || href.startsWith('#')) return
      if (a.target && a.target !== '_self') return
      if (a.hasAttribute('download')) return

      let url: URL
      try {
        url = new URL(a.href)
      } catch {
        return
      }
      if (url.origin !== window.location.origin) return
      if (url.protocol === 'mailto:' || url.protocol === 'tel:') return
      // Never hijack Next infra, API routes or asset files
      if (url.pathname.startsWith('/api') || url.pathname.startsWith('/_next') || url.pathname.startsWith('/payment')) return

      if (navigateFromPath(url.pathname)) {
        e.preventDefault()
        // Keep any query string / hash intact in the address bar
        const next = url.pathname + url.search + url.hash
        if (window.location.pathname + window.location.search + window.location.hash !== next) {
          window.history.pushState({ view: url.pathname }, '', next)
        }
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
    // capture phase → runs before next/link's own click handler
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return null
}
