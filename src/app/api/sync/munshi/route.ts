import { NextResponse } from 'next/server';
import { getUsers, createUser, updateUser } from '@/actions/userStore';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { name, phone, email, role, status, matchPhone } = payload;
    
    // Validate payload
    if (!name && !phone) {
      return NextResponse.json({ success: false, error: 'Missing name or phone' }, { status: 400 });
    }

    const users = await getUsers();
    
    // Match by provided matchPhone, or current phone, or name as fallback
    const existing = users.find((u: any) => 
      (matchPhone && u.phone === matchPhone) || 
      (phone && u.phone === phone) || 
      (name && u.name === name)
    );

    const active = status === 'Inactive' ? false : true;
    // ensure role format is uppercase for Catla DB
    const formattedRole = (role || 'TECHNICIAN').toUpperCase();

    if (existing) {
      await updateUser(existing.id, {
        name: name || existing.name,
        phone: phone || existing.phone,
        email: email !== undefined ? email : existing.email,
        role: formattedRole,
        active
      }, true); // pass true for isSync
      return NextResponse.json({ success: true, action: 'updated' });
    } else {
      await createUser({
        id: `STF-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        name,
        phone,
        email,
        role: formattedRole,
        active
      }, true); // pass true for isSync
      return NextResponse.json({ success: true, action: 'created' });
    }

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
