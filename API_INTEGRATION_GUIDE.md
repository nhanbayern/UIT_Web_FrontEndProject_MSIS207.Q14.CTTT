# Hướng Dẫn Tích Hợp API Backend

## 📍 Vị trí tích hợp API

Frontend sẽ nhận thông tin sản phẩm từ backend tại các điểm sau:

### 1. **File chính: `src/App.tsx`** (Dòng 11)
   - **Hiện tại**: Import từ `./data/mockData`
   ```typescript
   import { products } from './data/mockData';
   ```
   
   - **Sau khi tích hợp**: Sử dụng `useEffect` để fetch từ API
   ```typescript
   import { fetchProducts } from './services/api';
   
   useEffect(() => {
     fetchProducts().then(setProducts);
   }, []);
   ```

### 2. **Service Layer: `src/services/api.ts`** (File mới)
   - File này chứa tất cả các hàm gọi API từ backend
   - Các endpoint cần có:
     - `GET /api/products` - Lấy tất cả sản phẩm
     - `GET /api/products/:id` - Lấy sản phẩm theo ID
     - `GET /api/products?region=...` - Lọc theo vùng miền
     - `GET /api/products?category=...` - Lọc theo danh mục

### 3. **Các Component nhận dữ liệu qua Props**
   - `HomePage` - Nhận `products` prop từ `App.tsx`
   - `ProductsPage` - Nhận `products` prop từ `App.tsx`
   - `ProductCard` - Nhận `product` prop từ `HomePage` hoặc `ProductsPage`

## 🔄 Flow dữ liệu

```
Backend API
    ↓
src/services/api.ts (fetchProducts)
    ↓
src/App.tsx (useState + useEffect)
    ↓
Props: products={products}
    ↓
HomePage / ProductsPage
    ↓
ProductCard (hiển thị từng sản phẩm)
```

## 📝 Các bước tích hợp

### Bước 1: Tạo file API service
✅ Đã tạo: `src/services/api.ts`

### Bước 2: Cập nhật App.tsx
1. Thêm `useEffect` import
2. Thêm state cho `products`, `isLoadingProducts`, `productsError`
3. Gọi `fetchProducts()` trong `useEffect`
4. Xử lý loading và error states

### Bước 3: Cấu hình Environment Variables
Tạo file `.env` hoặc `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Bước 4: Đảm bảo Backend API trả về đúng format
Backend cần trả về mảng các object có cấu trúc:
```typescript
{
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  region: string;
  description: string;
  stock: number;
}
```

## 🎯 Ví dụ Response từ Backend

```json
[
  {
    "id": "1",
    "name": "Rượu Chuối Hột Đặc Sản",
    "price": 450000,
    "image": "https://example.com/image.jpg",
    "category": "Rượu Chuối",
    "region": "Miền Tây",
    "description": "Rượu chuối hột truyền thống...",
    "stock": 25
  }
]
```

## ⚠️ Lưu ý

1. **CORS**: Đảm bảo backend cho phép CORS từ frontend domain
2. **Error Handling**: Luôn có fallback về mockData nếu API lỗi
3. **Loading State**: Hiển thị loading indicator khi đang fetch
4. **Caching**: Có thể cache dữ liệu để tránh fetch lại nhiều lần

## 🔧 Xem ví dụ chi tiết

Xem file `src/App.example.tsx` để biết cách tích hợp đầy đủ.

