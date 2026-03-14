"use client";

import { useState } from "react";
import { FolderLock, Plus, Download, Share2, MoreHorizontal, Lock, Database } from "lucide-react";
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

export default function DocumentsPage() {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? DOCUMENTS : DOCUMENTS.filter(d => d.category === filter);
  const counts: Record<string, number> = { All: DOCUMENTS.length };
  DOCUMENTS.forEach(d => { counts[d.category] = (counts[d.category] || 0) + 1; });

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="font-mono text-[11px] text-muted-foreground tracking-[3px] uppercase mb-1">Secure Storage</p>
          <h1 className="font-sans text-3xl font-bold">Document <span className="font-serif italic text-vault-gold">Vault</span></h1>
          <p className="text-muted-foreground text-sm font-sans mt-1">7 documents found · Encrypted with AES-256 · Ethereum Mainnet</p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-vault-gold to-vault-goldLight text-[#0a0b08] font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-vault-gold/20">
          <Plus className="h-4 w-4" /> Add Document
        </button>
      </div>

      {/* Storage stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-vault-surface/60 border border-white/[0.07] rounded-xl p-4">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Total Documents</p>
          <p className="font-serif text-2xl font-bold text-vault-teal">7</p>
        </div>
        <div className="bg-vault-surface/60 border border-white/[0.07] rounded-xl p-4">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">IPFS Storage</p>
          <p className="font-serif text-2xl font-bold text-vault-gold">10.1 MB</p>
        </div>
        <div className="bg-vault-surface/60 border border-white/[0.07] rounded-xl p-4">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">On-Chain</p>
          <p className="font-serif text-2xl font-bold text-vault-purple">5 / 7</p>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("flex items-center gap-1.5 px-4 py-1.5 rounded-full border font-mono text-xs transition-all",
              filter === f ? "bg-vault-gold/10 border-vault-gold text-vault-gold" : "border-white/[0.12] text-muted-foreground hover:border-vault-gold/30"
            )}>
            {f} <span className="opacity-60">({counts[f] || 0})</span>
          </button>
        ))}
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(doc => (
          <div key={doc.id} className="group bg-vault-surface border border-white/[0.07] hover:border-vault-gold/25 hover:-translate-y-0.5 rounded-xl p-[18px] flex flex-col gap-3 cursor-pointer transition-all duration-200">
            <div className="flex items-start justify-between">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-lg", doc.color)}>{doc.emoji}</div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/[0.05] rounded-lg">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div>
              <p className="font-sans font-bold text-[14px] text-foreground mb-0.5">{doc.name}</p>
              <p className="font-mono text-[11px] text-muted-foreground">{doc.date} · {doc.size}</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {doc.tags.map(tag => (
                <span key={tag} className={cn("border rounded-full px-2 py-0.5 font-mono text-[9px]", tagColorMap[tag] || "border-white/10 text-muted-foreground")}>{tag}</span>
              ))}
            </div>
            <p className="font-mono text-[9px] text-white/20 truncate">{doc.cid}</p>
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/[0.05]">
              <div className="flex items-center gap-1">
                {doc.onChain
                  ? <span className="flex items-center gap-1 font-mono text-[10px] text-vault-teal"><Database className="h-2.5 w-2.5" /> On Polygon ✓</span>
                  : <Lock className="h-3 w-3 text-muted-foreground" />}
              </div>
              <div className="flex gap-2">
                <button className="p-1.5 hover:bg-white/[0.05] rounded-lg transition-colors"><Share2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                <button className="p-1.5 hover:bg-white/[0.05] rounded-lg transition-colors"><Download className="h-3.5 w-3.5 text-muted-foreground" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
