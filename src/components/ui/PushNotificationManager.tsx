'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, BellOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useAppStore } from '@/lib/store'
import { getAuthHeaders } from '@/lib/auth-client'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

async function autoSubscribe(userId: string) {
  try {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) return
    if (Notification.permission === 'denied') return

    const reg = await navigator.serviceWorker.ready
    const existing = await reg.pushManager.getSubscription()
    if (existing) {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ subscription: { endpoint: existing.endpoint, keys: existing.toJSON().keys } }),
      })
      return
    }

    if (Notification.permission === 'default') {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') return
    }

    const res = await fetch('/api/push/vapid-key')
    const { publicKey } = await res.json()

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    })

    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ subscription: { endpoint: subscription.endpoint, keys: subscription.toJSON().keys } }),
    })
  } catch (err) {
    console.log('Auto push subscribe skipped:', err)
  }
}

export { autoSubscribe }

export function PushNotificationManager() {
  const { user } = useAppStore()
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  const checkSubscription = useCallback(async () => {
    if (!isSupported) return
    try {
      const reg = await navigator.serviceWorker.ready
      const subscription = await reg.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch {
      setIsSubscribed(false)
    }
  }, [isSupported])

  useEffect(() => {
    checkSubscription()
  }, [checkSubscription])

  useEffect(() => {
    if (user?.id && isSupported && permission !== 'denied') {
      autoSubscribe(user.id)
    }
  }, [user?.id, isSupported, permission])

  const subscribe = async () => {
    if (!user?.id) {
      toast.error('Please login to enable notifications')
      return
    }

    setLoading(true)
    try {
      const permResult = await Notification.requestPermission()
      setPermission(permResult)

      if (permResult !== 'granted') {
        toast.error('Notification permission denied')
        setLoading(false)
        return
      }

      const reg = await navigator.serviceWorker.ready

      const existingSub = await reg.pushManager.getSubscription()
      if (existingSub) {
        await sendSubscriptionToServer(existingSub)
        setIsSubscribed(true)
        toast.success('Notifications enabled!')
        setLoading(false)
        return
      }

      const res = await fetch('/api/push/vapid-key')
      const { publicKey } = await res.json()

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      await sendSubscriptionToServer(subscription)
      setIsSubscribed(true)
      toast.success('Notifications enabled!')
    } catch (err) {
      console.error('Push subscribe error:', err)
      toast.error('Failed to enable notifications')
    }
    setLoading(false)
  }

  const unsubscribe = async () => {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const subscription = await reg.pushManager.getSubscription()

      if (subscription) {
        const endpoint = subscription.endpoint
        await subscription.unsubscribe()

        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(), },
          body: JSON.stringify({ endpoint }),
        })
      }

      setIsSubscribed(false)
      toast.success('Notifications disabled')
    } catch (err) {
      console.error('Push unsubscribe error:', err)
      toast.error('Failed to disable notifications')
    }
    setLoading(false)
  }

  const sendSubscriptionToServer = async (subscription: PushSubscription) => {
    const subJson = subscription.toJSON()
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(), },
      body: JSON.stringify({
        subscription: {
          endpoint: subJson.endpoint,
          keys: subJson.keys,
        },
      }),
    })
  }

  if (!isSupported || permission === 'denied') return null

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={loading}
      className="gap-1.5 text-xs"
      title={isSubscribed ? 'Disable push notifications' : 'Enable push notifications'}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isSubscribed ? (
        <Bell className="w-3.5 h-3.5 text-emerald-600" />
      ) : (
        <BellOff className="w-3.5 h-3.5 text-muted-foreground" />
      )}
      <span className="hidden sm:inline">
        {isSubscribed ? 'Push On' : 'Push Off'}
      </span>
    </Button>
  )
}
