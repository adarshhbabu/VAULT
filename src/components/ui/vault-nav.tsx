"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, Lock, ChevronDown, Settings, LogOut, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function VaultNav() {
  const [verifyUrl, setVerifyUrl] = useState("");
  const [verifyResult, setVerifyResult] = useState<"verified" | "failed" | null>(null);
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    if (!verifyUrl.trim()) return;
    setVerifying(true);
    setVerifyResult(null);
    await new Promise((r) => setTimeout(r, 2200));
    setVerifyResult(Math.random() > 0.3 ? "verified" : "failed");
    setVerifying(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-[62px] bg-vault-obsidian/90 backdrop-blur-xl border-b border-white/[0.06] z-50 flex items-center px-4 gap-4">
      {/* Left: Vault Brand */}
      <Link href="/" className="flex items-center gap-2.5 w-[200px] shrink-0">
        <div className="relative">
          <Shield className="h-6 w-6 text-vault-gold" />
          <div className="absolute inset-0 rounded-full blur-sm bg-vault-gold/20" />
        </div>
        <div>
          <span className="font-serif text-lg font-bold tracking-[0.1em] text-foreground">VAULT</span>
          <p className="font-mono text-[9px] text-muted-foreground tracking-widest -mt-0.5">document safe</p>
        </div>
      </Link>

      {/* Center: ZKP URL Verifier */}
      <div className="flex-1 flex items-center gap-2 max-w-[520px] mx-auto">
        <div className="flex-1 relative">
          <input
            value={verifyUrl}
            onChange={(e) => setVerifyUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            placeholder="Paste a URL to verify via ZKP..."
            className="w-full h-9 bg-vault-deep border border-white/[0.08] rounded-lg px-3 text-[13px] font-mono text-foreground placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-vault-gold/40 focus:border-vault-gold/40"
          />
          {verifyResult && (
            <div className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full",
              verifyResult === "verified" ? "bg-vault-teal/10 text-vault-teal" : "bg-vault-red/10 text-vault-red"
            )}>
              {verifyResult === "verified" ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {verifyResult === "verified" ? "Verified" : "Failed"}
            </div>
          )}
        </div>
        <button
          onClick={handleVerify}
          disabled={verifying}
          className="h-9 px-4 bg-gradient-to-r from-vault-gold to-vault-goldLight text-[#0a0b08] text-sm font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 shrink-0"
        >
          {verifying ? "Verifying..." : "Verify"}
        </button>
      </div>

      {/* Right: User Info */}
      <div className="w-[200px] flex items-center justify-end gap-3">
        <div className="flex items-center gap-2 bg-vault-surface/80 border border-white/[0.07] rounded-lg px-3 py-1.5">
          <div className="w-2 h-2 rounded-full bg-vault-teal animate-pulse" />
          <span className="font-mono text-xs text-foreground">Rahul</span>
          <Lock className="h-3 w-3 text-muted-foreground" />
        </div>
        <Link href="/settings" className="p-1.5 hover:bg-white/[0.04] rounded-lg transition-colors">
          <Settings className="h-4 w-4 text-muted-foreground" />
        </Link>
        <Link href="/login" className="p-1.5 hover:bg-white/[0.04] rounded-lg transition-colors">
          <LogOut className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>
    </header>
  );
}
