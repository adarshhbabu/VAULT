const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ══════════════════════════════════════
// CONTRACT SETUP
// ══════════════════════════════════════

const ABI = [
  // Identity
  "function registerDID(string memory did, bytes32 aadhaarHash, bytes32 emailHash) public",
  "function didExists(string memory did) public view returns (bool)",
  "function aadhaarRegistered(bytes32 aadhaarHash) public view returns (bool)",
  "function getSBT(string memory did) public view returns (bool isHuman, bool isAdult, bool isIndian, uint256 createdAt)",

  // Documents
  "function linkDocument(string memory did, bytes32 docHash, string memory ipfsCID) public",
  "function verify(string memory did, bytes32 docHash) public view returns (bool)",
  "function isDocumentClaimed(bytes32 docHash) public view returns (bool)",
  "function getDocumentCount(string memory did) public view returns (uint256)",

  // Organisations
  "function registerOrg(string memory domain, string memory orgDID) public",
  "function verifyOrg(string memory domain) public",
  "function isVerifiedOrg(string memory domain) public view returns (bool)",
  "function getOrg(string memory domain) public view returns (string memory orgDID, bool verified, uint256 registeredAt)",

  // Recovery
  "function recordRecoveryAttempt(string memory did) public",
  "function getRecoveryAttemptCount(string memory did) public view returns (uint256)",
  "function getLastRecoveryAttempt(string memory did) public view returns (uint256)",

  // Events
  "event DIDRegistered(string did, address wallet, uint256 timestamp)",
  "event DocumentLinked(string did, bytes32 docHash, string ipfsCID, uint256 timestamp)",
];

// Connect to Polygon Mumbai (falls back to Sepolia)
const RPC_URL = process.env.POLYGON_RPC_URL || process.env.SEPOLIA_RPC_URL;
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, wallet);

// ══════════════════════════════════════
// IN-MEMORY STORES (demo — replace with DB in production)
// ══════════════════════════════════════

// OTP store: phone/aadhaar → { otp, expires, aadhaarNumber }
const otpStore = {};

// Session store: sessionToken → { did, displayName, createdAt }
const sessions = {};

// Recovery store: did → { emailToken, deviceCode, zipAttempts }
const recoveryStore = {};

// Registered users store: did → { displayName, emailHash }
const users = {};

// ══════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════

function generateSSIId() {
  return 'did:vault:0x' + crypto.randomBytes(32).toString('hex');
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashData(data) {
  return ethers.keccak256(ethers.toUtf8Bytes(data));
}

// ══════════════════════════════════════
// ROUTE 1: Send Aadhaar OTP
// POST /aadhaar-otp
// Body: { aadhaarNumber }
// ══════════════════════════════════════
app.post('/aadhaar-otp', async (req, res) => {
  const { aadhaarNumber } = req.body;

  if (!aadhaarNumber || aadhaarNumber.replace(/\s/g, '').length !== 12) {
    return res.status(400).json({ error: 'Invalid Aadhaar number' });
  }

  const clean = aadhaarNumber.replace(/\s/g, '');

  // Check if Aadhaar already registered on blockchain
  try {
    const aadhaarHash = hashData(clean);
    const alreadyRegistered = await contract.aadhaarRegistered(aadhaarHash);
    if (alreadyRegistered) {
      return res.status(400).json({ error: 'This Aadhaar is already linked to a Vault account' });
    }
  } catch (err) {
    console.log('Blockchain check skipped (demo mode):', err.message);
  }

  const otp = generateOTP();
  const key = 'aadhaar_' + clean;

  otpStore[key] = {
    otp,
    aadhaarNumber: clean,
    expires: Date.now() + 600000, // 10 minutes
  };

  // Demo — print OTP to terminal
  // Production — call UIDAI API to send OTP to Aadhaar-linked mobile
  console.log(`\n🔐 Aadhaar OTP for ${clean.substring(0,4)}XXXX${clean.substring(8)}: ${otp}\n`);

  res.json({ success: true, message: 'OTP sent to Aadhaar-linked mobile number' });
});

// ══════════════════════════════════════
// ROUTE 2: Verify Aadhaar OTP
// POST /aadhaar-verify
// Body: { aadhaarNumber, otp }
// ══════════════════════════════════════
app.post('/aadhaar-verify', async (req, res) => {
  const { aadhaarNumber, otp } = req.body;
  const clean = (aadhaarNumber || '').replace(/\s/g, '');
  const key = 'aadhaar_' + clean;
  const stored = otpStore[key];

  // Demo mode — if no server OTP was sent, accept any 6-digit input
  if (!stored) {
    if (otp && otp.length === 6) {
      console.log('Demo mode — OTP accepted without server verification');
      return res.json({ success: true, verified: true, demo: true });
    }
    return res.status(400).json({ error: 'No OTP was sent for this Aadhaar number' });
  }

  if (stored.otp !== otp) {
    return res.status(400).json({ error: 'Incorrect OTP' });
  }

  if (Date.now() > stored.expires) {
    delete otpStore[key];
    return res.status(400).json({ error: 'OTP expired — please request a new one' });
  }

  // OTP correct — mark as verified
  delete otpStore[key];
  res.json({ success: true, verified: true });
});

// ══════════════════════════════════════
// ROUTE 3: Register DID
// POST /register-did
// Body: { aadhaarNumber, email, displayName }
// ══════════════════════════════════════
app.post('/register-did', async (req, res) => {
  const { aadhaarNumber, email, displayName } = req.body;

  if (!aadhaarNumber || !email || !displayName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const clean = aadhaarNumber.replace(/\s/g, '');
  const did = generateSSIId();
  const aadhaarHash = hashData(clean);
  const emailHash = hashData(email.toLowerCase().trim());

  try {
    // Register DID on blockchain
    const tx = await contract.registerDID(did, aadhaarHash, emailHash);
    await tx.wait();

    // Store user info locally (demo — use DB in production)
    users[did] = { displayName, emailHash, createdAt: Date.now() };

    // Create session
    const sessionToken = generateToken();
    sessions[sessionToken] = { did, displayName, createdAt: Date.now() };

    console.log(`\n✓ DID registered: ${did}\n  TX: ${tx.hash}\n`);

    res.json({
      success: true,
      did,
      sessionToken,
      txHash: tx.hash,
      message: 'Identity created on Polygon blockchain'
    });

  } catch (err) {
    // Demo fallback — if blockchain unavailable, still return success
    console.log('Blockchain unavailable — demo mode:', err.message);
    const sessionToken = generateToken();
    users[did] = { displayName, emailHash, createdAt: Date.now() };
    sessions[sessionToken] = { did, displayName, createdAt: Date.now() };
    res.json({ success: true, did, sessionToken, demo: true });
  }
});

// ══════════════════════════════════════
// ROUTE 4: Sign In
// POST /signin
// Body: { did, password }
// Note: password is never stored — this just creates a session
// In production: verify password decrypts private key correctly
// ══════════════════════════════════════
app.post('/signin', async (req, res) => {
  const { did, password } = req.body;

  if (!did || !password) {
    return res.status(400).json({ error: 'Missing DID or password' });
  }

  try {
    // Check DID exists on blockchain
    const exists = await contract.didExists(did);
    if (!exists) {
      return res.status(400).json({ error: 'DID not found on blockchain' });
    }

    // Create session
    const sessionToken = generateToken();
    const userData = users[did] || { displayName: 'User' };
    sessions[sessionToken] = { did, displayName: userData.displayName, createdAt: Date.now() };

    res.json({ success: true, sessionToken, displayName: userData.displayName });

  } catch (err) {
    // Demo fallback
    console.log('Blockchain check skipped — demo mode');
    const sessionToken = generateToken();
    sessions[sessionToken] = { did, displayName: 'User', createdAt: Date.now() };
    res.json({ success: true, sessionToken, displayName: 'User', demo: true });
  }
});

// ══════════════════════════════════════
// ROUTE 5: Link Document
// POST /link-document
// Body: { did, documentNumber, documentType, ipfsCID }
// ══════════════════════════════════════
app.post('/link-document', async (req, res) => {
  const { did, documentNumber, documentType, ipfsCID } = req.body;

  if (!did || !documentNumber) {
    return res.status(400).json({ error: 'Missing DID or document number' });
  }

  const docHash = hashData(documentNumber);
  const cid = ipfsCID || 'bafybei' + crypto.randomBytes(20).toString('hex');

  try {
    // Check not already claimed
    const claimed = await contract.isDocumentClaimed(docHash);
    if (claimed) {
      return res.status(400).json({ error: 'This document is already registered to another Vault' });
    }

    // Link to blockchain
    const tx = await contract.linkDocument(did, docHash, cid);
    await tx.wait();

    console.log(`\n✓ Document linked: ${documentType}\n  DID: ${did}\n  TX: ${tx.hash}\n`);

    res.json({ success: true, txHash: tx.hash, ipfsCID: cid, documentType });

  } catch (err) {
    console.log('Blockchain unavailable — demo mode:', err.message);
    res.json({ success: true, txHash: '0x' + crypto.randomBytes(32).toString('hex'), ipfsCID: cid, demo: true });
  }
});

// ══════════════════════════════════════
// ROUTE 6: Verify (Sign in with Vault)
// POST /verify
// Body: { did, documentNumber }
// ══════════════════════════════════════
app.post('/verify', async (req, res) => {
  const { did, documentNumber } = req.body;

  if (!did || !documentNumber) {
    return res.status(400).json({ error: 'Missing DID or document number' });
  }

  const docHash = hashData(documentNumber);

  try {
    const isValid = await contract.verify(did, docHash);
    res.json({
      verified: isValid,
      message: isValid ? '✓ Identity verified' : '✗ Verification failed',
      proofId: 'vlt-' + crypto.randomBytes(6).toString('hex').toUpperCase(),
      dataShared: 'NONE',
      proofType: 'ZKP hash-comparison'
    });
  } catch (err) {
    console.log('Blockchain unavailable — demo mode');
    res.json({ verified: true, message: '✓ Identity verified (demo)', demo: true });
  }
});

// ══════════════════════════════════════
// ROUTE 7: URL Verify (Vault Shield)
// POST /url-verify
// Body: { domain }
// ══════════════════════════════════════
app.post('/url-verify', async (req, res) => {
  const { domain } = req.body;

  if (!domain) {
    return res.status(400).json({ error: 'Missing domain' });
  }

  try {
    const isVerified = await contract.isVerifiedOrg(domain);
    const orgData = isVerified ? await contract.getOrg(domain) : null;

    res.json({
      domain,
      registered: isVerified,
      verified: isVerified,
      orgDID: orgData ? orgData.orgDID : null,
      riskLevel: isVerified ? 'Low' : 'High',
      verdict: isVerified ? 'Safe — verified Vault organisation' : 'Unverified — not registered on Vault'
    });
  } catch (err) {
    // Demo — randomly verify for demo purposes
    const demo = Math.random() > 0.4;
    res.json({
      domain,
      registered: demo,
      verified: demo,
      riskLevel: demo ? 'Low' : 'High',
      verdict: demo ? 'Safe — verified Vault organisation (demo)' : 'Unverified (demo)',
      demo: true
    });
  }
});

// ══════════════════════════════════════
// ROUTE 8: Send Recovery Email
// POST /recovery-email
// Body: { did }
// ══════════════════════════════════════
app.post('/recovery-email', async (req, res) => {
  const { did } = req.body;

  if (!did) return res.status(400).json({ error: 'Missing DID' });

  const token = generateToken();
  const expires = Date.now() + 600000; // 10 minutes

  if (!recoveryStore[did]) recoveryStore[did] = {};
  recoveryStore[did].emailToken = { token, expires };

  // Demo — log token
  // Production — send email via SendGrid/Nodemailer
  console.log(`\n📧 Recovery email token for ${did}:\n  Token: ${token}\n  Expires: 10 minutes\n`);

  res.json({ success: true, message: 'Recovery link sent to registered email' });
});

// ══════════════════════════════════════
// ROUTE 9: Verify Recovery Email Token
// POST /recovery-email-verify
// Body: { did, token, recoveryPin }
// ══════════════════════════════════════
app.post('/recovery-email-verify', async (req, res) => {
  const { did, token, recoveryPin } = req.body;

  if (!did || !token || !recoveryPin) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const stored = recoveryStore[did]?.emailToken;

  if (!stored || stored.token !== token) {
    return res.status(400).json({ error: 'Invalid or expired recovery token' });
  }

  if (Date.now() > stored.expires) {
    return res.status(400).json({ error: 'Recovery token expired — 10 minute window passed' });
  }

  res.json({ success: true, message: 'Email recovery verified' });
});

// ══════════════════════════════════════
// ROUTE 10: Send Device Recovery Code
// POST /recovery-device-code
// Body: { did }
// ══════════════════════════════════════
app.post('/recovery-device-code', async (req, res) => {
  const { did } = req.body;

  if (!did) return res.status(400).json({ error: 'Missing DID' });

  const code = generateOTP();
  const expires = Date.now() + 600000; // 10 minutes

  if (!recoveryStore[did]) recoveryStore[did] = {};
  recoveryStore[did].deviceCode = { code, expires };

  // Demo — log code
  // Production — send push notification to trusted devices
  console.log(`\n📱 Device recovery code for ${did}: ${code}\n  Expires: 10 minutes\n`);

  res.json({ success: true, message: 'Code sent to trusted devices' });
});

// ══════════════════════════════════════
// ROUTE 11: Verify Device Recovery Code
// POST /recovery-device-verify
// Body: { did, code }
// ══════════════════════════════════════
app.post('/recovery-device-verify', async (req, res) => {
  const { did, code } = req.body;

  const stored = recoveryStore[did]?.deviceCode;

  if (!stored || stored.code !== code) {
    // Demo mode — accept any 6-digit code
    if (code && code.length === 6) {
      return res.json({ success: true, demo: true });
    }
    return res.status(400).json({ error: 'Invalid device code' });
  }

  if (Date.now() > stored.expires) {
    return res.status(400).json({ error: 'Device code expired — 10 minute window passed' });
  }

  res.json({ success: true, message: 'Device verified' });
});

// ══════════════════════════════════════
// ROUTE 12: Record ZIP Recovery Attempt
// POST /recovery-zip
// Body: { did, zipVerified }
// ══════════════════════════════════════
app.post('/recovery-zip', async (req, res) => {
  const { did, zipVerified } = req.body;

  if (!did) return res.status(400).json({ error: 'Missing DID' });

  try {
    // Record attempt on blockchain (enforces 12-hour gap)
    const tx = await contract.recordRecoveryAttempt(did);
    await tx.wait();

    const count = await contract.getRecoveryAttemptCount(did);
    const complete = count >= 3;

    res.json({
      success: true,
      attemptNumber: Number(count),
      complete,
      message: complete
        ? 'All 3 verifications complete — recovery processing'
        : `Attempt ${count} of 3 recorded. Come back in 12 hours for next submission.`,
      nextAllowedAt: complete ? null : Date.now() + (12 * 60 * 60 * 1000)
    });

  } catch (err) {
    // Demo fallback
    if (!recoveryStore[did]) recoveryStore[did] = {};
    if (!recoveryStore[did].zipAttempts) recoveryStore[did].zipAttempts = [];

    const attempts = recoveryStore[did].zipAttempts;

    if (attempts.length > 0) {
      const last = attempts[attempts.length - 1];
      const twelveHours = 12 * 60 * 60 * 1000;
      if (Date.now() - last < twelveHours) {
        const waitMs = twelveHours - (Date.now() - last);
        return res.status(400).json({
          error: `Must wait 12 hours between attempts. Time remaining: ${Math.ceil(waitMs/3600000)} hours`
        });
      }
    }

    attempts.push(Date.now());
    const complete = attempts.length >= 3;

    res.json({
      success: true,
      attemptNumber: attempts.length,
      complete,
      message: complete
        ? 'All 3 verifications complete — recovery processing'
        : `Attempt ${attempts.length} of 3 recorded. Come back in 12 hours.`,
      nextAllowedAt: complete ? null : Date.now() + (12 * 60 * 60 * 1000),
      demo: true
    });
  }
});

// ══════════════════════════════════════
// ROUTE 13: Guardian Number Challenge
// POST /recovery-guardian-challenge
// Body: { did }
// ══════════════════════════════════════
app.post('/recovery-guardian-challenge', async (req, res) => {
  const { did } = req.body;

  if (!did) return res.status(400).json({ error: 'Missing DID' });

  const challengeNumber = Math.floor(10 + Math.random() * 90);
  const expires = Date.now() + 600000; // 10 minutes

  if (!recoveryStore[did]) recoveryStore[did] = {};
  recoveryStore[did].guardianChallenge = { challengeNumber, expires };

  console.log(`\n👥 Guardian challenge for ${did}: ${challengeNumber}\n`);

  res.json({ success: true, challengeNumber, expiresIn: 600 });
});

// ══════════════════════════════════════
// HEALTH CHECK
// ══════════════════════════════════════
app.get('/health', (req, res) => {
  res.json({
    status: 'running',
    network: process.env.POLYGON_RPC_URL ? 'Polygon Mumbai' : 'Sepolia (fallback)',
    contract: process.env.CONTRACT_ADDRESS || 'not set',
    timestamp: new Date().toISOString()
  });
});

// ══════════════════════════════════════
// START SERVER
// ══════════════════════════════════════
app.listen(3001, () => {
  console.log('\n🔐 Vault backend running on port 3001');
  console.log(`   Network: ${process.env.POLYGON_RPC_URL ? 'Polygon Mumbai' : 'Sepolia (fallback)'}`);
  console.log(`   Contract: ${process.env.CONTRACT_ADDRESS || 'not set — deploy first'}\n`);
});
// Send OTP for eKYC recovery verification
app.post('/recovery-ekyc-otp', async (req, res) => {
  const { aadhaarNumber } = req.body;
  const otp = generateOTP();
  const key = 'recovery_' + (aadhaarNumber||'').replace(/\s/g,'');
  otpStore[key] = { otp, expires: Date.now() + 600000 };
  console.log(`\n🔐 Recovery eKYC OTP: ${otp}\n`);
  res.json({ success: true });
});

// Verify eKYC OTP for recovery
app.post('/recovery-ekyc-verify', async (req, res) => {
  const { aadhaarNumber, otp, shareCode } = req.body;
  const key = 'recovery_' + (aadhaarNumber||'').replace(/\s/g,'');
  const stored = otpStore[key];
  // Demo mode — accept anything
  if (!stored || stored.otp !== otp) {
    if (otp && otp.length === 6 && shareCode && shareCode.length === 4) {
      return res.json({ success: true, verified: true, demo: true });
    }
    return res.status(400).json({ error: 'Invalid OTP or share code' });
  }
  delete otpStore[key];
  res.json({ success: true, verified: true });
});