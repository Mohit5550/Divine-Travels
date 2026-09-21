'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { Shield, Mail, Calendar, User as UserIcon, Package, Search, Car, Compass, Phone } from 'lucide-react'
import { Pagination } from '@/components/ui/Pagination'
import { Input } from '@/components/ui/input'
import { getAuthHeaders } from '@/lib/auth-client'

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
    tourBookings?: number
  }
}

export function AdminUsers() {
  const { user } = useAppStore()
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', user?.id, page],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users?page=${page}&limit=50`, {
        headers: { ...getAuthHeaders() },
      })
      if (!res.ok) return { users: [], total: 0, totalPages: 1 }
      const json = await res.json()
      if (Array.isArray(json)) {
        return { users: json, total: json.length, totalPages: 1 }
      }
      return {
        users: json.data,
        total: json.total,
        totalPages: json.totalPages,
      }
    },
  })

  const rawUsers: UserData[] = data?.users ?? []
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return rawUsers
    const s = searchTerm.toLowerCase()
    return rawUsers.filter(u =>
      u.name?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s) ||
      u.phone?.toLowerCase().includes(s)
    )
  }, [rawUsers, searchTerm])

  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark">Registered Users & Travelers</h2>
          <p className="text-sm text-gray-500 mt-1">
            {data?.total ?? rawUsers.length} registered customer{(data?.total ?? rawUsers.length) !== 1 ? 's' : ''} on Divine Travels
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-border/50">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No users found matching your search</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-cream/60 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="text-left py-3.5 px-4 font-semibold">User</th>
                  <th className="text-left py-3.5 px-4 font-semibold">Email</th>
                  <th className="text-left py-3.5 px-4 font-semibold">Phone</th>
                  <th className="text-left py-3.5 px-4 font-semibold">Role</th>
                  <th className="text-left py-3.5 px-4 font-semibold">Lifetime Bookings</th>
                  <th className="text-left py-3.5 px-4 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredUsers.map((u) => {
                  const totalBookings = (u._count.packageBookings || 0) + (u._count.bookings || 0) + (u._count.tourBookings || 0)
                  return (
                    <tr key={u.id} className="hover:bg-brand-cream/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-2xs ${
                            u.role === 'admin' ? 'bg-brand-orange/15 text-brand-orange' : 'bg-brand-teal/15 text-brand-teal'
                          }`}>
                            {u.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <span className="font-semibold text-brand-dark block">{u.name}</span>
                            <span className="text-[11px] text-gray-400 font-mono">ID: {u.id.slice(-6)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                          <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          {u.email}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {u.phone ? (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {u.phone}
                          </div>
                        ) : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1 ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {u.role === 'admin' && <Shield className="w-3 h-3 text-amber-600" />}
                          {u.role === 'admin' ? 'Admin' : 'Customer'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {totalBookings > 0 ? (
                            <>
                              <span className="bg-brand-orange/10 text-brand-orange font-bold text-xs px-2 py-0.5 rounded-md">
                                {totalBookings} Total
                              </span>
                              {u._count.packageBookings > 0 && (
                                <span className="bg-blue-50 text-blue-700 text-[11px] px-1.5 py-0.5 rounded border border-blue-100" title="Packages / Rafting / Activities">
                                  {u._count.packageBookings} pkg
                                </span>
                              )}
                              {(u._count.tourBookings || 0) > 0 && (
                                <span className="bg-amber-50 text-amber-700 text-[11px] px-1.5 py-0.5 rounded border border-amber-100" title="Taxis & Spiritual Tours">
                                  {u._count.tourBookings} tours
                                </span>
                              )}
                              {u._count.bookings > 0 && (
                                <span className="bg-emerald-50 text-emerald-700 text-[11px] px-1.5 py-0.5 rounded border border-emerald-100" title="Hotel / Camping Stays">
                                  {u._count.bookings} stays
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400 text-xs italic">0 bookings</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  )
}
