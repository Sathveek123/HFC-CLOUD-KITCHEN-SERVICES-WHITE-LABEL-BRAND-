'use client'

import { useEffect } from 'react'
import SplashScreen from '@/components/splash/SplashScreen'
import HeroSection from '@/components/hero/HeroSection'
import MenuSection from '@/components/menu/MenuSection'
import CartDrawer from '@/components/cart/CartDrawer'
import { usePromotionsStore } from '@/store/promotionsStore'
import { useSettingsStore } from '@/store/settingsStore'
import { subscribeToSettingRealtime } from '@/lib/supabaseSync'

import { ErrorBoundary } from '@/components/ErrorBoundary'
import MenuUnavailableFallback from '@/components/menu/MenuUnavailableFallback'

export default function Home() {
  const fetchAndSyncPromotions = usePromotionsStore(state => state.fetchAndSyncPromotions)
  const setPromotionsFromSupabase = usePromotionsStore(state => state.setPromotionsFromSupabase)
  const fetchAndSyncSettings = useSettingsStore(state => state.fetchAndSyncSettings)
  const setSettingsFromSupabase = useSettingsStore(state => state.setSettingsFromSupabase)

  useEffect(() => {
    // Fetch all live config from Supabase on first load
    fetchAndSyncPromotions()
    fetchAndSyncSettings()

    // Realtime: coupons/offers update live when admin changes them
    const unsubPromo = subscribeToSettingRealtime('promotions', (val) => {
      if (val) setPromotionsFromSupabase(val)
    })

    // Realtime: delivery fee, UPI ID, payment options update live
    const unsubSettings = subscribeToSettingRealtime('site_settings', (val) => {
      if (val) setSettingsFromSupabase(val)
    })

    return () => { unsubPromo(); unsubSettings() }
  }, [fetchAndSyncPromotions, setPromotionsFromSupabase, fetchAndSyncSettings, setSettingsFromSupabase])

  return (
    <main className="bg-white min-h-screen">
      <SplashScreen />
      <HeroSection />
      <ErrorBoundary fallback={<MenuUnavailableFallback />}>
        <MenuSection />
      </ErrorBoundary>
      <CartDrawer />
    </main>
  )
}

