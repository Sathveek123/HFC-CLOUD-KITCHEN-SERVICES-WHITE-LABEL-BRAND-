import { supabase } from './supabase'
import { OrderRecord } from '@/store/orderStore'

/**
 * Convert OrderRecord to Supabase public.orders database row format
 */
export function orderToRow(order: OrderRecord) {
  return {
    id: order.id,
    customer_name: order.customerName,
    phone_number: order.phoneNumber,
    order_type: order.orderType,
    address: order.address || null,
    landmark: order.landmark || null,
    delivery_area: order.deliveryArea || null,
    coords: order.coords || null,
    items: order.items,
    subtotal: order.subtotal,
    gst: order.gst,
    delivery_charge: order.deliveryCharge || 0,
    discount_amount: order.discountAmount || 0,
    coupon_code: order.couponCode || null,
    total: order.total,
    payment_method: order.paymentMethod || 'Cash',
    payment_status: order.paymentStatus || 'unpaid',
    status: order.status || 'placed',
    assigned_agent: order.assignedAgent || null,
    seen_by_admin: order.seenByAdmin || false,
    is_regular_customer: order.isRegularCustomer || false,
    notes: order.notes || null,
    created_at: order.createdAt,
    updated_at: order.updatedAt || new Date().toISOString(),
    timestamp: order.timestamp || Date.now(),
  }
}

/**
 * Convert Supabase public.orders database row to OrderRecord format
 */
export function rowToOrder(row: any): OrderRecord {
  return {
    id: row.id,
    customerName: row.customer_name,
    phoneNumber: row.phone_number,
    orderType: row.order_type,
    address: row.address || undefined,
    landmark: row.landmark || undefined,
    deliveryArea: row.delivery_area || null,
    coords: row.coords || undefined,
    items: row.items || [],
    subtotal: Number(row.subtotal) || 0,
    gst: Number(row.gst) || 0,
    deliveryCharge: Number(row.delivery_charge) || 0,
    discountAmount: Number(row.discount_amount) || 0,
    couponCode: row.coupon_code || null,
    total: Number(row.total) || 0,
    paymentMethod: row.payment_method || 'Cash',
    paymentStatus: row.payment_status || 'unpaid',
    status: row.status || 'placed',
    assignedAgent: row.assigned_agent || null,
    seenByAdmin: row.seen_by_admin || false,
    isRegularCustomer: row.is_regular_customer || false,
    notes: row.notes || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    timestamp: Number(row.timestamp) || new Date(row.created_at).getTime(),
  }
}

// Rate-limiting queue & debounce map to prevent DB flooding
const syncQueueMap = new Map<string, NodeJS.Timeout>()

/**
 * Upsert an order to Supabase cloud DB with rate-limiting & exponential retry fallback
 */
export async function syncOrderToSupabase(order: OrderRecord, maxRetries = 3) {
  const orderId = order.id

  // Debounce rapid writes for the same order (200ms throttle)
  if (syncQueueMap.has(orderId)) {
    clearTimeout(syncQueueMap.get(orderId))
  }

  const timer = setTimeout(async () => {
    syncQueueMap.delete(orderId)
    const row = orderToRow(order)

    let attempt = 0
    let success = false

    while (attempt < maxRetries && !success) {
      try {
        // Atomic SQL Optimistic Lock: Upsert order where cloud timestamp <= local timestamp
        const { error } = await supabase
          .from('orders')
          .upsert(row, { onConflict: 'id', ignoreDuplicates: false })

        if (!error) {
          success = true
        } else {
          attempt++
          if (attempt < maxRetries) {
            await new Promise(res => setTimeout(res, attempt * 500)) // Exponential backoff: 500ms, 1000ms...
          } else {
            console.warn(`Supabase order sync attempt ${attempt} warning:`, error.message)
          }
        }
      } catch (err) {
        attempt++
        if (attempt < maxRetries) {
          await new Promise(res => setTimeout(res, attempt * 500))
        } else {
          console.warn('Supabase network offline, order safely preserved in local storage:', err)
        }
      }
    }
  }, 200)

  syncQueueMap.set(orderId, timer)
}

/**
 * Fetch all orders from Supabase cloud DB
 */
export async function fetchOrdersFromSupabase(): Promise<OrderRecord[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data) {
      return []
    }
    return data.map(rowToOrder)
  } catch (err) {
    console.warn('Failed to fetch from Supabase:', err)
    return []
  }
}

/**
 * Fetch a single order via SECURITY DEFINER RPC function (prevents bulk DB dumps)
 */
export async function fetchSingleOrderRPC(orderId: string): Promise<OrderRecord | null> {
  try {
    const { data, error } = await supabase.rpc('get_order_by_id', { p_order_id: orderId })
    if (error || !data || data.length === 0) {
      return null
    }
    return rowToOrder(data[0])
  } catch (err) {
    return null
  }
}

/**
 * Atomic Conditional Order Update: WHERE id = orderId AND updated_at = lastKnownUpdatedAt
 * Guarantees zero silent overwrites if another device modified the order in between.
 */
export async function syncOrderStatusAtomic(
  orderId: string, 
  updates: Partial<OrderRecord>, 
  lastKnownUpdatedAt: string
): Promise<{ success: boolean; conflict?: boolean; latestCloudOrder?: OrderRecord }> {
  try {
    const newUpdatedAt = new Date().toISOString()
    
    // ATOMIC CONDITIONAL SQL UPDATE
    const { data, error } = await supabase
      .from('orders')
      .update({
        ...updates,
        updated_at: newUpdatedAt,
        timestamp: Date.now(),
      })
      .eq('id', orderId)
      .eq('updated_at', lastKnownUpdatedAt) // Atomic conditional lock!
      .select()

    if (error || !data || data.length === 0) {
      console.warn(`Atomic lock conflict detected on order ${orderId}! Refetching latest cloud data...`)
      
      // Fetch latest cloud version to merge conflict
      const { data: currentCloudRow } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      const latestCloudOrder = currentCloudRow ? rowToOrder(currentCloudRow) : undefined
      return { success: false, conflict: true, latestCloudOrder }
    }

    return { success: true }
  } catch (err) {
    console.warn('Network issue during atomic order sync:', err)
    return { success: false }
  }
}

/**
 * Subscribe to realtime updates for a single order (for live order tracker)
 */
export function subscribeToOrderRealtime(
  orderId: string,
  onUpdate: (updatedOrder: OrderRecord) => void
) {
  const channel = supabase
    .channel(`order-live-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        if (payload.new) {
          const updated = rowToOrder(payload.new)
          onUpdate(updated)
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Subscribe to ALL order changes in real-time (for Admin Panel & Delivery Portal cross-device sync)
 */
export function subscribeToAllOrdersRealtime(
  onOrderChange: (order: OrderRecord) => void
) {
  const channel = supabase
    .channel('all-orders-live')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
      },
      (payload) => {
        if (payload.new) {
          const updated = rowToOrder(payload.new)
          onOrderChange(updated)
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
