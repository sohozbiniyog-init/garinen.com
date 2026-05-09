import EmiCalculator from '@/components/emi-calculator';

export default function EmiToolsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-10 lg:px-6">
      <section className="mb-10 max-w-3xl">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Financing Solutions</p>
        <h1 className="mt-3 text-4xl font-bold text-white">EMI Calculator</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Calculate your monthly EMI installment for any car. Adjust your down payment, tenure, and
          bank scheme to find the best option for your budget.
        </p>
      </section>

      <div className="flex justify-center">
        <EmiCalculator />
      </div>

      <section className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-[2rem] border border-black/10 bg-white/80 p-6 shadow-soft">
          <h3 className="text-lg font-bold text-ink">📊 How EMI Works</h3>
          <p className="mt-3 text-sm leading-6 text-smoke">
            EMI (Equated Monthly Installment) is a fixed amount you pay monthly to repay your car
            loan over the agreed tenure.
          </p>
        </div>

        <div className="rounded-[2rem] border border-black/10 bg-white/80 p-6 shadow-soft">
          <h3 className="text-lg font-bold text-ink">💰 Down Payment Guide</h3>
          <p className="mt-3 text-sm leading-6 text-smoke">
            A higher down payment reduces your monthly EMI but requires more upfront cash. Most banks
            allow 10–60% down payment.
          </p>
        </div>

        <div className="rounded-[2rem] border border-black/10 bg-white/80 p-6 shadow-soft">
          <h3 className="text-lg font-bold text-ink">⏱️ Tenure Selection</h3>
          <p className="mt-3 text-sm leading-6 text-smoke">
            Longer tenure means lower EMI but higher total interest. Choose based on your monthly
            budget and preference.
          </p>
        </div>
      </section>

      <section className="mt-10 rounded-[2rem] border border-black/10 bg-sand/10 p-8 shadow-soft">
        <h3 className="text-2xl font-bold text-white">Banks Available in Ghuri Automobiles</h3>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h4 className="font-semibold text-white">BRAC Bank</h4>
            <ul className="mt-2 space-y-1 text-sm text-slate-300">
              <li>✓ Competitive interest rates (from 11%)</li>
              <li>✓ Flexible tenure up to 72 months</li>
              <li>✓ Quick approval process</li>
              <li>✓ Serving over 10 million customers</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white">City Bank</h4>
            <ul className="mt-2 space-y-1 text-sm text-slate-300">
              <li>✓ Islamic and conventional options</li>
              <li>✓ Tenure up to 72 months</li>
              <li>✓ Transparent pricing</li>
              <li>✓ Expert financial guidance</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
