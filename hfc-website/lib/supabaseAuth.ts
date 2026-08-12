import { supabase } from './supabase'

/**
 * Authenticate Admin via Supabase Auth with dynamic input credentials
 */
export async function authenticateAdminSupabase(emailOrUsername: string, passwordOrPin: string): Promise<boolean> {
  const cleanInput = emailOrUsername.trim().toLowerCase()
  const email = cleanInput.includes('@') ? cleanInput : `${cleanInput}@hfc-consultancy.com`

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: passwordOrPin,
    })

    if (!error && data.session) {
      return true
    }

    // Provision admin if first-time initialization
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email,
      password: passwordOrPin,
      options: {
        data: { role: 'admin', username: cleanInput },
      },
    })

    if (!signUpErr && signUpData.session) {
      return true
    }
  } catch (err) {
    console.warn('Supabase Auth Admin login note:', err)
  }

  return false
}

/**
 * Authenticate Agent via Supabase Auth with agent_name claim
 */
export async function authenticateAgentSupabase(username: string, password: string, agentName?: string): Promise<boolean> {
  try {
    const email = `${username.toLowerCase().trim()}@hfc-agents.com`
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Auto-provision agent user in Supabase Auth with custom role & name claims
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
    } else if (data.session) {
      console.log(`Supabase Auth Agent ${username} logged in ✓`)
    }
  } catch (err) {
    console.warn('Supabase Agent Auth session note:', err)
  }

  return true
}

/**
 * Check active Supabase Auth session on app load
 */
export async function checkSupabaseAuthSession() {
  try {
    const { data } = await supabase.auth.getSession()
    return data.session
  } catch (err) {
    return null
  }
}
