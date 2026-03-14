export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function loginUser(payload: { username: string; password: string }) {
  const res = await fetch(`${API}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  return res.json();
}

export async function sendOtp(phone: string) {
  const res = await fetch(`${API}/send-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone }) });
  return res.json();
}

export async function registerUser(payload: { phone: string; otp: string; ssiId: string; displayName: string }) {
  const res = await fetch(`${API}/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  return res.json();
}

export async function linkDocument(payload: { ssiId: string; documentNumber: string; documentType: string }) {
  const res = await fetch(`${API}/link-document`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  return res.json();
}

export async function verifyUrl(url: string, ssiId: string) {
  const res = await fetch(`${API}/verify-url`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url, ssiId }) });
  return res.json();
}
