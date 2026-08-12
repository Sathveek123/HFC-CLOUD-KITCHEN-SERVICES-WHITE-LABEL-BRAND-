'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Copy, Check, AlertTriangle, Trophy, Tag, Gift } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePromotionsStore, RewardTier, Coupon, Offer } from '@/store/promotionsStore'
import { useProductsStore } from '@/store/productsStore'

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | null) {
  if (!iso) return null
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
}

function isExpired(validUntil: string | null) {
  if (!validUntil) return false
  return new Date(validUntil) < new Date()
}

function isExpiringSoon(validUntil: string | null) {
  if (!validUntil) return false
  const diff = new Date(validUntil).getTime() - Date.now()
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000
}

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function ActiveToggle({ isActive, onToggle, title }: { isActive: boolean; onToggle: () => void; title?: string }) {
  return (
    <button
      onClick={onToggle}
      title={title}
      className={`px-3 py-1 rounded-full font-brand font-bold text-[10px] uppercase tracking-[0.5px] transition-colors cursor-pointer ${
        isActive
          ? 'bg-[#166534] text-white hover:bg-green-800'
          : 'bg-[#F0F0F0] text-brand-muted hover:bg-gray-200'
      }`}
    >
      {isActive ? 'Active' : 'Paused'}
    </button>
  )
}

function DeleteButton({ label, onConfirm }: { label: string; onConfirm: () => void }) {
  const [confirming, setConfirming] = useState(false)
  return confirming ? (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="font-body text-[11px] text-red-700 whitespace-nowrap">{label}</span>
      <button
        onClick={() => { onConfirm(); setConfirming(false) }}
        className="h-7 px-3 bg-red-600 hover:bg-red-700 text-white font-brand font-bold text-[10px] uppercase rounded-[5px] transition-colors cursor-pointer"
      >Delete</button>
      <button
        onClick={() => setConfirming(false)}
        className="h-7 px-3 border border-red-300 text-red-600 font-brand font-medium text-[10px] uppercase rounded-[5px] hover:bg-red-50 cursor-pointer"
      >Cancel</button>
    </div>
  ) : (
    <button
      onClick={() => setConfirming(true)}
      className="h-[30px] px-4 bg-white border border-red-300 text-red-600 font-brand font-bold text-[11px] uppercase rounded-[6px] hover:bg-red-50 transition-colors cursor-pointer"
    >Delete</button>
  )
}

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-brand-border rounded-[12px] shadow-sm ${className}`}>
      {children}
    </div>
  )
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-brand font-semibold text-[11px] text-brand-muted uppercase tracking-[0.5px] mb-1.5">
      {children}
    </label>
  )
}

const inputCls = 'w-full h-[42px] border border-brand-border rounded-[8px] px-4 font-body text-[14px] text-brand-black focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/10 transition-all bg-white'
const selectCls = `${inputCls} appearance-none cursor-pointer`

function AddBtn({ disabled, children }: { disabled: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`h-[44px] px-6 font-brand font-bold text-[13px] uppercase tracking-[1px] rounded-[8px] transition-colors mt-2 ${
        disabled
          ? 'bg-gray-100 text-brand-muted cursor-not-allowed'
          : 'bg-brand-red hover:bg-brand-redHover text-white cursor-pointer'
      }`}
    >
      {children}
    </button>
  )
}

// ─── TABLE EMPTY ROW ──────────────────────────────────────────────────────────

function EmptyRow({ message }: { message: string }) {
  return (
    <tr>
      <td colSpan={20} className="text-center py-5 font-body text-[13px] text-brand-muted italic">
        {message}
      </td>
    </tr>
  )
}

// ─── SECTION A: AUTO-REWARD TIERS ────────────────────────────────────────────

function RewardTierSection() {
  const tiers = usePromotionsStore(state => state.rewardTiers)
  const sortedTiers = useMemo(() => [...tiers].sort((a, b) => a.minOrderAmount - b.minOrderAmount), [tiers])
  const addRewardTier = usePromotionsStore(state => state.addRewardTier)
  const toggleRewardTierActive = usePromotionsStore(state => state.toggleRewardTierActive)
  const deleteRewardTier = usePromotionsStore(state => state.deleteRewardTier)

  const [minOrder, setMinOrder] = useState('')
  const [rewardType, setRewardType] = useState<'flat' | 'percent' | 'free-delivery'>('flat')
  const [rewardValue, setRewardValue] = useState('')
  const [validDays, setValidDays] = useState('30')
  const [dupError, setDupError] = useState('')

  const isFreeDelivery = rewardType === 'free-delivery'
  const minOrderNum = parseFloat(minOrder)
  const rewardValueNum = parseFloat(rewardValue)
  const validDaysNum = parseInt(validDays)

  const canAdd =
    !isNaN(minOrderNum) && minOrderNum > 0 &&
    (isFreeDelivery || (!isNaN(rewardValueNum) && rewardValueNum > 0)) &&
    !isNaN(validDaysNum) && validDaysNum > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Duplicate check
    const dup = tiers.some(t => t.minOrderAmount === minOrderNum)
    if (dup) {
      setDupError(`A tier already exists at ₹${minOrderNum.toLocaleString('en-IN')}. Edit or delete it first.`)
      return
    }
    addRewardTier({
      minOrderAmount: minOrderNum,
      rewardType,
      rewardValue: isFreeDelivery ? null : rewardValueNum,
      validDays: validDaysNum,
      isActive: true,
    })
    setMinOrder(''); setRewardValue(''); setValidDays('30'); setDupError('')
    toast.success('Reward tier added ✓')
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Form card */}
      <SectionCard className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <Trophy size={18} className="text-amber-500" />
          <h2 className="font-display font-bold text-[19px] text-brand-black">Auto-reward tiers for big orders</h2>
        </div>
        <p className="font-body text-[12.5px] text-brand-muted leading-relaxed max-w-[900px] mb-5">
          Set up as many tiers as you like — e.g. spend ₹1000 get ₹100 off, spend ₹2000 get ₹200 off.
          When an order crosses more than one tier, only the <strong>highest</strong> one applies — never stacked.
          The reward is a one-time coupon for the customer's next order, only issued once their payment is confirmed paid.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {/* Min order */}
            <div>
              <FormLabel>Minimum order amount</FormLabel>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted font-body text-[14px] pointer-events-none">₹</span>
                <input
                  type="number" min="1" value={minOrder}
                  onChange={e => { setMinOrder(e.target.value); setDupError('') }}
                  placeholder="e.g. 2500"
                  className={`${inputCls} pl-8`}
                />
              </div>
              {dupError && <p className="text-[11px] text-brand-red font-semibold mt-1">{dupError}</p>}
            </div>

            {/* Reward type */}
            <div>
              <FormLabel>Reward type</FormLabel>
              <select
                value={rewardType}
                onChange={e => setRewardType(e.target.value as any)}
                className={selectCls}
              >
                <option value="flat">Flat amount off</option>
                <option value="percent">Percentage off</option>
                <option value="free-delivery">Free delivery</option>
              </select>
            </div>

            {/* Reward value */}
            <div>
              <FormLabel>Reward value</FormLabel>
              {isFreeDelivery ? (
                <input disabled placeholder="N/A — free delivery applied" className={`${inputCls} opacity-50 cursor-not-allowed`} />
              ) : (
                <div className="relative">
                  {rewardType === 'flat' && (
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted font-body text-[14px] pointer-events-none">₹</span>
                  )}
                  <input
                    type="number" min="1" value={rewardValue}
                    onChange={e => setRewardValue(e.target.value)}
                    placeholder="e.g. 200"
                    className={`${inputCls} ${rewardType === 'flat' ? 'pl-8' : ''} ${rewardType === 'percent' ? 'pr-10' : ''}`}
                  />
                  {rewardType === 'percent' && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted font-body text-[14px] pointer-events-none">%</span>
                  )}
                </div>
              )}
            </div>

            {/* Valid days */}
            <div>
              <FormLabel>Valid for how many days</FormLabel>
              <input
                type="number" min="1" value={validDays}
                onChange={e => setValidDays(e.target.value)}
                className={inputCls}
              />
              <p className="font-body text-[11px] text-brand-muted mt-1">Reward coupon expires this many days after being issued</p>
            </div>
          </div>
          <AddBtn disabled={!canAdd}>Add tier</AddBtn>
        </form>
      </SectionCard>

      {/* Tiers table */}
      <SectionCard className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-brand-border">
              {['Spend at least', 'Reward', 'Valid for', 'Active', 'Actions'].map(h => (
                <th key={h} className="font-brand font-semibold text-[10px] text-brand-muted uppercase tracking-[1.2px] px-5 py-3 text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedTiers.length === 0 ? (
              <EmptyRow message="No reward tiers yet. Add one above to start rewarding big spenders." />
            ) : (
              sortedTiers.map(tier => (
                <TierRow key={tier.id} tier={tier}
                  onToggle={() => { toggleRewardTierActive(tier.id); toast.success(`Tier ${tier.isActive ? 'paused' : 'activated'}`) }}
                  onDelete={() => { deleteRewardTier(tier.id); toast.success('Tier deleted') }}
                />
              ))
            )}
          </tbody>
        </table>
      </SectionCard>
    </div>
  )
}

function TierRow({ tier, onToggle, onDelete }: { tier: RewardTier; onToggle: () => void; onDelete: () => void }) {
  const rewardLabel =
    tier.rewardType === 'flat' ? `₹${tier.rewardValue?.toFixed(2)} off` :
    tier.rewardType === 'percent' ? `${tier.rewardValue}% off` :
    'Free delivery'

  return (
    <tr className="border-b border-brand-border last:border-0 hover:bg-[#FAFAFA] transition-colors">
      <td className="px-5 py-3.5 font-brand font-bold text-[14px] text-brand-black whitespace-nowrap">
        ₹{tier.minOrderAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </td>
      <td className="px-5 py-3.5 font-body text-[13px] text-brand-black">{rewardLabel}</td>
      <td className="px-5 py-3.5 font-body text-[13px] text-brand-muted">{tier.validDays} days</td>
      <td className="px-5 py-3.5">
        <ActiveToggle isActive={tier.isActive} onToggle={onToggle} />
      </td>
      <td className="px-5 py-3.5">
        <DeleteButton
          label={`Delete this reward tier? Existing issued coupons remain valid.`}
          onConfirm={onDelete}
        />
      </td>
    </tr>
  )
}

// ─── SECTION B: COUPONS ───────────────────────────────────────────────────────

function CouponsSection() {
  const coupons = usePromotionsStore(state => state.coupons)
  const addCoupon = usePromotionsStore(state => state.addCoupon)
  const toggleCouponActive = usePromotionsStore(state => state.toggleCouponActive)
  const deleteCoupon = usePromotionsStore(state => state.deleteCoupon)
  const isCodeAvailable = usePromotionsStore(state => state.isCodeAvailable)

  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState<'percent' | 'flat' | 'free-delivery'>('percent')
  const [discountValue, setDiscountValue] = useState('')
  const [maxCap, setMaxCap] = useState('')
  const [minOrder, setMinOrder] = useState('0')
  const [usageLimit, setUsageLimit] = useState('')
  const [validFrom, setValidFrom] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [codeStatus, setCodeStatus] = useState<'available' | 'taken' | 'empty'>('empty')
  const [copied, setCopied] = useState('')

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCodeChange = (val: string) => {
    const clean = val.toUpperCase().replace(/\s/g, '')
    setCode(clean)
    if (!clean) { setCodeStatus('empty'); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setCodeStatus(isCodeAvailable(clean) ? 'available' : 'taken')
    }, 300)
  }

  const isFreeDelivery = discountType === 'free-delivery'
  const discountNum = parseFloat(discountValue)
  const canAdd =
    code.length > 0 &&
    codeStatus === 'available' &&
    (isFreeDelivery || (!isNaN(discountNum) && discountNum > 0)) &&
    (!validFrom || !validUntil || validUntil >= validFrom)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canAdd) return
    addCoupon({
      code,
      discountType,
      discountValue: isFreeDelivery ? null : discountNum,
      maxDiscountCap: maxCap && discountType === 'percent' ? parseFloat(maxCap) : null,
      minOrderAmount: parseFloat(minOrder) || 0,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      validFrom: validFrom || null,
      validUntil: validUntil || null,
      isActive: true,
      applicableCustomerPhone: null,
    })
    toast.success(`Coupon ${code} created ✓`)
    setCode(''); setDiscountValue(''); setMaxCap(''); setMinOrder('0')
    setUsageLimit(''); setValidFrom(''); setValidUntil(''); setCodeStatus('empty')
  }

  const handleCopy = (c: string) => {
    navigator.clipboard.writeText(c).then(() => {
      setCopied(c); toast.success('Copied!'); setTimeout(() => setCopied(''), 2000)
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Form card */}
      <SectionCard className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <Tag size={18} className="text-brand-red" />
          <h2 className="font-display font-bold text-[19px] text-brand-black">Add coupon</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {/* Code */}
            <div>
              <FormLabel>Code</FormLabel>
              <input
                value={code}
                onChange={e => handleCodeChange(e.target.value)}
                placeholder="WELCOME10"
                className={`${inputCls} font-mono font-semibold uppercase tracking-[0.5px]`}
              />
              <div className="flex items-center justify-between mt-1">
                {code && codeStatus !== 'empty' ? (
                  <span className={`font-body text-[11px] font-semibold ${codeStatus === 'available' ? 'text-green-700' : 'text-brand-red'}`}>
                    {codeStatus === 'available' ? '✓ Available' : '✗ Already exists'}
                  </span>
                ) : <span />}
                <button type="button" onClick={() => handleCodeChange(randomCode())}
                  className="font-brand font-semibold text-[11px] text-brand-red hover:underline cursor-pointer">
                  Auto-generate
                </button>
              </div>
            </div>

            {/* Discount type */}
            <div>
              <FormLabel>Discount type</FormLabel>
              <select value={discountType} onChange={e => setDiscountType(e.target.value as any)} className={selectCls}>
                <option value="percent">Percent off</option>
                <option value="flat">Flat amount off</option>
                <option value="free-delivery">Free delivery</option>
              </select>
            </div>

            {/* Discount value */}
            <div>
              <FormLabel>Discount value</FormLabel>
              {isFreeDelivery ? (
                <input disabled placeholder="N/A — free delivery applied" className={`${inputCls} opacity-50 cursor-not-allowed`} />
              ) : (
                <div className="relative">
                  {discountType === 'flat' && (
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted text-[14px] pointer-events-none">₹</span>
                  )}
                  <input
                    type="number" min="1" value={discountValue}
                    onChange={e => setDiscountValue(e.target.value)}
                    placeholder="e.g. 10"
                    className={`${inputCls} ${discountType === 'flat' ? 'pl-8' : ''} ${discountType === 'percent' ? 'pr-10' : ''}`}
                  />
                  {discountType === 'percent' && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted text-[14px] pointer-events-none">%</span>
                  )}
                </div>
              )}
              {/* Max cap for percent */}
              {discountType === 'percent' && (
                <div className="mt-2">
                  <input type="number" min="1" value={maxCap}
                    onChange={e => setMaxCap(e.target.value)}
                    placeholder="Max discount cap (₹, optional)"
                    className={`${inputCls} text-[12.5px]`}
                  />
                </div>
              )}
            </div>

            {/* Min order */}
            <div>
              <FormLabel>Minimum order amount (optional)</FormLabel>
              <input type="number" min="0" value={minOrder}
                onChange={e => setMinOrder(e.target.value)}
                placeholder="0"
                className={inputCls}
              />
              <p className="font-body text-[11px] text-brand-muted mt-1">0 = no minimum required</p>
            </div>

            {/* Usage limit */}
            <div>
              <FormLabel>Usage limit (blank = unlimited)</FormLabel>
              <input type="number" min="1" value={usageLimit}
                onChange={e => setUsageLimit(e.target.value)}
                placeholder="e.g. 100"
                className={inputCls}
              />
            </div>

            {/* Valid from */}
            <div>
              <FormLabel>Valid from (optional)</FormLabel>
              <input type="date" value={validFrom} onChange={e => setValidFrom(e.target.value)} className={inputCls} />
            </div>

            {/* Valid until */}
            <div>
              <FormLabel>Valid until (optional)</FormLabel>
              <input type="date" value={validUntil} min={validFrom || undefined}
                onChange={e => setValidUntil(e.target.value)} className={inputCls} />
            </div>
          </div>
          <AddBtn disabled={!canAdd}>Add coupon</AddBtn>
        </form>
      </SectionCard>

      {/* Coupons table */}
      <SectionCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-brand-border">
                {['Code', 'Discount', 'Min order', 'Usage', 'Valid', 'Active', 'Actions'].map(h => (
                  <th key={h} className="font-brand font-semibold text-[10px] text-brand-muted uppercase tracking-[1.2px] px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <EmptyRow message="No coupons yet." />
              ) : (
                coupons.map(c => (
                  <CouponRow key={c.id} coupon={c}
                    isCopied={copied === c.code}
                    onCopy={() => handleCopy(c.code)}
                    onToggle={() => { toggleCouponActive(c.id); toast.success('Coupon status updated') }}
                    onDelete={() => { deleteCoupon(c.id); toast.success(`Coupon ${c.code} deleted`) }}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )
}

function CouponRow({ coupon: c, isCopied, onCopy, onToggle, onDelete }: {
  coupon: Coupon; isCopied: boolean; onCopy: () => void; onToggle: () => void; onDelete: () => void
}) {
  const expired = isExpired(c.validUntil)
  const limitReached = c.usageLimit !== null && c.usedCount >= c.usageLimit
  const expiringSoon = isExpiringSoon(c.validUntil)

  const discountLabel =
    c.discountType === 'percent' ? `${c.discountValue}% off${c.maxDiscountCap ? ` (up to ₹${c.maxDiscountCap})` : ''}` :
    c.discountType === 'flat' ? `₹${c.discountValue} off` :
    'Free delivery'

  const validLabel = (() => {
    if (expired) return <span className="text-red-600 font-semibold">Expired</span>
    if (expiringSoon && c.validUntil) return <span className="text-red-600 font-semibold">Until {formatDate(c.validUntil)}</span>
    if (c.validFrom && c.validUntil) return `${formatDate(c.validFrom)} – ${formatDate(c.validUntil)}`
    if (c.validUntil) return `Until ${formatDate(c.validUntil)}`
    return <span className="italic text-brand-muted">No expiry</span>
  })()

  const statusBadge = (() => {
    if (expired) return <span className="px-3 py-1 rounded-full font-brand font-bold text-[10px] uppercase bg-[#F0F0F0] text-brand-muted">EXPIRED</span>
    if (limitReached) return <span className="px-3 py-1 rounded-full font-brand font-bold text-[10px] uppercase bg-[#FEF2F2] text-red-600">LIMIT REACHED</span>
    return <ActiveToggle isActive={c.isActive} onToggle={onToggle} />
  })()

  return (
    <tr className="border-b border-brand-border last:border-0 hover:bg-[#FAFAFA] transition-colors">
      <td className="px-4 py-3.5">
        <button onClick={onCopy}
          className="bg-brand-redLight text-brand-red font-mono font-bold text-[12px] px-3 py-1.5 rounded-[6px] inline-flex items-center gap-1.5 hover:bg-red-100 transition-colors cursor-pointer border border-red-100"
        >
          {c.code}
          {isCopied ? <Check size={11} className="text-green-700" /> : <Copy size={11} />}
        </button>
      </td>
      <td className="px-4 py-3.5 font-brand font-semibold text-[13px] text-brand-black whitespace-nowrap">{discountLabel}</td>
      <td className="px-4 py-3.5 font-body text-[13px]">
        {c.minOrderAmount > 0 ? `₹${c.minOrderAmount}` : <span className="italic text-brand-muted">No minimum</span>}
      </td>
      <td className="px-4 py-3.5 min-w-[100px]">
        <div className="font-brand font-semibold text-[13px] text-brand-black">
          {c.usedCount} / {c.usageLimit ?? '∞'}
        </div>
        {c.usageLimit && (
          <div className="w-full h-1 bg-[#F0F0F0] rounded-full mt-1.5 overflow-hidden">
            <div className="h-full bg-brand-red rounded-full transition-all"
              style={{ width: `${Math.min((c.usedCount / c.usageLimit) * 100, 100)}%` }}
            />
          </div>
        )}
      </td>
      <td className="px-4 py-3.5 font-body text-[12px] text-brand-body whitespace-nowrap">{validLabel}</td>
      <td className="px-4 py-3.5">{statusBadge}</td>
      <td className="px-4 py-3.5">
        <DeleteButton label={`Delete coupon ${c.code}?`} onConfirm={onDelete} />
      </td>
    </tr>
  )
}

// ─── SECTION C: OFFERS ────────────────────────────────────────────────────────

function OffersSection() {
  const offers = usePromotionsStore(state => state.offers)
  const addOffer = usePromotionsStore(state => state.addOffer)
  const toggleOfferActive = usePromotionsStore(state => state.toggleOfferActive)
  const deleteOffer = usePromotionsStore(state => state.deleteOffer)

  const allItems = useProductsStore(state => state.items)

  const [offerType, setOfferType] = useState<Offer['offerType']>('free-item')
  const [title, setTitle] = useState('')
  const [freeItemId, setFreeItemId] = useState('')
  const [minOrder, setMinOrder] = useState('0')
  const [validFrom, setValidFrom] = useState('')
  const [validUntil, setValidUntil] = useState('')

  const isFreeItem = offerType === 'free-item'
  const canAdd = title.trim().length > 0 && (!isFreeItem || freeItemId.length > 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canAdd) return
    addOffer({
      offerType,
      title: title.trim(),
      freeItemId: isFreeItem ? freeItemId : null,
      minOrderAmount: parseFloat(minOrder) || 0,
      validFrom: validFrom || null,
      validUntil: validUntil || null,
      isActive: true,
    })
    toast.success('Offer added ✓')
    setTitle(''); setFreeItemId(''); setMinOrder('0'); setValidFrom(''); setValidUntil('')
  }

  const offerTypeBadge = (type: Offer['offerType']) => {
    const map: Record<string, string> = {
      'free-item': 'bg-green-50 text-green-700',
      'bundle-discount': 'bg-blue-50 text-blue-700',
      'happy-hour': 'bg-amber-50 text-amber-700',
      'first-order': 'bg-purple-50 text-purple-700',
    }
    const labels: Record<string, string> = {
      'free-item': 'FREE ITEM',
      'bundle-discount': 'BUNDLE',
      'happy-hour': 'HAPPY HOUR',
      'first-order': 'FIRST ORDER',
    }
    return (
      <span className={`font-brand font-semibold text-[10px] uppercase tracking-[0.8px] px-2.5 py-1 rounded-[4px] ${map[type]}`}>
        {labels[type]}
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Form card */}
      <SectionCard className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <Gift size={18} className="text-purple-500" />
          <h2 className="font-display font-bold text-[19px] text-brand-black">Add offer</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {/* Offer type */}
            <div>
              <FormLabel>Offer type</FormLabel>
              <select value={offerType} onChange={e => setOfferType(e.target.value as any)} className={selectCls}>
                <option value="free-item">Free item on minimum order</option>
                <option value="bundle-discount">Bundle discount</option>
                <option value="happy-hour">Happy hour pricing</option>
                <option value="first-order">First order special</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <FormLabel>Title (shown to customers)</FormLabel>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Free dessert on big orders"
                className={inputCls} />
            </div>

            {/* Free item (conditional) */}
            {isFreeItem && (
              <div>
                <FormLabel>Free item</FormLabel>
                <select value={freeItemId} onChange={e => setFreeItemId(e.target.value)} className={selectCls}>
                  <option value="">Select item...</option>
                  {allItems.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Min order */}
            <div>
              <FormLabel>Minimum order amount</FormLabel>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted text-[14px] pointer-events-none">₹</span>
                <input type="number" min="0" value={minOrder} onChange={e => setMinOrder(e.target.value)}
                  placeholder="0" className={`${inputCls} pl-8`} />
              </div>
            </div>

            {/* Valid from */}
            <div>
              <FormLabel>Valid from (optional)</FormLabel>
              <input type="date" value={validFrom} onChange={e => setValidFrom(e.target.value)} className={inputCls} />
            </div>

            {/* Valid until */}
            <div>
              <FormLabel>Valid until (optional)</FormLabel>
              <input type="date" value={validUntil} min={validFrom || undefined}
                onChange={e => setValidUntil(e.target.value)} className={inputCls} />
            </div>
          </div>
          <AddBtn disabled={!canAdd}>Add offer</AddBtn>
        </form>
      </SectionCard>

      {/* Offers table */}
      <SectionCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-brand-border">
                {['Title', 'Type', 'Details', 'Valid', 'Active', 'Actions'].map(h => (
                  <th key={h} className="font-brand font-semibold text-[10px] text-brand-muted uppercase tracking-[1.2px] px-4 py-3 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {offers.length === 0 ? (
                <EmptyRow message="No offers yet." />
              ) : (
                offers.map(o => {
                  const freeItem = o.freeItemId ? allItems.find(i => i.id === o.freeItemId) : null
                  const details = (() => {
                    switch (o.offerType) {
                      case 'free-item': return freeItem
                        ? `${freeItem.name} free on orders above ₹${o.minOrderAmount}`
                        : `Free item on orders above ₹${o.minOrderAmount}`
                      case 'bundle-discount': return 'Bundle pricing applies'
                      case 'happy-hour': return 'Special hours pricing'
                      case 'first-order': return 'First-time customer discount'
                    }
                  })()

                  const expired = isExpired(o.validUntil)
                  const validLabel = (() => {
                    if (expired) return <span className="text-red-600 font-semibold text-[12px]">Expired</span>
                    if (o.validFrom && o.validUntil) return <span className="text-[12px]">{formatDate(o.validFrom)} – {formatDate(o.validUntil)}</span>
                    if (o.validUntil) return <span className="text-[12px]">Until {formatDate(o.validUntil)}</span>
                    return <span className="italic text-brand-muted text-[12px]">No expiry</span>
                  })()

                  return (
                    <tr key={o.id} className="border-b border-brand-border last:border-0 hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-4 py-3.5 font-brand font-semibold text-[13px] text-brand-black max-w-[180px]">{o.title}</td>
                      <td className="px-4 py-3.5">{offerTypeBadge(o.offerType)}</td>
                      <td className="px-4 py-3.5 font-body text-[12px] text-brand-body">{details}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">{validLabel}</td>
                      <td className="px-4 py-3.5">
                        <ActiveToggle isActive={o.isActive}
                          onToggle={() => { toggleOfferActive(o.id); toast.success('Offer status updated') }} />
                      </td>
                      <td className="px-4 py-3.5">
                        <DeleteButton
                          label="Delete this offer? It will disappear from the live site immediately."
                          onConfirm={() => { deleteOffer(o.id); toast.success('Offer deleted') }}
                        />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function AdminCouponsPage() {
  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 bg-[#FAFAFA] min-h-full">
      {/* Page Header */}
      <div>
        <h1 className="font-display font-bold text-[28px] text-brand-black">Offers &amp; Coupons</h1>
        <p className="font-body text-[12px] text-brand-muted mt-1">Admin / Offers &amp; Coupons</p>
      </div>

      {/* Section A */}
      <RewardTierSection />

      {/* Section B */}
      <CouponsSection />

      {/* Section C */}
      <OffersSection />
    </div>
  )
}
