"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Shield, Lock, ChevronRight, CheckCircle, XCircle,
  ArrowUpRight, Fingerprint, Key, Globe, Users, Zap, Menu, X
} from "lucide-react";

/* ── Counter animation hook ── */
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

/* ── Nav ── */
function Nav() {
  const [open, setOpen] = useState(false);
  const links = ["Features", "How it works", "Vault Shield", "Pricing"];
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between bg-[#0d1220]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl px-5 py-3 shadow-surface">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-xl bg-vault-gold/20 blur-sm" />
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-vault-gold to-vault-goldLight flex items-center justify-center">
                <span className="text-xl font-bold italic text-[#0a0b08]">V</span>
              </div>
            </div>
            <span className="font-serif text-xl font-bold tracking-wide">VAULT</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {links.map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g,"-")}`}
                className="text-sm font-sans text-[#94a3b8] hover:text-white transition-colors duration-200">
                {l}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm text-[#94a3b8] hover:text-white px-4 py-2 rounded-xl transition-colors">
              Sign in
            </Link>
            <Link href="/register" className="btn-primary text-sm px-5 py-2.5 flex items-center gap-1.5">
              Get Started <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5 text-[#94a3b8]" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="mt-2 bg-[#0d1220]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 md:hidden">
            {links.map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g,"-")}`}
                onClick={() => setOpen(false)}
                className="block py-2.5 text-sm font-sans text-[#94a3b8] hover:text-white transition-colors">
                {l}
              </a>
            ))}
            <div className="pt-4 mt-4 border-t border-white/[0.06] flex flex-col gap-2">
              <Link href="/login" onClick={() => setOpen(false)} className="btn-secondary text-sm px-5 py-2.5 text-center">Sign in</Link>
              <Link href="/register" onClick={() => setOpen(false)} className="btn-primary text-sm px-5 py-2.5 text-center">Get Started</Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

/* ── Hero Dashboard Preview ── */
function DashboardPreview() {
  const docs = [
    { name: "Aadhaar Card", tag: "✓ Verified", color: "#2dd4bf" },
    { name: "PAN Card", tag: "On-chain", color: "#7c6eff" },
    { name: "Passport", tag: "✓ Verified", color: "#2dd4bf" },
    { name: "B.Tech Degree", tag: "✓ Verified", color: "#2dd4bf" },
    { name: "Driving Licence", tag: "Encrypted", color: "#c9a84c" },
  ];
  return (
    <div className="relative w-full max-w-md mx-auto animate-float">
      {/* Glow behind */}
      <div className="absolute inset-0 rounded-3xl bg-vault-gold/10 blur-3xl scale-110" />

      <div className="relative glass-card p-6 shadow-surface border border-white/[0.1]" style={{ background: "rgba(13,18,32,0.9)" }}>
        {/* Top row */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-mono text-[10px] text-[#94a3b8] tracking-widest uppercase">Welcome back</p>
            <p className="font-serif text-2xl font-bold mt-0.5">
              Hello, <em className="text-vault-gold not-italic">Raj</em>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-vault-gold/15 flex items-center justify-center border border-vault-gold/20">
            <span className="text-xl font-bold italic text-vault-gold">V</span>
          </div>
        </div>

        {/* Score ring */}
        <div className="flex items-center gap-4 bg-vault-obsidian/60 rounded-xl p-3 mb-4 border border-white/[0.06]">
          <div className="relative w-14 h-14 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5"/>
              <circle cx="28" cy="28" r="22" fill="none" stroke="#2dd4bf" strokeWidth="5"
                strokeDasharray={`${(73/100)*138.2} 138.2`} strokeLinecap="round"/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-sm font-bold text-vault-teal">73</span>
            </div>
          </div>
          <div>
            <p className="font-sans text-sm font-semibold">Vault Score</p>
            <p className="font-mono text-[11px] text-[#94a3b8] mt-0.5">Add guardians to improve</p>
          </div>
          <div className="ml-auto flex gap-1">
            {["🛡","⛓","🔐"].map((e,i) => (
              <div key={i} className="w-7 h-7 rounded-lg bg-vault-surface text-center text-sm flex items-center justify-center">{e}</div>
            ))}
          </div>
        </div>

        {/* Stats pills */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[["7","Docs"],["5","On-chain"],["10.1","MB"],["3","ZKPs"]].map(([v,l]) => (
            <div key={l} className="bg-vault-obsidian/60 border border-white/[0.06] rounded-xl p-2.5 text-center">
              <p className="font-mono text-sm font-bold text-vault-teal">{v}</p>
              <p className="font-mono text-[9px] text-[#94a3b8] mt-0.5">{l}</p>
            </div>
          ))}
        </div>

        {/* Doc list */}
        <div className="flex flex-col gap-0">
          {docs.map((d, i) => (
            <div key={d.name} className="flex items-center justify-between py-2.5 border-b border-white/[0.05] last:border-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="font-sans text-[13px]">{d.name}</span>
              </div>
              <span className="font-mono text-[10px]" style={{ color: d.color }}>{d.tag}</span>
            </div>
          ))}
        </div>

        {/* DID footer */}
        <div className="mt-4 pt-3 border-t border-white/[0.06]">
          <p className="font-mono text-[9px] text-[#94a3b8]/50">did:vault:0x8f3a2b1c9d7e4f5a6b3c8d9e2f1a4b5c</p>
        </div>
      </div>
    </div>
  );
}

/* ── Feature Bento Card ── */
function BentoCard({ icon, title, body, accent, large }: {
  icon: React.ReactNode; title: string; body: string; accent?: string; large?: boolean
}) {
  return (
    <div className={`glass-card p-7 group cursor-default ${large ? "md:col-span-2" : ""}`}>
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: accent ? `${accent}18` : "rgba(201,168,76,0.1)", border: `1px solid ${accent || "#c9a84c"}28` }}>
        <span style={{ color: accent || "#c9a84c" }}>{icon}</span>
      </div>
      <h3 className="font-sans font-semibold text-lg text-white mb-2 group-hover:text-vault-gold transition-colors">{title}</h3>
      <p className="font-sans text-[15px] text-[#94a3b8] leading-relaxed">{body}</p>
    </div>
  );
}

/* ── How it works Step ── */
function Step({ n, title, body, last }: { n: string; title: string; body: string; last?: boolean }) {
  return (
    <div className="relative flex gap-5">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full border-2 border-vault-gold flex items-center justify-center font-mono text-sm font-bold text-vault-gold shrink-0 bg-vault-obsidian z-10">
          {n}
        </div>
        {!last && <div className="flex-1 w-px bg-gradient-to-b from-vault-gold/30 to-transparent mt-2" />}
      </div>
      <div className="pb-10">
        <h3 className="font-sans font-bold text-xl text-white mb-2">{title}</h3>
        <p className="font-sans text-[#94a3b8] leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function LandingPage() {
  const stat1 = useCounter(815);
  const stat2 = useCounter(2140);

  return (
    <div className="min-h-screen bg-vault-obsidian overflow-x-hidden">
      <Nav />

      {/* ╔══════════════════════════════════╗ */}
      {/* ║            HERO                  ║ */}
      {/* ╚══════════════════════════════════╝ */}
      <section className="relative min-h-screen flex items-center pt-28 pb-20 px-6">
        {/* Background effects */}
        <div className="hero-glow w-[600px] h-[600px] bg-vault-gold/[0.07] top-0 right-[5%]" />
        <div className="hero-glow w-[500px] h-[500px] bg-vault-teal/[0.04] top-[20%] right-[20%]" />
        <div className="hero-glow w-[500px] h-[500px] bg-blue-600/[0.04] bottom-0 left-[5%]" />

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.035]" aria-hidden style={{
          backgroundImage: 'linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)',
          backgroundSize: '52px 52px'
        }} />

        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: copy */}
            <div className="animate-fade-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-vault-gold/10 border border-vault-gold/30 rounded-full px-4 py-1.5 mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-vault-teal animate-pulse" />
                <span className="font-mono text-xs text-vault-gold">Built on India Stack · Ethereum Mainnet</span>
              </div>

              {/* H1 */}
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
                Own your identity.{" "}
                <span className="gold-text italic">Prove anything.</span>
              </h1>

              {/* Sub */}
              <p className="font-sans text-lg text-[#94a3b8] leading-relaxed mb-10 max-w-lg">
                Vault anchors your Aadhaar-verified identity on blockchain using Zero Knowledge Proofs — prove your age, citizenship, or credentials to any app without ever exposing the underlying data.
              </p>

              {/* Bullets */}
              <div className="flex flex-col gap-2.5 mb-10">
                {[
                  "Aadhaar eKYC verified on-device — no API call",
                  "Zero-Knowledge Proofs: prove without revealing",
                  "Immutable DID on Ethereum Sepolia",
                ].map(t => (
                  <div key={t} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-vault-teal/10 border border-vault-teal/30 flex items-center justify-center shrink-0">
                      <CheckCircle className="h-3 w-3 text-vault-teal" />
                    </div>
                    <span className="font-sans text-[15px] text-[#c4cdd9]">{t}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/register" className="btn-primary px-7 py-3.5 flex items-center justify-center gap-2 text-[15px]">
                  Create your Vault <ChevronRight className="h-4 w-4" />
                </Link>
                <a href="#how-it-works" className="btn-secondary px-7 py-3.5 flex items-center justify-center gap-2 text-[15px]">
                  Watch how it works
                </a>
              </div>

              {/* Trust bar */}
              <div className="mt-10 pt-7 border-t border-white/[0.06] flex items-center gap-6 flex-wrap">
                <p className="font-mono text-[10px] text-[#94a3b8]/60 uppercase tracking-widest">Secured by</p>
                {["RSA-2048", "AES-256-GCM", "Ethereum Mainnet", "UIDAI eKYC"].map(t => (
                  <span key={t} className="font-mono text-[11px] text-[#94a3b8] bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-1">{t}</span>
                ))}
              </div>
            </div>

            {/* Right: dashboard preview */}
            <div className="flex justify-center lg:justify-end opacity-0-start animate-fade-in delay-300">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════╗ */}
      {/* ║          STATS BAR               ║ */}
      {/* ╚══════════════════════════════════╝ */}
      <div className="border-y border-white/[0.06] bg-vault-surface/20 py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10">
          {[
            { value: `${stat1}M+`, label: "Aadhaar records leaked", color: "text-vault-red" },
            { value: `₹${stat2}Cr`, label: "Lost to scams in 2024", color: "text-vault-red" },
            { value: "0", label: "Personal records on our servers", color: "text-vault-teal" },
            { value: "100%", label: "Data encrypted on your device", color: "text-vault-teal" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className={`font-serif text-4xl font-bold mb-1.5 ${s.color}`}>{s.value}</p>
              <p className="font-mono text-[11px] text-[#94a3b8]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ╔══════════════════════════════════╗ */}
      {/* ║    FEATURES BENTO GRID           ║ */}
      {/* ╚══════════════════════════════════╝ */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-vault-gold/[0.08] border border-vault-gold/20 rounded-full px-4 py-1.5 mb-5">
              <Zap className="h-3.5 w-3.5 text-vault-gold" />
              <span className="font-mono text-xs text-vault-gold">Core Capabilities</span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              Everything your identity needs
            </h2>
            <p className="font-sans text-[#94a3b8] text-lg max-w-xl mx-auto">Built on India Stack. Powered by modern cryptography.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BentoCard large
              icon={<Fingerprint className="h-6 w-6" />}
              title="Zero-Knowledge Proofs"
              body="Prove your age, citizenship, or document ownership to any app — without ever transmitting the underlying data. Your Aadhaar number never leaves this device."
            />
            <BentoCard
              icon={<span className="text-2xl">⛓</span>}
              title="Blockchain DID"
              body="Your identity lives as a permanent, unforgeable DID on Ethereum. Recoverable, not deletable — yours forever."
              accent="#7c6eff"
            />
            <BentoCard
              icon={<Lock className="h-6 w-6" />}
              title="Encrypted Document Safe"
              body="All files AES-256-GCM encrypted with your key and pinned to IPFS. Readable only by you."
              accent="#2dd4bf"
            />
            <BentoCard
              icon={<Users className="h-6 w-6" />}
              title="Guardian Recovery"
              body="Lose your key? Two trusted contacts approve recovery. One blockchain update. No company involved."
              accent="#7c6eff"
            />
            <BentoCard
              icon={<Globe className="h-6 w-6" />}
              title="Sign in with Vault"
              body="Replace fragile passwords across every app. One cryptographic proof. Zero data shared."
              accent="#2dd4bf"
            />
            <BentoCard
              icon={<Shield className="h-6 w-6" />}
              title="Vault Shield"
              body="Cryptographic SMS & call verification. Real orgs use signed DIDs. Scams flagged instantly."
            />
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════╗ */}
      {/* ║        HOW IT WORKS              ║ */}
      {/* ╚══════════════════════════════════╝ */}
      <section id="how-it-works" className="py-24 px-6 bg-vault-surface/[0.3]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="inline-flex items-center gap-2 bg-vault-teal/[0.08] border border-vault-teal/20 rounded-full px-4 py-1.5 mb-6">
                <span className="font-mono text-xs text-vault-teal">How it works</span>
              </div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                Sovereign identity in three steps
              </h2>
              <p className="font-sans text-[#94a3b8] text-lg mb-12">No app, no company, no trust required. Just math.</p>

              <Step n="01" title="Verify once with Aadhaar"
                body="Download your offline eKYC from myaadhaar.uidai.gov.in. Vault verifies UIDAI's RSA-2048 signature locally — no API call, no server ever sees your data." />
              <Step n="02" title="Anchor on Ethereum"
                body="Your Soulbound Token (isHuman ✓ isAdult ✓ isIndianCitizen ✓) is minted on-chain. Your DID becomes permanent and unforgeable." />
              <Step n="03" title="Prove anything via ZKP" last
                body="Any app sends a proof request. A Zero-Knowledge proof is generated on your device. The app gets Verified/Failed — nothing else. Your data stays put." />
            </div>

            {/* Right: Live demo card */}
            <div className="lg:sticky lg:top-24">
              <div className="glass-card p-7" style={{ background: "rgba(13,18,32,0.9)" }}>
                <p className="font-mono text-[11px] text-[#94a3b8] uppercase tracking-widest mb-5">Live ZKP Demo</p>

                <div className="flex flex-col gap-3 mb-6">
                  {[
                    { label: "App requests", val: "Proof of age 18+" },
                    { label: "ZK proof generated", val: "On your device only" },
                    { label: "Aadhaar sent?", val: "Never" },
                    { label: "Result", val: "✓ Verified" },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between py-2.5 border-b border-white/[0.05] last:border-0">
                      <span className="font-mono text-[12px] text-[#94a3b8]">{r.label}</span>
                      <span className="font-mono text-[12px] text-vault-teal">{r.val}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-vault-teal/[0.06] border border-vault-teal/20 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-vault-teal shrink-0" />
                  <div>
                    <p className="font-sans font-semibold text-vault-teal text-sm">Age 18+ confirmed</p>
                    <p className="font-mono text-[10px] text-[#94a3b8] mt-0.5">No personal data transmitted · Proof: 0x7fa2...c8d1</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════╗ */}
      {/* ║        VAULT SHIELD              ║ */}
      {/* ╚══════════════════════════════════╝ */}
      <section id="vault-shield" className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-vault-red/[0.08] border border-vault-red/20 rounded-full px-4 py-1.5 mb-6">
            <Shield className="h-3.5 w-3.5 text-vault-red" />
            <span className="font-mono text-xs text-vault-red">Vault Shield</span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            End digital arrest scams.<br />
            <span className="gold-text">Cryptographically.</span>
          </h2>
          <p className="font-sans text-[#94a3b8] text-lg max-w-xl mx-auto">92,000 cases. ₹2,140 crore stolen in 2024. Vault Shield kills scams at the root with signed DIDs.</p>
        </div>

        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Verified */}
          <div className="glass-card p-6 border-vault-teal/20 bg-vault-teal/[0.03]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-vault-teal animate-pulse" />
              <span className="font-mono text-xs text-vault-teal font-semibold">✓ VERIFIED — SBI</span>
            </div>
            <p className="font-sans text-sm text-white mb-3">&quot;Your OTP for account login is 847291.&quot;</p>
            <div className="flex flex-col gap-1">
              {["Signed token ✓","DID verified ✓","Registry match ✓"].map(c => (
                <div key={c} className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-vault-teal shrink-0" />
                  <span className="font-mono text-[10px] text-vault-teal">{c}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-vault-teal/10 rounded-lg py-2 text-center">
              <span className="font-mono text-sm font-bold text-vault-teal">Safe to trust</span>
            </div>
          </div>

          {/* Scam */}
          <div className="glass-card p-6 border-vault-red/20 bg-vault-red/[0.03]">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="h-3.5 w-3.5 text-vault-red" />
              <span className="font-mono text-xs text-vault-red font-semibold">✗ UNVERIFIED — FAKE SBI</span>
            </div>
            <p className="font-sans text-sm text-white mb-3">&quot;URGENT: Your account is suspended. Click: bit.ly/...&quot;</p>
            <div className="flex flex-col gap-1">
              {["No signed token ✗","DID not found ✗","Registry miss ✗"].map(c => (
                <div key={c} className="flex items-center gap-2">
                  <XCircle className="h-3 w-3 text-vault-red shrink-0" />
                  <span className="font-mono text-[10px] text-vault-red">{c}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-vault-red/10 rounded-lg py-2 text-center">
              <span className="font-mono text-sm font-bold text-vault-red">SCAM — Do not click</span>
            </div>
          </div>
        </div>
      </section>

      {/* ╔══════════════════════════════════╗ */}
      {/* ║        FINAL CTA                 ║ */}
      {/* ╚══════════════════════════════════╝ */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="hero-glow w-[600px] h-[400px] bg-vault-gold/[0.07] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="font-serif text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Your identity.<br />
            <span className="gold-text">Your control. Forever.</span>
          </h2>
          <p className="font-sans text-[#94a3b8] text-lg mb-10 max-w-xl mx-auto">
            815 million Indians had their Aadhaar data stolen for less than a penny each. Vault is the layer India Stack was always missing.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="btn-primary px-10 py-4 flex items-center gap-2 text-base">
              Create your Vault — it&apos;s free <ChevronRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="btn-secondary px-8 py-4 text-base">
              Sign in
            </Link>
          </div>
          <p className="font-mono text-[11px] text-[#94a3b8]/50 mt-8">
            RSA-2048 · AES-256-GCM · Ethereum Sepolia · Zero server data · No cookies
          </p>
        </div>
      </section>

      {/* ╔══════════════════════════════════╗ */}
      {/* ║          FOOTER                  ║ */}
      {/* ╚══════════════════════════════════╝ */}
      <footer className="border-t border-white/[0.06] py-10 px-6 bg-vault-surface/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-vault-gold to-vault-goldLight flex items-center justify-center">
              <span className="text-sm font-bold italic text-[#0a0b08]">V</span>
            </div>
            <span className="font-serif text-lg font-bold">VAULT</span>
            <span className="font-mono text-xs text-[#94a3b8] ml-1">by India Stack</span>
          </div>
          <div className="flex items-center gap-7 text-sm text-[#94a3b8]">
            <a href="#features" className="hover:text-white transition-colors font-sans">Features</a>
            <Link href="/security" className="hover:text-white transition-colors font-sans">Security</Link>
            <Link href="/terms" className="hover:text-white transition-colors font-sans">Terms</Link>
            <Link href="/login" className="hover:text-white transition-colors font-sans">Sign in</Link>
          </div>
          <p className="font-mono text-xs text-[#94a3b8]/50">No cookies. No tracking. No ads.</p>
        </div>
      </footer>
    </div>
  );
}
