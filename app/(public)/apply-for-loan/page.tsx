'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useBankRates } from '@/lib/contexts/bank-rates';
import { PROFESSION_OPTIONS, type ProfessionType } from '@/lib/professions';

interface LoanApplication {
  fullName: string;
  email: string;
  phone: string;
  carPrice: number;
  downPayment: number;
  tenure: number;
  selectedBankId: string;
  selectedSchemeId: string;
  monthlyIncome: number;
  employmentType: ProfessionType;
  documents: string[];
}

type BuyerProfile = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  profession?: ProfessionType | null;
} | null;

export default function ApplyForLoanPage() {
  const { banks } = useBankRates();
  const [step, setStep] = useState<'personal' | 'financial' | 'vehicle' | 'review' | 'submitted'>(
    'personal'
  );
  const [referenceId, setReferenceId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [application, setApplication] = useState<Partial<LoanApplication>>({
    employmentType: '',
    carPrice: 2500000,
    tenure: 48,
    selectedBankId: banks[0]?.id,
    selectedSchemeId: banks[0]?.schemes?.[0]?.id,
  });

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const res = await fetch('/api/auth/profile', { cache: 'no-store' });
        if (!res.ok) return;

        const data = (await res.json()) as { profile?: BuyerProfile };
        const profile = data.profile;
        if (!active || !profile) return;

        setApplication((prev) => ({
          ...prev,
          fullName: prev.fullName || profile.name || '',
          email: prev.email || profile.email || '',
          phone: prev.phone || profile.phone || '',
          employmentType: prev.employmentType || profile.profession || '',
        }));
      } catch {
        return;
      }
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const selectedBank = banks.find((b) => b.id === application.selectedBankId);
  const selectedScheme = selectedBank?.schemes?.find((s) => s.id === application.selectedSchemeId);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setApplication((prev) => ({
      ...prev,
      [name]: name === 'carPrice' || name === 'downPayment' || name === 'monthlyIncome' || name === 'tenure'
        ? parseFloat(value)
        : value,
    }));
  };

  const handleSubmit = () => {
    if (step === 'personal') {
      setStep('financial');
    } else if (step === 'financial') {
      setStep('vehicle');
    } else if (step === 'vehicle') {
      setStep('review');
    } else if (step === 'review') {
      setStep('submitted');
    }
  };

  const downPayment = application.carPrice
    ? Math.round((30 / 100) * application.carPrice)
    : 0;
  const loanAmount = (application.carPrice || 0) - downPayment;

  const monthlyRate = (selectedScheme?.rate || 11) / 100 / 12;
  const tenure = application.tenure || 48;
  const emi =
    loanAmount *
    ((monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
      (Math.pow(1 + monthlyRate, tenure) - 1));

  const formatBDT = (n: number) => '৳ ' + Math.round(n).toLocaleString('en-IN');

  const submitApplication = async () => {
    if (!application.fullName || !application.email || !application.phone) {
      setSubmitError('Please complete the personal details before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/loan-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application: {
            buyerName: application.fullName,
            contactEmail: application.email,
            phone: application.phone,
              buyer: {
                name: application.fullName,
                email: application.email,
                phone: application.phone,
                monthlyIncome: application.monthlyIncome,
                employmentType: application.employmentType,
              },
            vehicle: {
              carPrice: application.carPrice,
              downPayment,
              loanAmount,
              tenure: application.tenure,
              selectedBankId: application.selectedBankId,
              selectedBankName: selectedBank?.name,
              selectedSchemeId: application.selectedSchemeId,
              selectedSchemeName: selectedScheme?.name,
            },
            financing: {
              loanAmount,
              downPayment,
              tenure: application.tenure,
              monthlyIncome: application.monthlyIncome,
              emi: Math.round(emi),
            },
          },
          status: 'SUBMITTED',
        }),
      });

      if (!response.ok) throw new Error('Failed to submit application');

      const data = await response.json();
      setReferenceId(data?.referenceId ?? data?.id ?? '');
      setStep('submitted');
    } catch (error) {
      console.error(error);
      setSubmitError('Unable to submit right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps_list = [
    { id: 'personal', label: 'Personal', order: 1 },
    { id: 'financial', label: 'Financial', order: 2 },
    { id: 'vehicle', label: 'Vehicle', order: 3 },
    { id: 'review', label: 'Review', order: 4 },
  ];

  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      <section className="mb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Financing</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Apply for Financing</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Disclaimer:
        </p>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          We are not a bank or financial institution. We do not provide loans directly. All financing options displayed are facilitated through licensed banks and financial institutions in Bangladesh. Loan approval, interest rates, and terms are solely determined by the respective financing partner.
          Share your details here and we&apos;ll help place a loan application with a partner bank. Loan officers review the financial documents you provide and contact you after their assessment, while we continue to support buyers browsing vehicles from across Bangladesh.
        </p>
      </section>

      {/* Progress Bar */}
      {step !== 'submitted' && (
        <div className="mb-10 flex gap-2">
          {steps_list.map((s) => (
            <div key={s.id} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition ${
                  step === s.id
                    ? 'bg-moss text-white'
                    : steps_list.find((st) => st.id === step)!.order > s.order
                      ? 'bg-moss/30 text-white'
                      : 'border border-white/20 bg-white/10 text-slate-300'
                }`}
              >
                {s.order}
              </div>
              <div className={`text-xs font-semibold ${step === s.id ? 'text-white' : 'text-slate-300'}`}>
                {s.label}
              </div>
              {s.order < steps_list.length && (
                <div
                  className={`flex-1 h-0.5 ${
                    steps_list.find((st) => st.id === step)!.order > s.order
                      ? 'bg-moss/30'
                      : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {step === 'submitted' ? (
        <div className="glass-card rounded-[2rem] p-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-moss/20">
              <svg className="h-8 w-8 text-moss" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Application Submitted!</h2>
          <p className="mt-3 text-sm text-slate-600">
            Your Financing application has been submitted successfully. We&apos;ll review your application and contact you within 24 hours.
          </p>
          <p className="mt-3 text-bold text-black">
            Garinen.com acts solely as a facilitator and service provider connecting customers with third-party licensed banks and non-bank financial institutions (NBFIs) in Bangladesh.
            We do not issue, underwrite, or approve any loans. All loan approvals, interest rates, processing fees, repayment terms, and conditions are determined exclusively by the respective financial institution, subject to their internal policies and Bangladesh Bank regulations.
            By applying through our platform, you acknowledge that your information may be shared with these partner institutions for the purpose of financing evaluation. garinen.com shall not be held liable for any decisions made by the financial institutions.
          </p>
          <p className="mt-3 text-sm font-semibold text-moss">
            Reference ID: {referenceId || 'PENDING'}
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full bg-moss px-6 py-3 text-sm font-semibold text-white transition hover:bg-opacity-90"
          >
            Back to Home
          </Link>
        </div>
      ) : (
        <div className="glass-card rounded-[2rem] shadow-soft">
          <div className="p-8">
            {/* Personal Info */}
            {step === 'personal' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900">Personal Information</h2>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={application.fullName || ''}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="glass-field w-full rounded-lg px-4 py-3 text-sm"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={application.email || ''}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className="glass-field w-full rounded-lg px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={application.phone || ''}
                      onChange={handleInputChange}
                      placeholder="+880"
                      className="glass-field w-full rounded-lg px-4 py-3 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Financial Info */}
            {step === 'financial' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900">Financial Information</h2>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Monthly Income</label>
                  <input
                    type="number"
                    name="monthlyIncome"
                    value={application.monthlyIncome || ''}
                    onChange={handleInputChange}
                    placeholder="50000"
                    className="glass-field w-full rounded-lg px-4 py-3 text-sm"
                  />
                  <p className="mt-2 text-xs text-slate-600">Your monthly gross income</p>
                </div>
                <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Employment Type</label>
                    <select
                      name="employmentType"
                      value={application.employmentType || ''}
                      onChange={handleInputChange}
                      className="glass-field w-full appearance-none rounded-lg border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-900 shadow-sm focus:border-moss focus:outline-none focus:ring-2 focus:ring-moss/20"
                    >
                      <option value="">Select profession</option>
                      {PROFESSION_OPTIONS.filter((option) => option.value).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                <div className="rounded-xl border border-slate-200/80 bg-white/70 p-4">
                  <p className="text-sm font-semibold text-slate-900">Recommended EMI Range</p>
                  <p className="mt-2 text-xs text-slate-600">
                    Based on your income, monthly EMI should not exceed 40-50% of your monthly income.
                  </p>
                </div>
              </div>
            )}

            {/* Vehicle Info */}
            {step === 'vehicle' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900">Vehicle & Financing Details</h2>
                <div>
                  <label className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
                    <span>Car Price</span>
                    <span className="font-mono text-moss">{formatBDT(application.carPrice || 0)}</span>
                  </label>
                  <input
                    type="number"
                    name="carPrice"
                    value={application.carPrice || ''}
                    onChange={handleInputChange}
                    className="glass-field w-full rounded-lg px-4 py-3 text-sm"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-ink">Bank</label>
                    <select
                      name="selectedBankId"
                      value={application.selectedBankId || ''}
                      onChange={(e) => {
                        const bankId = e.target.value;
                        const newBank = banks.find((b) => b.id === bankId);
                        setApplication((prev) => ({
                          ...prev,
                          selectedBankId: bankId,
                          selectedSchemeId: newBank?.schemes?.[0]?.id,
                        }));
                      }}
                      className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-900 shadow-sm focus:border-moss focus:outline-none focus:ring-2 focus:ring-moss/20"
                    >
                      {banks.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-ink">Scheme</label>
                    <select
                      name="selectedSchemeId"
                      value={application.selectedSchemeId || ''}
                      onChange={(e) =>
                        setApplication((prev) => ({
                          ...prev,
                          selectedSchemeId: e.target.value,
                        }))
                      }
                      className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-900 shadow-sm focus:border-moss focus:outline-none focus:ring-2 focus:ring-moss/20"
                    >
                      {selectedBank?.schemes?.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.rate}%)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-2 flex items-center justify-between text-sm font-semibold text-ink">
                    <span>Tenure (months)</span>
                    <span className="font-mono text-moss">{application.tenure}</span>
                  </label>
                  <input
                    type="range"
                    name="tenure"
                    min="12"
                    max={selectedScheme?.maxTenure || 72}
                    step="6"
                    value={application.tenure || 48}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Review */}
            {step === 'review' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-ink">Review Your Application</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border border-black/5 bg-sand/10 p-4">
                    <p className="text-xs uppercase tracking-[0.1em] text-smoke">Personal</p>
                    <div className="mt-3 space-y-2 text-sm">
                      <div>
                        <span className="text-smoke">Name:</span>
                        <span className="ml-2 font-semibold text-ink">{application.fullName}</span>
                      </div>
                      <div>
                        <span className="text-smoke">Email:</span>
                        <span className="ml-2 font-semibold text-ink">{application.email}</span>
                      </div>
                      <div>
                        <span className="text-smoke">Phone:</span>
                        <span className="ml-2 font-semibold text-ink">{application.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-black/5 bg-sand/10 p-4">
                    <p className="text-xs uppercase tracking-[0.1em] text-smoke">Financial</p>
                    <div className="mt-3 space-y-2 text-sm">
                      <div>
                        <span className="text-smoke">Monthly Income:</span>
                        <span className="ml-2 font-semibold text-ink">{formatBDT(application.monthlyIncome || 0)}</span>
                      </div>
                      <div>
                        <span className="text-smoke">Employment:</span>
                        <span className="ml-2 font-semibold text-ink capitalize">
                          {application.employmentType}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-moss/30 bg-moss/5 p-6">
                  <p className="text-xs uppercase tracking-[0.1em] text-moss mb-4">Loan Summary</p>
                  <div className="grid gap-4 text-sm md:grid-cols-4">
                    <div>
                      <p className="text-xs text-smoke">Car Price</p>
                      <p className="mt-1 font-bold text-ink">{formatBDT(application.carPrice || 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-smoke">Loan Amount</p>
                      <p className="mt-1 font-bold text-ink">{formatBDT(loanAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-smoke">Monthly EMI</p>
                      <p className="mt-1 font-bold text-moss">{formatBDT(Math.round(emi))}</p>
                    </div>
                    <div>
                      <p className="text-xs text-smoke">Tenure</p>
                      <p className="mt-1 font-bold text-ink">{application.tenure} months</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {submitError ? (
              <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {submitError}
              </div>
            ) : null}

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4 border-t border-black/5 pt-6">
              {step !== 'personal' && (
                <button
                  onClick={() => {
                    if (step === 'financial') setStep('personal');
                    else if (step === 'vehicle') setStep('financial');
                    else if (step === 'review') setStep('vehicle');
                  }}
                  className="flex-1 rounded-lg border border-black/10 px-4 py-3 text-sm font-semibold text-ink transition hover:bg-sand"
                >
                  Previous
                </button>
              )}
              <button
                onClick={() => {
                  if (step === 'review') {
                    void submitApplication();
                    return;
                  }

                  handleSubmit();
                }}
                disabled={isSubmitting}
                className="flex-1 rounded-lg bg-moss px-4 py-3 text-sm font-semibold text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {step === 'review' ? (isSubmitting ? 'Submitting…' : 'Submit Application') : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

