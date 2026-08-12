import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Bill } from '@/types'
import { OrderRecord, useOrderStore } from './orderStore'
import { format } from 'date-fns'

interface BillsStore {
  bills: Bill[]
  activeBill: Bill | null
  createBill: (order: OrderRecord) => Bill
  updatePaymentStatus: (billNo: string, status: 'paid' | 'unpaid' | 'partial') => void
  getBillByOrderId: (orderId: string) => Bill | undefined
  openBillPreview: (bill: Bill) => void
  closeBillPreview: () => void
}

export const useBillsStore = create<BillsStore>()(
  persist(
    (set, get) => ({
      bills: [],
      activeBill: null,

      createBill: (order: OrderRecord) => {
        const existing = get().bills.find(b => b.orderId === order.id)
        if (existing) return existing

        // Get daily sequence counter
        const todayStr = format(new Date(), 'yyyyMMdd')
        const seqKey = `hfc-bill-sequence-${todayStr}`
        let seq = 1
        try {
          const storedSeq = localStorage.getItem(seqKey)
          if (storedSeq) {
            seq = parseInt(storedSeq, 10) + 1
          }
          localStorage.setItem(seqKey, String(seq))
        } catch (e) {
          console.error('Failed to get/set bill sequence:', e)
        }

        const paddedSeq = String(seq).padStart(3, '0')
        const billNo = `BILL-${todayStr}-${paddedSeq}`

        const newBill: Bill = {
          billNo,
          orderId: order.id,
          timestamp: new Date(order.createdAt).getTime(),
          customerName: order.customerName,
          customerPhone: order.phoneNumber,
          orderType: order.orderType,
          assignedAgent: order.assignedAgent || null,
          items: order.items,
          subtotal: order.subtotal,
          gst: order.gst,
          deliveryCharge: order.deliveryCharge || 0,
          discountAmount: order.discountAmount || 0,
          couponCode: order.couponCode || null,
          total: order.total,
          paymentMethod: order.paymentMethod || 'Cash',
          paymentStatus: order.paymentStatus || 'unpaid',
          orderStatus: order.status,
          deliveryAddress: order.address || undefined,
          gpsCoordinates: order.coords || undefined,
        }

        set({ bills: [newBill, ...get().bills] })
        return newBill
      },

      updatePaymentStatus: (billNo: string, status: 'paid' | 'unpaid' | 'partial') => {
        const bill = get().bills.find(b => b.billNo === billNo)
        if (!bill) return

        // Update in Bills
        set({
          bills: get().bills.map(b => (b.billNo === billNo ? { ...b, paymentStatus: status } : b)),
        })

        // Sync to Orders Store
        try {
          const updateOrderPayStatus = useOrderStore.getState().updatePaymentStatus
          // Cast status since orderStatus supports paid/unpaid/partial in types
          updateOrderPayStatus(bill.orderId, status as any)
        } catch (e) {
          console.error('Failed to sync payment status to orders store:', e)
        }

        // Update active preview if it matches
        const active = get().activeBill
        if (active && active.billNo === billNo) {
          set({ activeBill: { ...active, paymentStatus: status } })
        }
      },

      getBillByOrderId: (orderId: string) => {
        return get().bills.find(b => b.orderId === orderId)
      },

      openBillPreview: (bill: Bill) => {
        set({ activeBill: bill })
      },

      closeBillPreview: () => {
        set({ activeBill: null })
      },
    }),
    {
      name: 'hfc-bills',
    }
  )
)
