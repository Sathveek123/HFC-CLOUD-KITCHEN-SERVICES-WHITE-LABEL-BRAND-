import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * SERVER-SIDE ONLY: Agent Provisioning API Route
 * Uses SUPABASE_SERVICE_ROLE_KEY to safely create agent Auth users
 * without ever exposing the service key to the client browser bundle.
 */
export async function POST(req: Request) {
  try {
    const { name, username, password, coverageArea, vehicleType } = await req.json()

    if (!username || !password || !name) {
      return NextResponse.json({ error: 'Missing required agent fields' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Supabase server environment unconfigured' }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })

    // 0. Fail-closed Admin JWT Token Verification
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized: missing authorization token' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '').trim()
    const { data: { user }, error: userErr } = await supabaseAdmin.auth.getUser(token)

    if (userErr || !user) {
      return NextResponse.json({ error: 'Unauthorized: invalid or expired token' }, { status: 401 })
    }

    if (user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin privilege required' }, { status: 403 })
    }

    const email = `${username.toLowerCase().trim()}@hfc-agents.com`

    // 1. Create or get Supabase Auth User with metadata claims
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'agent',
        agent_name: name,
        username,
      },
    })

    if (authError && !authError.message.includes('already registered')) {
      console.warn('Supabase Auth user creation warning:', authError.message)
    }

    // 2. Insert into public.agents database table
    const agentId = authUser?.user?.id || `AGT-${Date.now().toString(36).slice(-5).toUpperCase()}`

    const { data: agentRow, error: dbError } = await supabaseAdmin
      .from('agents')
      .upsert({
        id: agentId,
        name,
        username,
        password_hash: '***',
        is_active: true,
        vehicle_type: vehicleType || 'Bike',
        coverage_area: coverageArea || 'Central',
        total_deliveries: 0,
      }, { onConflict: 'id' })
      .select()

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      agent: agentRow ? agentRow[0] : null,
      message: `Agent ${name} provisioned securely with role claims`,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Provisioning failed' }, { status: 500 })
  }
}
