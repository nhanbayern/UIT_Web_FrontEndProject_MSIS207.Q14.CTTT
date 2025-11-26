import { useSearchParams } from "react-router-dom";
import { useCallback } from "react";

export interface ProductFilters {
  q: string;
  category: string;
  region: string;
  page: number;
  limit: number;
}

export function useProductFilters(defaultRegion?: string) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read values from URL query params
  const filters: ProductFilters = {
    q: searchParams.get("q") || "",
    category: searchParams.get("category") || "all",
    region: searchParams.get("region") || defaultRegion || "all",
    page: parseInt(searchParams.get("page") || "1", 10),
    limit: parseInt(searchParams.get("limit") || "10", 10),
  };

  /**
   * Update a single filter in the URL.
   * Automatically resets page to 1 when filters change (except when updating page itself).
   */
  const updateFilter = useCallback(
    (key: keyof ProductFilters, value: string | number) => {
      const params = new URLSearchParams(searchParams);

      // Convert value to string
      const stringValue = String(value);

      // Handle the filter update
      if (key === "q") {
        if (stringValue) {
          params.set("q", stringValue);
        } else {
          params.delete("q");
        }
      } else if (key === "category") {
        if (stringValue && stringValue !== "all") {
          params.set("category", stringValue);
        } else {
          params.delete("category");
        }
      } else if (key === "region") {
        if (stringValue && stringValue !== "all") {
          params.set("region", stringValue);
        } else {
          params.delete("region");
        }
      } else if (key === "page") {
        if (stringValue && stringValue !== "1") {
          params.set("page", stringValue);
        } else {
          params.delete("page");
        }
      } else if (key === "limit") {
        if (stringValue && stringValue !== "10") {
          params.set("limit", stringValue);
        } else {
          params.delete("limit");
        }
      }

      // Reset page to 1 when filters change (but not when page itself changes)
      if (key !== "page" && key !== "limit") {
        params.delete("page");
      }

      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  /**
   * Update multiple filters at once
   */
  const updateFilters = useCallback(
    (updates: Partial<ProductFilters>) => {
      const params = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        const stringValue = String(value);

        if (key === "q") {
          if (stringValue) {
            params.set("q", stringValue);
          } else {
            params.delete("q");
          }
        } else if (key === "category") {
          if (stringValue && stringValue !== "all") {
            params.set("category", stringValue);
          } else {
            params.delete("category");
          }
        } else if (key === "region") {
          if (stringValue && stringValue !== "all") {
            params.set("region", stringValue);
          } else {
            params.delete("region");
          }
        } else if (key === "page") {
          if (stringValue && stringValue !== "1") {
            params.set("page", stringValue);
          } else {
            params.delete("page");
          }
        } else if (key === "limit") {
          if (stringValue && stringValue !== "10") {
            params.set("limit", stringValue);
          } else {
            params.delete("limit");
          }
        }
      });

      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  /**
   * Clear all filters and reset to defaults
   */
  const clearFilters = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  /**
   * Check if any filters are active
   */
  const hasActiveFilters =
    filters.q !== "" ||
    filters.category !== "all" ||
    (filters.region !== "all" && filters.region !== (defaultRegion || "all"));

  /**
   * Get filter params for API call (undefined for default values)
   */
  const getApiParams = useCallback(() => {
    return {
      page: filters.page,
      limit: filters.limit,
      q: filters.q || undefined,
      category: filters.category === "all" ? undefined : filters.category,
      region: filters.region === "all" ? undefined : filters.region,
    };
  }, [filters]);

  return {
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    getApiParams,
  };
}
