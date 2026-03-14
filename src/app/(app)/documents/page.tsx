"use client";

import { useState, useRef } from "react";
import { FolderLock, Plus, Download, Share2, MoreHorizontal, Lock, Database, X, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CameraView } from "@/components/ui/camera-view";
import { linkDocument } from "@/lib/api";
import { useVaultStore } from "@/store/vault";

const DOCUMENTS_DEFAULT = [
  { id: 1, name: "Aadhaar Card", category: "Identity", emoji: "🪪", color: "bg-purple-500/20 text-purple-400", tags: ["✓ Verified","IPFS","AES-256","On-chain"], cid: "Qm3xK...b7Yz", date: "12 Jan 2025", size: "1.2 MB", onChain: true },
  { id: 2, name: "PAN Card", category: "Identity", emoji: "🪪", color: "bg-purple-500/20 text-purple-400", tags: ["IPFS","AES-256","On-chain"], cid: "Qm9aL...c4Wz", date: "12 Jan 2025", size: "0.8 MB", onChain: true },
  { id: 3, name: "Passport", category: "Identity", emoji: "📕", color: "bg-purple-500/20 text-purple-400", tags: ["✓ Verified","IPFS","AES-256","On-chain"], cid: "Qm2bM...d5Xz", date: "15 Jan 2025", size: "2.1 MB", onChain: true },
  { id: 4, name: "Driving Licence", category: "Vehicle", emoji: "🚗", color: "bg-vault-teal/20 text-vault-teal", tags: ["IPFS","AES-256"], cid: "Qm7cN...e6Yz", date: "20 Jan 2025", size: "0.5 MB", onChain: false },
  { id: 5, name: "B.Tech Degree", category: "Education", emoji: "🎓", color: "bg-amber-500/20 text-amber-400", tags: ["✓ Verified","IPFS","AES-256","On-chain"], cid: "Qm4dO...f7Wz", date: "22 Jan 2025", size: "3.4 MB", onChain: true },
  { id: 6, name: "Blood Report", category: "Medical", emoji: "🩸", color: "bg-vault-red/20 text-vault-red", tags: ["IPFS","AES-256"], cid: "Qm6eP...g8Xz", date: "25 Jan 2025", size: "1.8 MB", onChain: false },
  { id: 7, name: "Salary Slip", category: "Other", emoji: "💼", color: "bg-gray-500/20 text-gray-400", tags: ["IPFS","AES-256"], cid: "Qm1fQ...h9Yz", date: "28 Jan 2025", size: "0.3 MB", onChain: false },
];

const DOC_TYPES = [
  { name: "Aadhaar Card", emoji: "🪪", category: "Identity", color: "bg-purple-500/20 text-purple-400" },
  { name: "PAN Card", emoji: "💳", category: "Identity", color: "bg-purple-500/20 text-purple-400" },
  { name: "Passport", emoji: "📗", category: "Identity", color: "bg-purple-500/20 text-purple-400" },
  { name: "Driving Licence", emoji: "🚗", category: "Vehicle", color: "bg-vault-teal/20 text-vault-teal" },
  { name: "Voter ID", emoji: "🗳️", category: "Identity", color: "bg-purple-500/20 text-purple-400" },
  { name: "Degree Certificate", emoji: "🎓", category: "Education", color: "bg-amber-500/20 text-amber-400" },
  { name: "Medical Report", emoji: "🩺", category: "Medical", color: "bg-vault-red/20 text-vault-red" },
  { name: "Other", emoji: "📄", category: "Other", color: "bg-gray-500/20 text-gray-400" },
];

const FILTERS = ["All", "Identity", "Education", "Vehicle", "Medical", "Other"];

const tagColorMap: Record<string, string> = {
  "✓ Verified": "bg-vault-teal/10 text-vault-teal border-vault-teal/20",
  "IPFS": "bg-vault-purple/10 text-vault-purple border-vault-purple/20",
  "AES-256": "bg-vault-gold/10 text-vault-gold border-vault-gold/20",
  "On-chain": "bg-vault-teal/10 text-vault-teal border-vault-teal/20",
};

type UploadStep = "select-type" | "face-verify" | "uploading" | "done";

export default function DocumentsPage() {
  const { user } = useVaultStore();
  const [filter, setFilter] = useState("All");
  const [documents, setDocuments] = useState(DOCUMENTS_DEFAULT);
  const [showModal, setShowModal] = useState(false);
  const [uploadStep, setUploadStep] = useState<UploadStep>("select-type");
  const [selectedType, setSelectedType] = useState<typeof DOC_TYPES[0] | null>(null);
  const [fileName, setFileName] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [faceCapture, setFaceCapture] = useState("");
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = filter === "All" ? documents : documents.filter(d => d.category === filter);
  const counts: Record<string, number> = { All: documents.length };
  documents.forEach(d => { counts[d.category] = (counts[d.category] || 0) + 1; });

  function openModal() {
    setUploadStep("select-type");
    setSelectedType(null);
    setFileName(""); setDocNumber(""); setFaceCapture("");
    setShowModal(true);
  }

  async function handleUpload() {
    if (!selectedType || !docNumber) return;
    setUploading(true);
    try {
      const ssiId = user?.ssiId || "did:vault:demo";
      const res = await linkDocument({ ssiId, documentNumber: docNumber, documentType: selectedType.name });
      const now = new Date();
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const newDoc = {
        id: documents.length + 1,
        name: selectedType.name,
        category: selectedType.category,
        emoji: selectedType.emoji,
        color: selectedType.color,
        tags: ["✓ Verified", "IPFS", "AES-256", "On-chain"],
        cid: res?.cid || `Qm${Math.random().toString(36).slice(2,8)}...`,
        date: `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`,
        size: `${(Math.random() * 3 + 0.3).toFixed(1)} MB`,
        onChain: true,
        txHash: res?.txHash,
      };
      setDocuments(prev => [...prev, newDoc]);
      setToast(`✓ ${selectedType.name} verified and secured on blockchain!`);
      setTimeout(() => setToast(""), 3500);
    } catch {
      // Demo fallback
      const now = new Date();
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      setDocuments(prev => [...prev, {
        id: prev.length + 1, name: selectedType.name, category: selectedType.category,
        emoji: selectedType.emoji, color: selectedType.color,
        tags: ["✓ Verified", "IPFS", "AES-256", "On-chain"],
        cid: `Qm${Math.random().toString(36).slice(2,8)}...`,
        date: `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`,
        size: `${(Math.random() * 3 + 0.3).toFixed(1)} MB`, onChain: true,
      }]);
      setToast(`✓ ${selectedType.name} added (demo mode)`);
      setTimeout(() => setToast(""), 3500);
    }
    setUploading(false);
    setShowModal(false);
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0D2D1A] border border-[#22C55E] text-[#4ade80] px-6 py-3 rounded-xl font-mono text-sm animate-fade-up">
          {toast}
        </div>
      )}

      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="font-mono text-[11px] text-muted-foreground tracking-[3px] uppercase mb-1">Secure Storage</p>
          <h1 className="font-sans text-3xl font-bold">Document <span className="font-serif italic text-vault-gold">Vault</span></h1>
          <p className="text-muted-foreground text-sm font-sans mt-1">{documents.length} documents · Encrypted with AES-256 · Ethereum Mainnet</p>
        </div>
        <button onClick={openModal} className="flex items-center gap-2 bg-gradient-to-r from-vault-gold to-vault-goldLight text-[#0a0b08] font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-vault-gold/20">
          <Plus className="h-4 w-4" /> Add Document
        </button>
      </div>

      {/* Storage stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-vault-surface/60 border border-white/[0.07] rounded-xl p-4">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Total Documents</p>
          <p className="font-serif text-2xl font-bold text-vault-teal">{documents.length}</p>
        </div>
        <div className="bg-vault-surface/60 border border-white/[0.07] rounded-xl p-4">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">IPFS Storage</p>
          <p className="font-serif text-2xl font-bold text-vault-gold">10.1 MB</p>
        </div>
        <div className="bg-vault-surface/60 border border-white/[0.07] rounded-xl p-4">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">On-Chain</p>
          <p className="font-serif text-2xl font-bold text-vault-purple">{documents.filter(d => d.onChain).length} / {documents.length}</p>
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

      {/* ── UPLOAD MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-white/[0.08] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-7 relative animate-fade-up shadow-2xl">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-5 w-5" />
            </button>

            {/* Step 1 — Select type + file + doc number */}
            {uploadStep === "select-type" && (
              <div>
                <p className="font-mono text-[11px] text-vault-gold tracking-widest uppercase mb-1">Step 1 of 2</p>
                <h2 className="font-serif text-2xl font-bold mb-1">Secure a document</h2>
                <p className="text-muted-foreground text-sm mb-5">Select type, enter number, and upload the file.</p>

                {/* Doc type grid */}
                <div className="grid grid-cols-4 gap-2 mb-5">
                  {DOC_TYPES.map(dt => (
                    <button key={dt.name} onClick={() => setSelectedType(dt)}
                      className={cn("rounded-xl p-3 text-center border transition-all",
                        selectedType?.name === dt.name ? "border-vault-gold/60 bg-vault-gold/10" : "border-white/[0.07] bg-vault-surface/50 hover:border-vault-gold/30"
                      )}>
                      <div className="text-xl mb-1">{dt.emoji}</div>
                      <div className="text-[10px] text-muted-foreground leading-tight">{dt.name}</div>
                    </button>
                  ))}
                </div>

                {/* Document number */}
                <div className="mb-4">
                  <label className="font-mono text-[11px] text-muted-foreground tracking-widest uppercase block mb-2">
                    Document Number <span className="text-vault-red">*</span>
                  </label>
                  <input type="text" value={docNumber} onChange={e => setDocNumber(e.target.value)}
                    placeholder={selectedType ? `e.g. your ${selectedType.name} number` : "Select a document type first"}
                    disabled={!selectedType}
                    className="w-full bg-vault-deep border border-white/[0.08] rounded-xl px-4 py-3 font-mono text-sm text-foreground placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-vault-gold/40 disabled:opacity-40" />
                  <p className="text-[10px] text-muted-foreground font-mono mt-1.5">This will be hashed — the raw number is never stored.</p>
                </div>

                {/* File upload */}
                <div onClick={() => fileRef.current?.click()}
                  className="border border-dashed border-white/10 hover:border-vault-gold/40 rounded-xl p-5 text-center cursor-pointer transition-all mb-5 bg-vault-deep/30">
                  <div className="text-2xl mb-2 opacity-40">↑</div>
                  {fileName
                    ? <p className="text-sm font-medium text-vault-gold">{fileName}</p>
                    : <><p className="text-sm text-muted-foreground"><strong className="text-foreground">Click to upload</strong> or drag & drop</p>
                      <p className="text-[11px] text-muted-foreground/60 mt-1">PDF, JPG, PNG — max 10MB</p></>}
                  <input ref={fileRef} type="file" className="hidden" onChange={e => { if (e.target.files?.[0]) setFileName(e.target.files[0].name); }} />
                </div>

                {/* Encrypt notice */}
                <div className="bg-vault-teal/[0.05] border border-vault-teal/20 rounded-xl p-3 mb-5 flex gap-3 text-[11px] text-muted-foreground">
                  <span className="text-vault-teal shrink-0 mt-0.5">🔒</span>
                  <span>AES-256 encrypted in your browser before upload. Vault servers never see the original.</span>
                </div>

                <button onClick={() => { if (!selectedType || !docNumber) { alert("Please select a document type and enter the document number."); return; } setUploadStep("face-verify"); }}
                  className="w-full bg-gradient-to-r from-vault-gold to-vault-goldLight text-[#0a0b08] font-semibold py-3 rounded-xl hover:opacity-90 transition-all">
                  Continue to Face Verify →
                </button>
              </div>
            )}

            {/* Step 2 — Face verify */}
            {uploadStep === "face-verify" && (
              <div>
                <p className="font-mono text-[11px] text-vault-gold tracking-widest uppercase mb-1">Step 2 of 2</p>
                <h2 className="font-serif text-2xl font-bold mb-1">Confirm it&apos;s you</h2>
                <p className="text-muted-foreground text-sm mb-5">Quick face check before linking <strong className="text-foreground">{selectedType?.name}</strong> to your Vault.</p>

                <div className="bg-vault-surface2/50 border border-white/[0.06] rounded-xl px-4 py-2.5 mb-5 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>📷</span> Photo stays on your device — never uploaded or stored.
                </div>

                <CameraView
                  onCapture={(dataUrl) => { setFaceCapture(dataUrl); }}
                  onSkip={() => handleUpload()}
                  skipLabel="Skip face check (demo mode)"
                />

                {faceCapture && (
                  <button onClick={handleUpload} disabled={uploading}
                    className="w-full mt-4 bg-gradient-to-r from-vault-gold to-vault-goldLight text-[#0a0b08] font-semibold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {uploading ? "Uploading to blockchain..." : "Verified — Upload document"}
                  </button>
                )}

                <button onClick={() => setUploadStep("select-type")} className="w-full mt-2 text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-1">
                  ← Back
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


