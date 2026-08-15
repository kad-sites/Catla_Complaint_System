'use server'

import { updateTelegramPinnedHeader } from './sendTelegramAlert'

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
}

// Read complaints from Supabase
export async function getComplaints() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/UIComplaint?order=createdAt.desc`,
      { headers, cache: 'no-store' }
    )
    if (!res.ok) {
      const errText = await res.text()
      console.error('Supabase GET error:', res.status, errText)
      return []
    }
    return await res.json()
  } catch (error) {
    console.error('Error fetching complaints:', error)
    return []
  }
}

// Add a new complaint
export async function saveComplaint(complaint: any) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/UIComplaint`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id: complaint.id,
          customer: complaint.customer,
          category: complaint.category,
          issue: complaint.issue,
          priority: complaint.priority,
          sla: complaint.sla,
          slaPercent: complaint.slaPercent,
          tech: complaint.tech,
          status: complaint.status,
          time: complaint.time,
          phone: complaint.phone,
          address: complaint.address,
          createdAt: complaint.createdAt,
          slaHours: complaint.slaHours,
        }),
      }
    )
    if (!res.ok) {
      const errText = await res.text()
      console.error('Supabase POST error:', res.status, errText)
      return { success: false, error: errText }
    }
    
    // Fire and forget pinned header update
    updateTelegramPinnedHeader()
    
    return { success: true }
  } catch (error: any) {
    console.error('Error saving complaint:', error)
    return { success: false, error: error.message }
  }
}

// Update a specific complaint
export async function updateComplaint(id: string, updates: any) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/UIComplaint?id=eq.${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates),
      }
    )
    if (!res.ok) {
      const errText = await res.text()
      console.error('Supabase PATCH error:', res.status, errText)
      return { success: false, error: errText }
    }

    // Fire and forget pinned header update
    updateTelegramPinnedHeader()

    return { success: true }
  } catch (error: any) {
    console.error('Error updating complaint:', error)
    return { success: false, error: error.message }
  }
}

// Delete a specific complaint
export async function deleteComplaint(id: string) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/UIComplaint?id=eq.${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
        headers,
      }
    )
    if (!res.ok) {
      const errText = await res.text()
      console.error('Supabase DELETE error:', res.status, errText)
      return { success: false, error: errText }
    }

    // Fire and forget pinned header update
    updateTelegramPinnedHeader()

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting complaint:', error)
    return { success: false, error: error.message }
  }
}
