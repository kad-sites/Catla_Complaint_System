'use server'

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
}

// Read all users
export async function getUsers() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/User?order=createdAt.desc`,
      { headers, cache: 'no-store' }
    )
    if (!res.ok) {
      const errText = await res.text()
      console.error('Supabase GET User error:', res.status, errText)
      return []
    }
    return await res.json()
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

// Add a new user
export async function createUser(userData: any, isSync = false) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/User`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          role: userData.role,
          active: userData.active ?? true,
          passwordHash: 'catla123' // default password since it's required
        }),
      }
    )
    if (!res.ok) {
      const errText = await res.text()
      console.error('Supabase POST User error:', res.status, errText)
      return { success: false, error: errText }
    }
    const data = await res.json()

    // Sync to MunshiBook
    if (!isSync) {
      try {
        await fetch('https://munshibook.vercel.app/api/sync/isp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: userData.name,
            phone: userData.phone,
            email: userData.email,
            role: userData.role,
            status: userData.active === false ? 'Inactive' : 'Active'
          })
        }).catch(e => console.error('Sync POST error', e));
      } catch (e) {}
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Error saving user:', error)
    return { success: false, error: error.message }
  }
}

// Delete user
export async function deleteUser(id: string, isSync = false, phone?: string) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/User?id=eq.${id}`,
      {
        method: 'DELETE',
        headers,
      }
    )
    if (!res.ok) {
      const errText = await res.text()
      console.error('Supabase DELETE User error:', res.status, errText)
      return { success: false, error: errText }
    }

    // Sync DELETE to MunshiBook
    if (!isSync && phone) {
      try {
        await fetch('https://munshibook.vercel.app/api/sync/isp', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone })
        }).catch(e => console.error('Sync DELETE error', e));
      } catch (e) {}
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return { success: false, error: error.message }
  }
}

// Update user
export async function updateUser(id: string, updates: any, isSync = false, originalPhone?: string) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/User?id=eq.${id}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates),
      }
    )
    if (!res.ok) {
      const errText = await res.text()
      console.error('Supabase PATCH User error:', res.status, errText)
      return { success: false, error: errText }
    }

    // Sync to MunshiBook
    if (!isSync) {
      try {
        await fetch('https://munshibook.vercel.app/api/sync/isp', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            matchPhone: originalPhone || updates.phone,
            name: updates.name,
            phone: updates.phone,
            email: updates.email,
            role: updates.role,
            status: updates.active !== undefined ? (updates.active ? 'Active' : 'Inactive') : undefined
          })
        }).catch(e => console.error('Sync PUT error', e));
      } catch (e) {}
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error updating user:', error)
    return { success: false, error: error.message }
  }
}
