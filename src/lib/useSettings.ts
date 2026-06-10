import { useQuery } from '@tanstack/react-query'

const defaultSettings: Record<string, string> = {
  whatsapp: '+916396919007',
  phone: '+916396919007',
  email: 'info@divinetravels.in',
  address: 'Near Swami Narayan Ashram, Muni Ki Reti, Rishikesh - 249137',
  facebook: 'https://www.facebook.com/share/1ERbuic1Zk/',
  instagram: 'https://www.instagram.com/divinetravels.in',
  youtube: 'https://youtube.com/@divinetravelsuk14',
  siteName: 'Divine Travels',
  tagline: 'Explore the Divine with Us',
}

export function useSettings() {
  const { data = defaultSettings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/public/settings')
        if (!res.ok) return defaultSettings
        const data = await res.json()
        return { ...defaultSettings, ...data }
      } catch {
        return defaultSettings
      }
    },
    staleTime: 300000,
  })
  return data
}
