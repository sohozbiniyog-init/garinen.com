export default function AdminLoanApplicationsPage() {
  const draft = {
    applicationStatus: 'DRAFT',
    bank: 'BRAC Bank',
    vehicle: 'Toyota Corolla 2022',
    budget: 2500000,
    downPayment: 250000,
    documents: ['NID', 'Photo', 'Income proof', 'Address proof'],
    nextStep: 'Collect personal documents in person, then mark as submitted'
  };

  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      <section className="mb-8">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Admin</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Loan Applications</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Review buyer drafts, confirm in-person documents, and move applications to submitted for bank officers.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="glass-card rounded-[2rem] p-6 shadow-soft">
          <h2 className="text-2xl font-bold text-ink">Review Queue</h2>
          <div className="mt-4 rounded-2xl border border-white/30 bg-white/70 p-4 text-sm text-ink">
            No cloud uploads in v1. The buyer must bring documents in person before submission.
          </div>
          <div className="mt-4 space-y-3 text-sm text-smoke">
            <div>Application status: <strong className="text-ink">{draft.applicationStatus}</strong></div>
            <div>Partner bank: <strong className="text-ink">{draft.bank}</strong></div>
            <div>Vehicle: <strong className="text-ink">{draft.vehicle}</strong></div>
            <div>Budget: <strong className="text-ink">৳ {draft.budget.toLocaleString('en-IN')}</strong></div>
            <div>Down payment: <strong className="text-ink">৳ {draft.downPayment.toLocaleString('en-IN')}</strong></div>
          </div>
        </section>

        <section className="glass-card rounded-[2rem] p-6 shadow-soft">
          <h2 className="text-2xl font-bold text-ink">Admin JSON Preview</h2>
          <p className="mt-2 text-sm text-smoke">This is the normalized payload the backend can later post to partner bank systems.</p>
          <pre className="mt-4 max-h-[520px] overflow-auto rounded-2xl bg-ink p-4 text-[11px] leading-5 text-white/75">
{JSON.stringify(draft, null, 2)}
          </pre>
          <div className="mt-4 flex gap-3">
            <button className="rounded-full bg-moss px-4 py-3 text-sm font-semibold text-white">Mark Submitted</button>
            <button className="rounded-full border border-white/30 bg-white/80 px-4 py-3 text-sm font-semibold text-ink">Needs Info</button>
          </div>
        </section>
      </div>
    </main>
  );
}
