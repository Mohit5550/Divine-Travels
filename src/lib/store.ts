import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppUser {
  id: string
  email: string
  name: string
  phone?: string | null
  avatar?: string | null
  role: string
}

interface AppStore {
  currentView: string
  selectedDestinationId: string | null
  selectedPackageId: string | null
  user: AppUser | null
  isAuthenticated: boolean
  isAdmin: boolean
  navigate: (view: string, destId?: string | null, pkgId?: string | null) => void
  setUser: (user: AppUser | null) => void
  logout: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      currentView: 'landing',
      selectedDestinationId: null,
      selectedPackageId: null,
      user: null,
      isAuthenticated: false,
      isAdmin: false,

      navigate: (view: string, destId?: string | null, pkgId?: string | null) => {
        set({
          currentView: view,
          selectedDestinationId: destId ?? null,
          selectedPackageId: pkgId ?? null,
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
      },

      setUser: (user: AppUser | null) => {
        set({
          user,
          isAuthenticated: !!user,
          isAdmin: user?.role === 'admin',
        })
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isAdmin: false,
          currentView: 'landing',
          selectedDestinationId: null,
          selectedPackageId: null,
        })
      },
    }),
    {
      name: 'divine-travel-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
        currentView: state.currentView,
        selectedDestinationId: state.selectedDestinationId,
        selectedPackageId: state.selectedPackageId,
      }),
    }
  )
)
