import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { applyPageSeo } from '@/lib/seo'

interface AppUser {
  id: string
  email: string
  name: string
  phone?: string | null
  avatar?: string | null
  role: string
}

interface NavEntry {
  view: string
  packageId: string | null
  destinationId: string | null
  sourceView: string | null
}

interface AppStore {
  currentView: string
  selectedDestinationId: string | null
  selectedPackageId: string | null
  user: AppUser | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  sourceView: string | null
  navHistory: NavEntry[]
  dashboardTab: string | null
  voucherModalOpen: boolean
  setVoucherModalOpen: (open: boolean) => void
  navigate: (view: string, destId?: string | null, pkgId?: string | null) => void
  goBack: (fallbackView?: string | null) => void
  setUser: (user: AppUser | null, token?: string | null) => void
  setDashboardTab: (tab: string) => void
  logout: () => void
}

const LISTING_VIEWS = [
  'rafting-packages', 'bike-rental', 'taxi-booking', 'trekking', 'adventure',
  'domestic-tours', 'spiritual-tours', 'international-tours', 'hotel-packages',
  'camping-packages', 'rishikesh-tour', 'haridwar-tour', 'mussoorie-tour',
  'nainital-tour', 'hill-stations-tour', 'char-dham-tour', 'taxi-booking-form',
  'gallery', 'blog-archive', 'collaborate',
]

const DETAIL_VIEWS = ['package-detail', 'package-booking', 'company-detail', 'destination-detail', 'blog-single', 'hotel-detail']

const ALL_VALID_VIEWS = new Set([
  'landing', 'user-dashboard', 'admin-dashboard', 'destination-detail',
  'booking-success', 'about-us', 'contact', 'privacy-policy', 'terms-of-service',
  'refund-policy', 'cancellation-policy', 'cookie-policy', 'collaborate',
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
  'collaborate': '/collaborate',
  'about-us': '/about',
  'contact': '/contact',
  'user-dashboard': '/dashboard',
  'admin-dashboard': '/admin',
  'privacy-policy': '/privacy',
  'terms-of-service': '/terms',
  'refund-policy': '/refund',
  'cancellation-policy': '/cancellation',
  'cookie-policy': '/cookie-policy',
  'blog-archive': '/blog',
  'destination-detail': '/destination/:slug',
  'booking-success': '/booking-success',
  'package-detail': '/package/:id',
  'package-booking': '/package/:id/book',
  'company-detail': '/company/:id',
  'blog-single': '/blog/:id',
  'hotel-detail': '/hotel/:id',
}

const PATH_TO_VIEW: Record<string, string> = Object.fromEntries(
  Object.entries(VIEW_TO_PATH).map(([view, path]) => [path, view])
)

function resolveFromURL(): { view: string; packageId: string | null; destinationId: string | null } {
  if (typeof window === 'undefined') return { view: 'landing', packageId: null, destinationId: null }
  const path = window.location.pathname
  let m = path.match(/^\/package\/([^/]+)\/book$/)
  if (m) return { view: 'package-booking', packageId: m[1], destinationId: null }
  m = path.match(/^\/package\/([^/]+)$/)
  if (m) return { view: 'package-detail', packageId: m[1], destinationId: null }
  m = path.match(/^\/hotel\/([^/]+)$/)
  if (m) return { view: 'hotel-detail', packageId: m[1], destinationId: null }
  m = path.match(/^\/company\/([^/]+)$/)
  if (m) return { view: 'company-detail', packageId: m[1], destinationId: null }
  m = path.match(/^\/blog\/([^/]+)$/)
  if (m) return { view: 'blog-single', packageId: m[1], destinationId: null }
  m = path.match(/^\/destination\/([^/]+)$/)
  if (m) return { view: 'destination-detail', destinationId: m[1], packageId: null }
  return { view: PATH_TO_VIEW[path] || 'landing', packageId: null, destinationId: null }
}

function getPathForView(view: string): string {
  const path = VIEW_TO_PATH[view] || '/'
  const state = useAppStore.getState()
  return path
    .replace(':id', state.selectedPackageId || ':id')
    .replace(':slug', state.selectedDestinationId || ':slug')
}

export { getPathForView }

function syncURL(view: string) {
  if (typeof window === 'undefined') return
  const path = getPathForView(view)
  const currentPath = window.location.pathname
  if (path !== currentPath) {
    const isListingTarget = LISTING_VIEWS.includes(view)
    const currentViewFromPath = PATH_TO_VIEW[currentPath]
    const isListingCurrent = currentViewFromPath ? LISTING_VIEWS.includes(currentViewFromPath) : false
    if (isListingTarget && isListingCurrent) {
      window.history.replaceState({ view }, '', path)
    } else {
      window.history.pushState({ view }, '', path)
    }
  }
  applyPageSeo(view)
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      currentView: 'landing',
      selectedDestinationId: null,
      selectedPackageId: null,
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      sourceView: null,
      navHistory: [],
      dashboardTab: null,
      voucherModalOpen: false,

      setVoucherModalOpen: (open: boolean) => set({ voucherModalOpen: open }),

      navigate: (view: string, destId?: string | null, pkgId?: string | null) => {
        const state = get()
        const sameView =
          view === state.currentView &&
          (pkgId ?? null) === (state.selectedPackageId ?? null) &&
          (destId ?? null) === (state.selectedDestinationId ?? null)

        let newSource = state.sourceView
        if (DETAIL_VIEWS.includes(view)) {
          newSource = state.currentView
        } else if (LISTING_VIEWS.includes(view)) {
          newSource = 'landing'
        } else if (view === 'landing') {
          newSource = null
        }

        const navHistory = sameView
          ? state.navHistory
          : [
              ...state.navHistory,
              {
                view: state.currentView,
                packageId: state.selectedPackageId,
                destinationId: state.selectedDestinationId,
                sourceView: state.sourceView,
              },
            ].slice(-50)

        set({
          currentView: view,
          selectedDestinationId: destId ?? null,
          selectedPackageId: pkgId ?? null,
          sourceView: newSource,
          navHistory,
        })
        syncURL(view)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      },

      goBack: (fallbackView?: string | null) => {
        const state = get()
        if (state.navHistory.length > 0) {
          const prev = state.navHistory[state.navHistory.length - 1]
          set({
            currentView: prev.view,
            selectedDestinationId: prev.destinationId,
            selectedPackageId: prev.packageId,
            sourceView: prev.sourceView,
            navHistory: state.navHistory.slice(0, -1),
          })
          syncURL(prev.view)
        } else {
          const fb = fallbackView || 'landing'
          set({
            currentView: fb,
            selectedDestinationId: null,
            selectedPackageId: null,
            sourceView: null,
            navHistory: [],
          })
          syncURL(fb)
        }
        window.scrollTo({ top: 0, behavior: 'smooth' })
      },

      setUser: (user: AppUser | null, token?: string | null) => {
        set({
          user,
          token: token ?? null,
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
          token: null,
          isAuthenticated: false,
          isAdmin: false,
          currentView: 'landing',
          selectedDestinationId: null,
          selectedPackageId: null,
          sourceView: null,
          navHistory: [],
          dashboardTab: null,
        })
        syncURL('landing')
      },
    }),
    {
      name: 'divine-travel-store',
      skipHydration: true,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
      merge: (persisted, current) => {
        const merged = { ...current, ...(persisted as Partial<AppStore>) }
        const r = resolveFromURL()
        merged.currentView = r.view
        merged.selectedDestinationId = r.destinationId
        merged.selectedPackageId = r.packageId
        applyPageSeo(r.view)
        return merged
      },
    }
  )
)

if (typeof window !== 'undefined' && !(window as any).__divineStorePopstate) {
  ;(window as any).__divineStorePopstate = true
  const syncFromCurrentLocation = () => {
    const r = resolveFromURL()
    const state = useAppStore.getState()
    if (!state.currentView || state.currentView !== r.view || state.selectedPackageId !== r.packageId || state.selectedDestinationId !== r.destinationId) {
      useAppStore.setState({
        currentView: r.view || 'landing',
        selectedDestinationId: r.destinationId,
        selectedPackageId: r.packageId,
      })
      applyPageSeo(r.view || 'landing')
    }
  }

  window.addEventListener('popstate', syncFromCurrentLocation)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      syncFromCurrentLocation()
    }
  })
  window.addEventListener('focus', syncFromCurrentLocation)
}
