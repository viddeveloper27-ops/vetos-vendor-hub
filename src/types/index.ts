export interface VendorAddress {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export interface Vendor {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  gstNumber?: string;
  address?: VendorAddress;
}

export type ProductCategory = "vaccine" | "food" | "accessory";

export interface Product {
  _id: string;
  name: string;
  category: ProductCategory;
  brand?: string;
  vendorId: string;
  description?: string;
  quantity: number;
  unit: string;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

export type OrderStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface Order {
  _id: string;
  vendorId: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
}
