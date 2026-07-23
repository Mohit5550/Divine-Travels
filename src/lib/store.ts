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
  dashboardTab: string | null
  navigate: (view: string, destId?: string | null, pkgId?: string | null) => void
  goBack: () => void
  setUser: (user: AppUser | null) => void
  setDashboardTab: (tab: string) => void
  logout: () => void
}

const LISTING_VIEWS = [
  'rafting-packages', 'bike-rental', 'taxi-booking', 'trekking', 'adventure',
  'domestic-tours', 'spiritual-tours', 'international-tours', 'hotel-packages',
  'camping-packages', 'rishikesh-tour', 'haridwar-tour', 'mussoorie-tour',
  'nainital-tour', 'hill-stations-tour', 'char-dham-tour', 'taxi-booking-form',
  'gallery', 'company-detail', 'blog-archive',
]

const DETAIL_VIEWS = ['package-detail', 'package-booking', 'company-detail', 'destination-detail', 'blog-single', 'hotel-detail']

const ALL_VALID_VIEWS = new Set([
  'landing', 'user-dashboard', 'admin-dashboard', 'destination-detail',
  'booking-success', 'about-us', 'contact', 'privacy-policy', 'terms-of-service',
  'refund-policy', 'cancellation-policy',
  ...LISTING_VIEWS,
  ...DETAIL_VIEWS,
])

const VIEW_TO_PATH: Record<string, string> = {
  'landing': '/',
  'rishikesh-tour': '/rishikesh',
  'haridwar-tour': '/haridwar',
  'mussoorie-tour': '/mussoorie',
  'nainital-tour': '/nainital',
  'hill-stations-tour': '/hill-stations',
  'char-dham-tour': '/char-dham',
  'rafting-packages': '/rafting',
  'bike-rental': '/bike-rental',
  'taxi-booking': '/taxi',
  'taxi-booking-form': '/taxi/book',
  'trekking': '/trekking',
  'adventure': '/adventure',
  'domestic-tours': '/domestic',
  'spiritual-tours': '/spiritual',
  'international-tours': '/international',
  'hotel-packages': '/hotels',
  'camping-packages': '/camping',
  'gallery': '/gallery',
  'about-us': '/about',
  'contact': '/contact',
  'user-dashboard': '/dashboard',
  'admin-dashboard': '/admin',
  'privacy-policy': '/privacy',
  'terms-of-service': '/terms',
  'refund-policy': '/refund',
  'cancellation-policy': '/cancellation',
  'blog-archive': '/blog',
}

const PATH_TO_VIEW: Record<string, string> = Object.fromEntries(
  Object.entries(VIEW_TO_PATH).map(([view, path]) => [path, view])
)

function getViewFromURL(): string {
  if (typeof window === 'undefined') return 'landing'
  const path = window.location.pathname
  return PATH_TO_VIEW[path] || 'landing'
}

function getPathForView(view: string): string {
  return VIEW_TO_PATH[view] || '/'
}

function syncURL(view: string) {
  if (typeof window === 'undefined') return
  const path = getPathForView(view)
  const currentPath = window.location.pathname
  if (path !== currentPath) {
    window.history.pushState({ view }, '', path)
  }
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      currentView: getViewFromURL(),
      selectedDestinationId: null,
      selectedPackageId: null,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      sourceView: null,
      dashboardTab: null,

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
        syncURL(view)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      },

      goBack: () => {
        const state = get()
        const source = state.sourceView

        if (DETAIL_VIEWS.includes(state.currentView) && source) {
          const backView = LISTING_VIEWS.includes(source) ? 'landing' : source
          set({
            currentView: source,
            selectedDestinationId: null,
            selectedPackageId: null,
            sourceView: backView === 'landing' ? null : backView,
          })
          syncURL(source)
        } else {
          set({
            currentView: 'landing',
            selectedDestinationId: null,
            selectedPackageId: null,
            sourceView: null,
          })
          syncURL('landing')
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

      setDashboardTab: (tab: string) => {
        set({ dashboardTab: tab })
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
          dashboardTab: null,
        })
        syncURL('landing')
      },
    }),
    {
      name: 'divine-travel-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
      merge: (persisted, current) => {
        const merged = { ...current, ...(persisted as Partial<AppStore>) }
        merged.currentView = getViewFromURL()
        merged.selectedDestinationId = null
        merged.selectedPackageId = null
        return merged
      },
    }
  )
)

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    const view = getViewFromURL()
    const state = useAppStore.getState()
    if (state.currentView !== view) {
      useAppStore.setState({
        currentView: view,
        selectedDestinationId: null,
        selectedPackageId: null,
      })
    }
  })
}
