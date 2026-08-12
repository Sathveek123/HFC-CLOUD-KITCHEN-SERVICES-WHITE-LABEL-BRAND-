'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Star } from 'lucide-react'
import HeroBrandCircle from './HeroBrandCircle'

export default function HeroSection() {
  const scrollToMenu = () => {
    const el = document.getElementById('menu-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const openWhatsAppTalk = () => {
    const message = encodeURIComponent("Hi HFC Consultancy Services, I would like to talk about F&B setup & menu engineering.")
    window.open(`https://wa.me/919912799855?text=${message}`, '_blank')
  }

  const serviceTags = [
    'Menu Engineering',
    'Brand Identity',
    'Kitchen Setup',
    'Staff Training',
    'Cost Optimization'
  ]

  const statsList = [
    { number: '200+', label: 'F&B Brands' },
    { number: '15 Yrs', label: 'Experience' },
    { number: '500+', label: 'Menus Crafted' },
    { number: '₹50Cr+', label: 'Revenue Generated' },
  ]

  return (
    <section id="hero-section" className="bg-white pt-[130px] lg:pt-[150px] pb-[100px] lg:pb-[120px] overflow-hidden">
      <div className="max-w-[1320px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-16 items-center">
        
        {/* Left Column Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col items-start"
        >
          {/* 1. Credibility Eyebrow (Logo Badge + Pill Combination) */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-7 h-7 rounded-full border border-brand-red flex items-center justify-center flex-shrink-0 bg-white">
              <span className="font-brand font-black text-[9px] text-brand-red">
                HFC
              </span>
            </div>
            <div className="inline-flex items-center gap-2 border border-brand-red bg-brand-redLight rounded-pill px-4 py-1.5 shadow-2xs">
              <Star size={11} fill="#CC0000" color="#CC0000" />
              <span className="font-brand font-semibold text-[11px] text-brand-red tracking-[1px] uppercase">
                Trusted by 200+ F&amp;B Brands Across India
              </span>
            </div>
          </div>

          {/* 2. Headline with Animated Hand-Drawn Wavy Underline */}
          <h1 className="font-display font-bold text-[38px] sm:text-[52px] lg:text-[60px] leading-[1.1] text-brand-black">
            We Build Food Businesses <br />
            That Actually{' '}
            <span className="text-brand-red relative inline-block">
              Grow.
              <svg
                className="absolute -bottom-2 left-0 w-full"
                height="8"
                viewBox="0 0 140 8"
                fill="none"
              >
                <motion.path
                  d="M2 5 Q 35 1, 70 5 T 138 4"
                  stroke="#CC0000"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                />
              </svg>
            </span>
          </h1>

          {/* 3. Subheadline */}
          <p className="font-tagline italic text-[17px] sm:text-[19px] text-brand-body leading-[1.75] mt-6 max-w-[540px]">
            From concept to kitchen — HFC Consultancy Services handles menu engineering, brand positioning, and full F&amp;B setup, all within your budget.
          </p>

          {/* 4. Service Capability Tags Row */}
          <div className="flex flex-wrap gap-2.5 mt-6">
            {serviceTags.map(tag => (
              <span
                key={tag}
                className="font-body text-[12px] text-brand-body border border-brand-border rounded-[6px] px-3 py-1.5 bg-[#FAFAFA]"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* 5. CTA Buttons with Hover Micro-Interaction */}
          <div className="flex gap-4 mt-8 flex-wrap w-full sm:w-auto">
            <button
              onClick={scrollToMenu}
              className="group bg-brand-red hover:bg-brand-redHover text-white font-brand font-semibold text-[13px] uppercase tracking-[1.5px] px-9 py-4 rounded-btn transition-colors duration-200 shadow-card hover:shadow-cardHover w-full sm:w-auto text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Our Menu</span>
              <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
            </button>

            <button
              onClick={openWhatsAppTalk}
              className="border-2 border-brand-black text-brand-black hover:bg-brand-black hover:text-white font-brand font-semibold text-[13px] uppercase tracking-[1.5px] px-9 py-4 rounded-btn transition-all duration-200 w-full sm:w-auto text-center cursor-pointer"
            >
              Talk to Us
            </button>
          </div>

          {/* 6. Trust Metrics 4-Grid Row */}
          <div className="mt-10 pt-8 border-t border-brand-border grid grid-cols-2 sm:grid-cols-4 gap-6 w-full">
            {statsList.map((stat, i) => (
              <div key={stat.label} className={i > 0 ? 'border-l border-brand-border pl-4 sm:pl-6' : ''}>
                <div className="font-brand font-black text-[26px] sm:text-[30px] text-brand-red leading-none">
                  {stat.number}
                </div>
                <div className="font-body text-[11px] sm:text-[12px] text-brand-body uppercase tracking-[1px] mt-1.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Column Brand Visual */}
        <div className="hidden lg:block">
          <HeroBrandCircle />
        </div>

      </div>
    </section>
  )
}
