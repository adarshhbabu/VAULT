# VAULT — Own Your Identity

> **Prove who you are. Share nothing.**  
> A Self-Sovereign Identity platform built on Ethereum, Zero-Knowledge Proofs, and Aadhaar eKYC Verification.

---

## 🔐 What is Vault?

Vault is a decentralised identity platform that lets any Indian citizen prove their identity to any website, bank, or service in the form of a secured hash :— **without ever revealing their personal data**.

When you sign in with Vault, the receiving app gets a cryptographic proof that says *"this is a verified human, above 18, Indian citizen"* — nothing else. No name. No Aadhaar number. No address. Just math.

---

## 🚨 The Problem We Solve

| Stat | Source |
|------|--------|
| 815 million Aadhaar records leaked | 2023 breach |
| ₹2,140 crore lost to digital scams | 2024 data |
| 92,000 digital arrest cases | India, 2024 |

Current identity systems are centralised — one breach exposes millions. Vault fixes this at the root.

---

## Core Features

###....  Zero-Knowledge Proofs ......
Prove age, citizenship, or document ownership **without transmitting the underlying data**. Built using `snarkjs` with Groth16 circuits, running entirely in the browser.

###....  Blockchain DID .......
Your identity is a permanent Decentralised Identifier (DID) on Etherium. Unforgeable, unrevokable, owned only by you.

###....  Encrypted Document Safe ......
All documents are **AES-256-GCM encrypted** on your device before upload to IPFS. Vault's servers never see the original file.

###.... Account Recovery ......
Lost your password? The core *issue of Blockchain* tackled using highly decentralized form of verification system that requires multiple informations to set a Nullifier that lets you link the same documents with your new DID

###....  Sign in with Vault ......
Replace passwords across every app with one cryptographic proof. Demonstrated in `demo_v3_fixed.html`.

###....  Vault Shield  .......
This is the major Application of "Vault" Every incoming SMS is checked against a blockchain registry of verified organisations using a decentralized database. Scams are flagged instantly — cryptographically.

---

##  Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| Next.js 14 | File-based routing, SSR |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Zustand | Global state management |
| Framer Motion | Animations |

### Blockchain
| Technology | Purpose |
|-----------|---------|
| Ethereum/Polygon zkEVM | Identity layer |
| Solidity | Smart contracts (DID + SBT) |
| ethers.js + wagmi + viem | Wallet connection |
| Hardhat  | Contract deployment |
| snarkjs  | ZK proof generation |

### Backend & Security
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | API server |
| IPFS / Pinata | Decentralised storage |
| AES-256-GCM | Client-side encryption |
| RSA-2048 (UIDAI) | Aadhaar signature verification |

---

## How to Run

### Prerequisites
- Node.js v18+
- Git

### 1. Clone the repository
```bash
git clone https://github.com/adarshhbabu/VAULT.git
cd VAULT
```

### 2. Start the Backend
```bash
cd backend
npm install
node server.js
```
Backend runs on `http://localhost:3001`

### 3. Start the Frontend
Open a new terminal:
```bash
cd VAULT  # root of the repo
npm install --legacy-peer-deps
npm run dev
```
Frontend runs on `http://localhost:3000`

### 4. Open the Demo
Open `demo_v3_fixed.html` in your browser to see the **"Sign in with Vault"** flow from a third-party app perspective.

### 5. Storage & Security
| Technology | Purpose |
|-----------|---------|
| IPFS + Filecoin (Storacha) | Permanent decentralised file storage |
| AES-256-GCM | Client-side encryption before upload |
| RSA-2048 (UIDAI) | Aadhaar eKYC signature verification |
| keccak256 | Email + Aadhaar hashing on-chain |
| Node.js + Express | Backend API server |

---

## 📁 Project Structure

```
Vault Website:'http://localhost:3000'
VAULT/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/        # Login + recovery flows
│   │   │   └── register/     # 6-step registration
│   │   ├── (app)/
│   │   │   ├── dashboard/    # Main vault dashboard
│   │   │   ├── documents/    # Document management
│   │   │   ├── security/     # Recovery + threat alerts
│   │   │   └── shield/       # Vault Shield SMS/call verify
│   │   └── page.tsx          # Landing page
│   ├── components/
│   │   └── ui/               # Reusable components + camera
│   ├── lib/
│   │   └── api.ts            # Backend API calls
│   └── store/
│       └── vault.ts          # Zustand global state
├── backend/
│   ├── server.js             # Express API server
│   └── .env                  # Environment variables
└── demo_v3_fixed.html        # Third-party "Sign in with Vault" demo
```

---
## 🔒 Storage Architecture

```
User Device
────────────────────────────────────────────────────
Document selected
    ↓
AES-256-GCM Encrypt (key from user password, PBKDF2)
    ↓
Upload encrypted blob → IPFS + Filecoin via Storacha
    ↓
CID returned (permanent, content-addressed)
    ↓
keccak256(CID) → stored on Ethereum smart contract
    ↓
User owns document forever — on Filecoin + Ethereum

Nobody can delete it. Not even Vault.
```

---

## 🔒 Identity & ZKP Architecture

```
User Device                    Ethereum Sepolia         Filecoin
─────────────────────          ─────────────────        ──────────────
Aadhaar eKYC ZIP               DID Registry             Encrypted Docs
    ↓ (local only)             isHuman ✓                AES-256-GCM
RSA-2048 verify                isAdult ✓                (your key only)
    ↓                          isIndian ✓
ZK Proof generated             Nullifier Hash
    ↓                          keccak256(email)
    ↓ (proof only sent)        keccak256(aadhaar)
Third-party app ← Verified ✓

```
**Key principle:** Raw personal data never leaves your device. Ever.

---

## 🌐 Smart Contract

- **Network:** Sepolia Testnet
- **Contract:** `0x57AfF059580f37691A1bCCf1B44541E5b5701641`

---

## 👥 Team

Built at **Electrothon** by Team GitRekt.

---

## 📄 License

MIT — Open source, verifiable, trustless.

---

> *"815 million Indians had their Aadhaar data stolen for less than a penny each. Vault is the layer India Stack was always missing. It is the Next gen use of Blockchain"*
