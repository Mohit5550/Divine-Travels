'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HelpCircle,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Waves,
  Car,
  Tent,
  Compass,
  CreditCard,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { DEFAULT_FAQS_DATA, FAQItem, FAQCategoryData } from '@/lib/faqs-data'
import { getAuthHeaders } from '@/lib/auth-client'

const CATEGORY_ICONS: Record<string, any> = {
  rafting: Waves,
  camping: Tent,
  taxi: Car,
  chardham: Compass,
  booking: CreditCard,
}

export function AdminFAQs() {
  const { user } = useAppStore()
  const queryClient = useQueryClient()
  const [faqsData, setFaqsData] = useState<Record<string, FAQCategoryData>>(DEFAULT_FAQS_DATA)
  const [activeCategory, setActiveCategory] = useState<string>('rafting')
  const [isModified, setIsModified] = useState(false)
  const [previewOpenIdx, setPreviewOpenIdx] = useState<number | null>(0)

  const { data: serverData, isLoading } = useQuery({
    queryKey: ['admin-faqs', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/admin/faqs', {
        headers: { ...getAuthHeaders() },
      })
      if (!res.ok) return null
      return res.json()
    },
  })

  useEffect(() => {
    if (serverData && typeof serverData === 'object' && Object.keys(serverData).length > 0) {
      setFaqsData(serverData)
      setIsModified(false)
    }
  }, [serverData])

  const saveMutation = useMutation({
    mutationFn: async (updatedData: Record<string, FAQCategoryData>) => {
      const res = await fetch('/api/admin/faqs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(), },
        body: JSON.stringify(updatedData),
      })
      if (!res.ok) throw new Error('Failed to save FAQs')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Home page FAQs saved successfully!')
      setIsModified(false)
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] })
      queryClient.invalidateQueries({ queryKey: ['home-faqs'] })
    },
    onError: () => {
      toast.error('Failed to save FAQs')
    },
  })

  const currentCategoryData = faqsData[activeCategory] || { label: activeCategory, items: [] }

  const handleQuestionChange = (index: number, newQ: string) => {
    const updatedItems = [...currentCategoryData.items]
    updatedItems[index] = { ...updatedItems[index], q: newQ }
    setFaqsData({
      ...faqsData,
      [activeCategory]: { ...currentCategoryData, items: updatedItems },
    })
    setIsModified(true)
  }

  const handleAnswerChange = (index: number, newA: string) => {
    const updatedItems = [...currentCategoryData.items]
    updatedItems[index] = { ...updatedItems[index], a: newA }
    setFaqsData({
      ...faqsData,
      [activeCategory]: { ...currentCategoryData, items: updatedItems },
    })
    setIsModified(true)
  }

  const handleAddItem = () => {
    const newItem: FAQItem = {
      q: 'New FAQ Question here?',
      a: 'Detailed answer explaining the service, safety guidelines, and policies.',
    }
    const updatedItems = [...currentCategoryData.items, newItem]
    setFaqsData({
      ...faqsData,
      [activeCategory]: { ...currentCategoryData, items: updatedItems },
    })
    setIsModified(true)
    toast.success('New question added to this category')
  }

  const handleDeleteItem = (index: number) => {
    if (!confirm('Are you sure you want to delete this FAQ question?')) return
    const updatedItems = currentCategoryData.items.filter((_, i) => i !== index)
    setFaqsData({
      ...faqsData,
      [activeCategory]: { ...currentCategoryData, items: updatedItems },
    })
    setIsModified(true)
    toast.success('Question removed')
  }

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1
    if (newIdx < 0 || newIdx >= currentCategoryData.items.length) return
    const updatedItems = [...currentCategoryData.items]
    const temp = updatedItems[index]
    updatedItems[index] = updatedItems[newIdx]
    updatedItems[newIdx] = temp
    setFaqsData({
      ...faqsData,
      [activeCategory]: { ...currentCategoryData, items: updatedItems },
    })
    setIsModified(true)
  }

  const handleResetDefaults = () => {
    if (!confirm('Reset all FAQs across all categories to default original questions?')) return
    setFaqsData(DEFAULT_FAQS_DATA)
    setIsModified(true)
    toast.info('Reset to default FAQs. Click "Save Changes" to publish.')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-orange/10 text-brand-orange">
              <HelpCircle className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-brand-dark">Home Page FAQs Manager</h1>
              <p className="text-sm text-gray-500">
                Edit questions, answers, and category advice shown on the Divine Travels homepage.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            className="text-xs text-gray-600 hover:text-gray-900 border-gray-200"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset Defaults
          </Button>

          <Button
            onClick={() => saveMutation.mutate(faqsData)}
            disabled={saveMutation.isPending}
            className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saveMutation.isPending ? 'Publishing...' : isModified ? 'Publish Live Changes *' : 'Published & Live'}
          </Button>
        </div>
      </div>

      {/* Category Tabs Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {Object.entries(faqsData).map(([catKey, catVal]) => {
          const Icon = CATEGORY_ICONS[catKey] || HelpCircle
          const isSelected = activeCategory === catKey
          const count = catVal.items?.length || 0
          return (
            <button
              key={catKey}
              onClick={() => setActiveCategory(catKey)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-brand-dark text-white shadow-md ring-2 ring-brand-orange'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200/70'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-brand-orange' : 'text-gray-400'}`} />
              <span>{catVal.label || catKey}</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
                isSelected ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Category Editor Grid: Left = Editor, Right = Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Form Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-brand-dark text-base flex items-center gap-2">
                <span>{currentCategoryData.label}</span>
                <span className="text-xs text-gray-400 font-normal">({currentCategoryData.items.length} Questions)</span>
              </h2>
              <p className="text-xs text-gray-500">Edit questions and answers below. Changes update live in preview.</p>
            </div>

            <Button
              onClick={handleAddItem}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Question
            </Button>
          </div>

          {currentCategoryData.items.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-dashed border-gray-200 text-center">
              <HelpCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">No questions in this category</p>
              <p className="text-xs text-gray-400 mb-4">Click "Add Question" to create the first FAQ item.</p>
              <Button onClick={handleAddItem} size="sm" className="bg-brand-orange text-white text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Question
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {currentCategoryData.items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-gray-200 transition-all space-y-3 relative group"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                    <span className="text-xs font-bold text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded-md">
                      Q{idx + 1}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveItem(idx, 'up')}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveItem(idx, 'down')}
                        disabled={idx === currentCategoryData.items.length - 1}
                        title="Move Down"
                        className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(idx)}
                        title="Delete Question"
                        className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 cursor-pointer ml-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Question Text:
                    </label>
                    <input
                      type="text"
                      value={item.q}
                      onChange={(e) => handleQuestionChange(idx, e.target.value)}
                      className="w-full text-sm font-medium px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange bg-gray-50/50"
                      placeholder="e.g. Is river rafting safe for non-swimmers?"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Answer Text:
                    </label>
                    <textarea
                      rows={3}
                      value={item.a}
                      onChange={(e) => handleAnswerChange(idx, e.target.value)}
                      className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange bg-gray-50/50 leading-relaxed resize-y"
                      placeholder="Provide helpful, accurate details for travelers..."
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Homepage Preview Column */}
        <div className="lg:col-span-5">
          <div className="bg-gradient-to-b from-brand-cream/60 to-brand-cream/30 p-5 rounded-2xl border border-amber-200/50 sticky top-24 shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-amber-200/50 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-dark uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                <span>Live Homepage Preview</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                Interactive
              </span>
            </div>

            <div className="space-y-2.5">
              {currentCategoryData.items.map((item, idx) => {
                const isOpen = previewOpenIdx === idx
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-xl border border-border/80 shadow-xs overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setPreviewOpenIdx(isOpen ? null : idx)}
                      className="w-full p-3.5 text-left flex items-center justify-between gap-3 hover:bg-brand-cream/20 transition-colors"
                    >
                      <span className="font-semibold text-xs sm:text-sm text-brand-dark leading-snug">
                        {item.q || 'Untitled Question'}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-brand-orange shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="px-3.5 pb-3.5 text-xs text-gray-600 leading-relaxed border-t border-border/40 pt-2 bg-brand-cream/10">
                            {item.a || 'No answer entered yet.'}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
