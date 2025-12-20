import { useState, useEffect, useCallback } from "react";

interface Province {
  code: number;
  name: string;
  codename?: string;
}

interface District {
  code: number;
  name: string;
  codename?: string;
  province_code?: number;
}

interface Ward {
  code: number;
  name: string;
  codename?: string;
  district_code?: number;
}

interface ProvinceWithDistricts extends Province {
  districts?: District[];
}

interface DistrictWithWards extends District {
  wards?: Ward[];
}

const PROVINCES_CACHE_KEY = "vietnam_provinces_cache";
const CACHE_EXPIRY_KEY = "vietnam_provinces_cache_expiry";
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function useVietnamAddress() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Load provinces from cache or API
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setLoadingProvinces(true);

        // Check cache first
        const cachedData = localStorage.getItem(PROVINCES_CACHE_KEY);
        const cachedExpiry = localStorage.getItem(CACHE_EXPIRY_KEY);

        if (cachedData && cachedExpiry) {
          const expiryTime = parseInt(cachedExpiry, 10);
          if (Date.now() < expiryTime) {
            // Cache is still valid
            setProvinces(JSON.parse(cachedData));
            setLoadingProvinces(false);
            return;
          }
        }

        // Fetch from API
        const response = await fetch("https://provinces.open-api.vn/api/p/");
        if (!response.ok) {
          throw new Error("Failed to load provinces");
        }

        const data: Province[] = await response.json();
        setProvinces(data);

        // Cache the data
        localStorage.setItem(PROVINCES_CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(
          CACHE_EXPIRY_KEY,
          (Date.now() + CACHE_DURATION_MS).toString()
        );
      } catch (error) {
        console.error("Error loading provinces:", error);
      } finally {
        setLoadingProvinces(false);
      }
    };

    loadProvinces();
  }, []);

  // Load districts when province is selected
  const loadDistricts = useCallback(async (provinceCode: number) => {
    if (!provinceCode) {
      setDistricts([]);
      return;
    }

    try {
      setLoadingDistricts(true);
      const response = await fetch(
        `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
      );
      if (!response.ok) {
        throw new Error("Failed to load districts");
      }

      const data: ProvinceWithDistricts = await response.json();
      setDistricts(data.districts || []);
    } catch (error) {
      console.error("Error loading districts:", error);
      setDistricts([]);
    } finally {
      setLoadingDistricts(false);
    }
  }, []);

  // Load wards when district is selected
  const loadWards = useCallback(async (districtCode: number) => {
    if (!districtCode) {
      setWards([]);
      return;
    }

    try {
      setLoadingWards(true);
      const response = await fetch(
        `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
      );
      if (!response.ok) {
        throw new Error("Failed to load wards");
      }

      const data: DistrictWithWards = await response.json();
      setWards(data.wards || []);
    } catch (error) {
      console.error("Error loading wards:", error);
      setWards([]);
    } finally {
      setLoadingWards(false);
    }
  }, []);

  // Reset districts and wards
  const resetDistricts = useCallback(() => {
    setDistricts([]);
    setWards([]);
  }, []);

  // Reset wards only
  const resetWards = useCallback(() => {
    setWards([]);
  }, []);

  return {
    provinces,
    districts,
    wards,
    loadingProvinces,
    loadingDistricts,
    loadingWards,
    loadDistricts,
    loadWards,
    resetDistricts,
    resetWards,
  };
}

// Helper to concatenate address
export function concatenateAddress(
  addressLine: string,
  wardName: string,
  districtName: string,
  provinceName: string
): string {
  const parts = [addressLine, wardName, districtName, provinceName].filter(
    (part) => part && part.trim()
  );
  return parts.join(", ");
}
