import { Vendor } from "@/types";
import { VendorService } from "./VendorService";
import { API_URL } from "@/constants";

const STORAGE_KEY = "vetos_vendor";
// const API_BASE = "http://localhost:4210";

const API_BASE = API_URL;

let currentVendor: Vendor | null = null;

function loadFromStorage(): Vendor | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {
    // ignore
  }
  return null;
}

function saveToStorage(vendor: Vendor | null) {
  if (vendor) localStorage.setItem(STORAGE_KEY, JSON.stringify(vendor));
  else localStorage.removeItem(STORAGE_KEY);
}

currentVendor = loadFromStorage();

export const VendorAuthService = {
  getCurrentVendor: (): Vendor | null => currentVendor,

  sendOtp: async (
    phone: string
  ): Promise<{ success: boolean; otp?: string; message: string }> => {
    const vendor = await VendorService.getByPhone(phone);
    if (!vendor) {
      return { success: false, message: "No vendor found with this phone number." };
    }

    const res = await fetch(`${API_BASE}/vendor/otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, message: err.message || "Failed to send OTP" };
    }

    const data = await res.json();
    return {
      success: true,
      otp: data.otp,
      message: `OTP sent successfully (for dev: ${data.otp})`,
    };
  },

  verifyOtp: async (
    phone: string,
    otp: string
  ): Promise<{ success: boolean; vendor?: Vendor; message: string }> => {
    const res = await fetch(`${API_BASE}/vendor/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, message: err.message || "Failed to verify OTP" };
    }

    const data = await res.json();
    const vendor = data.vendor as Vendor;
    currentVendor = vendor;
    saveToStorage(vendor);
    return { success: true, vendor, message: "Login successful!" };
  },

  updateCurrentVendor: async (data: Partial<Vendor>) => {
    if (!currentVendor) return null;
    const updated = await VendorService.update(currentVendor._id, data);
    currentVendor = updated;
    saveToStorage(updated);
    return updated;
  },

  logout: () => {
    currentVendor = null;
    saveToStorage(null);
  },

  isLoggedIn: (): boolean => currentVendor !== null,
};
