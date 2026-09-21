import DOMPurify from 'dompurify'

export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') return html
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span', 'figure', 'figcaption'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'className', 'target', 'rel', 'width', 'height', 'loading'],
  })
}
