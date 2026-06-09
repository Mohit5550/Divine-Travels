'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Save, CheckCircle, Loader2, ChevronDown, ChevronUp, Plus, Trash2, Edit3, X, IndianRupee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

interface PriceRecord {
  id: string
  date: string
  dateTo: string | null
  service: string
  subOptions: string[]
  allDay: boolean
  price: number | null
  slots: number | null
  createdAt: string
}

const SERVICE_LABELS: Record<string, string> = {
  rafting: 'Rafting',
  trekking: 'Trekking',
  taxi: 'Taxi Rental',
  bike: 'Bike Rental',
  stay: 'Hotel & Camping',
  'tour-packages': 'Tour Packages',
}

const SERVICE_ICONS: Record<string, string> = {
  rafting: '🚣',
  trekking: '🥾',
  taxi: '🚕',
  bike: '🏍️',
  stay: '🏨',
  'tour-packages': '🧳',
}

const serviceKeys = Object.keys(SERVICE_LABELS)

export function AdminAvailability() {
  const { user } = useAppStore()
  const [records, setRecords] = useState<PriceRecord[]>([])
  const [serviceOptions, setServiceOptions] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedService, setExpandedService] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    date: '',
    dateTo: '',
    service: 'rafting',
    subOptions: [] as string[],
    allDay: false,
    price: '',
    slots: '',
  })

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/availability', {
        headers: { 'x-user-id': user?.id || '' },
      })
      const data = await res.json()
      if (res.ok) {
        setRecords(data.records)
        setServiceOptions(data.serviceOptions)
      } else {
        toast.error(data.error || 'Failed to load')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) fetchRecords()
  }, [fetchRecords, user?.id])

  const resetForm = () => {
    setForm({
      date: '',
      dateTo: '',
      service: 'rafting',
      subOptions: [],
      allDay: false,
      price: '',
      slots: '',
    })
    setEditingId(null)
    setShowForm(false)
  }

  const editRecord = (record: PriceRecord) => {
    setForm({
      date: record.date,
      dateTo: record.dateTo || '',
      service: record.service,
      subOptions: record.subOptions,
      allDay: record.allDay,
      price: record.price?.toString() || '',
      slots: record.slots?.toString() || '',
    })
    setEditingId(record.id)
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!form.date || !form.service) {
      toast.error('Date and service are required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({
          id: editingId,
          date: form.date,
          dateTo: form.dateTo || null,
          service: form.service,
          subOptions: form.subOptions,
          allDay: form.allDay,
          price: form.price,
          slots: form.slots,
        }),
      })
      if (res.ok) {
        toast.success(editingId ? 'Updated successfully' : 'Created successfully')
        resetForm()
        await fetchRecords()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Save failed')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  const deleteRecord = async (id: string) => {
    if (!confirm('Delete this availability record?')) return
    try {
      const res = await fetch(`/api/admin/availability?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user?.id || '' },
      })
      if (res.ok) {
        toast.success('Deleted')
        await fetchRecords()
      } else {
        toast.error('Delete failed')
      }
    } catch {
      toast.error('Network error')
    }
  }

  const toggleSubOption = (option: string) => {
    setForm((prev) => ({
      ...prev,
      subOptions: prev.subOptions.includes(option)
        ? prev.subOptions.filter((o) => o !== option)
        : [...prev.subOptions, option],
    }))
  }

  const recordsByService = serviceKeys.reduce((acc, s) => {
    acc[s] = records.filter((r) => r.service === s)
    return acc
  }, {} as Record<string, PriceRecord[]>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-dark">Availability & Pricing</h2>
          <p className="text-sm text-muted-foreground">
            Set date ranges with prices, availability, and slots per service
          </p>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-brand-teal hover:bg-brand-teal/90 text-white rounded-full"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Price Range
          </Button>
        )}
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-border/50 p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-brand-dark">
              {editingId ? 'Edit Price Range' : 'New Price Range'}
            </h3>
            <button onClick={resetForm} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Service</label>
              <select
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value, subOptions: [] })}
                className="w-full h-9 rounded-lg border border-border/50 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
              >
                {serviceKeys.map((s) => (
                  <option key={s} value={s}>{SERVICE_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">From Date</label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">To Date <span className="text-gray-400">(optional)</span></label>
              <Input type="date" value={form.dateTo} onChange={(e) => setForm({ ...form, dateTo: e.target.value })} />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Price (₹)</label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="e.g. 2499" />
              </div>
              <div className="w-24">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Slots</label>
                <Input type="number" value={form.slots} onChange={(e) => setForm({ ...form, slots: e.target.value })} placeholder="e.g. 20" />
              </div>
            </div>
          </div>

          <div className="border-t border-border/50 pt-4 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.allDay}
                onChange={(e) => setForm({ ...form, allDay: e.target.checked, subOptions: [] })}
                className="w-4 h-4 rounded border-gray-300 text-brand-teal focus:ring-brand-teal"
              />
              <span className="text-sm font-medium text-brand-dark">All sub-options available</span>
            </label>

            {!form.allDay && (
              <div className="flex flex-wrap gap-2">
                {(serviceOptions[form.service] || []).map((option) => {
                  const checked = form.subOptions.includes(option)
                  return (
                    <button
                      key={option}
                      onClick={() => toggleSubOption(option)}
                      className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                        checked
                          ? 'bg-brand-teal/10 border-brand-teal/30 text-brand-dark font-medium'
                          : 'bg-gray-50 border-border/50 text-muted-foreground hover:border-brand-teal/30'
                      }`}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-brand-teal hover:bg-brand-teal/90 text-white"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
              {editingId ? 'Update' : 'Save'}
            </Button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
        </div>
      ) : (
        <div className="space-y-4">
          {serviceKeys.map((service) => {
            const svcRecords = recordsByService[service] || []
            const isExpanded = expandedService === service
            const options = serviceOptions[service] || []

            return (
              <motion.div
                key={service}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-border/50 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedService(isExpanded ? null : service)}
                  className="w-full flex items-center justify-between p-4 hover:bg-brand-cream/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{SERVICE_ICONS[service]}</span>
                    <div className="text-left">
                      <p className="font-semibold text-brand-dark">{SERVICE_LABELS[service]}</p>
                      <p className="text-xs text-muted-foreground">{svcRecords.length} price range{svcRecords.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setForm({ date: '', dateTo: '', service, subOptions: [], allDay: false, price: '', slots: '' })
                        setEditingId(null)
                        setShowForm(true)
                      }}
                      className="bg-brand-teal hover:bg-brand-teal/90 text-white rounded-full h-8 w-8 p-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border/50">
                    {svcRecords.length === 0 ? (
                      <div className="p-6 text-center text-sm text-muted-foreground">
                        No price ranges set for {SERVICE_LABELS[service]}
                      </div>
                    ) : (
                      <div className="divide-y divide-border/50">
                        {svcRecords.map((record) => (
                          <div key={record.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-semibold text-brand-dark">
                                    {record.date}
                                    {record.dateTo ? ` → ${record.dateTo}` : ''}
                                  </span>
                                  {record.price && (
                                    <span className="inline-flex items-center gap-0.5 text-sm font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                                      <IndianRupee className="w-3 h-3" />{record.price.toLocaleString()}
                                    </span>
                                  )}
                                  {record.slots && (
                                    <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">
                                      {record.slots} slots
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  {record.allDay ? (
                                    <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                                      <CheckCircle className="w-3 h-3" /> All available
                                    </span>
                                  ) : (
                                    <div className="flex flex-wrap gap-1">
                                      {(record.subOptions || []).map((opt) => (
                                        <span key={opt} className="text-xs bg-brand-teal/10 text-brand-dark px-2 py-0.5 rounded-full">{opt}</span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => editRecord(record)}
                                  className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-muted-foreground hover:text-brand-teal transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteRecord(record.id)}
                                  className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
