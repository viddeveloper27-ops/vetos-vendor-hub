import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Vendor } from "@/types";
import { VendorAuthService } from "@/services/VendorAuthService";

interface AuthContextType {
  vendor: Vendor | null;
  isLoggedIn: boolean;
  login: (vendor: Vendor) => void;
  logout: () => void;
  updateVendor: (data: Partial<Vendor>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vendor, setVendor] = useState<Vendor | null>(VendorAuthService.getCurrentVendor());

  const login = useCallback((v: Vendor) => setVendor(v), []);
  const logout = useCallback(() => {
    VendorAuthService.logout();
    setVendor(null);
  }, []);
  const updateVendor = useCallback(async (data: Partial<Vendor>) => {
    const updated = await VendorAuthService.updateCurrentVendor(data);
    if (updated) setVendor({ ...updated });
  }, []);

  return (
    <AuthContext.Provider value={{ vendor, isLoggedIn: !!vendor, login, logout, updateVendor }}>
      {children}
    </AuthContext.Provider>
  );
};
