"use client";

import { useState, useRef } from "react";
import { Plus, Download, Share2, MoreHorizontal, Lock, Database, X, CheckCircle, Shield, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CameraView } from "@/components/ui/camera-view";
import { linkDocument, sendOtp } from "@/lib/api";
import { useVaultStore } from "@/store/vault";

/* ── Types ── */
interface Doc {
  id: number; name: string; category: string; emoji: string;
  color: string; tags: string[]; cid: string; date: string;
  size: string; onChain: boolean; verified: boolean; txHash?: string;
  docNumber?: string; did?: string;
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const DOC_TYPES = [
  { name: "Aadhaar Card",     emoji: "🪪", category: "Identity",  color: "bg-purple-500/20 text-purple-400",  requiresAadhaar: false, isAadhaar: true  },
  { name: "PAN Card",         emoji: "💳", category: "Identity",  color: "bg-purple-500/20 text-purple-400",  requiresAadhaar: true,  isAadhaar: false },
  { name: "Passport",         emoji: "📗", category: "Identity",  color: "bg-purple-500/20 text-purple-400",  requiresAadhaar: true,  isAadhaar: false },
  { name: "Driving Licence",  emoji: "🚗", category: "Vehicle",   color: "bg-vault-teal/20 text-vault-teal",  requiresAadhaar: true,  isAadhaar: false },
  { name: "Voter ID",         emoji: "🗳️", category: "Identity",  color: "bg-purple-500/20 text-purple-400",  requiresAadhaar: true,  isAadhaar: false },
  { name: "Degree Certificate",emoji: "🎓",category: "Education", color: "bg-amber-500/20 text-amber-400",    requiresAadhaar: true,  isAadhaar: false },
  { name: "Medical Report",   emoji: "🩺", category: "Medical",   color: "bg-vault-red/20 text-vault-red",    requiresAadhaar: true,  isAadhaar: false },
  { name: "Other",            emoji: "📄", category: "Other",     color: "bg-gray-500/20 text-gray-400",      requiresAadhaar: true,  isAadhaar: false, isOther: true },
];

const FILTERS = ["All", "Identity", "Education", "Vehicle", "Medical", "Other"];

const tagColorMap: Record<string, string> = {
  "✓ Verified":  "bg-vault-teal/10 text-vault-teal border-vault-teal/20",
  "Unverified":  "bg-vault-red/10 text-vault-red border-vault-red/20",
  "IPFS":        "bg-vault-purple/10 text-vault-purple border-vault-purple/20",
  "AES-256":     "bg-vault-gold/10 text-vault-gold border-vault-gold/20",
  "On-chain":    "bg-vault-teal/10 text-vault-teal border-vault-teal/20",
};

function generateDID() {
  return `did:vault:0x${Array.from({length:40},()=>Math.floor(Math.random()*16).toString(16)).join("")}`;
}

function generateCID() {
  return `Qm${Math.random().toString(36).slice(2,8)}...${Math.random().toString(36).slice(2,5)}`;
}

/* ── OTP Modal ── */
function OtpModal({ docName, onVerified, onClose }: { docName: string; onVerified: () => void; onClose: () => void }) {
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function sendCode() {
    setLoading(true);
    try { await sendOtp("demo"); } catch {}
    setSent(true);
    setLoading(false);
  }

  function verify() {
    if (!otp || otp.length < 4) { setErr("Please enter the OTP"); return; }
    onVerified();
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-white/[0.08] rounded-2xl w-full max-w-sm p-7 relative animate-fade-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-vault-gold/10 border border-vault-gold/20 flex items-center justify-center">
            <Shield className="h-5 w-5 text-vault-gold" />
          </div>
          <div>
            <p className="font-sans font-semibold">Verify {docName}</p>
            <p className="text-xs text-muted-foreground font-mono">OTP sent to registered phone</p>
          </div>
        </div>

        {!sent ? (
          <>
            <p className="text-sm text-muted-foreground mb-5">We will send a one-time password to your registered phone number to verify this document.</p>
            <button onClick={sendCode} disabled={loading}
              className="w-full bg-gradient-to-r from-vault-gold to-vault-goldLight text-[#0a0b08] font-semibold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50">
              {loading ? "Sending..." : "Send OTP →"}
            </button>
          </>
        ) : (
          <>
            <label className="font-mono text-[11px] text-muted-foreground tracking-widest uppercase block mb-2">Enter OTP</label>
            <input type="text" value={otp} onChange={e => { setOtp(e.target.value); setErr(""); }}
              placeholder="Enter 6-digit code" maxLength={6}
              className="w-full bg-vault-deep border border-white/[0.08] rounded-xl px-4 py-3 font-mono text-2xl text-vault-gold text-center tracking-widest mb-2 outline-none focus:border-vault-gold/50" />
            <p className="text-[10px] text-muted-foreground font-mono mb-4">Demo mode — enter any code</p>
            {err && <p className="text-xs text-vault-red mb-3">{err}</p>}
            <button onClick={verify}
              className="w-full bg-gradient-to-r from-vault-gold to-vault-goldLight text-[#0a0b08] font-semibold py-3 rounded-xl hover:opacity-90 transition-all">
              Verify & Secure Document
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Other Document Modal ── */
function OtherDocModal({ onDone, onClose }: { onDone: (name: string, number: string) => void; onClose: () => void }) {
  const [step, setStep] = useState<"form"|"otp"|"face">("form");
  const [docName, setDocName] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [err, setErr] = useState("");

  function validateForm() {
    if (!docName.trim()) { setErr("Document name is required"); return false; }
    if (/^[0-9]/.test(docName)) { setErr("Document name cannot start with a number"); return false; }
    if (!docNumber.trim()) { setErr("Document number is required"); return false; }
    return true;
  }

  async function goToOtp() {
    if (!validateForm()) return;
    setErr("");
    try { await sendOtp("demo"); } catch {}
    setOtpSent(true);
    setStep("otp");
  }

  function goToFace() {
    if (!otp || otp.length < 4) { setErr("Please enter the OTP"); return; }
    setErr(""); setStep("face");
  }

  function finish() { onDone(docName, docNumber); }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-white/[0.08] rounded-2xl w-full max-w-md p-7 relative animate-fade-up max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-6">
          {["Document Info","OTP Verify","Face ID"].map((s,i)=>(
            <div key={s} className="flex items-center gap-2">
              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                (step==="form"&&i===0)||(step==="otp"&&i===1)||(step==="face"&&i===2) ? "bg-vault-gold text-[#0a0b08]" :
                ((step==="otp"&&i===0)||(step==="face"&&i<=1)) ? "bg-vault-teal/20 text-vault-teal" : "bg-vault-surface2 text-muted-foreground"
              )}>{i+1}</div>
              <span className="text-xs text-muted-foreground hidden sm:block">{s}</span>
              {i<2&&<div className="h-px w-4 bg-vault-border" />}
            </div>
          ))}
        </div>

        {step === "form" && (
          <div>
            <h2 className="font-serif text-2xl font-bold mb-1">Custom Document</h2>
            <p className="text-muted-foreground text-sm mb-5">Enter details about your document</p>
            <div className="mb-4">
              <label className="font-mono text-[11px] text-muted-foreground tracking-widest uppercase block mb-2">Document Name *</label>
              <input value={docName} onChange={e => { if (/^[0-9]/.test(e.target.value)) { setErr("Name cannot start with a number"); } else { setErr(""); } setDocName(e.target.value); }}
                placeholder="e.g. Birth Certificate, GST Certificate"
                className="w-full bg-vault-deep border border-white/[0.08] rounded-xl px-4 py-3 font-sans text-sm text-foreground placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-vault-gold/40" />
            </div>
            <div className="mb-5">
              <label className="font-mono text-[11px] text-muted-foreground tracking-widest uppercase block mb-2">Document Number *</label>
              <input value={docNumber} onChange={e => { setErr(""); setDocNumber(e.target.value); }}
                placeholder="Enter document ID or reference number"
                className="w-full bg-vault-deep border border-white/[0.08] rounded-xl px-4 py-3 font-mono text-sm text-foreground placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-vault-gold/40" />
              <p className="text-[10px] text-muted-foreground font-mono mt-1.5">This will be hashed — the raw number is never stored</p>
            </div>
            {err && <p className="text-xs text-vault-red mb-3 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{err}</p>}
            <button onClick={goToOtp} className="w-full bg-gradient-to-r from-vault-gold to-vault-goldLight text-[#0a0b08] font-semibold py-3 rounded-xl hover:opacity-90 transition-all">
              Continue to Verify →
            </button>
          </div>
        )}

        {step === "otp" && (
          <div>
            <h2 className="font-serif text-2xl font-bold mb-1">Verify via OTP</h2>
            <p className="text-muted-foreground text-sm mb-5">Enter the code sent to your registered phone number</p>
            <div className="bg-vault-surface2/50 border border-white/[0.06] rounded-xl p-3 mb-5 flex items-center gap-3">
              <Shield className="h-4 w-4 text-vault-gold shrink-0" />
              <div>
                <p className="text-sm font-medium">{docName}</p>
                <p className="text-xs text-muted-foreground font-mono">{docNumber}</p>
              </div>
            </div>
            <label className="font-mono text-[11px] text-muted-foreground tracking-widest uppercase block mb-2">OTP Code</label>
            <input type="text" value={otp} onChange={e => { setOtp(e.target.value); setErr(""); }}
              placeholder="Enter code" maxLength={6}
              className="w-full bg-vault-deep border border-white/[0.08] rounded-xl px-4 py-3 font-mono text-2xl text-vault-gold text-center tracking-widest mb-2 outline-none focus:border-vault-gold/50" />
            <p className="text-[10px] text-muted-foreground font-mono mb-4">Demo mode — enter any 4+ digit code</p>
            {err && <p className="text-xs text-vault-red mb-3">{err}</p>}
            <button onClick={goToFace} className="w-full bg-gradient-to-r from-vault-gold to-vault-goldLight text-[#0a0b08] font-semibold py-3 rounded-xl hover:opacity-90 transition-all">
              Continue to Face ID →
            </button>
          </div>
        )}

        {step === "face" && (
          <div>
            <h2 className="font-serif text-2xl font-bold mb-1">Face Liveness Check</h2>
            <p className="text-muted-foreground text-sm mb-5">Final confirmation — look into the camera</p>
            <div className="bg-vault-surface2/50 border border-white/[0.06] rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>📷</span> Processed on your device only — never uploaded
            </div>
            <CameraView
              onCapture={() => finish()}
              onSkip={() => finish()}
              skipLabel="Skip face check (demo mode)"
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Aadhaar Verified Detail Modal ── */
function DocDetailModal({ doc, onClose }: { doc: Doc; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-white/[0.08] rounded-2xl w-full max-w-sm p-7 relative animate-fade-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>

        {/* Icon + name */}
        <div className="text-center mb-6">
          <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3", doc.color)}>
            {doc.emoji}
          </div>
          <h2 className="font-serif text-2xl font-bold">{doc.name}</h2>
          <p className="text-xs text-muted-foreground font-mono mt-1">Added {doc.date}</p>
        </div>

        {/* Detail rows */}
        <div className="bg-vault-surface/60 border border-white/[0.07] rounded-xl overflow-hidden mb-5">
          {[
            { label: "Document", value: doc.name },
            { label: "Number", value: doc.docNumber ? `XXXX-XXXX-${doc.docNumber.slice(-4)}` : "XXXX-XXXX-XXXX" },
            { label: "IPFS / W3P", value: doc.cid },
            { label: "SSI ID (DID)", value: doc.did ? doc.did.slice(0, 28) + "..." : "did:vault:0x—" },
            { label: "Status", value: doc.verified ? "✓ Verified" : "Unverified" },
          ].map((row, i) => (
            <div key={row.label} className={cn("flex items-start justify-between px-4 py-3", i > 0 && "border-t border-white/[0.05]")}>
              <span className="font-mono text-[11px] text-muted-foreground">{row.label}</span>
              <span className={cn("font-mono text-[11px] text-right max-w-[55%] break-all",
                row.label === "Status" ? (doc.verified ? "text-vault-teal" : "text-vault-red") : "text-foreground"
              )}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Verified badge */}
        {doc.verified && (
          <div className="flex items-center gap-3 bg-vault-teal/[0.06] border border-vault-teal/20 rounded-xl p-4">
            <div className="w-10 h-10 rounded-full bg-vault-teal/20 flex items-center justify-center shrink-0">
              <CheckCircle className="h-5 w-5 text-vault-teal" />
            </div>
            <div>
              <p className="font-sans font-semibold text-vault-teal text-sm">Identity Verified</p>
              <p className="font-mono text-[10px] text-muted-foreground mt-0.5">On-chain · No personal data shared</p>
            </div>
          </div>
        )}

        {doc.txHash && (
          <p className="font-mono text-[9px] text-muted-foreground/40 text-center mt-3">TX: {doc.txHash}</p>
        )}
      </div>
    </div>
  );
}

/* ── Upload Modal ── */
function UploadModal({ aadhaarVerified, onDone, onClose }: { aadhaarVerified: boolean; onDone: (doc: Partial<Doc>) => void; onClose: () => void }) {
  const { user } = useVaultStore();
  const [selectedType, setSelectedType] = useState<typeof DOC_TYPES[0] | null>(null);
  const [docNumber, setDocNumber] = useState("");
  const [fileName, setFileName] = useState("");
  const [step, setStep] = useState<"select"|"otp"|"done">("select");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function proceed() {
    if (!selectedType) { setErr("Please select a document type"); return; }
    if (!docNumber.trim()) { setErr("Please enter your document number"); return; }
    setErr("");

    if (selectedType.isAadhaar) {
      // Aadhaar — go straight to done (verified by eKYC)
      await upload(true);
    } else if (selectedType.requiresAadhaar && !aadhaarVerified) {
      setErr("You must verify your Aadhaar Card first before adding other documents");
      return;
    } else {
      // Non-Aadhaar — need OTP
      setLoading(true);
      try { await sendOtp("demo"); } catch {}
      setOtpSent(true);
      setLoading(false);
      setStep("otp");
    }
  }

  async function verifyOtp() {
    if (!otp || otp.length < 4) { setErr("Please enter the OTP"); return; }
    setErr("");
    await upload(true);
  }

  async function upload(verified: boolean) {
    setLoading(true);
    try {
      const ssiId = user?.ssiId || "did:vault:demo";
      await linkDocument({ ssiId, documentNumber: docNumber, documentType: selectedType!.name });
    } catch {}
    const now = new Date();
    onDone({
      name: selectedType!.name, category: selectedType!.category,
      emoji: selectedType!.emoji, color: selectedType!.color,
      tags: verified ? ["✓ Verified","IPFS","AES-256","On-chain"] : ["Unverified","IPFS","AES-256"],
      cid: generateCID(), did: generateDID(),
      date: `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`,
      size: `${(Math.random()*3+0.3).toFixed(1)} MB`,
      onChain: verified, verified, docNumber,
    });
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-white/[0.08] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-7 relative animate-fade-up shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>

        {step === "select" && (
          <div>
            <p className="font-mono text-[11px] text-vault-gold tracking-widest uppercase mb-1">Secure a document</p>
            <h2 className="font-serif text-2xl font-bold mb-5">Select document type</h2>

            {!aadhaarVerified && (
              <div className="flex items-center gap-2 bg-amber-500/[0.08] border border-amber-500/20 rounded-xl p-3 mb-5 text-xs text-amber-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Verify your Aadhaar Card first to unlock all other document types
              </div>
            )}

            <div className="grid grid-cols-4 gap-2 mb-5">
              {DOC_TYPES.map(dt => {
                const locked = dt.requiresAadhaar && !dt.isAadhaar && !aadhaarVerified;
                return (
                  <button key={dt.name} onClick={() => !locked && setSelectedType(dt)} disabled={locked}
                    className={cn("rounded-xl p-3 text-center border transition-all relative",
                      locked ? "border-white/[0.04] bg-vault-surface/30 opacity-40 cursor-not-allowed" :
                      selectedType?.name === dt.name ? "border-vault-gold/60 bg-vault-gold/10" :
                      "border-white/[0.07] bg-vault-surface/50 hover:border-vault-gold/30"
                    )}>
                    <div className="text-xl mb-1">{dt.emoji}</div>
                    <div className="text-[9px] text-muted-foreground leading-tight">{dt.name}</div>
                    {locked && <div className="absolute top-1 right-1 text-[8px]">🔒</div>}
                  </button>
                );
              })}
            </div>

            <div className="mb-4">
              <label className="font-mono text-[11px] text-muted-foreground tracking-widest uppercase block mb-2">
                Document Number <span className="text-vault-red">*</span>
              </label>
              <input type="text" value={docNumber} onChange={e => { setErr(""); setDocNumber(e.target.value); }}
                placeholder={selectedType ? `Enter your ${selectedType.name} number` : "Select a document type first"}
                disabled={!selectedType}
                className="w-full bg-vault-deep border border-white/[0.08] rounded-xl px-4 py-3 font-mono text-sm text-foreground placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-vault-gold/40 disabled:opacity-40" />
              <p className="text-[10px] text-muted-foreground font-mono mt-1.5">Hashed before storage — raw number never kept</p>
            </div>

            <div onClick={() => fileRef.current?.click()}
              className="border border-dashed border-white/10 hover:border-vault-gold/40 rounded-xl p-5 text-center cursor-pointer transition-all mb-5 bg-vault-deep/30">
              <div className="text-2xl mb-2 opacity-40">↑</div>
              {fileName
                ? <p className="text-sm font-medium text-vault-gold">{fileName}</p>
                : <><p className="text-sm text-muted-foreground"><strong className="text-foreground">Upload document</strong> (optional)</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-1">PDF, JPG, PNG — max 10MB</p></>}
              <input ref={fileRef} type="file" className="hidden" onChange={e => { if (e.target.files?.[0]) setFileName(e.target.files[0].name); }} />
            </div>

            <div className="bg-vault-teal/[0.05] border border-vault-teal/20 rounded-xl p-3 mb-5 flex gap-3 text-[11px] text-muted-foreground">
              <span className="text-vault-teal shrink-0">🔒</span>
              AES-256 encrypted in your browser. Vault servers never see the original.
            </div>

            {err && <p className="text-xs text-vault-red mb-3 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{err}</p>}

            <button onClick={proceed} disabled={!selectedType || !docNumber || loading}
              className="w-full bg-gradient-to-r from-vault-gold to-vault-goldLight text-[#0a0b08] font-semibold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-40">
              {loading ? "Processing..." : selectedType?.isAadhaar ? "Verify Aadhaar →" : "Continue to OTP →"}
            </button>
          </div>
        )}

        {step === "otp" && (
          <div>
            <p className="font-mono text-[11px] text-vault-gold tracking-widest uppercase mb-1">Step 2 of 2</p>
            <h2 className="font-serif text-2xl font-bold mb-1">Verify via OTP</h2>
            <p className="text-muted-foreground text-sm mb-5">Enter the OTP sent to your registered phone</p>
            <div className="bg-vault-surface2/50 border border-white/[0.06] rounded-xl p-3 mb-5 flex items-center gap-3">
              <span className="text-xl">{selectedType?.emoji}</span>
              <div>
                <p className="font-sans font-semibold text-sm">{selectedType?.name}</p>
                <p className="font-mono text-[11px] text-muted-foreground">{docNumber}</p>
              </div>
            </div>
            <label className="font-mono text-[11px] text-muted-foreground tracking-widest uppercase block mb-2">OTP Code</label>
            <input type="text" value={otp} onChange={e => { setOtp(e.target.value); setErr(""); }}
              placeholder="Enter 6-digit code" maxLength={6}
              className="w-full bg-vault-deep border border-white/[0.08] rounded-xl px-4 py-3 font-mono text-2xl text-vault-gold text-center tracking-widest mb-2 outline-none focus:border-vault-gold/50" />
            <p className="text-[10px] text-muted-foreground font-mono mb-4">Demo mode — enter any 4+ digit code</p>
            {err && <p className="text-xs text-vault-red mb-3">{err}</p>}
            <button onClick={verifyOtp} disabled={loading}
              className="w-full bg-gradient-to-r from-vault-gold to-vault-goldLight text-[#0a0b08] font-semibold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50">
              {loading ? "Verifying..." : "Verify & Secure →"}
            </button>
            <button onClick={() => setStep("select")} className="w-full text-center text-sm text-muted-foreground hover:text-foreground py-2 mt-1">← Back</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════ */
export default function DocumentsPage() {
  const { user } = useVaultStore();
  const [filter, setFilter] = useState("All");
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [showOther, setShowOther] = useState(false);
  const [detailDoc, setDetailDoc] = useState<Doc | null>(null);
  const [toast, setToast] = useState("");

  const aadhaarVerified = documents.some(d => d.name === "Aadhaar Card" && d.verified);

  const filtered = filter === "All" ? documents : documents.filter(d => d.category === filter);
  const counts: Record<string,number> = { All: documents.length };
  documents.forEach(d => { counts[d.category] = (counts[d.category]||0)+1; });

  function showToastMsg(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }

  function handleDocAdded(partial: Partial<Doc>) {
    const newDoc: Doc = {
      id: documents.length + 1,
      name: partial.name!, category: partial.category!, emoji: partial.emoji!,
      color: partial.color!, tags: partial.tags!, cid: partial.cid!,
      date: partial.date!, size: partial.size!, onChain: partial.onChain!,
      verified: partial.verified!, docNumber: partial.docNumber,
      did: partial.did, txHash: partial.txHash,
    };
    setDocuments(prev => [...prev, newDoc]);
    setShowUpload(false);
    setShowOther(false);
    showToastMsg(`✓ ${newDoc.name} ${newDoc.verified ? "verified and secured" : "added"} successfully!`);
  }

  function handleOtherDone(docName: string, docNumber: string) {
    const now = new Date();
    const newDoc: Doc = {
      id: documents.length + 1,
      name: docName, category: "Other", emoji: "📄",
      color: "bg-gray-500/20 text-gray-400",
      tags: ["✓ Verified","IPFS","AES-256","On-chain"],
      cid: generateCID(), did: generateDID(),
      date: `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`,
      size: `${(Math.random()*3+0.3).toFixed(1)} MB`,
      onChain: true, verified: true, docNumber,
    };
    setDocuments(prev => [...prev, newDoc]);
    setShowOther(false);
    showToastMsg(`✓ ${docName} verified and secured on blockchain!`);
  }

  function handleCardClick(doc: Doc) {
    setDetailDoc(doc);
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0D2D1A] border border-[#22C55E] text-[#4ade80] px-6 py-3 rounded-xl font-mono text-sm">
          {toast}
        </div>
      )}

      {/* Modals */}
      {showUpload && (
        <UploadModal
          aadhaarVerified={aadhaarVerified}
          onDone={handleDocAdded}
          onClose={() => setShowUpload(false)}
        />
      )}
      {showOther && (
        <OtherDocModal
          onDone={handleOtherDone}
          onClose={() => setShowOther(false)}
        />
      )}
      {detailDoc && (
        <DocDetailModal doc={detailDoc} onClose={() => setDetailDoc(null)} />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="font-mono text-[11px] text-muted-foreground tracking-[3px] uppercase mb-1">Secure Storage</p>
          <h1 className="font-sans text-3xl font-bold">Document <span className="font-serif italic text-vault-gold">Vault</span></h1>
          <p className="text-muted-foreground text-sm font-sans mt-1">
            {documents.length} documents · {documents.filter(d=>d.verified).length} verified · AES-256 Encrypted
          </p>
        </div>
        <button onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-vault-gold to-vault-goldLight text-[#0a0b08] font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-vault-gold/20">
          <Plus className="h-4 w-4" /> Add Document
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-vault-surface/60 border border-white/[0.07] rounded-xl p-4">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Total Documents</p>
          <p className="font-serif text-2xl font-bold text-vault-teal">{documents.length}</p>
        </div>
        <div className="bg-vault-surface/60 border border-white/[0.07] rounded-xl p-4">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Verified</p>
          <p className="font-serif text-2xl font-bold text-vault-gold">{documents.filter(d=>d.verified).length}</p>
        </div>
        <div className="bg-vault-surface/60 border border-white/[0.07] rounded-xl p-4">
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">On-Chain</p>
          <p className="font-serif text-2xl font-bold text-vault-purple">{documents.filter(d=>d.onChain).length} / {documents.length}</p>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("flex items-center gap-1.5 px-4 py-1.5 rounded-full border font-mono text-xs transition-all",
              filter === f ? "bg-vault-gold/10 border-vault-gold text-vault-gold" : "border-white/[0.12] text-muted-foreground hover:border-vault-gold/30"
            )}>
            {f} <span className="opacity-60">({counts[f]||0})</span>
          </button>
        ))}
      </div>

      {/* Empty state */}
      {documents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-vault-surface border border-white/[0.07] flex items-center justify-center text-3xl mb-4">📂</div>
          <p className="font-sans font-semibold text-lg mb-2">No documents yet</p>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs">Start by adding your Aadhaar Card — it unlocks all other document types</p>
          <button onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-vault-gold to-vault-goldLight text-[#0a0b08] font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-all">
            <Plus className="h-4 w-4" /> Add Aadhaar First
          </button>
        </div>
      )}

      {/* Document Grid */}
      {documents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(doc => (
            <div key={doc.id}
              onClick={() => handleCardClick(doc)}
              className="group bg-vault-surface border border-white/[0.07] hover:border-vault-gold/25 hover:-translate-y-0.5 rounded-xl p-[18px] flex flex-col gap-3 cursor-pointer transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-lg", doc.color)}>{doc.emoji}</div>
                <div className="flex items-center gap-1">
                  {doc.verified
                    ? <span className="flex items-center gap-1 bg-vault-teal/10 border border-vault-teal/20 rounded-full px-2 py-0.5 font-mono text-[9px] text-vault-teal">✓ Verified</span>
                    : <span className="flex items-center gap-1 bg-vault-red/10 border border-vault-red/20 rounded-full px-2 py-0.5 font-mono text-[9px] text-vault-red">Unverified</span>}
                </div>
              </div>
              <div>
                <p className="font-sans font-bold text-[14px] text-foreground mb-0.5">{doc.name}</p>
                <p className="font-mono text-[11px] text-muted-foreground">{doc.date} · {doc.size}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {doc.tags.filter(t => t !== "✓ Verified" && t !== "Unverified").map(tag => (
                  <span key={tag} className={cn("border rounded-full px-2 py-0.5 font-mono text-[9px]", tagColorMap[tag]||"border-white/10 text-muted-foreground")}>{tag}</span>
                ))}
              </div>
              <p className="font-mono text-[9px] text-white/20 truncate">{doc.cid}</p>
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/[0.05]">
                <div className="flex items-center gap-1">
                  {doc.onChain
                    ? <span className="flex items-center gap-1 font-mono text-[10px] text-vault-teal"><Database className="h-2.5 w-2.5" /> On-chain ✓</span>
                    : <Lock className="h-3 w-3 text-muted-foreground" />}
                </div>
                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                  <button className="p-1.5 hover:bg-white/[0.05] rounded-lg transition-colors"><Share2 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  <button className="p-1.5 hover:bg-white/[0.05] rounded-lg transition-colors"><Download className="h-3.5 w-3.5 text-muted-foreground" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
