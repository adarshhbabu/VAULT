"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, AlertTriangle, Lock, Users, Mail, Smartphone, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "recovery" | "threats" | "protection";

const THREAT_ALERTS = [
  { severity: "high", type: "Unauthorized recovery attempt", time: "2h ago", device: "Unknown device", detail: "Failed to complete eKYC step" },
  { severity: "medium", type: "New device login", time: "1 day ago", device: "Chrome on Windows", detail: "Confirmed by you" },
  { severity: "low", type: "Guardian invite sent", time: "2 days ago", device: "Your iPhone", detail: "Priya S. invited as guardian" },
];

const NULLIFIERS = [
  { name: "Aadhaar Card", hash: "0xf3a2c1d4e5b6...a7b8", onChain: true },
  { name: "PAN Card", hash: "0xd2e3f4a5b6c7...b8c9", onChain: true },
  { name: "Passport", hash: "0xe4f5a6b7c8d9...c9d0", onChain: true },
  { name: "B.Tech Degree", hash: "0xa6b7c8d9e0f1...d0e1", onChain: true },
  { name: "Driving Licence", hash: "0xb8c9d0e1f2a3...e1f2", onChain: false },
];

export default function SecurityPage() {
  const [tab, setTab] = useState<Tab>("recovery");
  const [guardians, setGuardians] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("adarsh_guardians");
    if (saved) {
      setGuardians(JSON.parse(saved));
    }
  }, []);

  const addGuardian = () => {
    if (guardians.length < 3) {
      const guardianNames = ["Priya S.", "Amit K.", "Neha R."];
      const newGuardian = guardianNames[guardians.length];
      const updated = [...guardians, newGuardian];
      setGuardians(updated);
      localStorage.setItem("adarsh_guardians", JSON.stringify(updated));
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "recovery", label: "Account Recovery", icon: Lock },
    { key: "threats", label: "Threat Alerts", icon: AlertTriangle },
    { key: "protection", label: "Doc Protection", icon: ShieldCheck },
  ];

  return (
    <div>
      <div className="mb-8">
        <p className="font-mono text-[11px] text-muted-foreground tracking-[3px] uppercase mb-1">Security Centre</p>
        <h1 className="font-sans text-3xl font-bold">Security & Recovery</h1>
        <p className="text-muted-foreground text-sm font-sans mt-1">Manage recovery methods, threats, and document protection.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-vault-surface/50 border border-white/[0.06] rounded-xl p-1 mb-8 w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-sans transition-all",
              tab === t.key ? "bg-vault-gold/[0.08] text-vault-gold font-medium" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Recovery Tab */}
      {tab === "recovery" && (
        <div className="flex flex-col gap-6">
          <div className="bg-vault-surface/80 border border-white/[0.07] rounded-2xl p-6">
            <h2 className="font-sans font-semibold text-lg mb-5">Recovery Methods</h2>
            <div className="flex flex-col gap-4">
              {[
                { icon: Users, label: "Guardians", status: guardians.length + " / 3 set", ok: guardians.length > 0, action: "View" },
                { icon: Mail, label: "Email Recovery", status: "Not configured", ok: false, action: "Configure →" },
                { icon: Lock, label: "Recovery Code", status: "Set", ok: true, action: "Change →" },
                { icon: Smartphone, label: "Trusted Device", status: "Adarsh's A35", ok: true, action: "Manage →" },
              ].map((m) => (
                <div key={m.label} className="flex items-center justify-between py-3 border-b border-white/[0.05] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-vault-surface2 flex items-center justify-center">
                      <m.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-sans text-sm font-medium">{m.label}</p>
                      <p className={cn("font-mono text-[11px]", m.ok ? "text-vault-teal" : "text-vault-red")}>{m.status}</p>
                    </div>
                  </div>
                  <button className="text-xs text-vault-gold hover:underline font-mono">{m.action}</button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-vault-surface/80 border border-white/[0.07] rounded-2xl p-6">
            <h2 className="font-sans font-semibold text-lg mb-5">Guardian Slots</h2>
            <div className="flex flex-col gap-3">
              {[0, 1, 2].map(i => (
                <div key={i} className="flex items-center gap-3 border border-dashed border-white/[0.12] rounded-xl p-3">
                  <div className="w-9 h-9 rounded-full bg-vault-surface2 flex items-center justify-center">
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground font-sans">+ Add guardian {i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Threats Tab */}
      {tab === "threats" && (
        <div className="flex flex-col gap-4">
          {THREAT_ALERTS.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle className="h-12 w-12 text-vault-teal mx-auto mb-4" />
              <p className="font-sans font-semibold">All clear — no suspicious activity</p>
            </div>
          ) : THREAT_ALERTS.map((alert, i) => (
            <div key={i} className={cn("border rounded-xl p-4 flex items-start gap-4",
              alert.severity === "high" ? "border-vault-red/20 bg-vault-red/[0.03]"
              : alert.severity === "medium" ? "border-amber-400/20 bg-amber-400/[0.03]"
              : "border-vault-teal/20 bg-vault-teal/[0.03]"
            )}>
              <span className={cn("border rounded-full px-2 py-0.5 font-mono text-[10px] shrink-0 mt-0.5",
                alert.severity === "high" ? "bg-vault-red/10 text-vault-red border-vault-red/20"
                : alert.severity === "medium" ? "bg-amber-400/10 text-amber-400 border-amber-400/20"
                : "bg-vault-teal/10 text-vault-teal border-vault-teal/20"
              )}>{alert.severity.toUpperCase()}</span>
              <div className="flex-1">
                <p className="font-sans font-medium text-sm">{alert.type}</p>
                <p className="font-mono text-[11px] text-muted-foreground mt-0.5">{alert.time} · {alert.device}</p>
                <p className="text-xs text-muted-foreground font-sans mt-1">{alert.detail}</p>
              </div>
              <button className="text-xs text-muted-foreground hover:text-foreground font-mono shrink-0">Dismiss</button>
            </div>
          ))}
        </div>
      )}

      {/* Protection Tab */}
      {tab === "protection" && (
        <div>
          <div className="bg-vault-surface2/30 border border-vault-teal/10 rounded-xl p-4 mb-6 text-sm text-muted-foreground font-sans">
            <strong className="text-foreground">What are nullifiers?</strong> Each document minted on-chain gets a unique cryptographic nullifier hash. This prevents anyone from minting the same document twice, protecting you from duplicate identity attacks.
          </div>
          <div className="bg-vault-surface/60 border border-white/[0.07] rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-white/[0.06]">
                <tr>
                  {["Document", "Nullifier Hash", "Status"].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {NULLIFIERS.map((n, i) => (
                  <tr key={i} className="border-b border-white/[0.04] last:border-0">
                    <td className="px-4 py-3 font-sans text-sm">{n.name}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{n.hash}</td>
                    <td className="px-4 py-3">
                      {n.onChain
                        ? <span className="bg-vault-teal/10 text-vault-teal border border-vault-teal/20 rounded-full px-2 py-0.5 font-mono text-[10px]">On-chain ✓</span>
                        : <span className="bg-white/5 text-muted-foreground border border-white/[0.07] rounded-full px-2 py-0.5 font-mono text-[10px]">Local only</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
