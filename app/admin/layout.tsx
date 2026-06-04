import AdminTopNav from '@/components/admin/TopNav';
import { FeaturedProvider } from '@/lib/contexts/featured';
import { cookies } from 'next/headers';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  const [approvedListingsRes, featuredRecordsRes] = await Promise.all([
    fetch(`${baseUrl}/api/admin/listings`, {
      headers: { Cookie: cookieHeader },
      cache: 'no-store',
    }),
    fetch(`${baseUrl}/api/featured?status=APPROVED&details=true`, {
      headers: { Cookie: cookieHeader },
      cache: 'no-store',
    }),
  ]);

  const initialListings = approvedListingsRes.ok
    ? (await approvedListingsRes.json()).listings || []
    : [];

  const initialFeatured = featuredRecordsRes.ok ? await featuredRecordsRes.json() : [];

  return (
    <FeaturedProvider initialListings={initialListings} initialFeatured={initialFeatured}>
      <div className="min-h-screen bg-transparent text-white admin-minimal">
        <AdminTopNav />
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      </div>
    </FeaturedProvider>
  );
}


