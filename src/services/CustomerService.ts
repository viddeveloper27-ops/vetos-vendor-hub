import { Customer } from "@/types";

const API_BASE = "https://vetos-api-saloni.coderly.in";

export const CustomerService = {
  getById: async (id: string): Promise<Customer | null> => {
    try {
      const res = await fetch(`${API_BASE}/customer/${id}`);
      if (!res.ok) throw new Error("Failed to fetch customer");
      const data = await res.json();
      
      console.log("Customer API Raw Data:", data);

      // Handle both cases: a single object or an array of customers
      let customer = data.customer || data.customers || data;
      
      if (Array.isArray(customer)) {
        return customer.find((c: any) => c._id === id) || null;
      }
      
      return customer as Customer;
    } catch (err) {
      console.error("Customer fetch error:", err);
      return null;
    }
  },
};
