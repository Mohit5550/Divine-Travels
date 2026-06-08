'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { Shield, Mail, Calendar, User as UserIcon, Package } from 'lucide-react'

interface UserData {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  createdAt: string
  _count: {
    bookings: number
    packageBookings: number
  }
}

export function AdminUsers() {
  const { user } = useAppStore()

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/admin/users', {
        headers: { 'x-user-id': user?.id || '' },
      })
      if (!res.ok) return []
      return res.json() as Promise<UserData[]>
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark">Manage Users</h2>
          <p className="text-sm text-gray-500 mt-1">{users.length} total user{users.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-cream/50 border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Phone</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Bookings</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-brand-cream/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                          u.role === 'admin' ? 'bg-brand-orange/10' : 'bg-brand-teal/10'
                        }`}>
                          <span className={`font-semibold text-sm ${
                            u.role === 'admin' ? 'text-brand-orange' : 'text-brand-teal'
                          }`}>
                            {u.name?.charAt(0)?.toUpperCase() || '?'}
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
                    <td className="py-3 px-4 text-muted-foreground">
                      {u.phone || '—'}
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
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {u._count.packageBookings > 0 && (
                          <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                            <Package className="w-3 h-3" />
                            {u._count.packageBookings} pkg
                          </span>
                        )}
                        {u._count.bookings > 0 && (
                          <span className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                            <UserIcon className="w-3 h-3" />
                            {u._count.bookings} stay
                          </span>
                        )}
                        {u._count.packageBookings === 0 && u._count.bookings === 0 && (
                          <span className="text-gray-400">No bookings</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(u.createdAt).toLocaleDateString('en-IN')}
                      </div>
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
