import { NextResponse } from 'next/server';
import { updateComplaint } from '@/actions/complaintStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { complaintId, status } = body;

    if (!complaintId || !status) {
      return NextResponse.json({ error: 'Missing complaintId or status' }, { status: 400 });
    }

    const result = await updateComplaint(complaintId, { status });

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
