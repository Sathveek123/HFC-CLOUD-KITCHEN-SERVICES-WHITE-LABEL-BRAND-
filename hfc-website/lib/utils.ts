import { CartItem } from '@/types'

// WhatsApp order message generator
export function generateWhatsAppMessage(items: CartItem[], total: number): string {
  const lines = items.map(i => `• ${i.name} x${i.quantity} = ₹${i.price * i.quantity}`)
  const message = [
    '🍽️ *New Order — HFC Consultancy Services*',
    '─────────────────────',
    ...lines,
    '─────────────────────',
    `*Total: ₹${total.toLocaleString('en-IN')}*`,
    '',
    'Please confirm my order. Thank you!',
  ].join('\n')
  return encodeURIComponent(message)
}

// Download order as .txt
export function downloadOrderSummary(items: CartItem[], subtotal: number, gst: number, total: number): void {
  const lines = [
    'HFC CONSULTANCY SERVICES',
    'ORDER SUMMARY',
    '═══════════════════════════════',
    ...items.map(i => `${i.name.padEnd(25)} x${i.quantity}   ₹${i.price * i.quantity}`),
    '───────────────────────────────',
    `Subtotal:                      ₹${subtotal.toLocaleString('en-IN')}`,
    `GST (5%):                      ₹${gst.toLocaleString('en-IN')}`,
    `TOTAL:                         ₹${total.toLocaleString('en-IN')}`,
    '═══════════════════════════════',
    `Generated: ${new Date().toLocaleString('en-IN')}`,
  ].join('\n')

  const blob = new Blob([lines], { type: 'text/plain;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `HFC-Order-${Date.now()}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Price formatter
export const formatPrice = (n: number) => `₹ ${n.toLocaleString('en-IN')}`

// Class merger
export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
