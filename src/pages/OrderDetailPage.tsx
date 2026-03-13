import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { OrderService } from "@/services/OrderService";
import { Order, OrderStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";

const statusColors: Record<string, string> = {
  PENDING: "bg-warning text-warning-foreground",
  ACCEPTED: "bg-success text-success-foreground",
  REJECTED: "bg-destructive text-destructive-foreground",
  SHIPPED: "bg-primary text-primary-foreground",
  DELIVERED: "bg-success text-success-foreground",
  CANCELLED: "bg-muted text-muted-foreground",
};

const STATUSES: OrderStatus[] = ["PENDING", "ACCEPTED", "REJECTED", "SHIPPED", "DELIVERED", "CANCELLED"];

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      if (id) setOrder(OrderService.getById(id) || null);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [id]);

  const handleStatusChange = (status: OrderStatus) => {
    if (!order) return;
    OrderService.updateStatus(order._id, status);
    setOrder({ ...order, status, updatedAt: new Date().toISOString() });
    toast.success(`Order status updated to ${status}`);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/orders")}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
        <Card><CardContent className="p-12 text-center text-muted-foreground">Order not found.</CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/orders")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Order {order._id}</h1>
          <p className="text-sm text-muted-foreground">Created {format(new Date(order.createdAt), "dd MMM yyyy, HH:mm")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Customer Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-muted-foreground">Name:</span> {order.customerName}</div>
            {order.customerPhone && <div><span className="text-muted-foreground">Phone:</span> {order.customerPhone}</div>}
            {order.customerAddress && <div><span className="text-muted-foreground">Address:</span> {order.customerAddress}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Status</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Badge className={`${statusColors[order.status]} text-sm px-3 py-1`}>{order.status}</Badge>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Update status:</p>
              <Select value={order.status} onValueChange={v => handleStatusChange(v as OrderStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {order.updatedAt && (
              <p className="text-xs text-muted-foreground">Last updated: {format(new Date(order.updatedAt), "dd MMM yyyy, HH:mm")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Order Items</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.quantity} {item.unit} × ₹{item.price.toLocaleString()}</p>
                </div>
                <p className="font-semibold text-sm">₹{(item.quantity * item.price).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>₹{order.totalAmount.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetailPage;
