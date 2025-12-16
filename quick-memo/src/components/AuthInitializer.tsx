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
        const user = await authService.validateSession();
        if (user.success) {
          setUser(user.data);
        }
      } catch {
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
