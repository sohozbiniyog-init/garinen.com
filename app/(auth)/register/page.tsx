'use client';

import { Suspense } from 'react';
import { AuthCard } from '@/components/auth-card';

function RegisterContent() {
  return (
    <AuthCard initialMode="signup" />
  );
}

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6 py-10">
      <Suspense fallback={<div className="w-full rounded-[2rem] border border-black/10 bg-white/85 p-8 shadow-soft h-64" />}>
        <RegisterContent />
      </Suspense>
    </main>
  );
}