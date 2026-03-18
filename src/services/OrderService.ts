import { Order, OrderStatus } from "@/types";

const API_BASE = "http://localhost:4210";

export const OrderService = {
  getByVendor: async (vendorId: string): Promise<Order[]> => {
    const filter = encodeURIComponent(JSON.stringify({ vendorId }));
    const res = await fetch(`${API_BASE}/order?filter=${filter}`);
    if (!res.ok) throw new Error("Failed to fetch orders");
    const data = await res.json();
    return data as Order[];
  },

  getById: async (id: string): Promise<Order | null> => {
    const res = await fetch(`${API_BASE}/order/${id}`);
    if (!res.ok) throw new Error("Failed to fetch order");
    const data = await res.json();
    return data as Order;
  },

  updateStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    const res = await fetch(`${API_BASE}/order/statusUpdate`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: id, status }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to update order status");
    }
    const data = await res.json();
    return data.data as Order;
  },
};
