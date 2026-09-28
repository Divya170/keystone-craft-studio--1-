import { AdminAuthProvider } from '@/lib/admin-auth-context';

export const metadata = { title: 'Admin' };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <div className="min-h-screen bg-paper text-ink">{children}</div>
    </AdminAuthProvider>
  );
}
