import { Shield } from "lucide-react";

export default function TermsPage() {
  const sections = [
    { title: "What Vault is", body: "Vault is a Self-Sovereign Identity (SSI) system. You control your identity. We don't." },
    { title: "What data we collect", body: "Only your email address — stored as a cryptographic hash. We cannot read it. Your name, Aadhaar number, documents, and identity fields never touch our servers." },
    { title: "What stays on your device", body: "Your private key, XML identity data, all uploaded documents, and all extracted identity fields." },
    { title: "What lives on blockchain", body: "Your DID, Soulbound Token flags (isHuman, isAdult, isIndianCitizen), nullifier hashes, and IPFS content identifiers. None of this is personal data." },
    { title: "Key recovery", body: "Vault cannot reset your password — it's never stored. Recovery is possible via guardians, email + recovery code, or trusted device OTP. Without these, re-verification via new eKYC is required (5+ days)." },
    { title: "Liveness data", body: "Camera data for liveness checks is processed entirely on your device using TensorFlow.js. No face data is stored or transmitted anywhere." },
    { title: "Sign in with Vault", body: "When you use Sign in with Vault with third-party apps, only a ZKP proof hash and a pairwise DID are shared. No personal data is transmitted." },
    { title: "Limitations", body: "If you lose your private key and all recovery methods, your identity cannot be recovered. Blockchain records are permanent and cannot be deleted. Liveness detection has edge-case failure rates." },
    { title: "Contact", body: "Questions? Email vault@example.com — we'll respond within 5 business days." },
  ];

  return (
    <div>
      <div className="mb-10">
        <p className="font-mono text-[11px] text-muted-foreground tracking-[3px] uppercase mb-1">Legal</p>
        <h1 className="font-sans text-3xl font-bold flex items-center gap-2">
          <Shield className="h-7 w-7 text-vault-gold" /> Terms & Conditions
        </h1>
        <p className="text-muted-foreground text-sm mt-2 font-sans">Plain English. No legalese. We believe in transparency.</p>
      </div>

      <div className="max-w-2xl flex flex-col gap-6">
        {sections.map((s, i) => (
          <div key={i} className="bg-vault-surface/60 border border-white/[0.07] rounded-2xl p-6">
            <h2 className="font-sans font-semibold text-base mb-2">{i + 1}. {s.title}</h2>
            <p className="text-muted-foreground text-sm font-sans leading-relaxed">{s.body}</p>
          </div>
        ))}
        <p className="font-mono text-[11px] text-muted-foreground text-center pb-8">Last updated: March 2025 · Vault v1.0.0</p>
      </div>
    </div>
  );
}
