'use client';

import Link from 'next/link';
import { useBankRates } from '@/lib/contexts/bank-rates';
import { useState, useEffect } from 'react';

interface Props {
  carPrice?: number;
}

export default function EmiCalculator({ carPrice: initialPrice = 3000000 }: Props) {
  const { banks } = useBankRates();
  const [carPrice, setCarPrice] = useState(initialPrice);
  const [downPct, setDownPct] = useState(30);
  const [tenure, setTenure] = useState(48);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(banks[0]?.id ?? null);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(banks[0]?.schemes?.[0]?.id ?? null);
  const [interestRate, setInterestRate] = useState(0);

  const selectedBankData = banks.find((b) => b.id === selectedBankId) ?? banks[0];
  const selectedScheme = selectedBankData?.schemes?.find((s) => s.id === selectedSchemeId) ?? selectedBankData?.schemes?.[0];

  const downPayment = Math.round((downPct / 100) * carPrice);
  const loanAmount = carPrice - downPayment;

  const monthlyRate = interestRate / 100 / 12;
  const emi =
    loanAmount *
    ((monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1));

  const totalPayable = emi * tenure;
  const totalInterest = totalPayable - loanAmount;

  useEffect(() => {
    if (selectedScheme) {
      setInterestRate(selectedScheme.rate);
      // ensure tenure does not exceed scheme maxTenure
      if (tenure > selectedScheme.maxTenure) setTenure(selectedScheme.maxTenure);
    }
  }, [selectedBankId, selectedSchemeId, selectedScheme]);

  const formatBDT = (amount: number) => '৳ ' + Math.round(amount).toLocaleString('en-IN');

  return (
    <div className="w-full max-w-md overflow-hidden rounded-[1.5rem] border border-black/10 bg-white/85 p-4 text-ink shadow-soft lg:p-5">
      {/* Controls - Compact */}
      <div className="space-y-4 lg:space-y-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-smoke">Financing Tool</p>
          <h2 className="mt-1 text-2xl font-bold text-ink lg:text-[1.7rem]">
            EMI <span className="text-clay">Calculator</span>
          </h2>
        </div>

        {/* Bank Selection */}
        <div>
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-smoke">
            Bank and Scheme
          </label>
          <div className="flex flex-wrap gap-2">
            {banks.map((bank) => (
              <div key={bank.id} className="flex items-center gap-2">
                <button onClick={() => { setSelectedBankId(bank.id); setSelectedSchemeId(bank.schemes?.[0]?.id ?? null); }} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${selectedBankId===bank.id?'bg-moss text-white':'border border-black/10 bg-white text-ink'}`}>{bank.name}</button>
                {selectedBankId === bank.id && bank.schemes?.length > 1 && (
                  <div className="flex gap-1.5">
                    {bank.schemes.map((s) => (
                      <button key={s.id} onClick={() => setSelectedSchemeId(s.id)} className={`rounded-full px-2.5 py-1 text-[11px] ${selectedSchemeId===s.id?'bg-clay text-white':'border border-black/10 bg-white text-ink'}`}>{s.name}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Car Price */}
        <div>
          <label className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-smoke">
            <span>Car Price</span>
            <span className="font-mono text-ink">{formatBDT(carPrice)}</span>
          </label>
          <input
            type="range"
            min="500000"
            max="50000000"
            step="50000"
            value={carPrice}
            onChange={(e) => setCarPrice(+e.target.value)}
            className="w-full"
          />
          <div className="mt-2 flex gap-2 text-[11px] text-black">
            <button
              onClick={() => setCarPrice(1500000)}
              className="rounded-full border border-black/10 px-2.5 py-1 hover:bg-brand-red/10"
            >
              15L
            </button>
            <button
              onClick={() => setCarPrice(2500000)}
              className="rounded-full border border-black/10 px-2.5 py-1 hover:bg-brand-red/10"
            >
              25L
            </button>
            <button
              onClick={() => setCarPrice(5000000)}
              className="rounded-full border border-black/10 px-2.5 py-1 hover:bg-brand-red/10"
            >
              50L
            </button>
          </div>
        </div>

        {/* Down Payment */}
        <div>
          <label className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-smoke">
            <span>Down Payment</span>
            <span className="font-mono text-ink">
              {downPct}% ({formatBDT(downPayment)})
            </span>
          </label>
          <input
            type="range"
            min="10"
            max="60"
            value={downPct}
            onChange={(e) => setDownPct(+e.target.value)}
            className="w-full"
          />
        </div>

        {/* Tenure */}
        <div>
          <label className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-smoke">
            <span>Tenure</span>
            <span className="font-mono text-ink">{tenure} months</span>
          </label>
          <input
            type="range"
            min="12"
            max={selectedScheme?.maxTenure || 72}
            step="6"
            value={tenure}
            onChange={(e) => setTenure(+e.target.value)}
            className="w-full"
          />
        </div>

        {/* Interest Rate */}
        <div>
          <label className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-smoke">
            <span>Interest Rate</span>
            <span className="font-mono text-ink">{interestRate.toFixed(2)}%</span>
          </label>
          <input
            type="range"
            min="8"
            max="18"
            step="0.5"
            value={interestRate}
            onChange={(e) => setInterestRate(+e.target.value)}
            className="w-full"
          />
          <p className="mt-1.5 text-[11px] text-smoke">Default: {selectedScheme?.rate}%</p>
        </div>
      </div>

      {/* Result - Right Side */}
      <div className="space-y-4 rounded-[1.25rem] border border-black/5 bg-sand/20 p-4 text-ink shadow-soft">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-smoke">Estimated Monthly EMI</p>
          <div className="mt-2 flex flex-col gap-1">
            <div className="text-3xl font-bold leading-none text-ink lg:text-[2.25rem]">
              {formatBDT(Math.round(emi))}
            </div>
            <div className="text-sm font-semibold leading-none text-smoke">
              per month
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-lg bg-white p-3 text-[11px] lg:gap-3 lg:p-3">
          <div className="space-y-1 text-center lg:space-y-2">
            <div className="font-semibold text-ink">{formatBDT(loanAmount)}</div>
            <div className="text-xs text-smoke">Loan amount</div>
          </div>
          <div className="border-l border-r border-black/10">
            <div className="space-y-1 px-2 text-center lg:space-y-2">
              <div className="font-semibold text-clay">{formatBDT(Math.round(totalInterest))}</div>
              <div className="text-xs text-smoke">Interest</div>
            </div>
          </div>
          <div className="space-y-1 text-center lg:space-y-2">
            <div className="font-semibold text-moss">{formatBDT(Math.round(totalPayable))}</div>
            <div className="text-xs text-smoke">Total payable</div>
          </div>
        </div>

        <Link href="/apply-for-loan" className="block w-full rounded-full bg-moss px-4 py-2 text-center text-xs font-semibold text-white transition hover:bg-opacity-90 lg:text-sm">
          Apply for Loan
        </Link>

        <p className="text-center text-[11px] leading-5 text-smoke">
          Estimates use the selected bank rate. Final approval depends on the lender.
        </p>
      </div>
    </div>
  );
}

