import React from 'react'

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'danger' | 'success' | 'whatsapp' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export default function AdminButton({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: AdminButtonProps) {
  let baseStyles = 'font-brand font-semibold text-[13px] uppercase tracking-[1px] rounded-btn transition-all duration-200 active:scale-98 inline-flex items-center justify-center gap-2 '

  let sizeStyles = 'h-10 px-5'
  if (size === 'sm') sizeStyles = 'h-8 px-3 text-[11px]'
  if (size === 'lg') sizeStyles = 'h-12 px-7 text-[14px]'

  let variantStyles = ''
  switch (variant) {
    case 'primary':
      variantStyles = 'bg-brand-red hover:bg-brand-redHover text-white shadow-sm'
      break
    case 'outline':
      variantStyles = 'border-2 border-brand-black text-brand-black hover:bg-brand-black hover:text-white'
      break
    case 'danger':
      variantStyles = 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
      break
    case 'success':
      variantStyles = 'bg-green-700 hover:bg-green-800 text-white shadow-sm'
      break
    case 'whatsapp':
      variantStyles = 'bg-brand-whatsapp hover:bg-[#1da851] text-white shadow-sm'
      break
    case 'ghost':
      variantStyles = 'text-brand-muted hover:text-brand-red hover:bg-brand-surface'
      break
  }

  return (
    <button className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </button>
  )
}
