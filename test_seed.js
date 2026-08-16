const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const govtCustomer = await prisma.customer.create({
    data: {
      name: 'City Municipal Corporation (TEST VIP)',
      phone: '+919998887776',
      email: 'admin@municipal.gov.in',
      address: 'Main Secretariat Building, Center Block',
      category: 'GOVERNMENT',
      plan: '1 Gbps Dedicated Lease Line',
      status: 'ACTIVE'
    }
  });
  console.log('Created dummy Govt customer:', govtCustomer);
}

main().catch(console.error).finally(() => prisma.$disconnect());
