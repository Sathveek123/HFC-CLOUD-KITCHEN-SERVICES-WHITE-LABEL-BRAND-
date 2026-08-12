import React from 'react'

interface AdminTableProps {
  headers: string[]
  alignments?: ('left' | 'center' | 'right')[]
  children: React.ReactNode
}

export default function AdminTable({ headers, alignments = [], children }: AdminTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#FAFAFA] border-b border-brand-border">
            {headers.map((header, idx) => {
              const align = alignments[idx] || 'left'
              let alignClass = 'text-left'
              if (align === 'center') alignClass = 'text-center'
              if (align === 'right') alignClass = 'text-right'

              return (
                <th
                  key={idx}
                  className={`px-5 py-3 font-brand font-semibold text-[11px] text-brand-body uppercase tracking-[1px] ${alignClass}`}
                >
                  {header}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border bg-white">{children}</tbody>
      </table>
    </div>
  )
}
