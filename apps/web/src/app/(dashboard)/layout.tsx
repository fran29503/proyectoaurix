import { Sidebar } from "@/components/shared/sidebar";
import { Header } from "@/components/shared/header";
import { TenantWrapper } from "@/components/providers/tenant-wrapper";
import { MobileSidebarProvider } from "@/components/shared/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TenantWrapper>
      <MobileSidebarProvider>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <Sidebar />

          {/* Main content */}
          <div className="flex flex-1 flex-col overflow-hidden min-w-0">
            <Header />
            <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      </MobileSidebarProvider>
    </TenantWrapper>
  );
}
