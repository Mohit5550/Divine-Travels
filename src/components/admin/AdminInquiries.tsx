'use client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { Mail, Phone, Trash2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useState } from 'react'

interface Inquiry {
  id: string; name: string; email: string; phone: string | null; message: string
  subject: string | null; source: string | null; read: boolean; createdAt: string
}

export function AdminInquiries() {
  const { user } = useAppStore()
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<Inquiry | null>(null)

  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ['admin-inquiries', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/admin/inquiries', { headers: { 'x-user-id': user?.id || '' } })
      if (!res.ok) return []
      const data = await res.json()
      return Array.isArray(data) ? data : []
    },
  })

  const markRead = async (id: string) => {
    await fetch(`/api/admin/inquiries?markRead=${id}`, { headers: { 'x-user-id': user?.id || '' } })
    queryClient.invalidateQueries({ queryKey: ['admin-inquiries'] })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this inquiry?')) return
    try {
      const res = await fetch(`/api/admin/inquiries?id=${id}`, { method: 'DELETE', headers: { 'x-user-id': user?.id || '' } })
      if (!res.ok) { toast.error('Failed to delete'); return }
      toast.success('Inquiry deleted')
      if (selected?.id === id) setSelected(null)
      queryClient.invalidateQueries({ queryKey: ['admin-inquiries'] })
    } catch { toast.error('Failed to delete') }
  }

  const unreadCount = inquiries.filter((i: Inquiry) => !i.read).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark">Contact Inquiries</h2>
          {unreadCount > 0 && <p className="text-sm text-muted-foreground mt-1">{unreadCount} unread</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-6 text-center text-muted-foreground">Loading...</div>
          ) : inquiries.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">No inquiries yet</div>
          ) : (
            <div className="divide-y divide-border/50 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {inquiries.map((inquiry: Inquiry) => (
                <button
                  key={inquiry.id}
                  onClick={() => { setSelected(inquiry); if (!inquiry.read) markRead(inquiry.id) }}
                  className={`w-full text-left p-4 hover:bg-brand-cream/30 transition-colors ${selected?.id === inquiry.id ? 'bg-brand-cream/50' : ''} ${!inquiry.read ? 'bg-brand-orange/5' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className={`text-sm truncate ${!inquiry.read ? 'font-semibold text-brand-dark' : 'text-muted-foreground'}`}>
                        {inquiry.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{inquiry.subject || inquiry.message.slice(0, 50)}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          {selected ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-brand-dark">{selected.name}</h3>
                  <p className="text-sm text-muted-foreground">{selected.subject || 'No subject'}</p>
                </div>
                <div className="flex gap-2">
                  {!selected.read && (
                    <Button variant="ghost" size="sm" className="text-green-600" onClick={() => markRead(selected.id)}>
                      <CheckCircle className="w-4 h-4 mr-1" /> Mark Read
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(selected.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${selected.email}`} className="text-brand-orange hover:underline">{selected.email}</a>
                </div>
                {selected.phone && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${selected.phone}`} className="text-brand-orange hover:underline">{selected.phone}</a>
                  </div>
                )}
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-sm whitespace-pre-wrap">{selected.message}</p>
              </div>
              {selected.source && (
                <p className="text-xs text-muted-foreground">Source: {selected.source}</p>
              )}
              <p className="text-xs text-muted-foreground">Received: {new Date(selected.createdAt).toLocaleString()}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Mail className="w-12 h-12 mb-3 opacity-30" />
              <p>Select an inquiry to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
