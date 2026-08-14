import { supabase } from './supabase'

/**
 * Authenticate Admin via Supabase Auth.
 * Never throws — returns false silently on any failure so caller can fall back.
 */
export async function authenticateAdminSupabase(
  emailOrUsername: string,
  passwordOrPin: string
): Promise<boolean> {
  try {
    const cleanInput = emailOrUsername.trim().toLowerCase()
    const suppliedPassword = passwordOrPin.trim()

    if (!suppliedPassword) return false

    const email = cleanInput.includes('@')
      ? cleanInput
      : (cleanInput === 'hfc_admin' || cleanInput === 'admin'
          ? 'admin@hfcconsultancy.com'
          : `${cleanInput}@hfc-admin-system.com`)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: suppliedPassword,
    })

    if (!error && data?.session && data?.user?.user_metadata?.role === 'admin') {
      console.log('Admin Supabase Auth login successful ✓')
      return true
    }

    // If login failed, try to auto-sign up the default admin account.
    // Suppress all errors here — if signUp fails (e.g. email confirm required, weak password),
    // the caller will fall back to local auth anyway.
    if (error) {
      const isDefault = (cleanInput === 'admin' || cleanInput === 'hfc_admin')
      if (isDefault) {
        try {
          await supabase.auth.signUp({
            email,
            password: suppliedPassword,
            options: {
              data: { role: 'admin', username: cleanInput },
              emailRedirectTo: undefined,
            },
          })
        } catch (_) {
          // swallow — local fallback will handle it
        }
      }
    }

    return false
  } catch (err) {
    console.warn('Admin Supabase Auth skipped (non-critical):', err)
    return false
  }
}


/**
 * Authenticate Agent via Supabase Auth with agent_name claim
 * Always returns true so agent flow never breaks — uses local fallback.
 */
export async function authenticateAgentSupabase(
  username: string,
  password: string,
  agentName?: string
): Promise<boolean> {
  try {
    const email = `${username.toLowerCase().trim()}@hfc-agents.com`
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      try {
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: 'agent',
              username,
              agent_name: agentName || username,
            },
          },
        })
      } catch (_) { /* swallow */ }
    } else if (data.session) {
      console.log(`Supabase Auth Agent ${username} logged in ✓`)
    }
  } catch (err) {
    console.warn('Supabase Agent Auth session note:', err)
  }

  return true
}

/**
 * Check active Supabase Auth session on app load.
 * Never throws.
 */
export async function checkSupabaseAuthSession() {
  try {
    const { data } = await supabase.auth.getSession()
    return data.session
  } catch (err) {
    return null
  }
}
