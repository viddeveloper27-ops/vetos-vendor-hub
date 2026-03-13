import { Vendor } from "@/types";
import { VendorService } from "./VendorService";

const STORAGE_KEY = "vetos_vendor";
let currentVendor: Vendor | null = null;
let mockOtp: string | null = null;

function loadFromStorage(): Vendor | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return null;
}

function saveToStorage(vendor: Vendor | null) {
  if (vendor) localStorage.setItem(STORAGE_KEY, JSON.stringify(vendor));
  else localStorage.removeItem(STORAGE_KEY);
}

// Initialize from storage
currentVendor = loadFromStorage();

export const VendorAuthService = {
  getCurrentVendor: (): Vendor | null => currentVendor,

  sendOtp: (phone: string): { success: boolean; otp?: string; message: string } => {
    const vendor = VendorService.getByPhone(phone);
    if (!vendor) return { success: false, message: "No vendor found with this phone number." };
    mockOtp = String(Math.floor(1000 + Math.random() * 9000));
    return { success: true, otp: mockOtp, message: `OTP sent (for mock: ${mockOtp})` };
  },

  verifyOtp: (phone: string, otp: string): { success: boolean; vendor?: Vendor; message: string } => {
    if (otp !== mockOtp) return { success: false, message: "Invalid OTP. Please try again." };
    const vendor = VendorService.getByPhone(phone);
    if (!vendor) return { success: false, message: "Vendor not found." };
    currentVendor = vendor;
    saveToStorage(vendor);
    mockOtp = null;
    return { success: true, vendor, message: "Login successful!" };
  },

  updateCurrentVendor: (data: Partial<Vendor>) => {
    if (!currentVendor) return null;
    const updated = VendorService.update(currentVendor._id, data);
    if (updated) {
      currentVendor = updated;
      saveToStorage(updated);
    }
    return updated;
  },

  logout: () => {
    currentVendor = null;
    saveToStorage(null);
  },

  isLoggedIn: (): boolean => currentVendor !== null,
};
