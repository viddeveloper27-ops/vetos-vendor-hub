import { Product } from "@/types";

// const API_BASE = "http://localhost:4210";

const API_BASE = "https://vetos-api-saloni.coderly.in";

function appendIfDefined(fd: FormData, key: string, value: unknown) {
  if (value === undefined || value === null) return;
  fd.append(key, String(value));
}

export const ProductService = {
  getAll: async (): Promise<Product[]> => {
    const res = await fetch(`${API_BASE}/products/all`);
    if (!res.ok) throw new Error("Failed to fetch products");
    const data = await res.json();
    return data.products as Product[];
  },

  getByVendor: async (vendorId: string): Promise<Product[]> => {
    const res = await fetch(`${API_BASE}/product/${vendorId}`);
    if (!res.ok) throw new Error("Failed to fetch products for vendor");
    const data = await res.json();
    return data.products as Product[];
  },

  getById: async (id: string): Promise<Product | null> => {
    const res = await fetch(`${API_BASE}/product/${id}`);
    if (!res.ok) throw new Error("Failed to fetch product");
    const data = await res.json();
    return data.product as Product;
  },

  add: async (args: {
    product: Omit<Product, "_id" | "createdAt" | "updatedAt">;
    imageFiles?: File[];
  }): Promise<Product> => {
    const fd = new FormData();
    appendIfDefined(fd, "name", args.product.name);
    appendIfDefined(fd, "category", args.product.category);
    appendIfDefined(fd, "brand", args.product.brand);
    appendIfDefined(fd, "vendorId", args.product.vendorId);
    appendIfDefined(fd, "description", args.product.description);
    appendIfDefined(fd, "quantity", args.product.quantity);
    appendIfDefined(fd, "unit", args.product.unit);
    appendIfDefined(fd, "price", args.product.price);

    (args.imageFiles || []).forEach((file) => fd.append("images", file));

    const res = await fetch(`${API_BASE}/product/add`, {
      method: "POST",
      body: fd,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to add product");
    }
    const data = await res.json();
    return data.product as Product;
  },

  update: async (args: {
    id: string;
    data: Partial<Product>;
    imageFiles?: File[];
    existingImages?: string[];
  }): Promise<Product> => {
    const fd = new FormData();
    appendIfDefined(fd, "name", args.data.name);
    appendIfDefined(fd, "category", args.data.category);
    appendIfDefined(fd, "brand", args.data.brand);
    appendIfDefined(fd, "vendorId", args.data.vendorId);
    appendIfDefined(fd, "description", args.data.description);
    appendIfDefined(fd, "quantity", args.data.quantity);
    appendIfDefined(fd, "unit", args.data.unit);
    appendIfDefined(fd, "price", args.data.price);

    if (args.existingImages) {
      fd.append("existingImages", JSON.stringify(args.existingImages));
    }

    (args.imageFiles || []).forEach((file) => fd.append("images", file));

    const res = await fetch(`${API_BASE}/product/${args.id}`, {
      method: "PATCH",
      body: fd,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to update product");
    }
    const body = await res.json();
    return body.product as Product;
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/product/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to delete product");
    }
  },
};
