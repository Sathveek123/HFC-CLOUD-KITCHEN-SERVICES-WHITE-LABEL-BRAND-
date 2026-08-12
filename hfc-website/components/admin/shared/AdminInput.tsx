import React from 'react'

interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  label?: string
  type?: 'text' | 'password' | 'email' | 'tel' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox'
  options?: { value: string; label: string }[]
  error?: string
}

export default function AdminInput({
  label,
  type = 'text',
  options = [],
  error,
  className = '',
  id,
  ...props
}: AdminInputProps) {
  const inputId = id || `input-${Date.now()}`
  const baseInputStyles = 'w-full border border-brand-border rounded-btn font-body text-[14px] outline-none focus:border-brand-red transition-colors px-4 '

  const renderField = () => {
    if (type === 'textarea') {
      return (
        <textarea
          id={inputId}
          className={`${baseInputStyles} py-2.5 min-h-[96px] ${className}`}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      )
    }

    if (type === 'select') {
      return (
        <select
          id={inputId}
          className={`${baseInputStyles} h-11 bg-white cursor-pointer ${className}`}
          {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )
    }

    if (type === 'checkbox') {
      return (
        <div className="flex items-center gap-2 cursor-pointer">
          <input
            id={inputId}
            type="checkbox"
            className="w-4 h-4 rounded text-brand-red border-brand-border focus:ring-brand-red cursor-pointer"
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
          {label && (
            <label htmlFor={inputId} className="font-brand font-semibold text-[13px] text-brand-black cursor-pointer">
              {label}
            </label>
          )}
        </div>
      )
    }

    return (
      <input
        id={inputId}
        type={type}
        className={`${baseInputStyles} h-11 ${className}`}
        {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
      />
    )
  }

  // Checkbox handles label itself
  if (type === 'checkbox') {
    return (
      <div className="space-y-1">
        {renderField()}
        {error && <p className="text-brand-red font-body text-[12px]">{error}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block font-brand font-semibold text-[12px] text-brand-black uppercase tracking-[1px]">
          {label}
        </label>
      )}
      {renderField()}
      {error && <p className="text-brand-red font-body text-[12px] mt-0.5">{error}</p>}
    </div>
  )
}
