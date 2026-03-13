import { Order, OrderStatus } from "@/types";
import { mockOrders } from "./mock-data";

let orders = [...mockOrders];

export const OrderService = {
  getAll: () => [...orders],
  getByVendor: (vendorId: string) => orders.filter(o => o.vendorId === vendorId),
  getById: (id: string) => orders.find(o => o._id === id),
  updateStatus: (id: string, status: OrderStatus) => {
    const idx = orders.findIndex(o => o._id === id);
    if (idx !== -1) {
      orders[idx] = { ...orders[idx], status, updatedAt: new Date().toISOString() };
      return orders[idx];
    }
    return null;
  },
};
