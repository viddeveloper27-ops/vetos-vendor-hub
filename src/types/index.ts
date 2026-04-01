export interface VendorAddress {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export interface VendorBank {
  _id?: string;
  vendorId?: string;
  accountHolderName?: string;
  accountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  upiId?: string;
  pendingAmount?: number;
  totalAmountReceived?: number;
}

export interface Vendor {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  gstNumber?: string;
  address?: VendorAddress;
  bank?: VendorBank;
  fcmToken?: string;
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
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string | Product;
  name?: string;
  quantity: number;
  unit?: string;
  price?: number;
}

export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface Order {
  _id: string;
  vendorId: string;
  customerId?: string | Customer;
  customerName?: string;
  customerPhone?: string;
  customerMobile?: string;
  customerAddress?: string;
  shippingAddress?: {
    houseNo?: string;
    street?: string;
    landmark?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Customer {
  _id: string;
  name: string;
  phone?: string;
  mobile?: string;
  email?: string;
  image?: string;
}
