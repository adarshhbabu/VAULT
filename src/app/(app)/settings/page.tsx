import Link from "next/link";
import { Settings, Bell, Shield, Info, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="font-mono text-[11px] text-muted-foreground tracking-[3px] uppercase mb-1">Configuration</p>
        <h1 className="font-sans text-3xl font-bold flex items-center gap-2"><Settings className="h-7 w-7 text-vault-gold" /> Settings</h1>
      </div>

      <div className="flex flex-col gap-6 max-w-2xl">
        {/* Account */}
        <div className="bg-vault-surface/80 border border-white/[0.07] rounded-2xl p-6">
          <h2 className="font-sans font-semibold text-lg mb-4">Account</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase block mb-1.5">Display Name</label>
              <input defaultValue="Adarsh Babu" className="w-full bg-vault-deep border border-white/[0.08] rounded-xl px-4 py-2.5 font-sans text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-vault-gold/40" />
            </div>
            <div>
              <label className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase block mb-1.5">Email (hashed, for recovery)</label>
              <p className="font-mono text-sm text-muted-foreground px-1">r***@gmail.com · <button className="text-vault-gold hover:underline">Update</button></p>
            </div>
            <div className="flex-1">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">Vault Address</p>
              <p className="text-sm font-mono text-foreground">did:vault:0x8f3a...ef2c</p>
              <p className="text-[10px] text-vault-teal font-mono mt-1">Anchored on Ethereum Mainnet ✓</p>
            </div>
            <div>
              <label className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase block mb-1.5">Recovery Code</label>
              <p className="font-mono text-sm text-vault-teal px-1">Set · <button className="text-vault-gold hover:underline">Change</button></p>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-vault-surface/80 border border-white/[0.07] rounded-2xl p-6">
          <h2 className="font-sans font-semibold text-lg mb-4">Security</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase block mb-1.5">Change Password</label>
              <input type="password" placeholder="Current password" className="w-full bg-vault-deep border border-white/[0.08] rounded-xl px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-vault-gold/40 mb-2" />
              <input type="password" placeholder="New password" className="w-full bg-vault-deep border border-white/[0.08] rounded-xl px-4 py-2.5 font-mono text-sm text-foreground placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-vault-gold/40" />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-vault-surface/80 border border-white/[0.07] rounded-2xl p-6">
          <h2 className="font-sans font-semibold text-lg mb-4 flex items-center gap-2"><Bell className="h-5 w-5 text-vault-gold" /> Notifications</h2>
          <div className="flex flex-col gap-3">
            {["Recovery attempts", "Guardian requests", "Vault Shield alerts", "Document uploads"].map(n => (
              <div key={n} className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0">
                <span className="font-sans text-sm text-foreground">{n}</span>
                <input type="checkbox" defaultChecked className="accent-vault-gold w-4 h-4" />
              </div>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="bg-vault-surface/80 border border-white/[0.07] rounded-2xl p-6">
          <h2 className="font-sans font-semibold text-lg mb-4 flex items-center gap-2"><Info className="h-5 w-5 text-vault-gold" /> About</h2>
          <div className="flex flex-col gap-2">
            {[
              ["App Version", "1.0.0-MVP"],
              ["Blockchain", "Ethereum Mainnet"],
              ["Smart Contract", "0x3f4a...b5c6"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5 border-b border-white/[0.05] last:border-0">
                <span className="font-mono text-[11px] text-muted-foreground">{k}</span>
                <span className="font-mono text-[11px] text-foreground">{v}</span>
              </div>
            ))}
            <div className="text-center pb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-vault-gold/10 border border-vault-gold/20 mb-3">
              <span className="text-xl font-bold italic text-vault-gold">V</span>
            </div>
            <p className="text-xs font-mono text-muted-foreground">VAULT v1.0.4-stable</p>
            <p className="text-[10px] text-muted-foreground/40 mt-1 uppercase tracking-widest">Built for India Stack · 2026</p>
          </div>
            <Link href="/terms" className="text-xs text-vault-gold hover:underline font-mono mt-1">View terms & conditions →</Link>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-vault-red/[0.04] border border-vault-red/20 rounded-2xl p-6">
          <h2 className="font-sans font-semibold text-lg mb-2 flex items-center gap-2 text-vault-red"><AlertTriangle className="h-5 w-5" /> Danger Zone</h2>
          <p className="text-sm text-muted-foreground font-sans mb-4">Deleting your account requires password + 2 guardian confirmations + 72h cooldown. This cannot be undone.</p>
          <button className="border border-vault-red/40 text-vault-red hover:bg-vault-red/10 font-semibold px-5 py-2.5 rounded-xl transition-all font-sans text-sm">
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
}
