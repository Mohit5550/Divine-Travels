'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Save, CheckCircle, Loader2, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

interface AvailabilityRecord {
  id: string
  date: string
  service: string
  subOptions: string[]
  allDay: boolean
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

export function AdminAvailability() {
  const { user } = useAppStore()
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [records, setRecords] = useState<AvailabilityRecord[]>([])
  const [serviceOptions, setServiceOptions] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [expandedService, setExpandedService] = useState<string | null>(null)

  const fetchAvailability = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/availability?date=${date}`, {
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
  }, [date, user?.id])

  useEffect(() => {
    if (user?.id) fetchAvailability()
  }, [fetchAvailability, user?.id])

  const getRecord = (service: string) =>
    records.find((r) => r.service === service) || {
      id: '',
      date,
      service,
      subOptions: [],
      allDay: false,
    }

  const updateSubOption = (service: string, option: string, checked: boolean) => {
    setRecords((prev) => {
      const existing = prev.find((r) => r.service === service)
      const currentOpts = existing?.subOptions || []
      const newOpts = checked
        ? [...currentOpts, option]
        : currentOpts.filter((o) => o !== option)

      if (existing) {
        return prev.map((r) =>
          r.service === service ? { ...r, subOptions: newOpts } : r
        )
      }
      return [
        ...prev,
        { id: '', date, service, subOptions: newOpts, allDay: false },
      ]
    })
  }

  const toggleAllDay = (service: string) => {
    setRecords((prev) => {
      const existing = prev.find((r) => r.service === service)
      const newVal = !(existing?.allDay || false)
      if (existing) {
        return prev.map((r) =>
          r.service === service ? { ...r, allDay: newVal } : r
        )
      }
      return [
        ...prev,
        { id: '', date, service, subOptions: [], allDay: newVal },
      ]
    })
  }

  const saveService = async (service: string) => {
    setSaving(service)
    try {
      const record = getRecord(service)
      const res = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({
          date,
          service,
          subOptions: record.subOptions,
          allDay: record.allDay,
        }),
      })
      if (res.ok) {
        toast.success(`${SERVICE_LABELS[service]} availability saved`)
        await fetchAvailability()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Save failed')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(null)
    }
  }

  const serviceKeys = Object.keys(SERVICE_LABELS)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-dark">Service Availability</h2>
          <p className="text-sm text-muted-foreground">
            Mark services as available or unavailable for specific dates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-brand-teal" />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-44"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
        </div>
      ) : (
        <div className="space-y-4">
          {serviceKeys.map((service) => {
            const record = getRecord(service)
            const options = serviceOptions[service] || []
            const isExpanded = expandedService === service
            const isSaving = saving === service

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
                      {record.allDay && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                          <CheckCircle className="w-3 h-3" /> All available
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        saveService(service)
                      }}
                      disabled={isSaving}
                      className="bg-brand-teal hover:bg-brand-teal/90 text-white rounded-full h-8 px-4 text-xs"
                    >
                      {isSaving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span className="ml-1.5">Save</span>
                    </Button>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border/50 pt-3">
                    <label className="flex items-center gap-2 mb-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={record.allDay}
                        onChange={() => toggleAllDay(service)}
                        className="w-4 h-4 rounded border-gray-300 text-brand-teal focus:ring-brand-teal"
                      />
                      <span className="text-sm font-medium text-brand-dark">
                        Available all day (all options)
                      </span>
                    </label>

                    {!record.allDay && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {options.map((option) => {
                          const checked = record.subOptions.includes(option)
                          return (
                            <button
                              key={option}
                              onClick={() => updateSubOption(service, option, !checked)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                                checked
                                  ? 'bg-brand-teal/10 border-brand-teal/30 text-brand-dark font-medium'
                                  : 'bg-gray-50 border-border/50 text-muted-foreground hover:border-brand-teal/30'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                  checked
                                    ? 'bg-brand-teal border-brand-teal'
                                    : 'border-gray-300'
                                }`}
                              >
                                {checked && <CheckCircle className="w-3 h-3 text-white" />}
                              </div>
                              {option}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    <div className="mt-3 flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => saveService(service)}
                        disabled={isSaving}
                        className="bg-brand-teal hover:bg-brand-teal/90 text-white rounded-full h-8 px-4 text-xs"
                      >
                        {isSaving ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        <span className="ml-1.5">Save {SERVICE_LABELS[service]}</span>
                      </Button>
                    </div>
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
