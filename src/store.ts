import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type JoinState =
  | { status: 'none' }
  | { status: 'pending'; role: string; reason: string; at: number };

interface PersistedState {
  join: JoinState;
  libraryTab: 'members' | 'history';
  recordsYear: string;
  sendJoin: (role: string, reason: string) => void;
  cancelJoin: () => void;
  setLibraryTab: (t: 'members' | 'history') => void;
  setRecordsYear: (y: string) => void;
}

/** Persisted prototype state (survives refresh). */
export const useApp = create<PersistedState>()(
  persist(
    (set) => ({
      join: { status: 'none' },
      libraryTab: 'members',
      recordsYear: '1404',
      sendJoin: (role, reason) => set({ join: { status: 'pending', role, reason, at: Date.now() } }),
      cancelJoin: () => set({ join: { status: 'none' } }),
      setLibraryTab: (libraryTab) => set({ libraryTab }),
      setRecordsYear: (recordsYear) => set({ recordsYear }),
    }),
    {
      name: 'naghshineh-prototype',
      version: 1,
      storage: createJSONStorage(() => {
        try {
          return window.localStorage;
        } catch {
          // private mode etc. — fall back to an in-memory store
          const m = new Map<string, string>();
          return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k) };
        }
      }),
    },
  ),
);

// ───── Ephemeral UI state (not persisted) ─────
interface Toast {
  id: number;
  text: string;
  tone?: 'info' | 'success';
}
interface UiState {
  toasts: Toast[];
  toast: (text: string, tone?: Toast['tone']) => void;
  dismiss: (id: number) => void;
}
let seq = 1;
export const useUi = create<UiState>()((set, get) => ({
  toasts: [],
  toast: (text, tone = 'success') => {
    const id = seq++;
    set({ toasts: [...get().toasts.slice(-2), { id, text, tone }] });
    window.setTimeout(() => get().dismiss(id), 2800);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

/** Camera hand-off between the two maps (neighbourhood ⇄ school zoom transitions). */
export const transition = { fromSchool: false, toSchool: false };
