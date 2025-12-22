import { create } from "zustand";
import { User } from "@/types/User";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (userData: User) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null, // Null if unauthenticated, object if authenticated
  isLoading: true, // Start as true to prevent premature redirects

  // --- Actions ---

  // Called on app load or login to set the authenticated state
  setUser: (userData) => set({ user: userData, isLoading: false }),

  // Called on logout or failed session check
  clearUser: () => set({ user: null, isLoading: false }),

  // Set loading state (e.g., during login or initial check)
  setLoading: (loading) => set({ isLoading: loading }),
}));

export default useAuthStore;
