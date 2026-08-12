import { OrderRecord } from '@/store/orderStore'

export const MERCHANT_PHONE = '919912799855'
export const MERCHANT_UPI_ID = '9912799855@okbizaxis'

export function buildWhatsAppOrderMessage(order: OrderRecord, siteOrigin: string = 'https://hfc-website.vercel.app'): string {
  const orderTypeLabels: Record<string, string> = {
    'dine-in': '🍽 DINE-IN',
    'takeaway': '🛍 TAKEAWAY',
    'delivery': '🏠 HOME DELIVERY',
  }

  const orderTypeLabel = orderTypeLabels[order.orderType] || order.orderType.toUpperCase()

  let message = `==========================\n`
  message += `📋 *NEW ORDER — HFC CONSULTANCY SERVICES*\n`
  message += `==========================\n`
  message += `🆔 *Order ID:* ${order.id}\n`
  message += `👤 *Customer Name:* ${order.customerName}\n`
  message += `📞 *Phone Number:* ${order.phoneNumber}\n`
  message += `🍽 *Order Type:* ${orderTypeLabel}\n`

  if (order.orderType === 'delivery') {
    message += `==========================\n`
    message += `📍 *DELIVERY LOCATION DETAILS*\n`
    message += `==========================\n`
    if (order.address) {
      message += `🏡 *Delivery Address:*\n${order.address}\n`
    }
    if (order.landmark) {
      message += `🏠 *Landmark / House No:*\n${order.landmark}\n`
    }
    if (order.coords && order.coords.lat && order.coords.lng) {
      message += `📍 *Customer GPS Pin:*\nhttps://www.google.com/maps?q=${order.coords.lat},${order.coords.lng}\n`
      message += `🚗 *Driving Route from HFC:*\nhttps://www.google.com/maps/dir/?api=1&origin=HFC+Consultancy+Services&destination=${order.coords.lat},${order.coords.lng}\n`
    }
  }

  message += `==========================\n`
  message += `🍲 *ITEMS ORDERED*\n`
  message += `==========================\n`

  order.items.forEach(item => {
    message += `- ${item.quantity} × ${item.name} — ₹${(item.price * item.quantity).toLocaleString('en-IN')}\n`
  })

  message += `==========================\n`
  if (order.couponCode && order.discountAmount) {
    message += `🎟 *Coupon Applied:* ${order.couponCode} — Saved ₹${order.discountAmount}\n`
    message += `Subtotal: ₹${order.subtotal.toLocaleString('en-IN')}\n`
    message += `GST (5%): ₹${order.gst.toLocaleString('en-IN')}\n`
  }
  message += `💰 *TOTAL AMOUNT: ₹${order.total.toLocaleString('en-IN')}*\n`
  message += `==========================\n`
  message += `📱 *TAP TO PAY VIA UPI (PhonePe / GPay / Paytm):*\n`
  message += `upi://pay?pa=${MERCHANT_UPI_ID}&pn=HFC%20Consultancy%20Services&am=${order.total}&cu=INR\n`
  message += `📸 *PAYMENT & ORDER VERIFICATION:*\n`
  message += `- If paying via UPI, tap the link above and reply with a screenshot of your payment receipt.\n`
  message += `- If paying Cash on Delivery / Counter Pickup, reply "CASH" in this chat.\n`
  message += `==========================\n`
  message += `🔗 *TRACK YOUR ORDER STATUS LIVE:*\n`
  message += `${siteOrigin}/track/${order.id}\n`
  message += `==========================\n`
  message += `_Order placed via hfc-website_`

  return encodeURIComponent(message)
}

export function openWhatsAppLink(order: OrderRecord): void {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://hfc-website.vercel.app'
  const text = buildWhatsAppOrderMessage(order, origin)
  const url = `https://wa.me/${MERCHANT_PHONE}?text=${text}`
  window.open(url, '_blank')
}
