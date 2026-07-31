import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')

  const where: any = {}
  if (status) where.status = status
  if (priority) where.priority = priority

  try {
    const complaints = await prisma.complaint.findMany({
      where,
      include: {
        customer: true,
        complaintType: true,
        assignedTech: {
          select: { id: true, name: true, email: true, role: true }
        },
        createdBy: {
          select: { id: true, name: true, email: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(complaints)
  } catch (error) {
    console.error('Failed to fetch complaints:', error)
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { customerId, complaintTypeId, priority, description } = body

    if (!customerId || !complaintTypeId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const customer = await prisma.customer.findUnique({ where: { id: customerId } })
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Generate ticket number TKT-YYMMDD-NNNNN
    const today = new Date()
    const yy = today.getFullYear().toString().slice(-2)
    const mm = (today.getMonth() + 1).toString().padStart(2, '0')
    const dd = today.getDate().toString().padStart(2, '0')
    const datePrefix = `TKT-${yy}${mm}${dd}-`

    const countToday = await prisma.complaint.count({
      where: {
        ticketNumber: { startsWith: datePrefix }
      }
    })
    const sequence = (countToday + 1).toString().padStart(5, '0')
    const ticketNumber = `${datePrefix}${sequence}`

    // Calculate SLA
    let slaHours = 24
    if (customer.category === 'ENTERPRISE') slaHours = 2
    else if (customer.category === 'BUSINESS') slaHours = 4
    else {
      // HOME
      if (priority === 'CRITICAL') slaHours = 4
      else if (priority === 'HIGH') slaHours = 8
      else if (priority === 'MEDIUM') slaHours = 24
      else if (priority === 'LOW') slaHours = 48
    }

    const slaDeadline = new Date(today.getTime() + slaHours * 60 * 60 * 1000)

    const complaint = await prisma.complaint.create({
      data: {
        ticketNumber,
        customerId,
        complaintTypeId,
        priority: priority || 'MEDIUM',
        description,
        customerCategory: customer.category,
        slaHours,
        slaDeadline,
        createdById: session.user.id
      }
    })

    // Log the creation
    await prisma.auditLog.create({
      data: {
        complaintId: complaint.id,
        userId: session.user.id,
        action: 'CREATED',
        details: JSON.stringify({ priority: complaint.priority, status: complaint.status })
      }
    })

    return NextResponse.json(complaint, { status: 201 })
  } catch (error) {
    console.error('Failed to create complaint:', error)
    return NextResponse.json({ error: 'Failed to create complaint' }, { status: 500 })
  }
}
