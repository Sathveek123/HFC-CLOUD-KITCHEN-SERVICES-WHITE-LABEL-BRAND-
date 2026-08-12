'use client'

import { useState } from 'react'
import CategoryTabs from './CategoryTabs'
import MenuGrid from './MenuGrid'

export default function MenuSection() {
  const [activeCategory, setActiveCategory] = useState('starters')

  return (
    <section id="menu-section" className="bg-white py-[80px] lg:py-[100px]">
      {/* Section Header */}
      <div className="text-center max-w-[680px] mx-auto px-6 mb-12">
        <div className="w-[60px] h-[2px] bg-brand-red mx-auto" />
        <p className="font-brand font-semibold text-[11px] text-brand-red tracking-[5px] uppercase mt-3">
          ★ OUR MENU ★
        </p>
        <h2 className="font-display font-bold text-[32px] sm:text-[42px] text-brand-black mt-3">
          Crafted With Passion, Served With Pride
        </h2>
        <p className="font-body text-[16px] sm:text-[17px] text-brand-body mt-4 leading-[1.75]">
          Every dish is built around flavor, quality, and the kind of experience your guests will come back for.
        </p>
      </div>

      {/* Sticky Category Tabs */}
      <CategoryTabs active={activeCategory} onChange={setActiveCategory} />

      {/* Grid Container */}
      <div className="max-w-[1280px] mx-auto px-6 mt-12">
        <MenuGrid category={activeCategory} />
      </div>
    </section>
  )
}
