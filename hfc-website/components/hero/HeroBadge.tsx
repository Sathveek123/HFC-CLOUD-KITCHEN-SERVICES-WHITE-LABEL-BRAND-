import { Star } from 'lucide-react'

export default function HeroBadge() {
  return (
    <div className="inline-flex items-center gap-2 border border-brand-red bg-brand-redLight rounded-pill px-4 py-1.5">
      <Star size={12} fill="#CC0000" color="#CC0000" />
      <span className="font-brand font-semibold text-[11px] text-brand-red tracking-[1px] uppercase">
        Trusted by 200+ F&B Brands Across India
      </span>
    </div>
  )
}
