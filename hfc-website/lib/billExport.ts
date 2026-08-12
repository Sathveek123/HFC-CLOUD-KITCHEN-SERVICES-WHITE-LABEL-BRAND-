import { Bill } from '@/types'
import { format } from 'date-fns'

export function exportBillsToCSV(bills: Bill[]): void {
  const headers = [
    'Bill No', 'Order ID', 'Date', 'Time',
    'Customer Name', 'Customer Phone',
    'Order Type', 'Agent',
    'Items', 'Subtotal', 'GST', 'Delivery Charge',
    'Discount', 'Coupon Code', 'Total',
    'Payment Method', 'Payment Status', 'Order Status'
  ]

  const rows = bills.map(b => [
    b.billNo,
    b.orderId,
    format(new Date(b.timestamp), 'dd/MM/yyyy'),
    format(new Date(b.timestamp), 'HH:mm'),
    b.customerName,
    b.customerPhone,
    b.orderType,
    b.assignedAgent || 'Unassigned',
    b.items.map(i => `${i.quantity}x ${i.name}`).join(' | '),
    b.subtotal.toFixed(2),
    b.gst.toFixed(2),
    b.deliveryCharge.toFixed(2),
    b.discountAmount.toFixed(2),
    b.couponCode || '',
    b.total.toFixed(2),
    b.paymentMethod,
    b.paymentStatus,
    b.orderStatus
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `HFC-Bills-${format(new Date(), 'yyyyMMdd-HHmm')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
