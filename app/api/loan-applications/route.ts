import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { application, status = 'DRAFT', userId } = body;

    // Basic mapping: try to extract applicant info if present
    const applicantName = application?.buyer?.name ?? application?.buyerName ?? '';
    const applicantEmail = application?.buyer?.email ?? application?.contactEmail ?? '';
    const applicantPhone = application?.buyer?.phone ?? application?.phone ?? null;
    const amount = application?.financing?.loanAmount ?? null;

    const created = await prisma.loanApplication.create({
      data: {
        userId: userId ?? undefined,
        name: applicantName || 'Anonymous',
        email: applicantEmail || '',
        phone: applicantPhone,
        amount: amount !== null ? amount : undefined,
        application: application ?? {},
        status: status as any,
        submittedAt: status === 'SUBMITTED' ? new Date() : undefined
      }
    });

    return NextResponse.json({ ok: true, id: created.id, referenceId: created.id });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Loan API error', err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}

