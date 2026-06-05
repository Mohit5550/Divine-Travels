'use client'
import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Download, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export function AdminReports() {
  const { user } = useAppStore()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [exporting, setExporting] = useState<string | null>(null)

  const exportCSV = async (type: string) => {
    setExporting(type)
    try {
      const params = new URLSearchParams({ type })
      if (from) params.set('from', from)
      if (to) params.set('to', to)

      const res = await fetch(`/api/admin/reports?${params}`, {
        headers: { 'x-user-id': user?.id || '' },
      })

      if (!res.ok) { toast.error('Failed to export'); return }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}-report.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success(`${type} report downloaded!`)
    } catch { toast.error('Failed to export') }
    finally { setExporting(null) }
  }

  return (
    <div>
      <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark mb-6">Reports & Export</h2>

      <div className="bg-white rounded-xl shadow-sm p-6 max-w-xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="from">From Date</Label>
              <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="to">To Date</Label>
              <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>

          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Leave dates empty for all records
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <Button onClick={() => exportCSV('bookings')} disabled={exporting !== null} className="bg-brand-orange hover:bg-brand-orange/90 text-white w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              {exporting === 'bookings' ? 'Exporting...' : 'Export Destination Bookings (CSV)'}
            </Button>
            <Button onClick={() => exportCSV('package-bookings')} disabled={exporting !== null} className="bg-blue-600 hover:bg-blue-700 text-white w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              {exporting === 'package-bookings' ? 'Exporting...' : 'Export Package Bookings (CSV)'}
            </Button>
            <Button onClick={() => exportCSV('revenue')} disabled={exporting !== null} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              {exporting === 'revenue' ? 'Exporting...' : 'Export Revenue Report (CSV)'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
