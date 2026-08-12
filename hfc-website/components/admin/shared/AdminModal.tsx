'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface AdminModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export default function AdminModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: AdminModalProps) {
  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  let widthClass = 'max-w-[480px]'
  if (size === 'md') widthClass = 'max-w-[600px]'
  if (size === 'lg') widthClass = 'max-w-[800px]'

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`bg-white rounded-[16px] border border-brand-border w-full ${widthClass} shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col max-h-[90vh] z-10`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border flex-shrink-0">
              <h2 className="font-display font-bold text-[20px] text-brand-black">{title}</h2>
              <button
                onClick={onClose}
                className="text-brand-muted hover:text-brand-red p-1 transition-colors rounded-full hover:bg-brand-surface"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
