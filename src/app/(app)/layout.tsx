import { VaultNav } from "@/components/ui/vault-nav";
import { VaultSidebar } from "@/components/ui/vault-sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <VaultNav />
      <VaultSidebar hasGuardians={false} />
      <main className="ml-[240px] pt-[62px] min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
