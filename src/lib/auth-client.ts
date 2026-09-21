import { useAppStore } from '@/lib/store'

export function getAuthHeaders(): Record<string, string> {
  const token = useAppStore.getState().token
  if (token) {
    return { Authorization: `Bearer ${token}` }
  }
  return {}
}
