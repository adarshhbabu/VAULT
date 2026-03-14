"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Eye, EyeOff, Lock, AlertCircle, ChevronRight, Mail, Smartphone, Users, FileArchive, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Screen = "login" | "recovery-choice" | "path-a-ekyc" | "path-a-guardian" | "path-a-email" | "path-a-code" | "path-b-step1" | "path-b-wait1" | "path-b-step2" | "path-b-wait2" | "path-b-step3" | "unlocked";

export default function LoginPage() {
  const [screen, setScreen] = useState<Screen>("login");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [shake, setShake] = useState(false);
  const [guardianApproved, setGuardianApproved] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");

  const handleLogin = () => {
    if (password === "vault123") {
      setScreen("unlocked");
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  if (screen === "unlocked") return (
    <div className="flex flex-col items-center justify-center text-center max-w-sm mx-auto px-6 py-24">
      <div className="w-20 h-20 rounded-full border-2 border-vault-teal flex items-center justify-center mb-6 animate-pulse">
        <CheckCircle className="h-10 w-10 text-vault-teal" />
      </div>
      <h1 className="font-serif text-3xl font-bold mb-2">Vault unlocked.</h1>
      <p className="text-muted-foreground font-sans mb-2">Your identity, documents, and history are intact.</p>
      <p className="font-mono text-xs text-muted-foreground mb-8">did:vault:0x8f3a...ef2c</p>
      <Link href="/dashboard" className="flex items-center gap-2 bg-gradient-to-r from-vault-gold to-vault-goldLight text-[#0a0b08] font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-all">
        Open your Vault <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );

  return (
    <div className="relative w-full max-w-md mx-auto px-6 py-20">
      {/* Vault rings background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[300, 420, 540].map((size, i) => (
          <div
            key={i}
            className="absolute rounded-full border"
            style={{
              width: size, height: size,
              borderColor: i === 2 ? "rgba(45,212,191,0.025)" : `rgba(201,168,76,${i === 0 ? 0.05 : 0.03})`,
              animation: `spin ${60 + i * 30}s linear infinite`,
            }}
          />
        ))}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Brand */}
      <div className="text-center mb-8 relative">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-vault-gold/10 border border-vault-gold/20 mb-4 shadow-[0_0_20px_rgba(201,168,76,0.1)]">
          <span className="text-3xl font-bold italic text-vault-gold">V</span>
        </div>
        <h1 className="font-serif text-2xl font-bold">VAULT</h1>
        <p className="font-mono text-xs text-muted-foreground tracking-widest mt-1">SELF-SOVEREIGN IDENTITY</p>
      </div>

      {/* Login Card */}
      {screen === "login" && (
        <div className="bg-vault-surface/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-7 relative">
          <h2 className="font-serif text-2xl font-bold mb-1">Welcome back</h2>
          <p className="text-muted-foreground text-sm font-sans mb-6">Your identity is locked on this device. Enter your password to unlock it.</p>

          <div className="flex items-center gap-3 bg-vault-teal/[0.06] border border-vault-teal/20 rounded-xl px-3 py-2.5 mb-6">
            <div className="w-2 h-2 rounded-full bg-vault-teal animate-pulse" />
            <div className="flex-1">
              <span className="text-sm font-sans text-foreground">Rahul&apos;s iPhone</span>
              <span className="font-mono text-xs text-muted-foreground ml-2">did:vault:0x8f...ef2</span>
            </div>
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          </div>

          {attempts >= 3 && (
            <div className="flex items-center gap-2 bg-vault-red/10 border border-vault-red/20 rounded-xl p-3 mb-4">
              <AlertCircle className="h-4 w-4 text-vault-red shrink-0" />
              <p className="text-sm text-vault-red font-sans">Too many attempts. Use recovery below.</p>
            </div>
          )}

          <div className="mb-5">
            <label className="font-mono text-[11px] text-muted-foreground tracking-widest uppercase block mb-2">Vault Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && attempts < 3 && handleLogin()}
                disabled={attempts >= 3}
                placeholder="Enter password"
                className={cn(
                  "w-full bg-vault-deep border rounded-xl px-4 py-3 font-mono text-[15px] text-foreground placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-vault-gold/40 focus:border-vault-gold/40 pr-12 transition-all",
                  shake ? "animate-bounce border-vault-red" : "border-white/[0.08]"
                )}
              />
              <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={attempts >= 3 || !password}
            className="w-full bg-gradient-to-r from-vault-gold to-vault-goldLight text-[#0a0b08] font-semibold py-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 mb-4"
          >
            Unlock Vault
          </button>

          <button onClick={() => setScreen("recovery-choice")} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-1">
            Lost access? Use recovery
          </button>
        </div>
      )}

      {/* Recovery Choice */}
      {screen === "recovery-choice" && (
        <div className="bg-vault-surface/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-7">
          <button onClick={() => setScreen("login")} className="text-sm text-muted-foreground hover:text-foreground mb-6 block">← Back</button>
          <h2 className="font-serif text-2xl font-bold mb-2">Recovery Method</h2>
          <p className="text-muted-foreground text-sm font-sans mb-6">Choose how you want to restore your identity.</p>
          
          <div className="flex flex-col gap-3">
            <button onClick={() => setScreen("path-a-ekyc")} className="bg-vault-surface2/50 hover:border-vault-gold/30 border border-white/[0.07] rounded-xl p-5 text-left transition-all group">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-vault-gold font-bold font-mono">PATH A</span>
                <span className="bg-vault-teal/10 text-vault-teal px-2 py-0.5 rounded text-[10px] font-mono uppercase">Faster</span>
              </div>
              <p className="font-sans font-semibold text-white">Full Verification Sequence</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">eKYC ZIP + Guardian Approval + Email + Code</p>
              <div className="flex justify-end mt-2">
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-vault-gold" />
              </div>
            </button>

            <button onClick={() => setScreen("path-b-step1")} className="bg-vault-surface2/50 hover:border-vault-gold/30 border border-white/[0.07] rounded-xl p-5 text-left transition-all group">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-vault-gold font-bold font-mono">PATH B</span>
                <span className="bg-vault-red/10 text-vault-red px-2 py-0.5 rounded text-[10px] font-mono uppercase">No Guardians</span>
              </div>
              <p className="font-sans font-semibold text-white">Time-Locked eKYC</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">3x Aadhaar eKYC with 12-hour intervals between each.</p>
              <div className="flex justify-end mt-2">
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-vault-gold" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Path A Sequence */}
      {screen === "path-a-ekyc" && (
        <div className="bg-vault-surface/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-7">
          <button onClick={() => setScreen("recovery-choice")} className="text-sm text-muted-foreground hover:text-foreground mb-6 block">← Back</button>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-vault-gold font-mono text-xs">PATH A: STEP 1</span>
            <div className="h-px flex-1 bg-vault-gold/20" />
          </div>
          <h2 className="font-serif text-2xl font-bold mb-4">Submit eKYC ZIP</h2>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-vault-gold/50 rounded-2xl p-8 cursor-pointer transition-all bg-vault-deep/40">
            <FileArchive className="h-10 w-10 text-vault-gold/50 mb-3" />
            <p className="text-sm text-foreground">Aadhaar eKYC ZIP</p>
            <input type="file" className="hidden" onChange={() => setScreen("path-a-guardian")} />
          </label>
        </div>
      )}

      {screen === "path-a-guardian" && (
        <div className="bg-vault-surface/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-7">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-vault-gold font-mono text-xs">PATH A: STEP 2</span>
            <div className="h-px flex-1 bg-vault-gold/20" />
          </div>
          <h2 className="font-serif text-2xl font-bold mb-4">Guardian Approval</h2>
          <div className="flex flex-col gap-3 mb-6">
            {["Priya S.", "Amit K.", "Neha R."].map((name, i) => (
              <div key={name} className={cn("flex items-center gap-3 border rounded-xl p-3", i === 0 && guardianApproved ? "border-vault-teal/30 bg-vault-teal/[0.03]" : "border-white/[0.07]")}>
                <Users className={cn("h-4 w-4", i === 0 && guardianApproved ? "text-vault-teal" : "text-muted-foreground")} />
                <span className="font-sans text-sm">{name}</span>
                <span className={cn("ml-auto font-mono text-[10px]", i === 0 && guardianApproved ? "text-vault-teal" : "text-muted-foreground")}>
                  {i === 0 && guardianApproved ? "✓ Approved" : "Waiting..."}
                </span>
              </div>
            ))}
          </div>
          {!guardianApproved ? (
            <button onClick={() => setTimeout(() => setGuardianApproved(true), 1500)} className="w-full btn-primary py-3">
              Request Approval
            </button>
          ) : (
            <button onClick={() => setScreen("path-a-email")} className="w-full btn-primary py-3">
              Continue to Step 3 →
            </button>
          )}
        </div>
      )}

      {screen === "path-a-email" && (
        <div className="bg-vault-surface/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-7 text-center">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-vault-gold font-mono text-xs">PATH A: STEP 3</span>
            <div className="h-px flex-1 bg-vault-gold/20" />
          </div>
          <Mail className="h-12 w-12 text-vault-gold mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold mb-2">Email Verified</h2>
          <p className="text-muted-foreground text-sm mb-6">Recovery link has been confirmed via your registered email.</p>
          <button onClick={() => setScreen("path-a-code")} className="w-full btn-primary py-3">
            Enter Recovery Code →
          </button>
        </div>
      )}

      {screen === "path-a-code" && (
        <div className="bg-vault-surface/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-7">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-vault-gold font-mono text-xs">PATH A: STEP 4</span>
            <div className="h-px flex-1 bg-vault-gold/20" />
          </div>
          <h2 className="font-serif text-2xl font-bold mb-2">Final Code</h2>
          <p className="text-muted-foreground text-sm mb-6 font-sans">Enter the 8-digit recovery code from your setup phase.</p>
          <input 
            type="text" 
            value={recoveryCode} 
            onChange={e => setRecoveryCode(e.target.value)}
            placeholder="XXXX XXXX"
            className="w-full bg-vault-deep border border-white/10 rounded-xl px-4 py-3 font-mono text-center text-xl tracking-widest text-vault-gold mb-6 outline-none focus:border-vault-gold/50"
          />
          <button onClick={() => setScreen("unlocked")} className="w-full btn-primary py-3">
            Restore Identity
          </button>
        </div>
      )}

      {/* Path B Sequence */}
      {screen === "path-b-step1" && (
        <div className="bg-vault-surface/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-7">
          <button onClick={() => setScreen("recovery-choice")} className="text-sm text-muted-foreground hover:text-foreground mb-6 block">← Back</button>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-vault-gold font-mono text-xs">PATH B: EKYC 1/3</span>
            <div className="h-px flex-1 bg-vault-gold/20" />
          </div>
          <h2 className="font-serif text-2xl font-bold mb-4">Initial Verification</h2>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-vault-gold/50 rounded-2xl p-8 cursor-pointer transition-all bg-vault-deep/40 mb-4">
            <FileArchive className="h-10 w-10 text-vault-gold/50 mb-3" />
            <p className="text-sm text-foreground">Upload 1st eKYC ZIP</p>
            <input type="file" className="hidden" onChange={() => setScreen("path-b-wait1")} />
          </label>
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">Note: 12-hour cooldown begins after this step.</p>
        </div>
      )}

      {screen === "path-b-wait1" && (
        <div className="bg-vault-surface/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-7 text-center">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-vault-gold font-mono text-xs">PATH B: COOLDOWN</span>
            <div className="h-px flex-1 bg-vault-gold/20" />
          </div>
          <Clock className="h-12 w-12 text-vault-gold mx-auto mb-4 animate-pulse" />
          <h2 className="font-serif text-2xl font-bold mb-2">Cooldown Period</h2>
          <p className="text-muted-foreground text-sm mb-6">Minimum 12 hours required before the next verification can be submitted.</p>
          <div className="bg-vault-deep rounded-xl p-4 mb-6">
            <p className="font-mono text-2xl font-bold text-vault-gold">11:59:59</p>
            <p className="font-mono text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">Time Remaining</p>
          </div>
          <button onClick={() => setScreen("path-b-step2")} className="w-full btn-secondary py-3 text-xs opacity-50">
            Skip Cooldown (Demo Only)
          </button>
        </div>
      )}

      {screen === "path-b-step2" && (
        <div className="bg-vault-surface/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-7">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-vault-gold font-mono text-xs">PATH B: EKYC 2/3</span>
            <div className="h-px flex-1 bg-vault-gold/20" />
          </div>
          <h2 className="font-serif text-2xl font-bold mb-4">Second Verification</h2>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-vault-gold/50 rounded-2xl p-8 cursor-pointer transition-all bg-vault-deep/40 mb-4">
            <FileArchive className="h-10 w-10 text-vault-gold/50 mb-3" />
            <p className="text-sm text-foreground">Upload 2nd eKYC ZIP</p>
            <input type="file" className="hidden" onChange={() => setScreen("path-b-wait2")} />
          </label>
        </div>
      )}

      {screen === "path-b-wait2" && (
        <div className="bg-vault-surface/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-7 text-center">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-vault-gold font-mono text-xs">PATH B: COOLDOWN 2</span>
            <div className="h-px flex-1 bg-vault-gold/20" />
          </div>
          <Clock className="h-12 w-12 text-vault-gold mx-auto mb-4 animate-pulse" />
          <h2 className="font-serif text-2xl font-bold mb-2">Final Cooldown</h2>
          <p className="text-muted-foreground text-sm mb-6">One last 12-hour period before final submission.</p>
          <div className="bg-vault-deep rounded-xl p-4 mb-6">
            <p className="font-mono text-2xl font-bold text-vault-gold">11:59:59</p>
          </div>
          <button onClick={() => setScreen("path-b-step3")} className="w-full btn-secondary py-3 text-xs opacity-50">
            Skip Cooldown (Demo Only)
          </button>
        </div>
      )}

      {screen === "path-b-step3" && (
        <div className="bg-vault-surface/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-7">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-vault-gold font-mono text-xs">PATH B: EKYC 3/3</span>
            <div className="h-px flex-1 bg-vault-gold/20" />
          </div>
          <h2 className="font-serif text-2xl font-bold mb-4">Final Submission</h2>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-vault-gold/50 rounded-2xl p-8 cursor-pointer transition-all bg-vault-deep/40 mb-4">
            <FileArchive className="h-10 w-10 text-vault-gold/50 mb-3" />
            <p className="text-sm text-foreground">Upload 3rd eKYC ZIP</p>
            <input type="file" className="hidden" onChange={() => setScreen("unlocked")} />
          </label>
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground mt-6">
        New to Vault?{" "}
        <Link href="/register" className="text-vault-gold hover:underline">Create identity</Link>
      </p>
    </div>
  );
}
