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

interface HistoryEntry {
  view: string
  packageId: string | null
  destinationId: string | null
}

interface AppStore {
  currentView: string
  selectedDestinationId: string | null
  selectedPackageId: string | null
  user: AppUser | null
  isAuthenticated: boolean
  isAdmin: boolean
  history: HistoryEntry[]
  navigate: (view: string, destId?: string | null, pkgId?: string | null) => void
  goBack: () => void
  setUser: (user: AppUser | null) => void
  logout: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      currentView: 'landing',
      selectedDestinationId: null,
      selectedPackageId: null,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      history: [],

      navigate: (view: string, destId?: string | null, pkgId?: string | null) => {
        const state = get()
        const newHistory = [
          ...state.history,
          {
            view: state.currentView,
            packageId: state.selectedPackageId,
            destinationId: state.selectedDestinationId,
          },
        ].slice(-10)
        set({
          currentView: view,
          selectedDestinationId: destId ?? null,
          selectedPackageId: pkgId ?? null,
          history: newHistory,
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
      },

      goBack: () => {
        const state = get()
        if (state.history.length > 0) {
          const prev = state.history[state.history.length - 1]
          set({
            currentView: prev.view,
            selectedDestinationId: prev.destinationId,
            selectedPackageId: prev.packageId,
            history: state.history.slice(0, -1),
          })
          window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
          set({
            currentView: 'landing',
            selectedDestinationId: null,
            selectedPackageId: null,
            history: [],
          })
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
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
          history: [],
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
