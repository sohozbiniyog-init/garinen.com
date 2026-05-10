import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Minimal server-side handling: log and acknowledge.
    // In production, forward this to support email, ticketing, or DB.
    // eslint-disable-next-line no-console
    console.info('Contact form submission:', JSON.stringify(body));

    return NextResponse.json({ ok: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Contact API error', err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}

