"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderLock,
  ShieldCheck,
  Radio,
  Settings,
  AlertTriangle,
  Shield,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Documents", icon: FolderLock, href: "/documents" },
  { label: "Security", icon: ShieldCheck, href: "/security" },
  { label: "Vault Shield", icon: Radio, href: "/shield" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function VaultSidebar({ hasGuardians = false }: { hasGuardians?: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-[62px] bottom-0 w-[240px] bg-vault-surface/50 backdrop-blur-sm border-r border-white/[0.06] flex flex-col z-40">
      <nav className="flex-1 flex flex-col gap-1 p-3 pt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-sans transition-all duration-200",
                isActive
                  ? "bg-vault-gold/[0.08] border-r-2 border-vault-gold text-vault-gold font-medium"
                  : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {!hasGuardians && (
        <div className="m-3 p-3 rounded-xl bg-amber-500/[0.08] border border-amber-500/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-amber-400 font-mono">No Guardians Set</p>
              <p className="text-xs text-muted-foreground mt-0.5">Recovery without them takes 5+ days.</p>
              <Link href="/security" className="text-xs text-amber-400 hover:underline mt-1 block">
                Add guardians →
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="p-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 px-3 py-2">
          <Shield className="h-4 w-4 text-vault-gold" />
          <div>
            <p className="text-xs font-mono text-vault-gold">VAULT</p>
            <p className="text-[10px] text-muted-foreground">Polygon zkEVM</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
