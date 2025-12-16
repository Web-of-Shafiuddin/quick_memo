import { create } from "zustand";
import { User } from "@/types/User";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (userData: User) => void;  //remove created at and updated at from here
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null, // Null if unauthenticated, object if authenticated
  isLoading: false, 

  // --- Actions ---

  // Called on app load or login to set the authenticated state
  setUser: (userData) => set({ user: userData, isLoading: false }),

  // Called on logout or failed session check
  clearUser: () => set({ user: null, isLoading: false }),

  // Set loading state (e.g., during login or initial check)
  setLoading: (loading) => set({ isLoading: loading }),
}));

export default useAuthStore;
