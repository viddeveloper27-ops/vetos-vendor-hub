import { Product } from "@/types";
import { mockProducts } from "./mock-data";

let products = [...mockProducts];

export const ProductService = {
  getAll: () => [...products],
  getByVendor: (vendorId: string) => products.filter(p => p.vendorId === vendorId),
  getById: (id: string) => products.find(p => p._id === id),
  add: (product: Omit<Product, "_id" | "createdAt" | "updatedAt">) => {
    const newProduct: Product = {
      ...product,
      _id: `p${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    products.push(newProduct);
    return newProduct;
  },
  update: (id: string, data: Partial<Product>) => {
    const idx = products.findIndex(p => p._id === id);
    if (idx !== -1) {
      products[idx] = { ...products[idx], ...data, updatedAt: new Date().toISOString() };
      return products[idx];
    }
    return null;
  },
  delete: (id: string) => {
    const idx = products.findIndex(p => p._id === id);
    if (idx !== -1) {
      products.splice(idx, 1);
      return true;
    }
    return false;
  },
};
