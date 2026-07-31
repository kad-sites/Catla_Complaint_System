import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // 1. Create Demo Users
  const passwordHash = await bcrypt.hash('password123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@catla.local' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@catla.local',
      passwordHash,
      role: 'ADMIN',
      phone: '+919999999990',
    },
  })

  const director = await prisma.user.upsert({
    where: { email: 'director@catla.local' },
    update: {},
    create: {
      name: 'Director Desk',
      email: 'director@catla.local',
      passwordHash,
      role: 'DIRECTOR',
      phone: '+919999999991',
    },
  })

  const operator = await prisma.user.upsert({
    where: { email: 'operator@catla.local' },
    update: {},
    create: {
      name: 'Desk Operator 1',
      email: 'operator@catla.local',
      passwordHash,
      role: 'OPERATOR',
      phone: '+919999999992',
    },
  })

  const tech1 = await prisma.user.upsert({
    where: { email: 'tech1@catla.local' },
    update: {},
    create: {
      name: 'Amit Singh',
      email: 'tech1@catla.local',
      passwordHash,
      role: 'TECHNICIAN',
      phone: '+919999999993',
    },
  })

  const tech2 = await prisma.user.upsert({
    where: { email: 'tech2@catla.local' },
    update: {},
    create: {
      name: 'Suresh Pal',
      email: 'tech2@catla.local',
      passwordHash,
      role: 'TECHNICIAN',
      phone: '+919999999994',
    },
  })

  // 2. Create Complaint Types
  const complaintTypes = [
    { category: 'No Internet', subType: 'Complete Outage', icon: '🌐', defaultPriority: 'HIGH' },
    { category: 'No Internet', subType: 'Intermittent Drops', icon: '🌐', defaultPriority: 'HIGH' },
    { category: 'No Internet', subType: 'Authentication Failure', icon: '🌐', defaultPriority: 'MEDIUM' },
    
    { category: 'Slow Speed', subType: 'Speed Below Plan', icon: '🐌', defaultPriority: 'MEDIUM' },
    { category: 'Slow Speed', subType: 'High Latency/Ping', icon: '🐌', defaultPriority: 'MEDIUM' },
    
    { category: 'WiFi / Router', subType: 'WiFi Not Working', icon: '📡', defaultPriority: 'MEDIUM' },
    { category: 'WiFi / Router', subType: 'Weak Signal', icon: '📡', defaultPriority: 'LOW' },
    { category: 'WiFi / Router', subType: 'Password Reset', icon: '📡', defaultPriority: 'LOW' },
    
    { category: 'ONT / Hardware', subType: 'ONT Red Light (LOS)', icon: '🔌', defaultPriority: 'HIGH' },
    { category: 'ONT / Hardware', subType: 'ONT Not Powering On', icon: '🔌', defaultPriority: 'HIGH' },
    
    { category: 'Fiber / Cable', subType: 'Fiber Cut (Weather/Animal)', icon: '⚡', defaultPriority: 'CRITICAL' },
    { category: 'Fiber / Cable', subType: 'Fiber Cut (Road Work)', icon: '⚡', defaultPriority: 'CRITICAL' },
    
    { category: 'Billing', subType: 'Payment Not Reflected', icon: '💰', defaultPriority: 'LOW' },
    { category: 'Billing', subType: 'Plan Change Request', icon: '💰', defaultPriority: 'LOW' },
  ]

  console.log(`Seeding ${complaintTypes.length} complaint types...`)
  for (const ct of complaintTypes) {
    await prisma.complaintType.upsert({
      where: { category_subType: { category: ct.category, subType: ct.subType } },
      update: {},
      create: ct,
    })
  }

  // 3. Create Mock Customers (SmartGuard Bridge Mock)
  console.log('Seeding mock customers...')
  const mockCustomers = [
    { smartguardId: 'CID-1042', name: 'Rajesh Kumar', phone: '9876543210', address: 'B-42, Sector 15', category: 'HOME', plan: '100Mbps Fiber', status: 'ACTIVE' },
    { smartguardId: 'CID-1043', name: 'Priya Singh', phone: '9876543211', address: 'D-15, Sector 12', category: 'HOME', plan: '50Mbps Fiber', status: 'ACTIVE' },
    { smartguardId: 'CID-2001', name: 'TechCorp Pvt Ltd', phone: '9811122233', address: 'Plot 4, IT Park', category: 'BUSINESS', plan: '1Gbps ILL', status: 'ACTIVE' },
    { smartguardId: 'CID-3001', name: 'City Hospital', phone: '9922233344', address: 'Main Road', category: 'ENTERPRISE', plan: '500Mbps ILL', status: 'ACTIVE' },
    { smartguardId: 'CID-4001', name: 'Municipality Office', phone: '9988877766', address: 'Town Hall', category: 'GOVERNMENT', plan: '200Mbps Fiber', status: 'ACTIVE' },
  ]

  for (const cust of mockCustomers) {
    await prisma.customer.upsert({
      where: { smartguardId: cust.smartguardId },
      update: {},
      create: cust,
    })
  }

  console.log('✅ Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
