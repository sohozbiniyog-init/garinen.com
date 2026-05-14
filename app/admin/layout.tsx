import AdminTopNav from '@/components/admin/TopNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-transparent text-white admin-minimal">
      
      <AdminTopNav />
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}

