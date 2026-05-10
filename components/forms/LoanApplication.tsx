'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { showToast } from '@/components/common/Toast';

type LoanStatus = 'DRAFT' | 'FOLLOW_UP_REQUIRED' | 'SUBMITTED';

export interface LoanPrefill {
  listingId?: string;
  title?: string;
  brand?: string;
  model?: string;
  year?: number;
  price?: number;
  location?: string;
}

const bankOptions = [
  { id: 'brac', name: 'BRAC Bank', maxFinancing: 0.7, maxTenure: 72 },
  { id: 'city', name: 'City Bank', maxFinancing: 0.6, maxTenure: 72 }
];

export function LoanApplicationForm({ prefill }: { prefill?: LoanPrefill }) {
  const [bankId, setBankId] = useState('brac');
  const [scheme, setScheme] = useState('standard');
  const [budget, setBudget] = useState(prefill?.price ?? 2500000);
  const [downPayment, setDownPayment] = useState(Math.round((prefill?.price ?? 2500000) * 0.1));
  const [tenure, setTenure] = useState(48);
  const [monthlyIncome, setMonthlyIncome] = useState(120000);
  const [occupation, setOccupation] = useState('Salaried');
  const [applicantName, setApplicantName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<LoanStatus>('DRAFT');

  const selectedBank = bankOptions.find((bank) => bank.id === bankId) ?? bankOptions[0];
  const loanAmount = Math.max(0, budget - downPayment);
  const maxLoanAmount = Math.round(budget * selectedBank.maxFinancing);
  const affordability = useMemo(() => {
    const estimatedEmi = Math.round(loanAmount / Math.max(1, tenure));
    const ratio = monthlyIncome ? estimatedEmi / monthlyIncome : 0;
    return { estimatedEmi, ratio };
  }, [loanAmount, monthlyIncome, tenure]);

  // Allow saving a draft without phone; defer document collection until follow-up/submission
  const canSubmitDraft = applicantName.trim().length > 1 && loanAmount > 0;

  const applicationJson = useMemo(() => ({
    applicationStatus: status,
    buyer: {
      name: applicantName,
      phone,
      occupation,
      monthlyIncome
    },
    vehicle: {
      listingId: prefill?.listingId ?? null,
      title: prefill?.title ?? null,
      brand: prefill?.brand ?? null,
      model: prefill?.model ?? null,
      year: prefill?.year ?? null,
      location: prefill?.location ?? null,
      targetBudget: budget
    },
    financing: {
      bankId,
      bankName: selectedBank.name,
      scheme,
      downPayment,
      loanAmount,
      tenure,
      maxFinancing: selectedBank.maxFinancing,
      maxLoanAmount,
      estimatedEmi: affordability.estimatedEmi,
      affordabilityRatio: Number(affordability.ratio.toFixed(2))
    },
    documents: {
      personalDocumentsRequired: ['NID', 'Photo', 'Income proof', 'Address proof'],
      collectionMode: 'in-person',
      followUpRequired: true,
      adminReviewNeeded: true
    }
  }), [affordability.estimatedEmi, affordability.ratio, applicantName, bankId, budget, downPayment, loanAmount, monthlyIncome, occupation, phone, prefill, scheme, selectedBank.maxFinancing, selectedBank.name, status, tenure, maxLoanAmount]);
  const signInRedirect = `/dashboard/buyer/loan-apply${prefill?.listingId ? `?listingId=${encodeURIComponent(prefill.listingId)}` : ''}`;

  async function saveDraft() {
    if (!canSubmitDraft) {
      showToast('Please provide a name and valid budget to save a draft.', { type: 'error' });
      return;
    }

    try {
      const res = await fetch('/api/loan-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application: applicationJson, status: 'DRAFT' }),
      });

      if (!res.ok) throw new Error('Failed to save draft');
      const data = await res.json();
      showToast(`Loan draft saved. Reference ID: ${data?.referenceId ?? data?.id ?? 'N/A'}.`, { type: 'success' });
      setStatus('DRAFT');
      return data?.referenceId ?? data?.id;
    } catch (err) {
      console.error(err);
      showToast('Failed to save draft. Try again later.', { type: 'error' });
    }
  }

  async function submitApplication() {
    // require phone before final submission
    if (!phone || phone.trim().length < 8) {
      showToast('Please provide a phone number before submitting the application.', { type: 'error' });
      return;
    }

    try {
      const res = await fetch('/api/loan-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application: applicationJson, status: 'SUBMITTED' }),
      });

      if (!res.ok) throw new Error('Failed to submit application');
      const data = await res.json();
      showToast(`Loan application submitted. Reference ID: ${data?.referenceId ?? data?.id ?? 'N/A'}.`, { type: 'success' });
      setStatus('SUBMITTED');
      return data?.referenceId ?? data?.id;
    } catch (err) {
      console.error(err);
      showToast('Failed to submit application. Try again later.', { type: 'error' });
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="glass-card rounded-[2rem] p-6 shadow-soft">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-600">Loan Application Draft</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">Apply for Car Loan</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Start a draft now. Personal documents are collected in person, then admin marks the application submitted for bank officers.
          </p>
        </div>

        {prefill?.title ? (
          <div className="mb-6 rounded-2xl border border-sky-200/60 bg-sky-50/70 p-4 text-sm text-ink">
            Prefilled from listing: <strong>{prefill.title}</strong>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Applicant Name</span>
            <input value={applicantName} onChange={(e) => setApplicantName(e.target.value)} className="glass-field w-full rounded-xl px-4 py-3" placeholder="Full name" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Phone</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="glass-field w-full rounded-xl px-4 py-3" placeholder="01XXXXXXXXX" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Occupation</span>
            <input value={occupation} onChange={(e) => setOccupation(e.target.value)} className="glass-field w-full rounded-xl px-4 py-3" placeholder="Salaried / Business / Self-employed" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Monthly Income</span>
            <input type="number" min="0" value={monthlyIncome} onChange={(e) => setMonthlyIncome(Number(e.target.value))} className="glass-field w-full rounded-xl px-4 py-3" />
          </label>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Budget</span>
            <input type="number" min="0" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="glass-field w-full rounded-xl px-4 py-3" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Down Payment</span>
            <input type="number" min="0" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} className="glass-field w-full rounded-xl px-4 py-3" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Tenure (months)</span>
            <input type="number" min="12" max={selectedBank.maxTenure} step="6" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="glass-field w-full rounded-xl px-4 py-3" />
          </label>
          <label className="space-y-2 text-sm">
            <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Scheme</span>
            <input value={scheme} onChange={(e) => setScheme(e.target.value)} className="glass-field w-full rounded-xl px-4 py-3" placeholder="Standard / Preferred" />
          </label>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Partner Bank</p>
          <div className="flex flex-wrap gap-3">
            {bankOptions.map((bank) => (
              <button key={bank.id} onClick={() => setBankId(bank.id)} type="button" className={`rounded-full px-4 py-2 text-sm font-semibold transition ${bankId === bank.id ? 'glass-button text-white' : 'border border-slate-200 bg-white/70 text-ink'}`}>
                {bank.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white/70 p-4 text-sm text-ink">
          <p className="font-semibold">Personal document follow-up</p>
          <p className="mt-1 text-sm text-slate-600">NID, photo, income proof, and address proof are collected in person. No cloud upload is used in v1.</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={!canSubmitDraft}
            onClick={async () => {
              const id = await saveDraft();
              if (id) setStatus('DRAFT');
            }}
            className="glass-button rounded-full px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={async () => {
              try {
                const res = await fetch('/api/loan-applications', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ application: applicationJson, status: 'FOLLOW_UP_REQUIRED' }),
                });
                if (!res.ok) throw new Error('Failed to mark follow-up');
                showToast('Marked documents pending. Admin will follow up.', { type: 'info' });
                setStatus('FOLLOW_UP_REQUIRED');
              } catch (err) {
                console.error(err);
                showToast('Failed to mark documents pending. Try again.', { type: 'error' });
              }
            }}
            className="glass-field rounded-full px-5 py-3 text-sm font-semibold text-ink"
          >
            Mark Documents Pending
          </button>

          <button
            type="button"
            onClick={() => submitApplication()}
            className="glass-button rounded-full px-5 py-3 text-sm font-semibold text-white"
          >
            Submit Application
          </button>

          <Link href={`/login?redirect=${encodeURIComponent(signInRedirect)}`} className="glass-field rounded-full px-5 py-3 text-sm font-semibold text-ink">
            Sign In / Register
          </Link>
        </div>
      </section>

      <aside className="glass-card space-y-6 rounded-[2rem] p-6 shadow-soft">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-600">Draft Output</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">Admin-ready JSON</h2>
        </div>

        <div className="rounded-2xl bg-slate-950/90 p-4 text-sm text-white/80">
          <div className="text-xs uppercase tracking-[0.2em] text-white/50">Status</div>
          <div className="mt-2 text-2xl font-bold text-white">{status}</div>
          <div className="mt-2 text-sm">Admin will move the record to submitted after checking personal documents in person.</div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4">
            <div className="text-xs text-slate-600">Loan Amount</div>
            <div className="mt-2 font-bold text-ink">৳ {loanAmount.toLocaleString('en-IN')}</div>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4">
            <div className="text-xs text-slate-600">Estimated EMI</div>
            <div className="mt-2 font-bold text-ink">৳ {affordability.estimatedEmi.toLocaleString('en-IN')}</div>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4">
            <div className="text-xs text-slate-600">Budget Check</div>
            <div className="mt-2 font-bold text-ink">{Math.round(affordability.ratio * 100)}%</div>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4">
            <div className="text-xs text-slate-600">Max Finance</div>
            <div className="mt-2 font-bold text-ink">{Math.round(selectedBank.maxFinancing * 100)}%</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 text-xs leading-6 text-slate-600">
          <p className="font-semibold text-ink">Documents for admin follow-up</p>
          <p className="mt-1">NID, photo, income proof, address proof, and any bank-specific paper forms.</p>
        </div>

        <pre className="max-h-[420px] overflow-auto rounded-2xl bg-slate-950 p-4 text-[11px] leading-5 text-white/75">{JSON.stringify(applicationJson, null, 2)}</pre>
      </aside>
    </div>
  );
}

