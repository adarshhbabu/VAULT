import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface VaultDocument {
  id: number; name: string; category: string; emoji: string;
  color: string; tags: string[]; cid: string; date: string; size: string; onChain: boolean; txHash?: string;
}

export interface VaultUser {
  displayName: string; ssiId: string; documents: VaultDocument[]; guardians: string[]; vaultScore: number;
}

interface VaultState {
  user: VaultUser | null; isAuthenticated: boolean;
  login: (user: VaultUser) => void; logout: () => void;
  addDocument: (doc: VaultDocument) => void;
}

export function generateSSI() {
  return `did:vault:0x${Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
}

export function getInitials(name: string) {
  return name.trim().split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

export const useVaultStore = create<VaultState>()(
  persist(
    (set) => ({
      user: null, isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      addDocument: (doc) => set((s) => ({ user: s.user ? { ...s.user, documents: [...s.user.documents, doc] } : null })),
    }),
    { name: 'vault-storage' }
  )
);
