"use client";

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';

function getInitials(name?: string) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase() || 'U';
}

export default function NavbarUserMenu() {
  const { user, isAdmin, navigate, logout, setDashboardTab } = useAppStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) return null;

  return (
    <div className="hidden sm:flex relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50 p-0.5"
        aria-label="Open user menu"
        aria-expanded={open}
      >
        <Avatar className="size-9 border border-gray-200">
          {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
          <AvatarFallback className="bg-brand-teal text-white text-sm font-semibold">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-md border border-gray-200 bg-white shadow-lg z-50 py-1 animate-in fade-in-0 zoom-in-95">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={() => { setDashboardTab('overview'); navigate('user-dashboard'); setOpen(false); }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <User className="w-4 h-4" /> Dashboard
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => { navigate('admin-dashboard'); setOpen(false); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <LayoutDashboard className="w-4 h-4" /> Admin Panel
            </button>
          )}
          <div className="my-1 border-t border-gray-100" />
          <button
            type="button"
            onClick={() => { logout(); setOpen(false); }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      )}
    </div>
  );
}
