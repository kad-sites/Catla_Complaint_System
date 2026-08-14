import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
};

export async function DELETE(request: Request) {
  try {
    const { id, phone } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    }

    // Delete from Catla Supabase
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/User?id=eq.${id}`,
      { method: 'DELETE', headers }
    );

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ success: false, error: errText }, { status: 500 });
    }

    // Sync DELETE to MunshiBook
    if (phone) {
      try {
        const syncRes = await fetch('https://munshibook.vercel.app/api/sync/isp', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone })
        });
        const syncData = await syncRes.json().catch(() => ({}));
        console.log('Sync DELETE to MunshiBook result:', syncRes.status, syncData);
      } catch (e) {
        console.error('Sync DELETE to MunshiBook failed:', e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
