"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, Eye, EyeOff, Check, X, ChevronRight, Upload, FileArchive, Users, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

const strengthChecks = [
  { label: "Minimum 8 characters", test: (p: string) => p.length >= 8 },
  { label: "At least one uppercase letter (A–Z)", test: (p: string) => /[A-Z]/.test(p) },
  { label: "At least one lowercase letter (a–z)", test: (p: string) => /[a-z]/.test(p) },
  { label: "At least one number (0–9)", test: (p: string) => /\d/.test(p) },
  { label: "At least one special character (!@#$%^&*)", test: (p: string) => /[!@#$%^&*]/.test(p) },
];

const aadhaarSteps = [
  "Unzipping eKYC file using share code",
  "Parsing XML document structure",
  "Loading UIDAI RSA-2048 public key",
  "Verifying UIDAI digital signature",
  "Extracting identity fields",
];

const anchorSteps = [
  "Generating cryptographic key pair on device",
  "Creating DID on Ethereum: did:vault:0x...",
  "Minting Soulbound Token (isHuman · isAdult · isIndianCitizen)",
  "Writing nullifier hashes to smart contract",
  "Wiping raw XML and video session from memory",
];

function PipelineSteps({ steps, onDone }: { steps: string[]; onDone: () => void }) {
  const [current, setCurrent] = useState(-1);
  const [done, setDone] = useState(false);

  const run = async () => {
    for (let i = 0; i < steps.length; i++) {
      setCurrent(i);
      await new Promise(r => setTimeout(r, 700));
    }
    setDone(true);
    setTimeout(onDone, 600);
  };

  return (
    <div>
      {current === -1 && (
        <button onClick={run} className="w-full bg-gradient-to-r from-vault-gold to-vault-goldLight text-[#0a0b08] font-semibold py-3 rounded-xl hover:opacity-90 transition-all mb-4">
          Start Verification
        </button>
      )}
      <div className="flex flex-col gap-3">
        {steps.map((s, i) => (
          <div key={i} className={cn("flex items-center gap-3 transition-opacity", i > current && current !== -1 ? "opacity-30" : "opacity-100")}>
            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-mono transition-all",
              i < current || done ? "bg-vault-teal/20 text-vault-teal" :
              i === current ? "bg-vault-gold/20 text-vault-gold border border-vault-gold/40 animate-pulse" :
              "bg-vault-surface2 text-muted-foreground"
            )}>
              {i < current || done ? "✓" : i + 1}
            </div>
            <span className={cn("text-sm font-sans", i === current ? "text-foreground" : "text-muted-foreground")}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepIndicator({ current }: { current: Step }) {
  const steps = ["Profile", "Identity", "Liveness", "Anchor", "Guardians", "Done"];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const n = (i + 1) as Step;
        const done = n < current;
        const active = n === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold border-2 transition-all",
                done ? "bg-vault-gold border-vault-gold text-[#0a0b08]" :
                active ? "border-vault-gold text-vault-gold shadow-[0_0_16px_rgba(201,168,76,0.3)]" :
                "bg-vault-surface border-white/10 text-muted-foreground"
              )}>
                {done ? "✓" : n}
              </div>
              <span className={cn("text-[10px] font-mono mt-1 hidden md:block", active ? "text-vault-gold" : "text-muted-foreground")}>{label}</span>
            </div>
            {i < steps.length - 1 && <div className={cn("h-px w-8 md:w-12 mx-1 mb-4 transition-colors", done ? "bg-vault-gold" : "bg-white/10")} />}
          </div>
        );
      })}
    </div>
  );
}

export default function RegisterPage() {
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [shareCode, setShareCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [anchored, setAnchored] = useState(false);
  const [guardians, setGuardians] = useState<string[]>([]);

  const passOk = strengthChecks.every(c => c.test(password));
  const passMatch = password === confirm && confirm.length > 0;
  const step1Ok = name.length >= 2 && passOk && passMatch && agreed;

  return (
    <div className="min-h-screen flex gap-0">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-[420px] shrink-0 flex-col justify-center p-12 bg-vault-surface/30 border-r border-white/[0.06]">
        <div className="flex items-center gap-3 mb-8">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-2xl bg-vault-gold/20 blur-md" />
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-vault-gold to-vault-goldLight flex items-center justify-center">
              <span className="text-2xl font-bold italic text-[#0a0b08]">V</span>
            </div>
          </div>
          <div>
            <p className="font-serif text-2xl font-bold tracking-[0.1em]">VAULT</p>
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest">SELF-SOVEREIGN IDENTITY</p>
          </div>
        </div>

        <h2 className="font-serif text-4xl font-bold leading-tight mb-3">
          Your identity,<br />
          <em className="text-vault-gold">finally yours to keep.</em>
        </h2>
        <p className="text-muted-foreground font-sans text-sm mb-8 leading-relaxed">
          Prove who you are without revealing your data. Powered by Aadhaar eKYC + Ethereum.
        </p>

        <div className="flex flex-col gap-3 mb-8">
          {[
            { icon: "🔐", title: "Zero-Knowledge Proofs", sub: "Prove age, citizenship, credentials without exposing your data" },
            { icon: "⛓", title: "Blockchain-Anchored DID", sub: "Your identity address is permanent on Ethereum. Only your key changes." },
            { icon: "👥", title: "Guardian Recovery", sub: "Two trusted people. One blockchain update. No company involved." },
          ].map(f => (
            <div key={f.title} className="bg-vault-surface/50 border border-white/[0.07] hover:border-vault-gold/25 rounded-xl p-4 transition-all">
              <div className="flex items-center gap-3">
                <span className="text-xl">{f.icon}</span>
                <div>
                  <p className="font-sans font-medium text-sm">{f.title}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{f.sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-vault-teal animate-pulse" />
          <p className="font-mono text-[10px] text-muted-foreground">RSA-2048 · AES-256-GCM · Ethereum · Liveness Check ✓</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-lg">
          <StepIndicator current={step} />

          {/* Step 1: Profile */}
          {step === 1 && (
            <div className="bg-vault-surface/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-7 relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-vault-gold/50 before:to-transparent">
              <h3 className="font-serif text-3xl font-bold mb-1">Create your Vault</h3>
              <p className="text-muted-foreground text-sm font-sans mb-6">Your password encrypts your private key locally — it never leaves this device.</p>

              <div className="flex flex-col gap-5">
                <div>
                  <label className="font-mono text-[11px] text-muted-foreground tracking-widest uppercase block mb-2">Display Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="How you'll appear in Vault"
                    className="w-full bg-vault-deep border border-white/[0.08] rounded-xl px-4 py-3 font-sans text-[15px] text-foreground placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-vault-gold/40 focus:border-vault-gold/40" />
                  {name.length >= 2 && (
                    <p className="font-mono text-xs text-vault-gold mt-1.5">vault://{name.toLowerCase().replace(/\s+/g, "-")}</p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="font-mono text-[11px] text-muted-foreground tracking-widest uppercase">Password</label>
                    <span className="font-mono text-[10px] text-muted-foreground">encrypts your local vault</span>
                  </div>
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a strong password"
                      className="w-full bg-vault-deep border border-white/[0.08] rounded-xl px-4 py-3 font-mono text-[15px] text-foreground placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-vault-gold/40 pr-12" />
                    <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-1 mt-2 mb-2">
                    {[...Array(4)].map((_, i) => {
                      const filled = strengthChecks.filter(c => c.test(password)).length;
                      return <div key={i} className={cn("h-1 rounded-full transition-colors", i < filled ? filled <= 2 ? "bg-vault-red" : filled <= 3 ? "bg-amber-400" : "bg-vault-teal" : "bg-vault-surface2")} />;
                    })}
                  </div>
                  <div className="flex flex-col gap-1">
                    {strengthChecks.map(c => (
                      <div key={c.label} className="flex items-center gap-2">
                        {c.test(password) ? <Check className="h-3 w-3 text-vault-teal" /> : <X className="h-3 w-3 text-muted-foreground" />}
                        <span className={cn("text-xs font-sans", c.test(password) ? "text-vault-teal" : "text-muted-foreground")}>{c.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-mono text-[11px] text-muted-foreground tracking-widest uppercase block mb-2">Confirm Password</label>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm your password"
                    className={cn("w-full bg-vault-deep border rounded-xl px-4 py-3 font-mono text-[15px] text-foreground placeholder:text-white/20 focus:outline-none focus:ring-1",
                      confirm.length > 0 ? passMatch ? "border-vault-teal/40 focus:ring-vault-teal/40" : "border-vault-red/40 focus:ring-vault-red/40" : "border-white/[0.08] focus:ring-vault-gold/40")} />
                  {confirm.length > 0 && !passMatch && <p className="text-xs text-vault-red mt-1.5 font-sans">Passwords don&apos;t match</p>}
                </div>

                <div className="flex items-start gap-3">
                  <input type="checkbox" id="terms" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 accent-vault-gold" />
                  <label htmlFor="terms" className="text-sm text-muted-foreground font-sans">
                    I have read and agree to the{" "}
                    <Link href="/terms" className="text-vault-gold hover:underline">Terms & Conditions</Link> and{" "}
                    <Link href="/terms" className="text-vault-gold hover:underline">Privacy Policy</Link>
                  </label>
                </div>

                <button
                  onClick={() => step1Ok && setStep(2)}
                  disabled={!step1Ok}
                  className="w-full bg-gradient-to-r from-vault-gold to-vault-goldLight text-[#0a0b08] font-semibold py-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40"
                >
                  Continue <ChevronRight className="inline h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Aadhaar */}
          {step === 2 && (
            <div className="bg-vault-surface/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-7">
              <h3 className="font-serif text-3xl font-bold mb-1">Verify your identity</h3>
              <p className="text-muted-foreground text-sm font-sans mb-6">All verification happens on your device. Nothing is sent to Vault&apos;s servers.</p>

              <div className="bg-vault-surface2/50 border border-vault-gold/20 rounded-xl p-4 mb-6">
                <p className="font-sans font-medium text-sm mb-3">Get your eKYC file first</p>
                <a href="https://myaadhaar.uidai.gov.in/offline-kyc" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-vault-gold text-sm font-mono hover:underline mb-3">
                  <ExternalLink className="h-3.5 w-3.5" /> myaadhaar.uidai.gov.in
                </a>
                <ol className="text-xs text-muted-foreground font-sans space-y-1 list-decimal list-inside">
                  <li>Go to myaadhaar.uidai.gov.in and log in</li>
                  <li>Click &ldquo;Offline e-KYC&rdquo; → &ldquo;Download&rdquo;</li>
                  <li>Set a 4-digit share code (remember it!)</li>
                  <li>Save the downloaded ZIP file</li>
                </ol>
              </div>

              {!fileUploaded ? (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-vault-purple/30 hover:border-vault-gold/50 hover:bg-vault-gold/[0.03] rounded-2xl p-10 cursor-pointer transition-all duration-200">
                  <FileArchive className="h-10 w-10 text-vault-purple mb-3" />
                  <p className="font-sans font-medium mb-1">Upload Aadhaar eKYC ZIP</p>
                  <p className="text-xs text-muted-foreground">From myaadhaar.uidai.gov.in · Must be a .zip file</p>
                  <input type="file" accept=".zip" className="hidden" onChange={() => setFileUploaded(true)} />
                </label>
              ) : !verified ? (
                <div>
                  <div className="flex items-center gap-3 bg-vault-teal/[0.06] border border-vault-teal/20 rounded-xl p-3 mb-4">
                    <FileArchive className="h-5 w-5 text-vault-teal" />
                    <span className="text-sm font-mono text-foreground">aadhaar_ekyc.zip · 24 KB · Ready</span>
                  </div>
                  <div className="mb-4">
                    <label className="font-mono text-[11px] text-muted-foreground tracking-widest uppercase block mb-2">4-Digit Share Code</label>
                    <input type="text" inputMode="numeric" maxLength={4} value={shareCode} onChange={e => setShareCode(e.target.value)}
                      placeholder="••••"
                      className="w-full bg-vault-deep border border-white/[0.08] rounded-xl px-4 py-3 font-mono text-2xl text-vault-gold text-center tracking-[0.5em] placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-vault-gold/40" />
                  </div>
                  {shareCode.length === 4 && (
                    <PipelineSteps steps={aadhaarSteps} onDone={() => setVerified(true)} />
                  )}
                </div>
              ) : (
                <div>
                  <div className="bg-vault-teal/[0.05] border border-vault-teal/20 rounded-xl p-4 mb-6">
                    <p className="font-mono text-xs text-vault-teal mb-3">✓ UIDAI SIGNATURE VERIFIED (RSA-2048)</p>
                    {[["Full Name", "Rahul Kumar Singh"],["Date of Birth","01/01/1995"],["Gender","Male"],["Aadhaar","XXXX XXXX 6789"],["Verified","✓ Government of India"]].map(([k,v]) => (
                      <div key={k} className="flex justify-between py-1 border-b border-white/[0.05] last:border-0">
                        <span className="font-mono text-[11px] text-muted-foreground">{k}</span>
                        <span className="font-mono text-[11px] text-vault-teal">{v}</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-1 border-b border-white/[0.05] last:border-0">
                        <span className="font-mono text-[11px] text-muted-foreground">Signature</span>
                        <span className="font-mono text-[11px] text-vault-teal">RSA-2048 ✓</span>
                      </div>
                  </div>
                  <button onClick={() => setStep(3)} className="w-full bg-gradient-to-r from-vault-gold to-vault-goldLight text-[#0a0b08] font-semibold py-3 rounded-xl hover:opacity-90 transition-all">
                    Continue to Liveness Check <ChevronRight className="inline h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Liveness / Video Confirmation */}
          {step === 3 && (
            <div className="bg-vault-surface/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-7">
              <h3 className="font-serif text-3xl font-bold mb-1">Video Confirmation</h3>
              <p className="text-muted-foreground text-sm font-sans mb-6">Position your face in the frame. We use local AI to verify you are a real person.</p>
              
              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden mb-6 border border-white/10 group">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full border-2 border-dashed border-vault-gold/40 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-44 h-44 rounded-full border-2 border-vault-gold/60" />
                  </div>
                </div>
                {/* Simulated scan line */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-vault-teal/50 to-transparent shadow-[0_0_15px_rgba(45,212,191,0.5)] animate-scan" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-vault-red animate-pulse" />
                  <span className="font-mono text-[10px] text-white">REC · LIVENESS_DETECT_V2</span>
                </div>
              </div>
              <style>{`
                @keyframes scan {
                  0% { top: 0%; }
                  50% { top: 100%; }
                  100% { top: 0%; }
                }
                .animate-scan {
                  position: absolute;
                  animation: scan 3s ease-in-out infinite;
                }
              `}</style>

              <button onClick={() => setStep(4)} className="w-full bg-gradient-to-r from-vault-gold to-vault-goldLight text-[#0a0b08] font-semibold py-3 rounded-xl hover:opacity-90 transition-all">
                Confirm Identity <Check className="inline h-4 w-4" />
              </button>
              <p className="text-[10px] text-muted-foreground font-mono mt-4 text-center">Video data is processed locally and never leaves this device.</p>
            </div>
          )}

          {/* Step 4: Anchor */}
          {step === 4 && (
            <div className="bg-vault-surface/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-7">
              <h3 className="font-serif text-3xl font-bold mb-1">Anchoring your identity</h3>
              <p className="text-muted-foreground text-sm font-sans mb-6">Creating your permanent, unforgeable identity on Ethereum.</p>
              {!anchored ? (
                <PipelineSteps steps={anchorSteps} onDone={() => setAnchored(true)} />
              ) : (
                <div>
                  <div className="bg-vault-gold/[0.05] border border-vault-gold/20 rounded-xl p-5 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-vault-gold/10 flex items-center justify-center">
                        <span className="text-vault-gold font-bold italic">V</span>
                      </div>
                      <div>
                        <p className="font-sans font-bold text-lg">Identity Anchored</p>
                        <p className="font-mono text-xs text-muted-foreground">Soulbound Token minted</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap mb-3">
                      {["isHuman ✓","isAdult ✓","isIndianCitizen ✓"].map(b => (
                        <span key={b} className="bg-vault-teal/10 text-vault-teal border border-vault-teal/20 rounded-full px-3 py-1 font-mono text-[11px]">{b}</span>
                      ))}
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground">did:vault:0x8f3a2b1c9d7e4f5a6b3c8d9e2f1a4b5c7d8e9f0a</p>
                  </div>
                  <button onClick={() => setStep(5)} className="w-full bg-gradient-to-r from-vault-gold to-vault-goldLight text-[#0a0b08] font-semibold py-3 rounded-xl hover:opacity-90 transition-all">
                    Continue <ChevronRight className="inline h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Guardians */}
          {step === 5 && (
            <div className="bg-vault-surface/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-7">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-serif text-3xl font-bold">Nominate guardians</h3>
                <button onClick={() => setStep(6)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Skip →</button>
              </div>
              <p className="text-muted-foreground text-sm font-sans mb-2">Up to 3 guardians. Only 1 of 3 needs to approve recovery. Guardians must be Vault users.</p>
              <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-xl p-3 mb-5 text-xs text-amber-400 font-sans">
                ⚠ Without guardians: recovery takes 5+ days via Path B (3x eKYC).
              </div>
              <div className="flex flex-col gap-3 mb-6">
                {[0, 1, 2].map(i => (
                  <div key={i} className={cn("flex items-center gap-3 border rounded-xl p-3 transition-all",
                    guardians[i] ? "border-vault-teal/30 bg-vault-teal/[0.03]" : "border-dashed border-white/[0.12]"
                  )}>
                    <div className="w-9 h-9 rounded-full bg-vault-surface2 flex items-center justify-center text-muted-foreground">
                      <Users className="h-4 w-4" />
                    </div>
                    {guardians[i] ? (
                      <div className="flex-1">
                        <p className="font-sans text-sm">{guardians[i]}</p>
                        <p className="font-mono text-[10px] text-vault-teal">Invite sent → Accepted</p>
                      </div>
                    ) : (
                      <button onClick={() => {
                        const name = prompt(`Enter Guardian ${i+1} name`);
                        if (name) setGuardians(prev => { const n = [...prev]; n[i] = name; return n; });
                      }} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        + Add guardian {i + 1}
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(6)} disabled={guardians.length === 0} className="w-full bg-gradient-to-r from-vault-gold to-vault-goldLight text-[#0a0b08] font-semibold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-40">
                Continue <ChevronRight className="inline h-4 w-4" />
              </button>
              <button onClick={() => setStep(6)} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors mt-2 py-1">
                Skip for now
              </button>
            </div>
          )}

          {/* Step 6: Done */}
          {step === 6 && (
            <div className="bg-vault-surface/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-7 text-center">
              <div className="w-20 h-20 rounded-full border-2 border-vault-teal flex items-center justify-center mx-auto mb-6">
                <Check className="h-10 w-10 text-vault-teal" />
              </div>
              <h3 className="font-serif text-3xl font-bold mb-2">Your Vault is live.</h3>
              <p className="text-muted-foreground font-sans mb-1">{name || "Your identity"}</p>
              <p className="font-mono text-xs text-muted-foreground mb-4">did:vault:0x8f3a2b1c9d7e4f5a6b3c8d9e2f1a4b5c</p>
              <div className="flex gap-2 justify-center flex-wrap mb-8">
                {["isHuman ✓","isAdult ✓","isIndianCitizen ✓"].map(b => (
                  <span key={b} className="bg-vault-teal/10 text-vault-teal border border-vault-teal/20 rounded-full px-3 py-1 font-mono text-[11px]">{b}</span>
                ))}
              </div>
              <Link href="/dashboard" className="inline-flex items-center gap-2 bg-gradient-to-r from-vault-gold to-vault-goldLight text-[#0a0b08] font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-all">
                Open your Vault <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
