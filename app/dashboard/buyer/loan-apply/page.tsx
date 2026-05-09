import { LoanApplicationForm, LoanPrefill } from '@/components/loan-application-form';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BuyerLoanApplyPage({ searchParams }: { searchParams: SearchParams }) {
  const resolvedSearchParams = await searchParams;
  const prefill: LoanPrefill = {
    listingId: getParam(resolvedSearchParams.listingId),
    title: getParam(resolvedSearchParams.title),
    brand: getParam(resolvedSearchParams.brand),
    model: getParam(resolvedSearchParams.model),
    year: getParam(resolvedSearchParams.year) ? Number(getParam(resolvedSearchParams.year)) : undefined,
    price: getParam(resolvedSearchParams.price) ? Number(getParam(resolvedSearchParams.price)) : undefined,
    location: getParam(resolvedSearchParams.location)
  };

  const hasPrefill = Boolean(prefill.title || prefill.listingId);

  return (
    <main className="min-h-screen w-full px-6 py-10 lg:px-10">
      <LoanApplicationForm prefill={hasPrefill ? prefill : undefined} />
    </main>
  );
}
