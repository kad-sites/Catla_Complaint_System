'use server'

import fs from 'fs/promises'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'complaints.json')

// Read complaints from JSON
export async function getComplaints() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    // If file doesn't exist, return empty array
    return []
  }
}

// Add a new complaint
export async function saveComplaint(complaint: any) {
  try {
    const current = await getComplaints()
    current.unshift(complaint) // Add to top
    await fs.writeFile(DB_PATH, JSON.stringify(current, null, 2), 'utf-8')
    return { success: true }
  } catch (error: any) {
    console.error('Error saving complaint:', error)
    return { success: false, error: error.message }
  }
}

// Update a specific complaint
export async function updateComplaint(id: string, updates: any) {
  try {
    const current = await getComplaints()
    const updated = current.map((c: any) => 
      c.id === id ? { ...c, ...updates } : c
    )
    await fs.writeFile(DB_PATH, JSON.stringify(updated, null, 2), 'utf-8')
    return { success: true }
  } catch (error: any) {
    console.error('Error updating complaint:', error)
    return { success: false, error: error.message }
  }
}
