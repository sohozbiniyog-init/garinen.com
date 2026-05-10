import BuyerWishlistAndApps from '@/components/buyers/WishlistAndApps';

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <h2 className="text-2xl font-bold">Buyer Dashboard</h2>
      <p className="mt-2 text-sm text-slate-300">Your wishlist and EMI applications.</p>
      <BuyerWishlistAndApps />
    </main>
  );
}

