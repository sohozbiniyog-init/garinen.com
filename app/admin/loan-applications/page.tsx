 'use client';

import { useEffect, useState } from 'react';

type LoanRecord = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  amount: string | null;
  status: 'DRAFT' | 'FOLLOW_UP_REQUIRED' | 'SUBMITTED' | 'REVIEWING' | 'APPROVED' | 'REJECTED';
  submittedAt: string | null;
  createdAt: string;
  application: {
    financing?: {
      bankName?: string;
      loanAmount?: number;
      downPayment?: string | number;
      tenure?: string | number;
    };
    vehicle?: {
      selectedBankName?: string;
      title?: string;
      carTitle?: string;
      listingTitle?: string;
      loanAmount?: number;
    };
    [key: string]: unknown;
  };
};

export default function AdminLoanApplicationsPage() {
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadLoans = async () => {
      try {
        const response = await fetch('/api/admin/loans');
        if (!response.ok) {
          throw new Error('Failed to load loan applications');
        }

        const data = (await response.json()) as LoanRecord[];
        setLoans(data);
      } catch (loadError) {
        console.error(loadError);
        setError('Could not load loan applications right now.');
      } finally {
        setLoading(false);
      }
    };

    loadLoans();
  }, []);

  const formatAmount = (amount: string | null) => (amount ? `৳ ${Number(amount).toLocaleString('en-IN')}` : 'N/A');
  const getBankName = (application: LoanRecord['application']) => application.financing?.bankName ?? application.vehicle?.selectedBankName ?? 'N/A';
  const getVehicleName = (application: LoanRecord['application']) => application.vehicle?.title ?? application.vehicle?.carTitle ?? application.vehicle?.listingTitle ?? 'Vehicle not provided';
  const getLoanAmount = (application: LoanRecord['application'], fallbackAmount: string | null) => {
    const loanAmount = application?.financing?.loanAmount ?? application?.vehicle?.loanAmount;
    if (typeof loanAmount === 'number') {
      return `৳ ${loanAmount.toLocaleString('en-IN')}`;
    }

    return formatAmount(fallbackAmount);
  };

  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      <section className="mb-8">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Admin</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Financing Applications</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Review buyer drafts, confirm in-person documents, and move applications to submitted for bank officers.
        </p>
      </section>

      {error ? (
        <div className="mb-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6">
        {loading ? (
          <section className="glass-card rounded-[2rem] p-8 text-center text-sm text-white shadow-soft">
            Loading  Financing applications...
          </section>
        ) : loans.length === 0 ? (
          <section className="glass-card rounded-[2rem] p-8 text-center text-sm text-white shadow-soft">
            No  Financing applications found.
          </section>
        ) : (
          loans.map((loan) => (
            <section key={loan.id} className="glass-card rounded-[2rem] p-6 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-white">{loan.name}</h2>
                  <p className="mt-1 text-sm text-white">{loan.email}{loan.phone ? ` • ${loan.phone}` : ''}</p>
                </div>
                <div className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold tracking-[0.12em] text-white">
                  Reference: {loan.id}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-white/30 bg-white/70 p-4 text-sm text-ink">
                  <p className="text-xs uppercase tracking-[0.12em] text-white">Status</p>
                  <p className="mt-2 font-semibold">{loan.status}</p>
                </div>
                <div className="rounded-2xl border border-white/30 bg-white/70 p-4 text-sm text-ink">
                  <p className="text-xs uppercase tracking-[0.12em] text-white">Financing Amount</p>
                  <p className="mt-2 font-semibold">{getLoanAmount(loan.application, loan.amount)}</p>
                </div>
                <div className="rounded-2xl border border-white/30 bg-white/70 p-4 text-sm text-ink">
                  <p className="text-xs uppercase tracking-[0.12em] text-white">Bank</p>
                  <p className="mt-2 font-semibold">{getBankName(loan.application)}</p>
                </div>
                <div className="rounded-2xl border border-white/30 bg-white/70 p-4 text-sm text-ink">
                  <p className="text-xs uppercase tracking-[0.12em] text-white">Vehicle</p>
                  <p className="mt-2 font-semibold">{getVehicleName(loan.application)}</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/30 bg-white/70 p-4 text-sm text-ink">
                <p className="text-xs uppercase tracking-[0.12em] text-white">Submission Details</p>
                <div className="mt-3 grid gap-2 text-sm text-smoke md:grid-cols-2">
                  <div>Submitted: <strong className="text-ink">{loan.submittedAt ? new Date(loan.submittedAt).toLocaleString() : 'Not yet submitted'}</strong></div>
                  <div>Created: <strong className="text-ink">{new Date(loan.createdAt).toLocaleString()}</strong></div>
                  <div>Down payment: <strong className="text-ink">{loan.application?.financing?.downPayment ? `৳ ${Number(loan.application.financing.downPayment).toLocaleString('en-IN')}` : 'N/A'}</strong></div>
                  <div>Tenure: <strong className="text-ink">{loan.application?.financing?.tenure ? `${loan.application.financing.tenure} months` : 'N/A'}</strong></div>
                </div>
              </div>

              <details className="mt-4 rounded-2xl border border-white/30 bg-slate-950 p-4 text-white/80">
                <summary className="cursor-pointer text-sm font-semibold text-white">View payload</summary>
                <pre className="mt-4 max-h-[360px] overflow-auto text-[11px] leading-5">{JSON.stringify(loan.application, null, 2)}</pre>
              </details>
            </section>
          ))
        )}
      </div>
    </main>
  );
}

