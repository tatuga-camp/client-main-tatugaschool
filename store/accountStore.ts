import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/interfaces";

interface AccountStore {
  account: User | null;
  photo: string | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useAccountStore = create<AccountStore>((set) => ({
  account: null,
  photo: null,
  setPhoto: (photo: string) => set((state) => ({ photo })),
  setAccount: (user: User) => set(() => ({ user })),
  clearAccount: () => set(() => ({ user: null })),
}));

export default useAccountStore;
