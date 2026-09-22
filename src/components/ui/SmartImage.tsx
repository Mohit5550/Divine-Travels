'use client'

import Image from 'next/image'
import type { CSSProperties } from 'react'

const OPTIMIZED_HOSTS = new Set(['images.unsplash.com', 'ik.imagekit.io'])

interface SmartImageProps {
  src: string
  alt?: string
  className?: string
  style?: CSSProperties
  /** Above-the-fold hero images: eager + high fetch priority. Default lazy. */
  priority?: boolean
  sizes?: string
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void
  draggable?: boolean
}

// Drop-in <img loading="lazy" decoding="async"> replacement: optimized responsive images for known hosts,
// plain lazy <img loading="lazy" decoding="async"> for data/blob URLs, unoptimized next/image otherwise
// (still lazy-loads, never throws on unknown domains).
export function SmartImage({
  src,
  alt = '',
  className,
  style,
  priority = false,
  sizes = '(max-width: 768px) 100vw, 50vw',
  onError,
  draggable,
}: SmartImageProps) {
  if (!src || src.startsWith('data:') || src.startsWith('blob:')) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={style}
        loading="lazy"
        decoding="async"
        onError={onError}
        draggable={draggable}
      />
    )
  }
  let unoptimized = false
  try {
    const u = new URL(src, 'http://local')
    if (u.hostname !== 'local' && !OPTIMIZED_HOSTS.has(u.hostname)) unoptimized = true
  } catch {
    unoptimized = true
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={unoptimized}
      className={className}
      style={style}
      onError={onError}
      draggable={draggable}
    />
  )
}
