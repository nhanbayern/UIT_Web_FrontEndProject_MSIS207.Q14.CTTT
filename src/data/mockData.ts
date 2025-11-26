// mockData removed — frontend now fetches products from the real API.
// Keep a minimal shim to avoid accidental imports elsewhere during transition.
export const products: any[] = [];
export const getProducts = async (): Promise<any[]> => {
  return [];
};
