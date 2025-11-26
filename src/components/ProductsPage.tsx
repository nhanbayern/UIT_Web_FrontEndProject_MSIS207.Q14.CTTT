import { useEffect } from "react";
import { ProductCard } from "./ProductCard";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useApp } from "../contexts/AppContext";
import { useProductFilters } from "../hooks/useProductFilters";

interface ProductsPageProps {
  filterRegion?: string;
}

export function ProductsPage({ filterRegion }: ProductsPageProps) {
  const { products, loadProducts, totalItems, totalPages } = useApp();
  const {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    getApiParams,
  } = useProductFilters(filterRegion);

  const categories = [
    "all",
    ...Array.from(new Set(products.map((p: any) => p.category))),
  ];
  const regions = [
    "all",
    ...Array.from(new Set(products.map((p: any) => p.region))),
  ];

  // Load products automatically when URL query params change
  useEffect(() => {
    const apiParams = getApiParams();
    loadProducts(apiParams);
  }, [
    filters.q,
    filters.category,
    filters.region,
    filters.page,
    filters.limit,
  ]);

  // Store current product list URL whenever filters change or page loads
  // This ensures that when user clicks a product card, we have the latest URL stored
  useEffect(() => {
    const currentUrl = window.location.pathname + window.location.search;
    sessionStorage.setItem("lastProductsPage", currentUrl);
  }, [
    filters.q,
    filters.category,
    filters.region,
    filters.page,
    filters.limit,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="container mx-auto px-4">
        <h1 className="mb-8 text-primary">Danh Mục Sản Phẩm</h1>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-primary/10 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-primary">
                Tìm kiếm
              </label>
              <Input
                placeholder="Tìm sản phẩm..."
                value={filters.q}
                onChange={(e) => updateFilter("q", e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-primary">
                Loại rượu
              </label>
              <Select
                value={filters.category}
                onValueChange={(value: string) =>
                  updateFilter("category", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {categories
                    .filter((c) => c !== "all")
                    .map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-primary">
                Vùng miền
              </label>
              <Select
                value={filters.region}
                onValueChange={(value: string) => updateFilter("region", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vùng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {regions
                    .filter((r) => r !== "all")
                    .map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {hasActiveFilters && (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:bg-primary/5"
                onClick={clearFilters}
              >
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="mb-4">
          <p className="text-muted-foreground">
            Hiển thị {totalItems} sản phẩm
          </p>
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Không tìm thấy sản phẩm nào</p>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Trang {filters.page} / {totalPages || 1}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={filters.page <= 1}
              onClick={() =>
                updateFilter("page", Math.max(1, filters.page - 1))
              }
            >
              Trước
            </Button>
            <Button
              disabled={filters.page >= (totalPages || 1)}
              onClick={() => updateFilter("page", filters.page + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
