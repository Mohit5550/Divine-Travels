'use client'

import { useState, useEffect } from 'react'
import { htmlToMarkdown, markdownToHtml } from '@/lib/utils'

interface BlogEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function BlogEditor({ value, onChange, placeholder }: BlogEditorProps) {
  const [EditorComponent, setEditorComponent] = useState<any>(null)
  const [markdown, setMarkdown] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    Promise.all([
      import('@mdxeditor/editor'),
      import('@mdxeditor/editor/style.css'),
    ]).then(([editorModule]) => {
      const {
        MDXEditor,
        headingsPlugin,
        toolbarPlugin,
        BoldItalicUnderlineToggles,
        UndoRedo,
        listsPlugin,
        linkDialogPlugin,
        imagePlugin,
        codeBlockPlugin,
        thematicBreakPlugin,
        markdownShortcutPlugin,
      } = editorModule

      const plugins = [
        headingsPlugin(),
        toolbarPlugin({
          contents: (
            <>
              <UndoRedo />
              <BoldItalicUnderlineToggles />
            </>
          ),
        }),
        listsPlugin(),
        linkDialogPlugin(),
        imagePlugin(),
        codeBlockPlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
      ]

      setEditorComponent({ MDXEditor, plugins })
    })
  }, [])

  useEffect(() => {
    if (EditorComponent && !isLoaded) {
      if (value) {
        const md = htmlToMarkdown(value)
        setMarkdown(md)
      } else {
        setMarkdown('')
      }
      setIsLoaded(true)
    }
  }, [value, EditorComponent, isLoaded])

  const handleChange = (newMarkdown: string) => {
    setMarkdown(newMarkdown)
    const html = markdownToHtml(newMarkdown)
    onChange(html)
  }

  if (!EditorComponent || !isLoaded) {
    return (
      <div className="h-96 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-400">
        Loading editor...
      </div>
    )
  }

  const { MDXEditor, plugins } = EditorComponent

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <MDXEditor
        markdown={markdown}
        onChange={handleChange}
        placeholder={placeholder || 'Start writing your blog post...'}
        className="min-h-[400px]"
        plugins={plugins}
      />
    </div>
  )
}
