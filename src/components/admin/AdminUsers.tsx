'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { Shield, Mail, Calendar } from 'lucide-react'

export function AdminUsers() {
  const { user } = useAppStore()

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users', user?.id],
    queryFn: async () => {
      // Using the stats endpoint approach - we'll fetch from a simple users list
      // Since there's no dedicated users endpoint, we'll use the stats data
      const statsRes = await fetch('/api/admin/stats', {
        headers: { 'x-user-id': user?.id || '' },
      })
      const stats = await statsRes.json()

      // Get users from bookings data
      const bookingsRes = await fetch('/api/bookings?all=true', {
        headers: { 'x-user-id': user?.id || '' },
      })
      const bookings = await bookingsRes.json()

      // Extract unique users from bookings + current admin
      const userMap = new Map()
      userMap.set(user.id, { id: user.id, name: user.name, email: user.email, role: user.role })
      bookings.forEach((b: { user: { id: string; name: string; email: string } }) => {
        if (!userMap.has(b.user.id)) {
          userMap.set(b.user.id, { ...b.user, role: 'user' })
        }
      })

      return Array.from(userMap.values())
    },
  })

  return (
    <div>
      <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark mb-6">Manage Users</h2>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-cream/50 border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u: {
                  id: string
                  name: string
                  email: string
                  role: string
                }) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-brand-cream/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-orange/10 flex items-center justify-center">
                          <span className="text-brand-orange font-semibold text-sm">
                            {u.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-brand-dark">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {u.email}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        u.role === 'admin'
                          ? 'bg-brand-orange/10 text-brand-orange'
                          : 'bg-brand-teal/10 text-brand-teal'
                      }`}>
                        {u.role === 'admin' ? (
                          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Admin</span>
                        ) : 'User'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                        <Calendar className="w-3 h-3" /> Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
