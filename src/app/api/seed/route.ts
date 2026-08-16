import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const govtCustomer = await prisma.customer.create({
      data: {
        smartguardId: 'SGVIP-001-' + Math.floor(Math.random()*1000),
        name: 'City Municipal Corporation (TEST VIP)',
        phone: '+919998887776',
        email: 'admin@municipal.gov.in',
        address: 'Main Secretariat Building, Center Block',
        category: 'GOVERNMENT',
        plan: '1 Gbps Dedicated Lease Line',
        status: 'ACTIVE'
      }
    });
    return NextResponse.json({ success: true, customer: govtCustomer });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}
