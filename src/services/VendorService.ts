import { Vendor } from "@/types";

// const API_BASE = "http://localhost:4210";

const API_BASE = "https://vetos-api-saloni.coderly.in";

export const VendorService = {
  getAll: async (): Promise<Vendor[]> => {
    const res = await fetch(`${API_BASE}/vendor/all`);
    if (!res.ok) throw new Error("Failed to fetch vendors");
    const data = await res.json();
    return data.vendors as Vendor[];
  },

  getById: async (id: string): Promise<Vendor | null> => {
    const res = await fetch(`${API_BASE}/vendor/all`);
    if (!res.ok) throw new Error("Failed to fetch vendors");
    const data = await res.json();
    const vendors = data.vendors as Vendor[];
    return vendors.find((v) => v._id === id) || null;
  },

  getByPhone: async (phone: string): Promise<Vendor | null> => {
    const res = await fetch(`${API_BASE}/vendor/all`);
    if (!res.ok) throw new Error("Failed to fetch vendors");
    const data = await res.json();
    const vendors = data.vendors as Vendor[];
    return vendors.find((v) => v.phone === phone) || null;
  },

  add: async (vendor: Omit<Vendor, "_id">): Promise<Vendor> => {
    const res = await fetch(`${API_BASE}/vendor/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vendor),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to create vendor");
    }
    const data = await res.json();
    return data.vendor as Vendor;
  },

  update: async (id: string, payload: Partial<Vendor>): Promise<Vendor> => {
    const res = await fetch(`${API_BASE}/vendor/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to update vendor");
    }
    const data = await res.json();
    return data.vendor as Vendor;
  },
};
