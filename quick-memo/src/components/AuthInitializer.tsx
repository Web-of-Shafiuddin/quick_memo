"use client";
import React, { useEffect } from "react";
import useAuthStore from "@/store/authStore";
import { authService } from "@/services/authService";
import { useShallow } from "zustand/react/shallow";

const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const { setUser, clearUser, setLoading } = useAuthStore(
    useShallow((state) => ({
      setUser: state.setUser,
      clearUser: state.clearUser,
      setLoading: state.setLoading,
    }))
  );

  useEffect(() => {
    const checkSession = async () => {
      try {
        setLoading(true);

        // First, check if user data exists in localStorage
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('authToken');

        if (storedUser && storedToken) {
          // Validate the token with backend
          try {
            const response = await authService.validateSession();
            if (response.success) {
              setUser(response.data);
              // Update localStorage with fresh data
              localStorage.setItem('user', JSON.stringify(response.data));
              return;
            }
          } catch (error) {
            // Token invalid, clear storage
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');
          }
        }

        // No valid session
        clearUser();
      } catch (error) {
        clearUser();
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [setUser, clearUser, setLoading]);

  return <>{children}</>;
};

export default AuthInitializer;
