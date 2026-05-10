import AdminTopNav from '@/components/admin/TopNav';
import { SiteHeader } from '@/components/common/Header';
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-transparent text-white admin-minimal">
      <SiteHeader/>
      <AdminTopNav />
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}

