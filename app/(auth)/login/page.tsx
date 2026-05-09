'use client';

import { Suspense } from 'react';
import { AuthCard } from '@/components/auth-card';

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md items-center px-6 py-12">
      <Suspense fallback={<div className="h-64 w-full rounded-[2rem] border border-black/10 bg-white/85 p-8 shadow-soft" />}>
        <AuthCard />
      </Suspense>
    </main>
  );
}