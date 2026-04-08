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

  add: async (vendor: Omit<Vendor, "_id">, imageFile?: File): Promise<Vendor> => {
    if (!imageFile) {
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
    }

    const fd = new FormData();
    fd.append("name", vendor.name);
    if (vendor.legalName) fd.append("legalName", vendor.legalName);
    if (vendor.brandName) fd.append("brandName", vendor.brandName);
    if (vendor.businessType) fd.append("businessType", vendor.businessType);
    if (vendor.category) fd.append("category", vendor.category);
    fd.append("phone", vendor.phone);
    if (vendor.email) fd.append("email", vendor.email);
    if (vendor.panNumber) fd.append("panNumber", vendor.panNumber);
    if (vendor.gstNumber) fd.append("gstNumber", vendor.gstNumber);
    
    if (vendor.address) {
      if (vendor.address.street) fd.append("address[street]", vendor.address.street);
      if (vendor.address.city) fd.append("address[city]", vendor.address.city);
      if (vendor.address.state) fd.append("address[state]", vendor.address.state);
      if (vendor.address.pincode) fd.append("address[pincode]", vendor.address.pincode);
      if (vendor.address.country) fd.append("address[country]", vendor.address.country);
    }
    
    if (vendor.bank) {
      if (vendor.bank.accountHolderName) fd.append("bank[accountHolderName]", vendor.bank.accountHolderName);
      if (vendor.bank.accountNumber) fd.append("bank[accountNumber]", vendor.bank.accountNumber);
      if (vendor.bank.bankName) fd.append("bank[bankName]", vendor.bank.bankName);
      if (vendor.bank.ifscCode) fd.append("bank[ifscCode]", vendor.bank.ifscCode);
      if (vendor.bank.upiId) fd.append("bank[upiId]", vendor.bank.upiId);
    }

    fd.append("image", imageFile);

    const res = await fetch(`${API_BASE}/vendor/add`, {
      method: "POST",
      body: fd,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to create vendor");
    }
    const data = await res.json();
    return data.vendor as Vendor;
  },

  update: async (id: string, payload: Partial<Vendor>, imageFile?: File): Promise<Vendor> => {
    if (!imageFile) {
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
    }

    const fd = new FormData();
    if (payload.name) fd.append("name", payload.name);
    if (payload.legalName) fd.append("legalName", payload.legalName);
    if (payload.brandName) fd.append("brandName", payload.brandName);
    if (payload.businessType) fd.append("businessType", payload.businessType);
    if (payload.category) fd.append("category", payload.category);
    if (payload.phone) fd.append("phone", payload.phone);
    if (payload.email) fd.append("email", payload.email);
    if (payload.panNumber) fd.append("panNumber", payload.panNumber);
    if (payload.gstNumber) fd.append("gstNumber", payload.gstNumber);
    if (payload.address) {
      if (payload.address.street) fd.append("address[street]", payload.address.street);
      if (payload.address.city) fd.append("address[city]", payload.address.city);
      if (payload.address.state) fd.append("address[state]", payload.address.state);
      if (payload.address.pincode) fd.append("address[pincode]", payload.address.pincode);
      if (payload.address.country) fd.append("address[country]", payload.address.country);
    }
    fd.append("image", imageFile);

    const res = await fetch(`${API_BASE}/vendor/${id}`, {
      method: "PATCH",
      body: fd,
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
