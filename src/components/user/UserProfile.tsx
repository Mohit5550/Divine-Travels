'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { useQueryClient } from '@tanstack/react-query'
import { User, Mail, Phone, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export function UserProfile() {
  const { user, setUser } = useAppStore()
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // In a real app, this would update the user profile via API
      // For now, we update the local store
      const updatedUser = { ...user, name: form.name, phone: form.phone }
      setUser(updatedUser)
      toast.success('Profile updated successfully!')
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] })
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark mb-6">My Profile</h2>

      <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-brand-orange/10 flex items-center justify-center">
            <User className="w-10 h-10 text-brand-orange" />
          </div>
          <div>
            <h3 className="font-semibold text-xl text-brand-dark">{user?.name}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <span className="inline-flex items-center gap-1 mt-1 text-xs bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-full">
              {user?.role === 'admin' ? 'Admin' : 'Member'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5 max-w-lg">
          <div>
            <label className="text-sm font-medium text-brand-dark mb-1.5 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="pl-10 h-11"
                placeholder="Your name"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-brand-dark mb-1.5 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={form.email}
                disabled
                className="pl-10 h-11 bg-muted"
                placeholder="Your email"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="text-sm font-medium text-brand-dark mb-1.5 block">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="pl-10 h-11"
                placeholder="Your phone number"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="bg-brand-orange hover:bg-brand-orange/90 text-white h-11 px-6"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>
    </div>
  )
}
