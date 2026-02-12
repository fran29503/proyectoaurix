import { Sidebar } from "@/components/shared/sidebar";
import { Header } from "@/components/shared/header";
import { TenantWrapper } from "@/components/providers/tenant-wrapper";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TenantWrapper>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto bg-slate-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </TenantWrapper>
  );
}
