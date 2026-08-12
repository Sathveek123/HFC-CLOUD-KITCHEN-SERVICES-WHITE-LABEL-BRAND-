'use client'

import React from 'react'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAgentsStore } from '@/store/agentsStore'
import { useOrderStore, OrderRecord } from '@/store/orderStore'

interface AgentDropdownProps {
  order: OrderRecord
}

export default function AgentDropdown({ order }: AgentDropdownProps) {
  const agents = useAgentsStore(state => state.agents)
  const assignAgent = useOrderStore(state => state.assignAgent)

  if (order.orderType !== 'delivery') {
    return (
      <span className="font-body italic text-[11px] text-brand-muted">
        Not applicable
      </span>
    )
  }

  const activeAgents = agents.filter(a => a.isActive)

  const handleAssign = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value || null
    assignAgent(order.id, val)
    if (val) {
      toast.success(`Assigned to ${val}`)
    } else {
      toast.success('Agent unassigned')
    }
  }

  return (
    <div className="flex flex-col gap-2 w-[170px]" onClick={e => e.stopPropagation()}>
      {activeAgents.length === 0 ? (
        <div className="space-y-1">
          <select
            disabled
            className="w-[170px] h-[34px] border border-brand-border rounded-[6px] px-3 font-body text-[12px] bg-gray-50 text-brand-muted italic appearance-none"
          >
            <option>No agents available</option>
          </select>
          <Link
            href="/admin/agents"
            className="text-brand-red hover:underline text-[10px] font-brand font-bold uppercase tracking-[0.5px] block"
          >
            + Add Agent
          </Link>
        </div>
      ) : (
        <select
          value={order.assignedAgent || ''}
          onChange={handleAssign}
          className={`w-[170px] h-[34px] border rounded-[6px] px-3 pr-8 font-body text-[12px] cursor-pointer bg-white outline-none focus:border-brand-red hover:border-brand-black transition-colors ${
            order.assignedAgent ? 'text-brand-black font-semibold' : 'text-brand-muted italic'
          }`}
        >
          <option value="">— none —</option>
          {activeAgents.map(agent => (
            <option key={agent.id} value={agent.name}>
              {agent.name}
            </option>
          ))}
        </select>
      )}

      {/* WhatsApp notify trigger links */}
      {order.assignedAgent && (
        <button
          type="button"
          onClick={() => {
            const agent = agents.find(a => a.name === order.assignedAgent)
            if (!agent || !agent.whatsapp) {
              toast.error('Agent WhatsApp number not found')
              return
            }

            const itemsStr = order.items
              .map(i => `• ${i.quantity}x ${i.name}`)
              .join('\n')

            const msg = encodeURIComponent(
              `🛵 *HFC Delivery Assignment*\n` +
              `==========================\n` +
              `Order ID: ${order.id}\n` +
              `Customer: ${order.customerName}\n` +
              `Phone: ${order.phoneNumber || ''}\n` +
              `Address: ${order.address || ''}\n` +
              `Landmark: ${order.landmark || ''}\n` +
              `Items:\n${itemsStr}\n` +
              `==========================\n` +
              `Amount to Collect: ₹${order.total} (${order.paymentStatus.toUpperCase()})\n` +
              `==========================\n` +
              `Please pick up from HFC and dispatch. Thanks!`
            )
            
            const cleanPhone = agent.whatsapp.replace(/\D/g, '')
            window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank')
          }}
          className="inline-flex items-center gap-1.5 text-[10px] font-brand font-semibold text-[#25D366] hover:underline cursor-pointer w-fit text-left"
        >
          <MessageCircle size={11} />
          Notify agent
        </button>
      )}
    </div>
  )
}
