'use client'

import { useState, useEffect } from 'react'

export function useSplash() {
  const [showSplash, setShowSplash] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const shown = sessionStorage.getItem('hfc-splash-shown')
    if (!shown) {
      setShowSplash(true)
    }
    setIsLoaded(true)
  }, [])

  const markSplashComplete = () => {
    sessionStorage.setItem('hfc-splash-shown', 'true')
    setShowSplash(false)
  }

  return { showSplash, isLoaded, markSplashComplete }
}
