'use client'
import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { getAuthHeaders } from '@/lib/auth-client'

const defaultSettings: Record<string, string> = {
  whatsapp: '+916396919007',
  phone: '+916396919007',
  email: 'info@divinetravels.in',
  address: 'Near Swami Narayan Ashram, Muni Ki Reti, Rishikesh - 249137',
  facebook: 'https://facebook.com/divinetravels',
  instagram: 'https://instagram.com/divinetravels',
  youtube: 'https://youtube.com/@divinetravels',
  siteName: 'Divine Travels',
  tagline: 'Explore the Divine with Us',
  seasonAdvisory: '☀️ Ganga Rafting Season is OPEN in Rishikesh · Clear Weather 24°C · Advance Bookings Active 🟢',
}

export function AdminSettings() {
  const { user } = useAppStore()
  const queryClient = useQueryClient()
  const [settings, setSettings] = useState<Record<string, string>>(defaultSettings)
  const [saving, setSaving] = useState(false)

  const { data: fetched, isLoading } = useQuery({
    queryKey: ['admin-settings', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/admin/settings', { headers: { ...getAuthHeaders() } })
      return res.json() as Promise<Record<string, string>>
    },
  })

  useEffect(() => {
    if (fetched && Object.keys(fetched).length > 0) {
      setSettings({ ...defaultSettings, ...fetched })
    }
  }, [fetched])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), },
        body: JSON.stringify(settings),
      })
      if (!res.ok) { toast.error('Failed to save'); return }
      toast.success('Settings saved!')
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
      queryClient.invalidateQueries({ queryKey: ['public-settings'] })
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const fields = [
    { key: 'siteName', label: 'Site Name', type: 'text', help: 'Brand name displayed across the website.' },
    { key: 'tagline', label: 'Tagline', type: 'text', help: 'Short slogan under site name.' },
    { key: 'seasonAdvisory', label: 'Live Weather & Season Advisory (Top Live Bar)', type: 'textarea', help: 'This text shows in real-time at the very top of the website with the live green indicator (e.g. Ganga Rafting Season Open, Weather 24°C, Char Dham 2026 Active).' },
    { key: 'whatsapp', label: 'WhatsApp Number (with Country Code)', type: 'text', help: 'Used for floating WhatsApp widget and customer inquiries (e.g. +916396919007).' },
    { key: 'phone', label: 'Public Phone / Helpline', type: 'text', help: 'Displayed on top bar and footer for direct calling.' },
    { key: 'email', label: 'Contact Email Address', type: 'email', help: 'Official inquiry email.' },
    { key: 'address', label: 'Company Office Address', type: 'textarea', help: 'Physical address in Rishikesh/Uttarakhand.' },
    { key: 'facebook', label: 'Facebook URL', type: 'text' },
    { key: 'instagram', label: 'Instagram URL', type: 'text' },
    { key: 'youtube', label: 'YouTube URL', type: 'text' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-bold text-2xl sm:text-3xl text-brand-dark tracking-tight">Site & Live Updates Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Control website brand details, contact numbers, and top live advisory banner.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-3xl">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading settings...</div>
        ) : (
          <div className="space-y-5">
            {fields.map(({ key, label, type, help }) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={key} className="font-semibold text-brand-dark text-sm">{label}</Label>
                {help && <p className="text-[11px] text-gray-400 leading-normal">{help}</p>}
                {type === 'textarea' ? (
                  <Textarea id={key} value={settings[key] || ''} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} rows={2} className="rounded-xl" />
                ) : (
                  <Input id={key} type={type} value={settings[key] || ''} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} className="rounded-xl" />
                )}
              </div>
            ))}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <Button onClick={handleSave} disabled={saving} className="bg-brand-orange hover:bg-brand-orange/90 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save All Changes'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
