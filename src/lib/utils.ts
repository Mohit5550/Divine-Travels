import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  const trimmed = url.trim()
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function handleImgError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  const target = e.currentTarget
  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Y2EzYWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg=='
  target.className = target.className + ' opacity-50'
}

export function toDirectImageUrl(url: string): string {
  if (!url) return url
  const trimmed = url.trim()
  if (trimmed.includes('drive.google.com')) {
    let fileId = ''
    const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
    if (fileMatch) {
      fileId = fileMatch[1]
    } else {
      const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/)
      if (idMatch) fileId = idMatch[1]
    }
    if (fileId) {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`
    }
  }
  return trimmed
}

// Normalize a gallery JSON payload (array of image URLs) to direct URLs.
// Returns the original string untouched when it isn't valid JSON.
export function normalizeGalleryImages(images: unknown): string {
  if (typeof images !== 'string') return '[]'
  try {
    const arr = JSON.parse(images)
    if (!Array.isArray(arr)) return images
    return JSON.stringify(arr.map((u) => (typeof u === 'string' ? toDirectImageUrl(u) : u)))
  } catch {
    return images
  }
}

export function htmlToMarkdown(html: string): string {
  if (!html) return ''
  let md = html
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
  md = md.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
  md = md.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
  md = md.replace(/<u[^>]*>(.*?)<\/u>/gi, '__$1__')
  md = md.replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~')
  md = md.replace(/<del[^>]*>(.*?)<\/del>/gi, '~~$1~~')
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)')
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)')
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
  md = md.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n')
  md = md.replace(/<pre[^>]*>(.*?)<\/pre>/gi, '```\n$1\n```\n\n')
  md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n')
  md = md.replace(/<hr\s*\/?>/gi, '---\n\n')
  md = md.replace(/<br\s*\/?>/gi, '\n')
  md = md.replace(/<\/li>/gi, '\n')
  md = md.replace(/<li[^>]*>/gi, '- ')
  md = md.replace(/<\/?[uo]l[^>]*>/gi, '\n')
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
  md = md.replace(/<div[^>]*>(.*?)<\/div>/gi, '$1\n')
  md = md.replace(/<span[^>]*>(.*?)<\/span>/gi, '$1')
  md = md.replace(/<[^>]+>/g, '')
  md = md.replace(/&nbsp;/g, ' ')
  md = md.replace(/&amp;/g, '&')
  md = md.replace(/&lt;/g, '<')
  md = md.replace(/&gt;/g, '>')
  md = md.replace(/&quot;/g, '"')
  md = md.replace(/&#39;/g, "'")
  md = md.replace(/\n{3,}/g, '\n\n')
  return md.trim()
}

export function markdownToHtml(md: string): string {
  if (!md) return ''
  let html = md
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/__(.+?)__/g, '<u>$1</u>')
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>')
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>')
  html = html.replace(/^---$/gm, '<hr />')
  const lines = html.split('\n')
  const result: string[] = []
  let inList = false
  let listType = ''
  for (const line of lines) {
    const ulMatch = line.match(/^- (.+)$/)
    const olMatch = line.match(/^\d+\.\s+(.+)$/)
    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        if (inList) result.push(`</${listType}>`)
        result.push('<ul>')
        inList = true
        listType = 'ul'
      }
      result.push(`<li>${ulMatch[1]}</li>`)
    } else if (olMatch) {
      if (!inList || listType !== 'ol') {
        if (inList) result.push(`</${listType}>`)
        result.push('<ol>')
        inList = true
        listType = 'ol'
      }
      result.push(`<li>${olMatch[1]}</li>`)
    } else {
      if (inList) {
        result.push(`</${listType}>`)
        inList = false
      }
      if (line.match(/^<(h[1-6]|ul|ol|li|blockquote|pre|hr|img|div)/i)) {
        result.push(line)
      } else if (line.trim() === '') {
        result.push('')
      } else if (!line.match(/^<\/?(h[1-6]|ul|ol|li|blockquote|pre|hr|img|div)/i)) {
        result.push(`<p>${line}</p>`)
      } else {
        result.push(line)
      }
    }
  }
  if (inList) result.push(`</${listType}>`)
  let output = result.join('\n')
  output = output.replace(/<\/blockquote>\n<blockquote>/g, '\n')
  output = output.replace(/<p><\/p>/g, '')
  output = output.replace(/\n{3,}/g, '\n\n')
  return output.trim()
}
