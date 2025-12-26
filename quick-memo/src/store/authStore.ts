import { create, StateCreator } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { User } from "@/types/User";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (userData: User) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (userData: Partial<User>) => void;
}

const createAuthSlice: StateCreator<
  AuthState,
  [["zustand/devtools", never], ["zustand/persist", unknown]]
> = (set) => ({
  // --- State ---
  user: null,
  isLoading: true,

  // --- Actions ---
  setUser: (userData: User) => {
    set({ user: userData, isLoading: false }, false, "setUser");
  },

  clearUser: () => {
    set({ user: null, isLoading: false }, false, "clearUser");
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading }, false, "setLoading");
  },

  updateUser: (userData: Partial<User>) => {
    set(
      (state) => ({
        user: state.user ? { ...state.user, ...userData } : null,
      }),
      false,
      "updateUser"
    );
  },
});

const useAuthStore = create<AuthState>()(
  devtools(
    persist(createAuthSlice, {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    }),
    {
      name: "AuthStore",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);

export default useAuthStore;
