'use client'

import { useRef, useEffect, useCallback } from 'react'

interface BlogEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function BlogEditor({ value, onChange, placeholder }: BlogEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const lastValueRef = useRef('')
  const isInternalChange = useRef(false)

  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (value !== lastValueRef.current) {
        const sel = window.getSelection()
        const hadFocus = document.activeElement === editorRef.current

        editorRef.current.innerHTML = value || ''
        lastValueRef.current = value || ''

        if (hadFocus && editorRef.current.childNodes.length > 0) {
          const range = document.createRange()
          range.selectNodeContents(editorRef.current)
          range.collapse(false)
          sel?.removeAllRanges()
          sel?.addRange(range)
        }
      }
    }
    isInternalChange.current = false
  }, [value])

  const emitChange = useCallback(() => {
    if (!editorRef.current) return
    const html = editorRef.current.innerHTML
    if (html !== lastValueRef.current) {
      lastValueRef.current = html
      isInternalChange.current = true
      onChange(html)
    }
  }, [onChange])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const html = e.clipboardData.getData('text/html')
    const text = e.clipboardData.getData('text/plain')

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    range.deleteContents()

    if (html) {
      const temp = document.createElement('div')
      temp.innerHTML = html
      const frag = document.createDocumentFragment()
      let lastNode: Node | null = null
      while (temp.firstChild) {
        lastNode = temp.firstChild
        frag.appendChild(lastNode)
      }
      range.insertNode(frag)

      if (lastNode && lastNode.nodeType === Node.ELEMENT_NODE) {
        const newRange = document.createRange()
        newRange.selectNodeContents(lastNode)
        newRange.collapse(false)
        selection.removeAllRanges()
        selection.addRange(newRange)
      } else {
        range.collapse(false)
      }
    } else {
      range.insertNode(document.createTextNode(text))
      range.collapse(false)
    }

    emitChange()
  }, [emitChange])

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-orange/50 focus-within:border-brand-orange transition-all">
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onPaste={handlePaste}
        onInput={emitChange}
        onBlur={emitChange}
        className="min-h-[400px] p-4 prose prose-lg max-w-none focus:outline-none [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-gray-400 [&:empty]:before:pointer-events-none"
        data-placeholder={placeholder || 'Paste your blog content here... Formatting will be preserved.'}
      />
    </div>
  )
}
