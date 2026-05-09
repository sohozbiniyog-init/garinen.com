'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface BankScheme {
  id: string;
  name: string; // scheme name (e.g., "BRAC Bank - Standard")
  rate: number;
  maxTenure: number;
  maxLtv: number;
}

export interface Bank {
  id: string;
  name: string;
  schemes: BankScheme[];
}

interface BankRatesContextType {
  banks: Bank[];
  addBank: (name: string) => void;
  removeBank: (id: string) => void;
  updateBank: (id: string, data: Partial<Bank>) => void;
  addScheme: (bankId: string, scheme: Omit<BankScheme, 'id'>) => void;
  updateScheme: (bankId: string, schemeId: string, data: Partial<BankScheme>) => void;
  removeScheme: (bankId: string, schemeId: string) => void;
}

const BankRatesContext = createContext<BankRatesContextType | undefined>(undefined);

const defaultBanks: Bank[] = [
  {
    id: 'brac',
    name: 'BRAC Bank',
    schemes: [
      { id: 'brac-standard', name: 'Standard', rate: 11.0, maxTenure: 72, maxLtv: 70 },
    ],
  },
  {
    id: 'city',
    name: 'City Bank',
    schemes: [
      { id: 'city-standard', name: 'Standard', rate: 12.0, maxTenure: 72, maxLtv: 70 },
    ],
  },
];

function genId(prefix = '') {
  return prefix + Math.random().toString(36).slice(2, 9);
}

export function BankRatesProvider({ children }: { children: ReactNode }) {
  const [banks, setBanks] = useState<Bank[]>(defaultBanks);

  const addBank = (name: string) => {
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + genId();
    setBanks((prev) => [...prev, { id, name, schemes: [] }]);
  };

  const removeBank = (id: string) => {
    setBanks((prev) => prev.filter((b) => b.id !== id));
  };

  const updateBank = (id: string, data: Partial<Bank>) => {
    setBanks((prev) => prev.map((b) => (b.id === id ? { ...b, ...data } : b)));
  };

  const addScheme = (bankId: string, scheme: Omit<BankScheme, 'id'>) => {
    setBanks((prev) =>
      prev.map((b) =>
        b.id === bankId
          ? { ...b, schemes: [...b.schemes, { ...scheme, id: genId('sch-') }] }
          : b
      )
    );
  };

  const updateScheme = (bankId: string, schemeId: string, data: Partial<BankScheme>) => {
    setBanks((prev) =>
      prev.map((b) =>
        b.id === bankId
          ? { ...b, schemes: b.schemes.map((s) => (s.id === schemeId ? { ...s, ...data } : s)) }
          : b
      )
    );
  };

  const removeScheme = (bankId: string, schemeId: string) => {
    setBanks((prev) => prev.map((b) => (b.id === bankId ? { ...b, schemes: b.schemes.filter((s) => s.id !== schemeId) } : b)));
  };

  return (
    <BankRatesContext.Provider value={{ banks, addBank, removeBank, updateBank, addScheme, updateScheme, removeScheme }}>
      {children}
    </BankRatesContext.Provider>
  );
}

export function useBankRates() {
  const context = useContext(BankRatesContext);
  if (!context) {
    throw new Error('useBankRates must be used within BankRatesProvider');
  }
  return context;
}
