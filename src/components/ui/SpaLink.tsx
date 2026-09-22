'use client'

import { useAppStore, getPathForView } from '@/lib/store'
import type { AnchorHTMLAttributes, MouseEvent } from 'react'

interface SpaLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  view: string
  destId?: string | null
  pkgId?: string | null
}

// Crawlable anchor for SEO (real href) that still navigates inside the SPA.
// Crawlers see and follow the href; users get instant client-side navigation.
export function SpaLink({ view, destId, pkgId, href, onClick, children, ...rest }: SpaLinkProps) {
  const { navigate } = useAppStore()
  const to = href || getPathForView(view)
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e)
    if (e.defaultPrevented) return
    e.preventDefault()
    navigate(view, destId ?? null, pkgId ?? null)
  }
  return (
    <a href={to} onClick={handle} {...rest}>
      {children}
    </a>
  )
}
