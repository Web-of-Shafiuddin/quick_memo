"use client";

import { useState, useEffect } from "react";
import { adService, AdPlacement } from "@/services/adService";
import useAuthStore from "@/store/authStore";
import { useShallow } from "zustand/react/shallow";

export function useShowAds() {
  const { user } = useAuthStore(
    useShallow((state) => ({ user: state.user }))
  );
  const [showAds, setShowAds] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      if (!user) {
        // Not logged in — show ads (public pages)
        setShowAds(true);
        setLoading(false);
        return;
      }
      try {
        const result = await adService.shouldShowAds();
        setShowAds(result);
      } catch {
        setShowAds(true);
      } finally {
        setLoading(false);
      }
    };
    check();
  }, [user]);

  return { showAds, loading };
}

export function useAdPlacement(slotName: string) {
  const [placement, setPlacement] = useState<AdPlacement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await adService.getAdPlacement(slotName);
        setPlacement(result);
      } catch {
        setPlacement(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slotName]);

  return { placement, loading };
}
