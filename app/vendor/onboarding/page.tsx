import { Suspense } from 'react';
import VendorOnboardingForm from './vendor-onboarding-form';

export default function VendorOnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <VendorOnboardingForm />
    </Suspense>
  );
}

