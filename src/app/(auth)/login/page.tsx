"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Eye, EyeOff, Lock, AlertCircle, ChevronRight, Mail, Smartphone, Users, FileArchive, CheckCircle, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    JSZip: any;
  }
}

// UIDAI Public Key (RSA-2048) - Replace with actual UIDAI public key
const UIDAI_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2a2rwplBCXmzXB0pkzxm
n4JWTG9rjxXvKmC4hYjmqJKwsVvMqRaELaZhDM6cQnqGqLkpxGZP4zZLZVDKkwwp
S0r0YhC5pJ5xKvVqXmVrGJaxqZLYBKN3N5mXqFqG9fCmVn5YX5vZnWjG8qJ2HqSg
lqvLyZRLLqwZmHDXvkBJFMlXvWqfN6K4wK5p8fQKzLXqM5fVbxWXJXLqXbYJVnLY
FlDQnZ6p7vPWQmL3MvXqQqQqG8M8LX5ZpN5R8vZL2wQQZ6LqMPZbLqVZLqMzLpXz
Q5MzJ8nWpLnJLqQ8J5Q6Q8Q5Q7Q5Q7Q5Q7Q5Q7Q5Q7Q7Q8Q8Q8Q8Q8QIDAQAB
-----END PUBLIC KEY-----`;

type Screen = "login" | "recovery-choice" | "path-a-ekyc" | "path-a-guardian" | "path-a-email" | "path-a-code" | "path-b-step1" | "path-b-wait1" | "path-b-step2" | "path-b-wait2" | "path-b-step3" | "unlocked";

export default function LoginPage() {
  const [screen, setScreen] = useState<Screen>("login");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [shake, setShake] = useState(false);
  const [guardianApproved, setGuardianApproved] = useState(false);
  const [guardiansApproved, setGuardiansApproved] = useState(0); // Track number of approved guardians (0-3)
  const [storedGuardians, setStoredGuardians] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("adarsh_guardians");
    if (saved) {
      setStoredGuardians(JSON.parse(saved));
    }
  }, []);
  const [recoveryCode, setRecoveryCode] = useState("");

  // Path A: XML submission states
  const [pathAFile, setPathAFile] = useState<File | null>(null);
  const [pathAShareCode, setPathAShareCode] = useState("");
  const [pathAFileAgeError, setPathAFileAgeError] = useState("");
  const [pathAShareCodeError, setPathAShareCodeError] = useState("");
  const [pathAVerified, setPathAVerified] = useState(false);
  const [pathAError, setPathAError] = useState("");
  const [pathAData, setPathAData] = useState<any>(null);
  const [pathAVerifying, setPathAVerifying] = useState(false);

  // Path B: Multi-step XML submission states
  const [pathBStep1File, setPathBStep1File] = useState<File | null>(null);
  const [pathBStep2File, setPathBStep2File] = useState<File | null>(null);
  const [pathBStep3File, setPathBStep3File] = useState<File | null>(null);
  const [pathBStep1AgeError, setPathBStep1AgeError] = useState("");
  const [pathBStep2AgeError, setPathBStep2AgeError] = useState("");
  const [pathBStep3AgeError, setPathBStep3AgeError] = useState("");

  const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

  // Load JSZip on mount
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
    script.async = true;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

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

  // Path A XML handlers
  const handlePathAUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".zip")) {
      setPathAFileAgeError("Only .zip files are allowed");
      setPathAFile(null);
      return;
    }

    const fileAge = Date.now() - file.lastModified;
    if (fileAge > TWO_DAYS_MS) {
      const daysOld = Math.ceil(fileAge / (24 * 60 * 60 * 1000));
      setPathAFileAgeError(`This ZIP file is ${daysOld} days old. Download a fresh one from myaadhaar.uidai.gov.in (max 2 days old)`);
      setPathAFile(null);
      return;
    }

    setPathAFileAgeError("");
    setPathAFile(file);
    setPathAShareCode("");
    setPathAShareCodeError("");
    setPathAVerified(false);
    setPathAData(null);
    setPathAError("");
  };

  const handlePathAShareCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 4);
    if (!/^\d*$/.test(value)) {
      setPathAShareCodeError("Only numbers allowed");
      return;
    }
    setPathAShareCodeError("");
    setPathAShareCode(value);
  };

  const handlePathAVerifyPressed = async () => {
    if (!pathAFile || pathAShareCode.length !== 4) {
      setPathAShareCodeError("Enter a valid 4-digit code");
      return;
    }

    setPathAVerifying(true);
    setPathAError("");
    setPathAShareCodeError("");

    // Simulate verification delay (pretend to do all the checks)
    await new Promise(r => setTimeout(r, 2000));

    // Generate random reference ID (24-char hex hash for UI fit)
    const referenceId = Array.from(crypto.getRandomValues(new Uint8Array(12)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
    
    // Generate document hash
    const documentHash = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
      .substring(0, 16);
    
    // Generate IPFS CID (simulated)
    const ipfsCid = `Qm${Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map(b => ((b % 26) + 10).toString(36))
      .join('')
      .toUpperCase()}`;
    
    // Generate public key hash
    const pubKeyHash = Array.from(crypto.getRandomValues(new Uint8Array(20)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
      .substring(0, 16);

    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();

    // Always show Adarsh Babu's data
    setPathAData({
      name: "Adarsh Babu",
      dob: "29/04/2006",
      gender: "Male",
      aadhaar: "XXXX XXXX 5719",
      address: "C/O Santhosh Babu, Anusree, Kuttemperoor P.O., Mannar, Kuttemperur, Alappuzha, Kerala",
      timestamp: `${dateStr} ${timeStr}`,
      signature: "RSA-2048 ✓",
      referenceId: referenceId,
      documentHash: documentHash,
      ipfsCid: ipfsCid,
      pubKeyHash: pubKeyHash,
      verificationMethod: "Zero-Knowledge Proof (ZKP)",
      status: "Verified & Secured on IPFS"
    });

    setPathAVerified(true);
    setPathAVerifying(false);
  };

  // Path B XML handlers - helper function
  const handlePathBUpload = (stepNum: 1 | 2 | 3, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".zip")) {
      if (stepNum === 1) setPathBStep1AgeError("Only .zip files are allowed");
      else if (stepNum === 2) setPathBStep2AgeError("Only .zip files are allowed");
      else setPathBStep3AgeError("Only .zip files are allowed");
      return;
    }

    const fileAge = Date.now() - file.lastModified;
    if (fileAge > TWO_DAYS_MS) {
      const daysOld = Math.ceil(fileAge / (24 * 60 * 60 * 1000));
      const errorMsg = `This ZIP file is ${daysOld} days old. Download a fresh one from myaadhaar.uidai.gov.in (max 2 days old)`;
      if (stepNum === 1) setPathBStep1AgeError(errorMsg);
      else if (stepNum === 2) setPathBStep2AgeError(errorMsg);
      else setPathBStep3AgeError(errorMsg);
      return;
    }

    if (stepNum === 1) {
      setPathBStep1AgeError("");
      setPathBStep1File(file);
      setScreen("path-b-wait1");
    } else if (stepNum === 2) {
      setPathBStep2AgeError("");
      setPathBStep2File(file);
      setScreen("path-b-wait2");
    } else {
      setPathBStep3AgeError("");
      setPathBStep3File(file);
      setScreen("unlocked");
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
              <span className="text-sm font-sans text-foreground">Adarsh&apos;s A35</span>
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

          <div className="bg-vault-surface2/50 border border-vault-gold/20 rounded-xl p-4 mb-6">
            <p className="font-sans font-medium text-sm mb-3">Get your eKYC file first</p>
            <a href="https://myaadhaar.uidai.gov.in/offline-kyc" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-vault-gold text-sm font-mono hover:underline mb-3">
              <ExternalLink className="h-3.5 w-3.5" /> myaadhaar.uidai.gov.in
            </a>
            <ol className="text-xs text-muted-foreground font-sans space-y-1 list-decimal list-inside">
              <li>Go to myaadhaar.uidai.gov.in and log in</li>
              <li>Click &ldquo;Offline e-KYC&rdquo; → &ldquo;Download&rdquo;</li>
              <li>Set a 4-digit share code (remember it!)</li>
              <li>Save the downloaded ZIP file (must be less than 2 days old)</li>
            </ol>
          </div>

          {!pathAFile ? (
            <>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-vault-gold/50 rounded-2xl p-8 cursor-pointer transition-all bg-vault-deep/40">
                <FileArchive className="h-10 w-10 text-vault-gold/50 mb-3" />
                <p className="text-sm text-foreground">Aadhaar eKYC ZIP</p>
                <p className="text-xs text-muted-foreground">.zip files only · max 2 days old</p>
                <input type="file" accept=".zip" className="hidden" onChange={handlePathAUpload} />
              </label>
              {pathAFileAgeError && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 mt-4 text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-sans">{pathAFileAgeError}</span>
                </div>
              )}
            </>
          ) : !pathAVerified ? (
            <div>
              <div className="flex items-center gap-3 bg-vault-teal/[0.06] border border-vault-teal/20 rounded-xl p-3 mb-4">
                <FileArchive className="h-5 w-5 text-vault-teal" />
                <span className="text-sm font-mono text-foreground">{pathAFile.name} · {(pathAFile.size / 1024).toFixed(0)} KB · Ready</span>
              </div>
              <div className="mb-4">
                <label className="font-mono text-[11px] text-muted-foreground tracking-widest uppercase block mb-2">4-Digit Share Code</label>
                <input 
                  type="text" 
                  inputMode="numeric" 
                  maxLength={4} 
                  value={pathAShareCode} 
                  onChange={handlePathAShareCodeChange}
                  placeholder="••••"
                  className="w-full bg-vault-deep border border-white/[0.08] rounded-xl px-4 py-3 font-mono text-2xl text-vault-gold text-center tracking-[0.5em] placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-vault-gold/40" 
                />
                {pathAShareCodeError && (
                  <p className="text-xs text-red-400 mt-2 font-sans">{pathAShareCodeError}</p>
                )}
              </div>
              {pathAError && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="text-sm font-sans">{pathAError}</span>
                </div>
              )}
              {pathAShareCode.length === 4 && !pathAVerifying && (
                <button
                  onClick={handlePathAVerifyPressed}
                  className="w-full bg-gradient-to-r from-vault-gold to-vault-goldLight text-[#0a0b08] font-semibold py-3 rounded-xl hover:opacity-90 transition-all"
                >
                  Verify & Extract Data
                </button>
              )}
              {pathAVerifying && (
                <div className="flex items-center justify-center gap-2 bg-vault-gold/10 border border-vault-gold/20 rounded-xl p-4">
                  <div className="w-4 h-4 rounded-full border-2 border-vault-gold border-t-transparent animate-spin" />
                  <span className="text-sm text-vault-gold font-mono">Decrypting and parsing XML...</span>
                </div>
              )}
            </div>
          ) : pathAData ? (
            <div>
              <div className="space-y-4">
                {/* Identity Section */}
                <div className="bg-vault-teal/[0.05] border border-vault-teal/20 rounded-xl p-4">
                  <p className="font-mono text-xs text-vault-teal mb-3">✓ IDENTITY VERIFIED (UIDAI RSA-2048)</p>
                  {[
                    ["Full Name", pathAData.name],
                    ["Date of Birth", pathAData.dob || "Not extracted"],
                    ["Gender", pathAData.gender || "Not extracted"],
                    ["Address", pathAData.address || "Not extracted"],
                    ["Aadhaar", pathAData.aadhaar],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1 border-b border-white/[0.05] last:border-0 gap-4">
                      <span className="font-mono text-[11px] text-muted-foreground shrink-0">{k}</span>
                      <span className="font-mono text-[11px] text-vault-teal truncate text-right">{v}</span>
                    </div>
                  ))}
                </div>
                
                {/* Decentralized Verification Section */}
                <div className="bg-vault-gold/[0.05] border border-vault-gold/20 rounded-xl p-4">
                  <p className="font-mono text-xs text-vault-gold mb-3">📋 DECENTRALIZED VERIFICATION</p>
                  {[
                    ["Reference ID", pathAData.referenceId],
                    ["Document Hash", `${pathAData.documentHash}...`],
                    ["IPFS CID", pathAData.ipfsCid],
                    ["Public Key Hash", `${pathAData.pubKeyHash}...`],
                    ["Status", pathAData.status],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1 border-b border-white/[0.05] last:border-0">
                      <span className="font-mono text-[11px] text-muted-foreground">{k}</span>
                      <span className="font-mono text-[11px] text-vault-gold">{v}</span>
                    </div>
                  ))}
                </div>
                
                {/* Technical Details Section */}
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
                  <p className="font-mono text-xs text-muted-foreground mb-3">⚙️ TECHNICAL DETAILS</p>
                  {[
                    ["Verification Method", pathAData.verificationMethod],
                    ["Signature Algorithm", pathAData.signature],
                    ["Verification Time", pathAData.timestamp],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1 border-b border-white/[0.05] last:border-0">
                      <span className="font-mono text-[11px] text-muted-foreground">{k}</span>
                      <span className="font-mono text-[11px] text-foreground/70">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => setScreen("path-a-guardian")} className="w-full bg-gradient-to-r from-vault-gold to-vault-goldLight text-[#0a0b08] font-semibold py-3 rounded-xl hover:opacity-90 transition-all mt-4">
                Continue to Step 2 → Guardian Approval
              </button>
            </div>
          ) : null}
        </div>
      )}

      {screen === "path-a-guardian" && (
        <div className="bg-vault-surface/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-7">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-vault-gold font-mono text-xs">PATH A: STEP 2</span>
            <div className="h-px flex-1 bg-vault-gold/20" />
          </div>
          <h2 className="font-serif text-2xl font-bold mb-4">Guardian Approval</h2>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <p className="font-mono text-xs text-muted-foreground">Approval Progress</p>
              <p className="font-mono text-xs text-vault-gold">{guardiansApproved}/3</p>
            </div>
            <div className="w-full bg-vault-surface/50 border border-white/[0.05] rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-vault-teal to-vault-gold h-full transition-all duration-500"
                style={{ width: `${(guardiansApproved / 3) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-3 mb-6">
            {["Priya S.", "Amit K.", "Neha R."].map((name, i) => {
              const isApproved = guardiansApproved > i;
              return (
              <div key={name} className={cn("flex items-center gap-3 border rounded-xl p-3", isApproved ? "border-vault-teal/30 bg-vault-teal/[0.03]" : "border-white/[0.07]")}>
                <Users className={cn("h-4 w-4", isApproved ? "text-vault-teal" : "text-muted-foreground")} />
                <span className="font-sans text-sm">{name}</span>
                <span className={cn("ml-auto font-mono text-[10px]", isApproved ? "text-vault-teal" : "text-muted-foreground")}>
                  {isApproved ? "✓ Approved" : "Waiting..."}
                </span>
              </div>
            );
            })};
          </div>
          {guardiansApproved < 3 ? (
            <button 
              onClick={() => {
                if (guardiansApproved < 3) {
                  setTimeout(() => setGuardiansApproved(guardiansApproved + 1), 1500);
                  setGuardianApproved(true);
                }
              }} 
              className="w-full btn-primary py-3"
            >
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

      {screen === "path-b-step1" && (
        <div className="bg-vault-surface/80 backdrop-blur-sm border border-white/[0.07] rounded-2xl p-7">
          <button onClick={() => setScreen("recovery-choice")} className="text-sm text-muted-foreground hover:text-foreground mb-6 block">← Back</button>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-vault-gold font-mono text-xs">PATH B: EKYC 1/3</span>
            <div className="h-px flex-1 bg-vault-gold/20" />
          </div>
          <h2 className="font-serif text-2xl font-bold mb-4">Initial Verification</h2>
          <div className="bg-vault-surface2/50 border border-vault-gold/20 rounded-xl p-4 mb-6">
            <p className="font-sans font-medium text-sm mb-3">ZIP must be less than 2 days old</p>
            <p className="text-xs text-muted-foreground font-sans">After upload, a 12-hour cooldown period begins.</p>
          </div>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-vault-gold/50 rounded-2xl p-8 cursor-pointer transition-all bg-vault-deep/40 mb-4">
            <FileArchive className="h-10 w-10 text-vault-gold/50 mb-3" />
            <p className="text-sm text-foreground">Upload 1st eKYC ZIP</p>
            <p className="text-xs text-muted-foreground">.zip files only · max 2 days old</p>
            <input type="file" accept=".zip" className="hidden" onChange={(e) => handlePathBUpload(1, e)} />
          </label>
          {pathBStep1AgeError && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="text-sm font-sans">{pathBStep1AgeError}</span>
            </div>
          )}
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
            <p className="text-xs text-muted-foreground">.zip files only · max 2 days old</p>
            <input type="file" accept=".zip" className="hidden" onChange={(e) => handlePathBUpload(2, e)} />
          </label>
          {pathBStep2AgeError && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="text-sm font-sans">{pathBStep2AgeError}</span>
            </div>
          )}
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
            <p className="text-xs text-muted-foreground">.zip files only · max 2 days old</p>
            <input type="file" accept=".zip" className="hidden" onChange={(e) => handlePathBUpload(3, e)} />
          </label>
          {pathBStep3AgeError && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="text-sm font-sans">{pathBStep3AgeError}</span>
            </div>
          )}
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground mt-6">
        New to Vault?{" "}
        <Link href="/register" className="text-vault-gold hover:underline">Create identity</Link>
      </p>
    </div>
  );
}
