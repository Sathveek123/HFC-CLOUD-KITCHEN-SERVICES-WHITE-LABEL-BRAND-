import React from 'react'

interface EmptyStateProps {
  message: string
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <tr className="border-t border-brand-border bg-white">
      <td colSpan={12} className="px-5 py-12 text-center align-middle font-body text-[14px] text-brand-body">
        <div className="flex flex-col items-center justify-center space-y-1">
          <span className="text-[28px]">📁</span>
          <span>{message}</span>
        </div>
      </td>
    </tr>
  )
}
