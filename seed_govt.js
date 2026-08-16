const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.zsggpphwgqgbauunilww:Assantype54321@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres"
  });

  await client.connect();
  
  const cuid = 'cl' + Math.random().toString(36).substr(2, 23);
  const now = new Date().toISOString();

  const query = `
    INSERT INTO "Customer" (id, "smartguardId", name, phone, email, address, category, plan, status, "lastSyncedAt", "createdAt")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *;
  `;

  const values = [
    cuid,
    'SGVIP-001',
    'City Municipal Corporation (TEST VIP)',
    '+919998887776',
    'admin@municipal.gov.in',
    'Main Secretariat Building, Center Block',
    'GOVERNMENT',
    '1 Gbps Dedicated Lease Line',
    'ACTIVE',
    now,
    now
  ];

  try {
    const res = await client.query(query, values);
    console.log('Successfully created Customer:', res.rows[0]);
  } catch (err) {
    console.error('Error inserting customer:', err);
  } finally {
    await client.end();
  }
}

main();
