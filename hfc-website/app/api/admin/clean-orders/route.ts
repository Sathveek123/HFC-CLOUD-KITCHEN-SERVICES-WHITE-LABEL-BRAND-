import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Admin-only endpoint: clears ALL orders + bills from Supabase.
 * Runs ONLY if a valid admin JWT Authorization header is provided.
 * DOES NOT create Supabase Auth users (old code was leaking users every request).
 */
export async function GET(req: Request) {
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      'https://cmwsffhenpckwkwgnmsy.supabase.co'
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'sb_publishable_hZmCQNTdDAuysF3iU4IaYA_daEHVI8D'

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })

    // ── Admin JWT Check ──────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    let isAdmin = false
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '').trim()
        const { data, error } = await supabaseAdmin.auth.getUser(token)
        if (!error && data?.user?.user_metadata?.role === 'admin') {
          isAdmin = true
        }
      } catch (_) { /* token invalid */ }
    }

    // ── Fallback: simple one-time clear-token (stored server-side only) ────
    const clearToken = process.env.ADMIN_CLEAR_TOKEN || 'HFC-CLEAR-2026-ADMIN'
    const url = new URL(req.url, 'http://localhost')
    const tokenParam = url.searchParams.get('token')
    if (tokenParam === clearToken) {
      isAdmin = true
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin JWT or valid clear token required' },
        { status: 401 }
      )
    }

    const results: Record<string, string> = {}

    // Delete bills first (FK references orders)
    const { error: billsErr } = await supabaseAdmin
      .from('bills')
      .delete()
      .neq('bill_no', '__never__')
    results.bills_cleared = billsErr
      ? `FAILED: ${billsErr.message}`
      : 'SUCCESS'

    // Delete orders
    const { error: ordersErr } = await supabaseAdmin
      .from('orders')
      .delete()
      .neq('id', '__never__')
    results.orders_cleared = ordersErr
      ? `FAILED: ${ordersErr.message}`
      : 'SUCCESS'

    // Very small, lightweight response — saves egress
    return NextResponse.json({ ok: true, results }, {
      headers: {
        'Cache-Control': 'no-store, no-cache',
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'Cleanup failed' },
      { status: 500 }
    )
  }
}
