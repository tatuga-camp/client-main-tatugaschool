import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/interfaces";

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

const useUserStore = create(
  persist<UserStore>(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    { name: "user-storage", getStorage: () => sessionStorage }
  )
);

export default useUserStore;
