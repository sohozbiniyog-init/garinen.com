'use client';

import { useBankRates, Bank, BankScheme } from '@/lib/contexts/bank-rates';
import { useState } from 'react';

type SchemeDraft = {
  rate?: number;
  maxTenure?: number;
  maxLtv?: number;
};

type TempValue = string | SchemeDraft;

const getSchemeDraft = (value: TempValue | undefined): SchemeDraft | undefined => {
  if (typeof value === 'object' && value !== null) {
    return value;
  }

  return undefined;
};

const getBankNameDraft = (value: TempValue | undefined): string => {
  return typeof value === 'string' ? value : '';
};

export default function AdminBankRatesPage() {
  const { banks, addBank, removeBank, updateBank, addScheme, updateScheme, removeScheme } = useBankRates();
  const [newBankName, setNewBankName] = useState('');
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [editingScheme, setEditingScheme] = useState<{ bankId: string; schemeId: string } | null>(null);
  const [temp, setTemp] = useState<Record<string, TempValue>>({});

  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      <section className="mb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Admin Tools</p>
        <h1 className="mt-3 text-4xl font-bold text-white">Bank Rates Management</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">Manage bank partners and their EMI schemes. Add banks, create schemes, and edit rates.</p>
      </section>

      <div className="mb-6 flex items-center gap-3">
        <input value={newBankName} onChange={(e)=>setNewBankName(e.target.value)} placeholder="New bank name" className="glass-field rounded-lg px-3 py-2 text-sm text-ink" />
        <button onClick={()=>{ if(newBankName.trim()) { addBank(newBankName.trim()); setNewBankName(''); } }} className="glass-button rounded-full px-4 py-2 text-sm font-semibold text-white">Add Bank</button>
      </div>

      <div className="space-y-6">
        {banks.map((bank: Bank) => (
          <div key={bank.id} className="glass-card overflow-hidden rounded-[2rem] shadow-soft">
            <div className="p-6 md:p-8">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-ink">{bank.name}</h3>
                  <p className="mt-1 text-sm text-smoke">ID: {bank.id}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>removeBank(bank.id)} className="rounded-full border border-white/30 bg-white/80 px-3 py-2 text-sm text-ink">Remove Bank</button>
                  <button onClick={()=>{ setEditingBankId(bank.id); setTemp((t)=>({ ...t, [bank.id]: bank.name })); }} className="rounded-full bg-sky-500 px-3 py-2 text-sm font-semibold text-white">Rename</button>
                </div>
              </div>

              {editingBankId === bank.id && (
                <div className="mb-4 flex gap-2">
                  <input value={getBankNameDraft(temp[bank.id])} onChange={(e)=>setTemp((t)=>({...t, [bank.id]: e.target.value}))} className="glass-field rounded-lg px-3 py-2 text-sm text-ink" />
                  <button onClick={()=>{ updateBank(bank.id, { name: getBankNameDraft(temp[bank.id]) || bank.name }); setEditingBankId(null); }} className="glass-button rounded-full px-3 py-2 text-sm font-semibold text-white">Save</button>
                  <button onClick={()=>setEditingBankId(null)} className="rounded-full border border-white/30 bg-white/80 px-3 py-2 text-sm text-ink">Cancel</button>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                {bank.schemes.map((scheme) => (
                  <div key={scheme.id} className="rounded-lg border border-white/30 bg-white/70 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-ink">{scheme.name}</div>
                        <div className="text-xs text-smoke">Rate: {scheme.rate}% • Tenure: {scheme.maxTenure} months • LTV: {scheme.maxLtv}%</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={()=>setEditingScheme({ bankId: bank.id, schemeId: scheme.id })} className="rounded-full border border-white/30 bg-white/80 px-3 py-1 text-sm text-ink">Edit</button>
                        <button onClick={()=>removeScheme(bank.id, scheme.id)} className="rounded-full border border-white/30 bg-white/80 px-3 py-1 text-sm text-ink">Delete</button>
                      </div>
                    </div>

                    {editingScheme?.bankId === bank.id && editingScheme?.schemeId === scheme.id && (
                      <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
                        <input type="number" step="0.5" min="6" max="24" value={getSchemeDraft(temp[scheme.id])?.rate ?? scheme.rate} onChange={(e)=>setTemp((current)=>({ ...current, [scheme.id]: { ...getSchemeDraft(current[scheme.id]), rate: parseFloat(e.target.value) } }))} className="glass-field rounded-lg px-3 py-2 text-sm text-ink" />
                        <input type="number" min="12" max="84" value={getSchemeDraft(temp[scheme.id])?.maxTenure ?? scheme.maxTenure} onChange={(e)=>setTemp((current)=>({ ...current, [scheme.id]: { ...getSchemeDraft(current[scheme.id]), maxTenure: parseInt(e.target.value) } }))} className="glass-field rounded-lg px-3 py-2 text-sm text-ink" />
                        <input type="number" min="30" max="100" value={getSchemeDraft(temp[scheme.id])?.maxLtv ?? scheme.maxLtv} onChange={(e)=>setTemp((current)=>({ ...current, [scheme.id]: { ...getSchemeDraft(current[scheme.id]), maxLtv: parseInt(e.target.value) } }))} className="glass-field rounded-lg px-3 py-2 text-sm text-ink" />
                        <div className="md:col-span-3 flex gap-2">
                          <button onClick={()=>{ const draft = getSchemeDraft(temp[scheme.id]); updateScheme(bank.id, scheme.id, { rate: draft?.rate ?? scheme.rate, maxTenure: draft?.maxTenure ?? scheme.maxTenure, maxLtv: draft?.maxLtv ?? scheme.maxLtv }); setEditingScheme(null); }} className="glass-button rounded-full px-4 py-2 text-sm font-semibold text-white">Save Scheme</button>
                          <button onClick={()=>setEditingScheme(null)} className="rounded-full border border-white/30 bg-white/80 px-4 py-2 text-sm text-ink">Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <div className="rounded-lg border border-white/30 bg-white/80 px-4 py-3 flex items-center">
                  <AddSchemeForm bankId={bank.id} addScheme={addScheme} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card mt-10 rounded-[2rem] p-6 shadow-soft">
        <p className="text-sm text-ink">
          <strong>💡 Tip:</strong> Changes here update the EMI calculator behavior site-wide.
        </p>
      </div>
    </main>
  );
}

function AddSchemeForm({ bankId, addScheme }: { bankId: string; addScheme: (bankId: string, scheme: Omit<BankScheme, 'id'>) => void }) {
  const [name, setName] = useState('Standard');
  const [rate, setRate] = useState(11);
  const [maxTenure, setMaxTenure] = useState(72);
  const [maxLtv, setMaxLtv] = useState(70);

  return (
    <div className="w-full">
      <div className="mb-2 text-sm font-semibold text-slate-600">Add scheme</div>
      <input value={name} onChange={(e)=>setName(e.target.value)} className="glass-field mb-2 w-full rounded-lg px-3 py-2 text-sm text-ink" />
      <div className="mb-2 grid grid-cols-3 gap-2">
        <input type="number" value={rate} onChange={(e)=>setRate(parseFloat(e.target.value))} className="glass-field rounded-lg px-3 py-2 text-sm text-ink" />
        <input type="number" value={maxTenure} onChange={(e)=>setMaxTenure(parseInt(e.target.value))} className="glass-field rounded-lg px-3 py-2 text-sm text-ink" />
        <input type="number" value={maxLtv} onChange={(e)=>setMaxLtv(parseInt(e.target.value))} className="glass-field rounded-lg px-3 py-2 text-sm text-ink" />
      </div>
      <button onClick={()=>{ addScheme(bankId, { name, rate, maxTenure, maxLtv }); setName('Standard'); setRate(11); setMaxTenure(72); setMaxLtv(70); }} className="glass-button rounded-full px-3 py-2 text-sm font-semibold text-white">Add Scheme</button>
    </div>
  );
}

