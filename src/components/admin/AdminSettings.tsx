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
}

export function AdminSettings() {
  const { user } = useAppStore()
  const queryClient = useQueryClient()
  const [settings, setSettings] = useState<Record<string, string>>(defaultSettings)
  const [saving, setSaving] = useState(false)

  const { data: fetched, isLoading } = useQuery({
    queryKey: ['admin-settings', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/admin/settings', { headers: { 'x-user-id': user?.id || '' } })
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
        headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) { toast.error('Failed to save'); return }
      toast.success('Settings saved!')
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const fields = [
    { key: 'siteName', label: 'Site Name', type: 'text' },
    { key: 'tagline', label: 'Tagline', type: 'text' },
    { key: 'whatsapp', label: 'WhatsApp Number', type: 'text' },
    { key: 'phone', label: 'Phone Number', type: 'text' },
    { key: 'email', label: 'Email Address', type: 'email' },
    { key: 'address', label: 'Company Address', type: 'textarea' },
    { key: 'facebook', label: 'Facebook URL', type: 'text' },
    { key: 'instagram', label: 'Instagram URL', type: 'text' },
    { key: 'youtube', label: 'YouTube URL', type: 'text' },
  ]

  return (
    <div>
      <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark mb-6">Site Settings</h2>

      <div className="bg-white rounded-xl shadow-sm p-6 max-w-2xl">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading settings...</div>
        ) : (
          <div className="space-y-5">
            {fields.map(({ key, label, type }) => (
              <div key={key}>
                <Label htmlFor={key}>{label}</Label>
                {type === 'textarea' ? (
                  <Textarea id={key} value={settings[key] || ''} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} rows={3} />
                ) : (
                  <Input id={key} type={type} value={settings[key] || ''} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} />
                )}
              </div>
            ))}
            <div className="pt-4">
              <Button onClick={handleSave} disabled={saving} className="bg-brand-orange hover:bg-brand-orange/90 text-white">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
