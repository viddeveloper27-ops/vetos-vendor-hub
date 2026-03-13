import { useAuth } from "@/contexts/AuthContext";
import { ProductService } from "@/services/ProductService";
import { OrderService } from "@/services/OrderService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingCart, Clock, Truck, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Product, Order } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const statusColors: Record<string, string> = {
  PENDING: "bg-warning text-warning-foreground",
  ACCEPTED: "bg-success text-success-foreground",
  REJECTED: "bg-destructive text-destructive-foreground",
  SHIPPED: "bg-primary text-primary-foreground",
  DELIVERED: "bg-success text-success-foreground",
  CANCELLED: "bg-muted text-muted-foreground",
};

const DashboardPage = () => {
  const { vendor } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (vendor) {
        setProducts(ProductService.getByVendor(vendor._id));
        setOrders(OrderService.getByVendor(vendor._id));
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [vendor]);

  const pending = orders.filter(o => o.status === "PENDING").length;
  const shipped = orders.filter(o => o.status === "SHIPPED").length;
  const delivered = orders.filter(o => o.status === "DELIVERED").length;
  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  const metrics = [
    { label: "Total Products", value: products.length, icon: Package, color: "text-primary" },
    { label: "Total Orders", value: orders.length, icon: ShoppingCart, color: "text-primary" },
    { label: "Pending Orders", value: pending, icon: Clock, color: "text-warning" },
    { label: "Delivered", value: delivered, icon: CheckCircle, color: "text-success" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(m => (
          <Card key={m.label}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-muted ${m.color}`}>
                <m.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{m.label}</p>
                <p className="text-2xl font-semibold">{m.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No orders yet.</p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left py-3 font-medium">Order ID</th>
                      <th className="text-left py-3 font-medium">Customer</th>
                      <th className="text-left py-3 font-medium">Amount</th>
                      <th className="text-left py-3 font-medium">Status</th>
                      <th className="text-left py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order._id} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => navigate(`/orders/${order._id}`)}>
                        <td className="py-3 font-medium">{order._id}</td>
                        <td className="py-3">{order.customerName}</td>
                        <td className="py-3">₹{order.totalAmount.toLocaleString()}</td>
                        <td className="py-3">
                          <Badge className={statusColors[order.status]}>{order.status}</Badge>
                        </td>
                        <td className="py-3 text-muted-foreground">{format(new Date(order.createdAt), "dd MMM yyyy")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {recentOrders.map(order => (
                  <div key={order._id} className="border rounded-lg p-3 space-y-2 cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/orders/${order._id}`)}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{order._id}</span>
                      <Badge className={statusColors[order.status]}>{order.status}</Badge>
                    </div>
                    <p className="text-sm">{order.customerName}</p>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>₹{order.totalAmount.toLocaleString()}</span>
                      <span>{format(new Date(order.createdAt), "dd MMM")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
