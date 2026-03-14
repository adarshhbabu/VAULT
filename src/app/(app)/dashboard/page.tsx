"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MoreHorizontal, Plus, Share2, Download, Shield, CheckCircle, Lock, Database } from "lucide-react";
import { cn } from "@/lib/utils";

const DOCUMENTS = [
  { id: 1, name: "Aadhaar Card", category: "Identity", emoji: "🪪", color: "bg-purple-500/20 text-purple-400", tags: ["✓ Verified","IPFS","AES-256","On-chain"], cid: "Qm3xK...b7Yz", date: "12 Jan 2025", size: "1.2 MB", onChain: true },
  { id: 2, name: "PAN Card", category: "Identity", emoji: "🪪", color: "bg-purple-500/20 text-purple-400", tags: ["IPFS","AES-256","On-chain"], cid: "Qm9aL...c4Wz", date: "12 Jan 2025", size: "0.8 MB", onChain: true },
  { id: 3, name: "Passport", category: "Identity", emoji: "📕", color: "bg-purple-500/20 text-purple-400", tags: ["✓ Verified","IPFS","AES-256","On-chain"], cid: "Qm2bM...d5Xz", date: "15 Jan 2025", size: "2.1 MB", onChain: true },
  { id: 4, name: "Driving Licence", category: "Vehicle", emoji: "🚗", color: "bg-vault-teal/20 text-vault-teal", tags: ["IPFS","AES-256"], cid: "Qm7cN...e6Yz", date: "20 Jan 2025", size: "0.5 MB", onChain: false },
  { id: 5, name: "B.Tech Degree", category: "Education", emoji: "🎓", color: "bg-amber-500/20 text-amber-400", tags: ["✓ Verified","IPFS","AES-256","On-chain"], cid: "Qm4dO...f7Wz", date: "22 Jan 2025", size: "3.4 MB", onChain: true },
  { id: 6, name: "Blood Report", category: "Medical", emoji: "🩸", color: "bg-vault-red/20 text-vault-red", tags: ["IPFS","AES-256"], cid: "Qm6eP...g8Xz", date: "25 Jan 2025", size: "1.8 MB", onChain: false },
  { id: 7, name: "Salary Slip", category: "Other", emoji: "💼", color: "bg-gray-500/20 text-gray-400", tags: ["IPFS","AES-256"], cid: "Qm1fQ...h9Yz", date: "28 Jan 2025", size: "0.3 MB", onChain: false },
];

const FILTERS = ["All", "Identity", "Education", "Vehicle", "Medical", "Other"];

const tagColorMap: Record<string, string> = {
  "✓ Verified": "bg-vault-teal/10 text-vault-teal border-vault-teal/20",
  "IPFS": "bg-vault-purple/10 text-vault-purple border-vault-purple/20",
  "AES-256": "bg-vault-gold/10 text-vault-gold border-vault-gold/20",
  "On-chain": "bg-vault-teal/10 text-vault-teal border-vault-teal/20",
};

function VaultScoreRing({ score, guardians }: { score: number; guardians: string[] }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = score >= 75 ? "#2dd4bf" : score >= 45 ? "#f59e0b" : "#e05a5a";

  return (
    <div className="bg-vault-surface/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-6 mb-6 flex items-center gap-6">
      <div className="relative w-28 h-28 shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${progress} ${circumference}`} strokeLinecap="round" className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif text-3xl font-bold" style={{ color }}>{score}</span>
          <span className="font-mono text-[9px] text-muted-foreground">/ 100</span>
        </div>
      </div>
      <div className="flex-1">
        <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase mb-1">Vault Score</p>
        <h3 className="font-serif text-2xl font-bold mb-3">Your Vault Score: <span style={{ color }}>{score}</span></h3>
        <div className="flex flex-col gap-1.5">
          {[
            { label: "3 data breaches detected", bad: true },
            { label: "847 scam reports in your area", bad: true },
            { label: "Documents on-chain: 5/7", bad: false },
            { label: `Guardians: ${guardians.length}/3`, bad: guardians.length === 0 },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              {item.bad ? <span className="w-1.5 h-1.5 rounded-full bg-vault-red shrink-0" /> : <CheckCircle className="h-3 w-3 text-vault-teal shrink-0" />}
              <span className={cn("text-xs font-sans", item.bad ? "text-muted-foreground" : "text-vault-teal")}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color = "text-foreground" }: { 
  icon: string; label: string; value: string; sub: string; color?: string 
}) {
  return (
    <div className="bg-vault-surface border border-white/[0.07] rounded-xl p-5 hover:border-vault-gold/20 transition-all">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      </div>
      <p className={cn("font-serif text-3xl font-bold", color)}>{value}</p>
      <p className="font-mono text-[10px] text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [filter, setFilter] = useState("All");
  const [guardians, setGuardians] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("adarsh_guardians");
    if (saved) {
      setGuardians(JSON.parse(saved));
    }
  }, []);

  const filtered = filter === "All" ? DOCUMENTS : DOCUMENTS.filter(d => d.category === filter);

  const counts: Record<string, number> = { All: DOCUMENTS.length };
  DOCUMENTS.forEach(d => { counts[d.category] = (counts[d.category] || 0) + 1; });

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="font-mono text-[11px] text-muted-foreground tracking-[3px] uppercase mb-1">Welcome back</p>
          <h1 className="font-sans text-3xl font-bold">Hello, <span className="font-serif italic text-vault-gold">Adarsh Babu</span></h1>
          <p className="text-muted-foreground text-sm font-sans mt-1">Encrypted on IPFS · Anchored on Ethereum · Readable only by you</p>
        </div>
        <Link href="/documents" className="flex items-center gap-2 bg-gradient-to-r from-vault-gold to-vault-goldLight text-[#0a0b08] font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-vault-gold/20">
          <Plus className="h-4 w-4" /> Add Document
        </Link>
      </div>

      {/* Vault Score */}
      <VaultScoreRing score={73} guardians={guardians} />

      {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon="📄" label="Total Documents" value="7" sub="AES-256 Encrypted" />
          <StatCard icon="⛓" label="On-chain Proofs" value="5" sub="Ethereum Mainnet" />
          <StatCard icon="💾" label="Vault Size" value="10.1 MB" sub="89% storage free" />
          <StatCard icon="🛡" label="Vault Score" value="73" sub="Add 1 more guardian" color="text-vault-teal" />
        </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-1.5 rounded-full border font-mono text-xs transition-all",
              filter === f ? "bg-vault-gold/10 border-vault-gold text-vault-gold" : "border-white/[0.12] text-muted-foreground hover:border-vault-gold/30 hover:text-foreground"
            )}
          >
            {f} <span className="opacity-60">({counts[f] || 0})</span>
          </button>
        ))}
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(doc => (
          <div key={doc.id} className="group bg-vault-surface border border-white/[0.07] hover:border-vault-gold/25 hover:-translate-y-0.5 rounded-xl p-[18px] flex flex-col gap-3 cursor-pointer transition-all duration-200">
            {/* Icon + Menu */}
            <div className="flex items-start justify-between">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 rounded-xl bg-vault-gold/20 blur-sm" />
                <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-vault-gold to-vault-goldLight flex items-center justify-center">
                  <span className="text-xl font-bold italic text-[#0a0b08]">V</span>
                </div>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/[0.05] rounded-lg">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Name + Meta */}
            <div>
              <p className="font-sans font-bold text-[14px] text-foreground mb-0.5">{doc.name}</p>
              <p className="font-mono text-[11px] text-muted-foreground">{doc.date} · {doc.size}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {doc.tags.map(tag => (
                <span key={tag} className={cn("border rounded-full px-2 py-0.5 font-mono text-[9px]", tagColorMap[tag] || "border-white/10 text-muted-foreground")}>
                  {tag}
                </span>
              ))}
            </div>

            {/* CID */}
            <p className="font-mono text-[9px] text-white/20 truncate">{doc.cid}</p>

            {/* Actions */}
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/[0.05]">
              <div className="flex items-center gap-1">
                {doc.onChain && (
                  <span className="flex items-center gap-1 font-mono text-[10px] text-vault-teal">
                    <Database className="h-2.5 w-2.5" /> On Ethereum ✓
                  </span>
                )}
                {!doc.onChain && <Lock className="h-3 w-3 text-muted-foreground" />}
              </div>
              <div className="flex gap-2">
                <button className="p-1.5 hover:bg-white/[0.05] rounded-lg transition-colors">
                  <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                <button className="p-1.5 hover:bg-white/[0.05] rounded-lg transition-colors">
                  <Download className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sign in with Vault Section */}
      <div className="mt-10">
        <h2 className="font-sans font-semibold text-lg mb-4">Sign in with Vault</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { name: "BankVerify", claim: "Proof of income" },
            { name: "RentEase", claim: "Identity + address" },
            { name: "UniApply", claim: "Education credentials" },
          ].map(app => (
            <div key={app.name} className="bg-vault-surface/60 border border-white/[0.07] hover:border-vault-gold/25 rounded-xl p-4 flex items-center justify-between transition-all">
              <div>
                <p className="font-sans font-semibold text-sm">{app.name}</p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">Requests: {app.claim}</p>
              </div>
              <button className="flex items-center gap-1.5 bg-gradient-to-r from-vault-gold to-vault-goldLight text-[#0a0b08] font-semibold text-xs px-4 py-2 rounded-lg hover:opacity-90 transition-all">
                <Shield className="h-3 w-3" /> Connect
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
