import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { OrderService } from "@/services/OrderService";
import { Order, OrderStatus } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const statusColors: Record<string, string> = {
  PENDING: "bg-warning text-warning-foreground",
  SHIPPED: "bg-primary text-primary-foreground",
  DELIVERED: "bg-success text-success-foreground",
  CANCELLED: "bg-muted text-muted-foreground",
};

const STATUSES: OrderStatus[] = ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"];
const PAGE_SIZE = 8;

const OrdersPage = () => {
  const { vendor } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!vendor) return;
      setLoading(true);
      try {
        const data = await OrderService.getByVendor(vendor._id);
        if (!cancelled) setOrders(data);
      } catch {
        if (!cancelled) setOrders([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (vendor) load();
    return () => {
      cancelled = true;
    };
  }, [vendor]);

  const filtered = useMemo(() => {
    let list = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (statusFilter !== "all") {
      list = list.filter(o => o.status.toUpperCase() === statusFilter.toUpperCase());
    }
    return list;
  }, [orders, statusFilter]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  const renderStatus = (status: string) => {
    const s = status?.toUpperCase() || "PENDING";
    return <Badge className={`${statusColors[s] || statusColors.PENDING}`}>{s}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-semibold">Orders</h1>
        {[1, 2, 3].map(i => <Card key={i}><CardContent className="p-6"><Skeleton className="h-16 w-full" /></CardContent></Card>)}
      </div>
    );
  }

  const getCustomerName = (o: Order) => {
    if (o.customerName) return o.customerName;
    if (o.customerId) {
        if (typeof o.customerId === "string") {
            return `Customer: ...${o.customerId.slice(-6)}`;
        }
        return `Customer: ${o.customerId.name || "Unknown"}`;
    }
    return "Unknown Customer";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">No orders found.</CardContent></Card>
      ) : (
        <>
          {/* Desktop */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left p-4 font-medium">Order ID</th>
                    <th className="text-left p-4 font-medium">Customer</th>
                    <th className="text-left p-4 font-medium">Items</th>
                    <th className="text-left p-4 font-medium">Amount</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(o => (
                    <tr key={o._id} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer" onClick={() => navigate(`/orders/${o._id}`)}>
                      <td className="p-4 font-medium">...{o._id.slice(-8)}</td>
                      <td className="p-4">{getCustomerName(o)}</td>
                      <td className="p-4 text-muted-foreground">{o.items?.length || 0} item{(o.items?.length || 0) > 1 ? "s" : ""}</td>
                      <td className="p-4">₹{o.totalAmount?.toLocaleString() || "0"}</td>
                      <td className="p-4">{renderStatus(o.status)}</td>
                      <td className="p-4 text-muted-foreground">{o.createdAt ? format(new Date(o.createdAt), "dd MMM yyyy") : "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {paginated.map(o => (
              <Card key={o._id} className="cursor-pointer hover:bg-muted/30" onClick={() => navigate(`/orders/${o._id}`)}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">...{o._id.slice(-8)}</span>
                    {renderStatus(o.status)}
                  </div>
                  <p className="text-sm">{getCustomerName(o)}</p>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{o.items?.length || 0} items · ₹{o.totalAmount?.toLocaleString() || "0"}</span>
                    <span>{o.createdAt ? format(new Date(o.createdAt), "dd MMM") : "N/A"}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => setPage(p => p + 1)}>Load More</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};


export default OrdersPage;
