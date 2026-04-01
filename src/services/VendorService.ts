import { API_URL } from "@/constants";
import { Vendor, VendorBank } from "@/types";

// const API_BASE = "http://localhost:4210";

const API_BASE = API_URL;

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

  getBank: async (vendorId: string): Promise<VendorBank | null> => {
    const filter = JSON.stringify({ vendorId });
    const res = await fetch(`${API_BASE}/bank?filter=${encodeURIComponent(filter)}`);
    if (!res.ok) throw new Error("Failed to fetch bank details");
    const data = await res.json();
    return (data[0] || null) as VendorBank | null;
  },

  withdraw: async (vendorId: string): Promise<{ message: string; amount: number; mode: string }> => {
    const res = await fetch(`${API_BASE}/vendor/withdraw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to process withdrawal");
    }
    return await res.json();
  },
  addBank: async (bank: Omit<VendorBank, "_id">): Promise<VendorBank> => {
    const res = await fetch(`${API_BASE}/bank`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bank),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to save bank details");
    }
    const data = await res.json();
    return data.data as VendorBank;
  },
  updateBank: async (bank: VendorBank): Promise<VendorBank> => {
    const res = await fetch(`${API_BASE}/bank`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bank),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to update bank details");
    }
    const data = await res.json();
    return data.data as VendorBank;
  },
};
