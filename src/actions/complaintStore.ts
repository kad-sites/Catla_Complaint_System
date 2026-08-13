'use server'

import { prisma } from '@/lib/db'

// Read complaints from Database
export async function getComplaints() {
  try {
    const complaints = await prisma.uIComplaint.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    return complaints
  } catch (error) {
    console.error('Error fetching complaints from DB:', error)
    return []
  }
}

// Add a new complaint
export async function saveComplaint(complaint: any) {
  try {
    await prisma.uIComplaint.create({
      data: {
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
      }
    })
    return { success: true }
  } catch (error: any) {
    console.error('Error saving complaint to DB:', error)
    return { success: false, error: error.message }
  }
}

// Update a specific complaint
export async function updateComplaint(id: string, updates: any) {
  try {
    await prisma.uIComplaint.update({
      where: { id },
      data: updates
    })
    return { success: true }
  } catch (error: any) {
    console.error('Error updating complaint in DB:', error)
    return { success: false, error: error.message }
  }
}
