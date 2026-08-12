'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSplash } from '@/hooks/useSplash'

export default function SplashScreen() {
  const { showSplash, isLoaded, markSplashComplete } = useSplash()
  const [exiting, setExiting] = useState(false)
  const [badgeExiting, setBadgeExiting] = useState(false)

  useEffect(() => {
    if (!isLoaded || !showSplash) return

    // Phase 10 Step A: Badge scale down + fade out at 3900ms
    const timerBadge = setTimeout(() => {
      setBadgeExiting(true)
    }, 3900)

    // Phase 10 Step B: Container slides up at 4050ms
    const timerContainer = setTimeout(() => {
      setExiting(true)
      setTimeout(() => {
        markSplashComplete()
      }, 650)
    }, 4050)

    return () => {
      clearTimeout(timerBadge)
      clearTimeout(timerContainer)
    }
  }, [isLoaded, showSplash, markSplashComplete])

  if (!isLoaded || !showSplash) return null

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="splash-screen-overlay"
          initial={{ y: 0 }}
          exit={{ y: '-100vh' }}
          transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center pointer-events-auto select-none overflow-hidden"
        >
          {/* Background Rotating Faint Circles */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
              className="relative flex items-center justify-center"
            >
              <div className="absolute w-[900px] h-[900px] rounded-full border border-[rgba(204,0,0,0.03)]" />
              <div className="absolute w-[650px] h-[650px] rounded-full border border-[rgba(204,0,0,0.02)]" />
              <div className="absolute w-[420px] h-[420px] rounded-full border border-[rgba(26,26,26,0.02)]" />
            </motion.div>
          </div>

          {/* Badge Group */}
          <motion.div
            animate={badgeExiting ? { scale: 0.92, opacity: 0 } : { scale: 1, opacity: 1 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="relative z-10 flex flex-col items-center justify-center text-center px-4"
          >
            {/* Phase 1 (0ms – 900ms): Outer red ring draws in */}
            <div className="relative w-[220px] h-[220px] sm:w-[300px] sm:h-[300px]">
              <svg viewBox="0 0 300 300" className="absolute inset-0 w-full h-full">
                {/* Outer Red Circle Draw */}
                <motion.circle
                  cx="150" cy="150" r="144"
                  fill="none" stroke="#CC0000" strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
                />
                {/* Inner Dashed Ring Draw */}
                <motion.circle
                  cx="150" cy="150" r="133"
                  fill="none" stroke="#1A1A1A" strokeWidth="1.5"
                  strokeDasharray="4 6"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.4 }}
                  transition={{ delay: 0.7, duration: 0.7, ease: 'easeInOut' }}
                />
              </svg>

              {/* Center: Actual HFC Logo Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="relative w-[160px] h-[160px] sm:w-[220px] sm:h-[220px] rounded-full overflow-hidden bg-white shadow-[0_4px_20px_rgba(204,0,0,0.15)]">
                  <Image
                    src="/logo.jpeg"
                    alt="HFC Consultancy Services Logo"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </motion.div>
            </div>

            {/* Phase 5 (1900ms): Divider Line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.9, duration: 0.25 }}
              style={{ transformOrigin: 'left' }}
              className="w-[60px] h-[1px] bg-brand-black mt-5"
            />

            {/* Phase 6 (2050ms): CONSULTANCY SERVICES Letter-spacing Expand */}
            <motion.p
              initial={{ opacity: 0, letterSpacing: '1px' }}
              animate={{ opacity: 1, letterSpacing: '5px' }}
              transition={{ delay: 2.05, duration: 0.35 }}
              className="font-brand font-semibold text-[9px] sm:text-[11px] text-brand-black uppercase mt-2"
            >
              Consultancy Services
            </motion.p>

            {/* Phase 7 (2300ms): ★★★★★ Spring Bounce Stagger */}
            <div className="flex gap-1 mt-2 text-brand-gold text-[13px] sm:text-[16px]">
              {[0, 1, 2, 3, 4].map((index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0, rotate: -15 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{
                    delay: 2.3 + index * 0.07,
                    type: 'spring',
                    stiffness: 400,
                    damping: 10,
                    mass: 0.6,
                  }}
                >
                  ★
                </motion.span>
              ))}
            </div>

            {/* Phase 8 (2700ms): Tagline Fade Up */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.7, duration: 0.4 }}
              className="font-tagline italic text-[14px] sm:text-[18px] text-brand-body mt-6 max-w-[340px] sm:max-w-[440px] leading-relaxed"
            >
              &ldquo;Your Growth, Our Responsibility. All Within Your Budget.&rdquo;
            </motion.p>

            {/* Phase 9 (3100ms): Micro Trust-Line */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.1, duration: 0.3 }}
              className="font-body text-[11px] text-brand-muted tracking-[1.5px] uppercase mt-2 font-medium"
            >
              Crafting F&amp;B Brands Since 2011
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
