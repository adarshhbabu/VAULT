"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Phone, MessageSquare, ShieldCheck, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const SMS_MESSAGES = [
  { sender: "SBI", verified: "verified", preview: "Your OTP for account login is 847291.", detail: ["Signed token: ✓ Present", "DID match: ✓ Verified", "Registry: ✓ State Bank of India"] },
  { sender: "Fake SBI", verified: "failed", preview: "URGENT: Your SBI account will be suspended. Click: bit.ly/...", detail: ["Signed token: ✗ Absent", "DID match: ✗ No DID found", "Registry: ✗ Not registered"] },
  { sender: "IRCTC", verified: "verified", preview: "Your PNR 4521987634 is confirmed. Coach B3 Seat 42.", detail: ["Signed token: ✓ Present", "DID match: ✓ Verified", "Registry: ✓ Indian Railways"] },
  { sender: "HDFC Bank", verified: "unknown", preview: "Your credit card transaction of ₹2,340 was approved.", detail: ["Signed token: ⚠ Unverified", "DID match: ⚠ Pending", "Registry: ⚠ Under review"] },
  { sender: "Lottery Scam", verified: "failed", preview: "You have won ₹25 lakhs! Call now: +91-9876543210", detail: ["Signed token: ✗ Absent", "DID match: ✗ No DID found", "Registry: ✗ SPAM flagged"] },
];

const ORG_TABLE = [
  { org: "State Bank of India", did: "did:vault:0xSBI...a1b2", status: "Verified", date: "Jan 2025" },
  { org: "IRCTC", did: "did:vault:0xIRCTC...c3d4", status: "Verified", date: "Jan 2025" },
  { org: "Amazon India", did: "did:vault:0xAMZN...e5f6", status: "Verified", date: "Feb 2025" },
  { org: "Apollo Hospitals", did: "did:vault:0xAPOL...g7h8", status: "Verified", date: "Feb 2025" },
  { org: "HDFC Bank", did: "did:vault:0xHDFC...i9j0", status: "Pending", date: "Mar 2025" },
];

export default function ShieldPage() {
  const [selected, setSelected] = useState<number | null>(null);

  const badgeStyle = (v: string) =>
    v === "verified" ? "bg-vault-teal/10 text-vault-teal border-vault-teal/20"
    : v === "failed" ? "bg-vault-red/10 text-vault-red border-vault-red/20"
    : "bg-amber-400/10 text-amber-400 border-amber-400/20";

  const badgeLabel = (v: string) => v === "verified" ? "✓ Verified" : v === "failed" ? "✗ Unverified" : "⚠ Unknown";

  return (
    <div>
      <div className="mb-8">
        <p className="font-mono text-[11px] text-muted-foreground tracking-[3px] uppercase mb-1">Protection Layer</p>
        <h1 className="font-sans text-3xl font-bold flex items-center gap-2">
          <Shield className="h-7 w-7 text-vault-gold" /> Vault Shield
        </h1>
        <p className="text-muted-foreground text-sm font-sans mt-1">Cryptographic verification for every call and SMS.</p>
      </div>

      {/* SMS Inbox */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div>
          <h2 className="font-sans font-semibold mb-4">SMS Inbox</h2>
          <div className="flex flex-col gap-2">
            {SMS_MESSAGES.map((msg, i) => (
              <button key={i} onClick={() => setSelected(selected === i ? null : i)}
                className={cn("text-left bg-vault-surface border rounded-xl p-4 transition-all group",
                  selected === i ? "border-vault-gold/30" : "border-white/[0.07] hover:border-vault-gold/20"
                )}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-sans font-medium text-sm">{msg.sender}</span>
                  <span className={cn("border rounded-full px-2 py-0.5 font-mono text-[10px]", badgeStyle(msg.verified))}>
                    {badgeLabel(msg.verified)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-sans truncate">{msg.preview}</p>
                {selected === i && (
                  <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-col gap-1">
                    {msg.detail.map(d => (
                      <p key={d} className="font-mono text-[11px] text-muted-foreground">{d}</p>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Incoming Call Demo */}
        <div>
          <h2 className="font-sans font-semibold mb-4">Incoming Call Verification</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-vault-teal/[0.05] border border-vault-teal/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-vault-teal animate-pulse" />
                <span className="font-mono text-xs text-vault-teal font-semibold">✓ VERIFIED CALLER</span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-vault-teal/20 flex items-center justify-center">
                  <Phone className="h-6 w-6 text-vault-teal" />
                </div>
                <div>
                  <p className="font-sans font-bold">State Bank of India</p>
                  <p className="font-mono text-xs text-muted-foreground">+91-1800-11-2211</p>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 mb-4">
                {["Registered org ✓", "Signed token ✓", "DID verified ✓"].map(c => (
                  <div key={c} className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-vault-teal shrink-0" />
                    <span className="font-mono text-xs text-vault-teal">{c}</span>
                  </div>
                ))}
              </div>
              <div className="bg-vault-teal/10 border border-vault-teal/20 rounded-xl px-4 py-2 text-center">
                <span className="font-mono text-sm text-vault-teal font-bold">Safe to answer</span>
              </div>
            </div>

            <div className="bg-vault-red/[0.05] border border-vault-red/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="h-3.5 w-3.5 text-vault-red" />
                <span className="font-mono text-xs text-vault-red font-semibold">✗ UNVERIFIED — LIKELY SCAM</span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-vault-red/20 flex items-center justify-center">
                  <Phone className="h-6 w-6 text-vault-red" />
                </div>
                <div>
                  <p className="font-sans font-bold">Fake SBI</p>
                  <p className="font-mono text-xs text-muted-foreground">+91-9876543210</p>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 mb-4">
                {["Not in registry ✗", "No signed token ✗", "DID not found ✗"].map(c => (
                  <div key={c} className="flex items-center gap-2">
                    <XCircle className="h-3.5 w-3.5 text-vault-red shrink-0" />
                    <span className="font-mono text-xs text-vault-red">{c}</span>
                  </div>
                ))}
              </div>
              <div className="bg-vault-red/10 border border-vault-red/20 rounded-xl px-4 py-2 text-center">
                <span className="font-mono text-sm text-vault-red font-bold">Do not answer</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Org Registry */}
      <div>
        <h2 className="font-sans font-semibold mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-vault-gold" /> Organisation Registry
        </h2>
        <div className="bg-vault-surface/60 border border-white/[0.07] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-white/[0.06]">
              <tr>
                {["Organisation", "DID", "Status", "Date"].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-[10px] text-muted-foreground uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ORG_TABLE.map((org, i) => (
                <tr key={i} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 font-sans text-sm font-medium">{org.org}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{org.did}</td>
                  <td className="px-4 py-3">
                    <span className={cn("border rounded-full px-2 py-0.5 font-mono text-[10px]",
                      org.status === "Verified" ? "bg-vault-teal/10 text-vault-teal border-vault-teal/20" : "bg-amber-400/10 text-amber-400 border-amber-400/20"
                    )}>
                      {org.status === "Verified" ? "✓ " : "⏳ "}{org.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{org.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
