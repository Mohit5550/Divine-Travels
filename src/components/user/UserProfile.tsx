'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { User, Mail, Phone, Save, Camera, Lock, Upload, Palette, Globe, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '')
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [savingPassword, setSavingPassword] = useState(false)
  const [preferences, setPreferences] = useState<Record<string, string>>({})
  const [showPreferences, setShowPreferences] = useState(false)
  const [savingPrefs, setSavingPrefs] = useState(false)

  const { data: prefsData } = useQuery({
    queryKey: ['user-preferences', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/user/preferences', { headers: { 'x-user-id': user?.id || '' } })
      if (!res.ok) return {}
      return res.json()
    },
    enabled: showPreferences,
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
        body: JSON.stringify({ name: form.name, phone: form.phone, avatar: avatarUrl || null }),
      })
      if (!res.ok) { const d = await res.json(); toast.error(d.error || 'Failed to save profile'); return }
      const updatedUser = await res.json()
      setUser(updatedUser)
      toast.success('Profile updated!')
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] })
    } catch { toast.error('Failed to update profile') }
    finally { setSaving(false) }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setSavingPassword(true)
    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
        body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed to change password'); return }
      toast.success('Password changed!')
      setShowPasswordForm(false)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch { toast.error('Failed to change password') }
    finally { setSavingPassword(false) }
  }

  const handleSavePreferences = async () => {
    setSavingPrefs(true)
    try {
      const res = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
        body: JSON.stringify(preferences),
      })
      if (!res.ok) { toast.error('Failed to save preferences'); return }
      toast.success('Preferences saved!')
    } catch { toast.error('Failed to save preferences') }
    finally { setSavingPrefs(false) }
  }

  const prefFields = [
    { key: 'theme', label: 'Preferred Theme', icon: Palette, options: ['light', 'dark', 'system'] },
    { key: 'currency', label: 'Preferred Currency', icon: DollarSign, options: ['INR', 'USD', 'EUR'] },
    { key: 'language', label: 'Language', icon: Globe, options: ['English', 'Hindi'] },
    { key: 'budgetRange', label: 'Budget Range', icon: DollarSign, options: ['budget', 'mid-range', 'luxury'] },
  ]

  return (
    <div>
      <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark mb-6">My Profile</h2>

      <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-brand-orange/10 flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-brand-orange" />
              )}
            </div>
            <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <Camera className="w-6 h-6 text-white" />
              <input type="text" className="hidden" onChange={() => {}} />
            </label>
          </div>
          <div className="text-center sm:text-left">
            <h3 className="font-semibold text-xl text-brand-dark">{user?.name}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <span className="inline-flex items-center gap-1 mt-1 text-xs bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-full">
              {user?.role === 'admin' ? 'Admin' : 'Member'}
            </span>
          </div>
        </div>

        {/* Avatar URL Input */}
        <div className="mb-6">
          <label className="text-sm font-medium text-brand-dark mb-1.5 block">Profile Picture URL</label>
          <div className="relative">
            <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="pl-10 h-11"
              placeholder="Paste image URL or leave empty"
            />
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave} className="space-y-5 max-w-lg mb-8">
          <div>
            <label className="text-sm font-medium text-brand-dark mb-1.5 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="pl-10 h-11" placeholder="Your name" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-brand-dark mb-1.5 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={form.email} disabled className="pl-10 h-11 bg-muted" placeholder="Your email" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="text-sm font-medium text-brand-dark mb-1.5 block">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="pl-10 h-11" placeholder="Your phone number" />
            </div>
          </div>
          <Button type="submit" disabled={saving} className="bg-brand-orange hover:bg-brand-orange/90 text-white h-11 px-6">
            <Save className="w-4 h-4 mr-2" />{saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>

        {/* Change Password */}
        <div className="border-t border-border pt-6 mb-8">
          <Button
            variant="outline"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="text-brand-dark mb-4"
          >
            <Lock className="w-4 h-4 mr-2" />{showPasswordForm ? 'Cancel' : 'Change Password'}
          </Button>
          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
              <div>
                <label className="text-sm font-medium text-brand-dark mb-1.5 block">Current Password</label>
                <Input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="h-11"
                  placeholder="Enter current password"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-brand-dark mb-1.5 block">New Password</label>
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="h-11"
                  placeholder="Min. 6 characters"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-brand-dark mb-1.5 block">Confirm New Password</label>
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="h-11"
                  placeholder="Re-enter new password"
                  required
                />
              </div>
              <Button type="submit" disabled={savingPassword} className="bg-brand-dark hover:bg-brand-dark/90 text-white">
                <Lock className="w-4 h-4 mr-2" />{savingPassword ? 'Changing...' : 'Update Password'}
              </Button>
            </form>
          )}
        </div>

        {/* Travel Preferences */}
        <div className="border-t border-border pt-6">
          <Button
            variant="outline"
            onClick={() => { setShowPreferences(!showPreferences); if (!showPreferences && prefsData) setPreferences(prefsData) }}
            className="text-brand-dark mb-4"
          >
            <Palette className="w-4 h-4 mr-2" />{showPreferences ? 'Close' : 'Travel Preferences'}
          </Button>
          {showPreferences && (
            <div className="space-y-4 max-w-lg">
              {prefFields.map((field) => {
                const Icon = field.icon
                return (
                  <div key={field.key}>
                    <label className="text-sm font-medium text-brand-dark mb-1.5 block flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground" />{field.label}
                    </label>
                    <select
                      value={preferences[field.key] || ''}
                      onChange={(e) => setPreferences({ ...preferences, [field.key]: e.target.value })}
                      className="w-full h-11 px-3 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                    >
                      <option value="">Select...</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                )
              })}
              <Button onClick={handleSavePreferences} disabled={savingPrefs} className="bg-brand-teal hover:bg-brand-teal/90 text-white">
                <Save className="w-4 h-4 mr-2" />{savingPrefs ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
