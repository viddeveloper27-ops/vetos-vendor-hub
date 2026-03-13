import { Vendor } from "@/types";
import { mockVendors } from "./mock-data";

let vendors = [...mockVendors];

export const VendorService = {
  getAll: () => [...vendors],
  getById: (id: string) => vendors.find(v => v._id === id),
  getByPhone: (phone: string) => vendors.find(v => v.phone === phone),
  add: (vendor: Omit<Vendor, "_id">) => {
    const newVendor: Vendor = { ...vendor, _id: `v${Date.now()}` };
    vendors.push(newVendor);
    return newVendor;
  },
  update: (id: string, data: Partial<Vendor>) => {
    const idx = vendors.findIndex(v => v._id === id);
    if (idx !== -1) {
      vendors[idx] = { ...vendors[idx], ...data };
      return vendors[idx];
    }
    return null;
  },
};
