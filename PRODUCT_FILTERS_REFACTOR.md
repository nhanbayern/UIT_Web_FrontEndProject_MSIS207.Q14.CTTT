# Product Filters Refactor - URL-Driven State

## 📋 Overview

Refactored `ProductsPage` to use **URL query parameters** as the single source of truth for search, filters, and pagination state. This enables:

- ✅ **Bookmarkable URLs** - Users can save filtered product pages
- ✅ **Shareable Links** - Share URLs with filters preserved
- ✅ **Browser Navigation** - Back/Forward buttons work correctly
- ✅ **Persistent State** - F5 reload maintains filter state
- ✅ **Deep Linking** - Direct links from external sources work
- ✅ **SEO Friendly** - Search engines can index filter combinations

---

## 🏗️ Architecture Changes

### **Before (State-based)**

```tsx
// State stored in React component
const [searchTerm, setSearchTerm] = useState("");
const [selectedCategory, setSelectedCategory] = useState("all");
const [selectedRegion, setSelectedRegion] = useState("all");

// URL: /products (no query params)
```

### **After (URL-driven)**

```tsx
// State stored in URL query parameters
const { filters, updateFilter } = useProductFilters();

// URL: /products?q=vodka&category=Rượu+Gạo&region=Miền+Bắc&page=2
```

---

## 📦 New Files Created

### 1. **`src/hooks/useProductFilters.ts`**

Custom hook for URL synchronization with filters.

**Features:**

- ✅ Reads filter values from URL query params
- ✅ Updates URL when filters change
- ✅ Auto-resets page to 1 when filters change
- ✅ Provides clean API params for backend calls
- ✅ Checks if filters are active
- ✅ Clear all filters function

**API:**

```typescript
const {
  filters, // Current filter values from URL
  updateFilter, // Update single filter
  updateFilters, // Update multiple filters
  clearFilters, // Reset all filters
  hasActiveFilters, // Check if any filter is active
  getApiParams, // Get params for API call
} = useProductFilters(defaultRegion);
```

---

## 🔄 Modified Files

### 1. **`src/components/ProductsPage.tsx`**

**Key Changes:**

#### Before:

```tsx
const [searchTerm, setSearchTerm] = useState("");
const [selectedCategory, setSelectedCategory] = useState("all");

useEffect(() => {
  const delay = setTimeout(() => {
    loadProducts({
      page: 1,
      q: searchTerm || undefined,
      category: selectedCategory === "all" ? undefined : selectedCategory,
    });
  }, 300);
  return () => clearTimeout(delay);
}, [searchTerm, selectedCategory]);
```

#### After:

```tsx
const { filters, updateFilter, clearFilters, hasActiveFilters, getApiParams } =
  useProductFilters(filterRegion);

useEffect(() => {
  const apiParams = getApiParams();
  loadProducts(apiParams);
}, [filters.q, filters.category, filters.region, filters.page, filters.limit]);
```

**Benefits:**

- ✅ No internal state management
- ✅ URL is automatically updated
- ✅ Simpler component logic
- ✅ Automatic debouncing via URL change detection

---

## 🎯 URL Query Parameter Format

### **Search**

```
/products?q=vodka
/products?q=rượu+gạo
```

### **Category Filter**

```
/products?category=Rượu+Gạo
/products?category=Rượu+Trái+Cây
```

### **Region Filter**

```
/products?region=Miền+Bắc
/products?region=Miền+Nam
```

### **Pagination**

```
/products?page=2
/products?page=3&limit=20
```

### **Combined Filters**

```
/products?q=vodka&category=Rượu+Gạo&region=Miền+Bắc&page=2
```

### **Default Values (omitted from URL)**

- `q` = "" (empty search)
- `category` = "all"
- `region` = "all" (or `filterRegion` prop)
- `page` = 1
- `limit` = 10

---

## 🔧 How It Works

### **1. User Interaction Flow**

```
User types in search input
         ↓
updateFilter("q", "vodka") called
         ↓
URL updated to /products?q=vodka
         ↓
useEffect detects URL change
         ↓
getApiParams() builds API request
         ↓
loadProducts(apiParams) called
         ↓
Products fetched and displayed
```

### **2. Browser Back/Forward**

```
User clicks Back button
         ↓
Browser navigates to previous URL
         ↓
useEffect detects URL change
         ↓
Filters automatically restored
         ↓
Products reloaded with old filters
```

### **3. Direct Link / Bookmark**

```
User opens /products?q=vodka&region=Miền+Nam
         ↓
useProductFilters reads URL params
         ↓
filters = { q: "vodka", region: "Miền Nam", ... }
         ↓
useEffect triggers on mount
         ↓
Products loaded with filters applied
```

### **4. F5 Reload**

```
User presses F5 on /products?category=Rượu+Gạo&page=2
         ↓
Page reloads
         ↓
useProductFilters reads URL params
         ↓
Filters and pagination restored
         ↓
Products reloaded with same state
```

---

## 📝 Usage Examples

### **Basic Filter Update**

```tsx
// Update search query
updateFilter("q", "vodka");

// Update category
updateFilter("category", "Rượu Gạo");

// Update region
updateFilter("region", "Miền Bắc");

// Update page
updateFilter("page", 2);
```

### **Multiple Filters**

```tsx
updateFilters({
  q: "vodka",
  category: "Rượu Gạo",
  region: "Miền Bắc",
  page: 1,
});
```

### **Clear All Filters**

```tsx
clearFilters(); // Resets URL to /products
```

### **Check Active Filters**

```tsx
if (hasActiveFilters) {
  // Show "Clear Filters" button
}
```

### **Get API Parameters**

```tsx
const apiParams = getApiParams();
// Returns: { page: 1, limit: 10, q: "vodka", category: "Rượu Gạo", region: undefined }
```

---

## ✅ Testing Checklist

- [x] Search input updates URL query param `q`
- [x] Category dropdown updates URL query param `category`
- [x] Region dropdown updates URL query param `region`
- [x] Pagination buttons update URL query param `page`
- [x] Changing filters resets page to 1
- [x] F5 reload preserves filters
- [x] Browser back/forward buttons work
- [x] Bookmarked URLs restore filters
- [x] Shared URLs work correctly
- [x] "Clear Filters" button resets URL
- [x] Direct navigation to filtered URL works
- [x] Multiple tabs with different filters work independently

---

## 🚀 Benefits

### **User Experience**

- 📌 Can bookmark filtered product pages
- 🔗 Can share filtered links with others
- ⬅️ Back button works as expected
- 🔄 F5 doesn't lose filter state
- 📱 Deep links from mobile apps work

### **Developer Experience**

- 🧹 Cleaner component code
- 🔧 Easier to debug (state visible in URL)
- 📊 Better analytics tracking
- 🧪 Easier to test specific filter combinations
- 🔌 Reusable hook for other pages

### **SEO**

- 🔍 Search engines can index filter combinations
- 🌐 Better crawlability
- 📈 More indexed pages

---

## 🔮 Future Enhancements

### **Potential Additions:**

1. **Sort Parameter**

```typescript
/products?sort=price_asc
/products?sort=name_desc
```

2. **Price Range Filter**

```typescript
/products?min_price=100000&max_price=500000
```

3. **Multiple Categories**

```typescript
/products?category=Rượu+Gạo,Rượu+Nếp
```

4. **URL Shortening**

```typescript
/products?f=eyJxIjoidm9ka2EiLCJjYXRlZ29yeSI6IlJpYW8gR2EiLCJwYWdlIjoyfQ==
```

5. **Filter Presets**

```typescript
/products?preset=bestsellers
/products?preset=new_arrivals
```

---

## 📚 Related Files

- `src/hooks/useProductFilters.ts` - Custom hook
- `src/components/ProductsPage.tsx` - Main component
- `src/contexts/AppContext.tsx` - loadProducts function
- `src/services/api.ts` - fetchProducts API call
- `src/App.tsx` - Routing configuration

---

## 🐛 Troubleshooting

### **Issue: Filters not persisting on reload**

**Solution:** Check that `react-router-dom` is properly configured with `BrowserRouter`.

### **Issue: Multiple API calls on filter change**

**Solution:** useEffect dependencies are correctly set to individual filter values.

### **Issue: URL not updating**

**Solution:** Ensure `useSearchParams` from `react-router-dom` is being used.

### **Issue: Page not resetting when filter changes**

**Solution:** `updateFilter` automatically resets page to 1 for non-page updates.

---

## 📞 Support

For questions or issues related to this refactor, please refer to:

- This documentation
- Code comments in `useProductFilters.ts`
- Example usage in `ProductsPage.tsx`
