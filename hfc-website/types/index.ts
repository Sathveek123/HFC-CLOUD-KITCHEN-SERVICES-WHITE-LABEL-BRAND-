export type DietaryTag = 'veg' | 'non-veg' | 'egg'

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  dietaryTag: DietaryTag
  isBestseller?: boolean
  imageKeyword: string
  image?: string
}

export interface Category {
  id: string
  label: string
  emoji: string
}

export interface CartItem extends MenuItem {
  quantity: number
}

export interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: MenuItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, delta: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  getCount: () => number
  getSubtotal: () => number
}

export interface Bill {
  billNo: string
  orderId: string
  timestamp: number
  customerName: string
  customerPhone: string
  orderType: 'dine-in' | 'takeaway' | 'delivery'
  assignedAgent: string | null
  items: { id: string; name: string; price: number; quantity: number }[]
  subtotal: number
  gst: number
  deliveryCharge: number
  discountAmount: number
  couponCode: string | null
  total: number
  paymentMethod: 'Cash' | 'UPI' | 'Online' | 'Card'
  paymentStatus: 'paid' | 'unpaid' | 'partial'
  orderStatus: string
  deliveryAddress?: string
  landmark?: string
  gpsCoordinates?: { lat: number; lng: number } | null
}

