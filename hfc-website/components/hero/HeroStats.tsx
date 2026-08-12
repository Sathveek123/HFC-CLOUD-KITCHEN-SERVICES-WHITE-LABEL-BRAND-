export default function HeroStats() {
  const stats = [
    { number: '200+', label: 'F&B Brands' },
    { number: '15 Yrs', label: 'Experience' },
    { number: '500+', label: 'Menus Crafted' },
  ]

  return (
    <div className="mt-10 pt-8 border-t border-brand-border grid grid-cols-3 gap-6 w-full">
      {stats.map((stat, i) => (
        <div key={i} className={`${i > 0 ? 'border-l border-brand-border pl-6' : ''}`}>
          <div className="font-brand font-black text-[32px] text-brand-red leading-none">
            {stat.number}
          </div>
          <div className="font-body text-[12px] text-brand-body uppercase tracking-[1px] mt-1">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  )
}
