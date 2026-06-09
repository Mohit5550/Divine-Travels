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
  sourceView: string | null
  navigate: (view: string, destId?: string | null, pkgId?: string | null) => void
  goBack: () => void
  setUser: (user: AppUser | null) => void
  logout: () => void
}

const LISTING_VIEWS = [
  'rafting-packages', 'bike-rental', 'taxi-booking', 'trekking', 'adventure',
  'domestic-tours', 'spiritual-tours', 'international-tours', 'hotel-packages',
  'camping-packages', 'rishikesh-tour', 'haridwar-tour', 'mussoorie-tour',
  'nainital-tour', 'hill-stations-tour', 'char-dham-tour', 'taxi-booking-form',
  'gallery', 'company-detail',
]

const DETAIL_VIEWS = ['package-detail', 'package-booking', 'company-detail']

function getBackView(currentView: string): string {
  if (DETAIL_VIEWS.includes(currentView)) return ''
  if (LISTING_VIEWS.includes(currentView)) return 'landing'
  return 'landing'
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
      sourceView: null,

      navigate: (view: string, destId?: string | null, pkgId?: string | null) => {
        const state = get()
        const prevSource = state.sourceView
        let newSource = prevSource

        if (DETAIL_VIEWS.includes(view)) {
          newSource = state.currentView
        } else if (LISTING_VIEWS.includes(view) && state.currentView === 'landing') {
          newSource = 'landing'
        } else if (view === 'landing') {
          newSource = null
        }

        set({
          currentView: view,
          selectedDestinationId: destId ?? null,
          selectedPackageId: pkgId ?? null,
          sourceView: newSource,
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
      },

      goBack: () => {
        const state = get()
        const source = state.sourceView

        if (DETAIL_VIEWS.includes(state.currentView) && source) {
          set({
            currentView: source,
            selectedDestinationId: null,
            selectedPackageId: null,
            sourceView: LISTING_VIEWS.includes(source) ? 'landing' : null,
          })
        } else if (LISTING_VIEWS.includes(state.currentView)) {
          set({
            currentView: 'landing',
            selectedDestinationId: null,
            selectedPackageId: null,
            sourceView: null,
          })
        } else {
          set({
            currentView: 'landing',
            selectedDestinationId: null,
            selectedPackageId: null,
            sourceView: null,
          })
        }
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
          sourceView: null,
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
