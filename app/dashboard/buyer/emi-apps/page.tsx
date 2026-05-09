import BuyerWishlistAndApps from '@/components/BuyerWishlistAndApps';

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <h2 className="text-2xl font-bold">Buyer Dashboard — EMI Applications</h2>
      <p className="mt-2 text-sm text-smoke">Track your loan applications and drafts.</p>
      <BuyerWishlistAndApps />
    </main>
  );
}
