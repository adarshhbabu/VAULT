"use client";

import { useState } from "react";
import { FolderLock, Plus, Download, Share2, MoreHorizontal, Lock, Database, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { LivenessTest } from "@/components/ui/liveness-test";
import { livenessSessionValid } from "@/lib/liveness-session";

const DOCUMENTS = [
  { id: 1, name: "Aadhaar Card", category: "Identity", emoji: "🪪", color: "bg-purple-500/20 text-purple-400", tags: ["✓ Verified","IPFS","AES-256","On-chain"], cid: "Qm3xK...b7Yz", date: "12 Jan 2025", size: "1.2 MB", onChain: true, uploaded: true },
  { id: 2, name: "PAN Card", category: "Identity", emoji: "🪪", color: "bg-purple-500/20 text-purple-400", tags: ["IPFS","AES-256","On-chain"], cid: "Qm9aL...c4Wz", date: "12 Jan 2025", size: "0.8 MB", onChain: true, uploaded: false },
  { id: 3, name: "Passport", category: "Identity", emoji: "📕", color: "bg-purple-500/20 text-purple-400", tags: ["IPFS","AES-256","On-chain"], cid: "Qm2bM...d5Xz", date: "15 Jan 2025", size: "2.1 MB", onChain: true, uploaded: false },
  { id: 4, name: "Driving Licence", category: "Vehicle", emoji: "🚗", color: "bg-vault-teal/20 text-vault-teal", tags: ["IPFS","AES-256"], cid: "Qm7cN...e6Yz", date: "20 Jan 2025", size: "0.5 MB", onChain: false, uploaded: false },
  { id: 5, name: "B.Tech Degree", category: "Education", emoji: "🎓", color: "bg-amber-500/20 text-amber-400", tags: ["IPFS","AES-256","On-chain"], cid: "Qm4dO...f7Wz", date: "22 Jan 2025", size: "3.4 MB", onChain: true, uploaded: false },
  { id: 6, name: "Blood Report", category: "Medical", emoji: "🩸", color: "bg-vault-red/20 text-vault-red", tags: ["IPFS","AES-256"], cid: "Qm6eP...g8Xz", date: "25 Jan 2025", size: "1.8 MB", onChain: false, uploaded: false },
  { id: 7, name: "Salary Slip", category: "Other", emoji: "💼", color: "bg-gray-500/20 text-gray-400", tags: ["IPFS","AES-256"], cid: "Qm1fQ...h9Yz", date: "28 Jan 2025", size: "0.3 MB", onChain: false, uploaded: false },
];

const FILTERS = ["All", "Identity", "Education", "Vehicle", "Medical", "Other"];
const CATEGORY_LIST = ["Identity", "Education", "Vehicle", "Medical", "Other"];

const categoryEmojis: Record<string, string> = {
  "Identity": "🪪",
  "Education": "🎓",
  "Vehicle": "🚗",
  "Medical": "🩸",
  "Other": "💼",
};

const tagColorMap: Record<string, string> = {
  "✓ Verified": "bg-vault-teal/10 text-vault-teal border-vault-teal/20",
  "IPFS": "bg-vault-purple/10 text-vault-purple border-vault-purple/20",
  "AES-256": "bg-vault-gold/10 text-vault-gold border-vault-gold/20",
  "On-chain": "bg-vault-teal/10 text-vault-teal border-vault-teal/20",
};

export default function DocumentsPage() {
  const [filter, setFilter] = useState("All");
  const [selectedDoc, setSelectedDoc] = useState<typeof DOCUMENTS[0] | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCustomNameModal, setShowCustomNameModal] = useState(false);
  const [customDocName, setCustomDocName] = useState("");
  const [showLiveness, setShowLiveness] = useState(false);
  const [livenessDone, setLivenessDone] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const filtered = filter === "All" ? DOCUMENTS : DOCUMENTS.filter(d => d.category === filter);
  const counts: Record<string, number> = { All: DOCUMENTS.length };
  DOCUMENTS.forEach(d => { counts[d.category] = (counts[d.category] || 0) + 1; });

  const handleDocumentClick = (doc: typeof DOCUMENTS[0]) => {
    if (!doc.uploaded) {
      alert("Document not yet uploaded. Please upload it first.");
      return;
    }
    setSelectedDoc(doc);
    setShowDetailModal(true);
  };

  const handleAddDocumentClick = () => {
    setShowCategoryModal(true);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    if (category === "Other") {
      setShowCustomNameModal(true);
      setShowCategoryModal(false);
    } else {
      setShowCategoryModal(false);
      // Check liveness for predefined categories
      if (livenessSessionValid()) {
        setLivenessDone(true);
      } else {
        setLivenessDone(false);
        setShowLiveness(true);
      }
    }
  };

  const handleCustomNameSubmit = () => {
    if (customDocName.trim()) {
      setShowCustomNameModal(false);
      // Check liveness for "Other" category
      if (livenessSessionValid()) {
        setLivenessDone(true);
      } else {
        setLivenessDone(false);
        setShowLiveness(true);
      }
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="font-mono text-[11px] text-muted-foreground tracking-[3px] uppercase mb-1">Secure Storage</p>
          <h1 className="font-sans text-3xl font-bold">Document <span className="font-serif italic text-vault-gold">Vault</span></h1>
          <p className="text-muted-foreground text-sm font-sans mt-1">7 documents found · Encrypted with AES-256 · Ethereum Mainnet</p>
        </div>
        <button 
          onClick={handleAddDocumentClick}
          className="flex items-center gap-2 bg-gradient-to-r from-vault-gold to-vault-goldLight text-[#0a0b08] font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-vault-gold/20">
          <Plus className="h-4 w-4" /> Add Document
        </button>
      </div>

      {/* Storage stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-vault-surface/60 border border-white/[0.07] rounded-xl p-4">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Total Documents</p>
          <p className="font-serif text-2xl font-bold text-vault-teal">{DOCUMENTS.length}</p>
        </div>
        <div className="bg-vault-surface/60 border border-white/[0.07] rounded-xl p-4">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">IPFS Storage</p>
          <p className="font-serif text-2xl font-bold text-vault-gold">{(DOCUMENTS.reduce((sum, d) => sum + parseFloat(d.size), 0)).toFixed(1)} MB</p>
        </div>
        <div className="bg-vault-surface/60 border border-white/[0.07] rounded-xl p-4">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">On-Chain</p>
          <p className="font-serif text-2xl font-bold text-vault-purple">{DOCUMENTS.filter(d => d.onChain).length} / {DOCUMENTS.length}</p>
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
          <div key={doc.id} 
            onClick={() => handleDocumentClick(doc)}
            className={cn("group bg-vault-surface border border-white/[0.07] hover:border-vault-gold/25 hover:-translate-y-0.5 rounded-xl p-[18px] flex flex-col gap-3 transition-all duration-200", doc.uploaded ? "cursor-pointer" : "cursor-not-allowed opacity-60")}>
            <div className="flex items-start justify-between">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-lg", doc.color)}>{doc.emoji}</div>
              <div className="flex items-center gap-2">
                {!doc.uploaded && <span className="text-[10px] font-mono text-vault-red px-2 py-1 bg-vault-red/10 rounded">pending</span>}
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/[0.05] rounded-lg">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
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
                  ? <span className="flex items-center gap-1 font-mono text-[10px] text-vault-teal"><Database className="h-2.5 w-2.5" /> On Ethereum ✓</span>
                  : <Lock className="h-3 w-3 text-muted-foreground" />}
              </div>
              <div className="flex gap-2">
                <button className="p-1.5 hover:bg-white/[0.05] rounded-lg transition-colors" onClick={(e) => e.stopPropagation()}><Share2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                <button className="p-1.5 hover:bg-white/[0.05] rounded-lg transition-colors" onClick={(e) => e.stopPropagation()}><Download className="h-3.5 w-3.5 text-muted-foreground" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-vault-surface border border-white/[0.07] rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Document Details</p>
                <h2 className="font-sans text-3xl font-bold flex items-center gap-3">
                  <span className="text-4xl">{selectedDoc.emoji}</span>
                  {selectedDoc.name}
                </h2>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-vault-deep/50 rounded-lg p-4">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase mb-2">Category</p>
                  <p className="font-sans font-bold">{selectedDoc.category}</p>
                </div>
                <div className="bg-vault-deep/50 rounded-lg p-4">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase mb-2">Size</p>
                  <p className="font-sans font-bold">{selectedDoc.size}</p>
                </div>
                <div className="bg-vault-deep/50 rounded-lg p-4">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase mb-2">Date</p>
                  <p className="font-sans font-bold">{selectedDoc.date}</p>
                </div>
                <div className="bg-vault-deep/50 rounded-lg p-4">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase mb-2">Status</p>
                  <p className="font-sans font-bold text-vault-teal">✓ Uploaded</p>
                </div>
              </div>

              <div className="bg-vault-deep/50 rounded-lg p-4">
                <p className="font-mono text-[10px] text-muted-foreground uppercase mb-2">IPFS Hash</p>
                <p className="font-mono text-[12px] text-vault-gold break-all">{selectedDoc.cid}</p>
              </div>

              <div>
                <p className="font-mono text-[10px] text-muted-foreground uppercase mb-3">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {selectedDoc.tags.map(tag => (
                    <span key={tag} className={cn("border rounded-full px-3 py-1 font-mono text-[10px]", tagColorMap[tag] || "border-white/10 text-muted-foreground")}>{tag}</span>
                  ))}
                </div>
              </div>

              {selectedDoc.onChain && (
                <div className="bg-vault-teal/10 border border-vault-teal/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-4 w-4 text-vault-teal" />
                    <p className="font-mono text-[10px] text-vault-teal uppercase">On-chain Verification</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Ethereum Sepolia Testnet · Block #245891</p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button className="flex-1 bg-gradient-to-r from-vault-gold to-vault-goldLight text-[#0a0b08] font-semibold py-2.5 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  <Download className="h-4 w-4" /> Download
                </button>
                <button className="flex-1 bg-vault-gold/10 border border-vault-gold/30 text-vault-gold font-semibold py-2.5 rounded-xl hover:bg-vault-gold/20 transition-all flex items-center justify-center gap-2">
                  <Share2 className="h-4 w-4" /> Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-vault-surface border border-white/[0.07] rounded-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-sans text-2xl font-bold">Add Custom Document</h2>
              <button onClick={() => { setShowAddModal(false); setCustomDocName(""); }} className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <label className="font-mono text-[11px] text-muted-foreground tracking-widest uppercase block mb-3">Document Name</label>
              <input 
                type="text" 
                value={customDocName} 
                onChange={e => setCustomDocName(e.target.value)}
                placeholder="e.g., Medical Report, Invoice, Contract..."
                className="w-full bg-vault-deep border border-white/[0.08] rounded-xl px-4 py-3 font-sans text-[15px] text-foreground placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-vault-gold/40"
              />
              <p className="text-xs text-muted-foreground mt-2">Name this document for your vault. You&apos;ll upload the file next.</p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => { setShowAddModal(false); setCustomDocName(""); }}
                className="flex-1 bg-vault-surface2 border border-white/[0.07] text-foreground font-semibold py-2.5 rounded-xl hover:border-white/[0.15] transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (customDocName.trim()) {
                    alert(`Document "${customDocName}" added! You'll now proceed to upload and verify it with liveness.`);
                    setShowAddModal(false);
                    setCustomDocName("");
                  }
                }}
                disabled={!customDocName.trim()}
                className="flex-1 bg-gradient-to-r from-vault-gold to-vault-goldLight text-[#0a0b08] font-semibold py-2.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liveness Verification Modal */}
      {showLiveness && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-vault-surface border border-white/[0.07] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Security Verification</p>
                <h2 className="font-sans text-2xl font-bold">Verify Your Identity</h2>
              </div>
              <button onClick={() => setShowLiveness(false)} className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <LivenessTest
              onSuccess={() => {
                setLivenessDone(true);
                setShowLiveness(false);
                setShowAddModal(true);
              }}
              onClose={() => setShowLiveness(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
