import api from "@/lib/api";

export interface AdPlacement {
  ad_id: number;
  slot_name: string;
  ad_type: "ADSENSE" | "CUSTOM_BANNER" | "CUSTOM_HTML";
  ad_client: string | null;
  ad_slot: string | null;
  custom_html: string | null;
  custom_image_url: string | null;
  custom_link_url: string | null;
  is_active?: boolean;
  display_order: number;
}

// In-memory client-side cache
let placementsCache: AdPlacement[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

export const adService = {
  getAdPlacements: async (): Promise<AdPlacement[]> => {
    if (placementsCache && Date.now() - cacheTime < CACHE_TTL) {
      return placementsCache;
    }
    const response = await api.get<{ success: boolean; data: AdPlacement[] }>("/ads/placements");
    placementsCache = response.data.data;
    cacheTime = Date.now();
    return placementsCache;
  },

  getAdPlacement: async (slotName: string): Promise<AdPlacement | null> => {
    const placements = await adService.getAdPlacements();
    return placements.find((p) => p.slot_name === slotName) || null;
  },

  shouldShowAds: async (): Promise<boolean> => {
    try {
      const response = await api.get<{ success: boolean; data: { showAds: boolean } }>("/ads/should-show");
      return response.data.data.showAds;
    } catch {
      return true;
    }
  },
};
