import { create } from "zustand";
import { User } from "@/interfaces";

interface AccountStore {
  account: User | null;
  signURL: string | null;
  originalURL: string | null;
  setUser: (user: User) => void;
  setOriginalURL: (originalURL: string) => void;
  setSignURL: (signURL: string) => void;
  clearUser: () => void;
}

export const useAccountStore = create<AccountStore>((set) => ({
  account: null,
  signURL: null,
  setSignURL: (signURL: string) => set(() => ({ signURL: signURL })),
  setOriginalURL: (originalURL: string) => set(() => ({ originalURL })),
  setAccount: (user: User) => set(() => ({ user })),
  clearAccount: () => set(() => ({ user: null })),
}));

export default useAccountStore;
