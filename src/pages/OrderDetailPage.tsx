import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Phone, Mail, MapPin, CreditCard } from "lucide-react";
import { OrderService } from "@/services/OrderService";
import { CustomerService } from "@/services/CustomerService";
import { Order, OrderStatus, Customer } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { format } from "date-fns";
const statusColors: Record<string, string> = {
  PENDING: "bg-warning text-warning-foreground",
  CONFIRMED: "bg-info text-info-foreground",
  SHIPPED: "bg-primary text-primary-foreground",
  DELIVERED: "bg-success text-success-foreground",
  CANCELLED: "bg-muted text-muted-foreground",
};

const STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCustomer, setLoadingCustomer] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await OrderService.getById(id);
        if (!cancelled && data) {
          setOrder(data);

          // Use populated customer data if available, otherwise fetch it
          if (data.customerId && typeof data.customerId === "object") {
            setCustomer(data.customerId as Customer);
          } else if (data.customerId && typeof data.customerId === "string") {
            setLoadingCustomer(true);
            const customerData = await CustomerService.getById(data.customerId);
            if (!cancelled) setCustomer(customerData);
            setLoadingCustomer(false);
          }
        }
      } catch (err) {
        console.error("Order load error:", err);
        if (!cancelled) setOrder(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleStatusChange = async (status: string) => {
    if (!order) return;
    try {
      const normalizedStatus = status.toUpperCase() as OrderStatus;
      const updated = await OrderService.updateStatus(order._id, normalizedStatus);
      setOrder(updated);
      toast.success(`Order status updated to ${status}`);
    } catch (e: any) {
      toast.error(e?.message || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in p-6">
        <Skeleton className="h-8 w-48" />
        <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4 p-6">
        <Button variant="ghost" onClick={() => navigate("/orders")}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
        <Card><CardContent className="p-12 text-center text-muted-foreground">Order not found.</CardContent></Card>
      </div>
    );
  }

  const currentStatus = (typeof order.status === 'string' ? order.status.toUpperCase() : "PENDING");

  const displayAddress = order.customerAddress ||
    (order.shippingAddress ?
      [
        order.shippingAddress.houseNo,
        order.shippingAddress.street,
        order.shippingAddress.landmark,
        order.shippingAddress.city,
        order.shippingAddress.state,
        order.shippingAddress.pincode,
        order.shippingAddress.country
      ]
        .filter(Boolean).join(", ")
      : "No address provided");

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/orders")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Order Detail</h1>
          <p className="text-xs text-muted-foreground font-mono">ID: {order._id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Customer & Shipping</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Customer Name</p>
                {loadingCustomer ? <Skeleton className="h-4 w-32" /> : (
                  <p className="font-semibold text-base">{customer?.name || order.customerName || "Customer"}</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone / Mobile</p>
                {loadingCustomer ? <Skeleton className="h-4 w-32" /> : (
                  <p className="font-semibold text-base">
                    {customer?.phone || customer?.mobile || order.customerPhone || order.customerMobile || "N/A"}
                  </p>
                )}
              </div>
              {customer?.email && (
                <div className="sm:col-span-2 space-y-1">
                  <p className="text-muted-foreground flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email Address</p>
                  <p className="font-medium text-primary">{customer.email}</p>
                </div>
              )}
              <div className="sm:col-span-2 space-y-1">
                <p className="text-muted-foreground flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Shipping Address</p>
                <p className="font-medium leading-relaxed">{displayAddress}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" /> Payment Method</p>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">{order.paymentMethod?.toUpperCase() || "COD"}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" /> Status</p>
                <Badge
                  variant="outline"
                  className={order.paymentStatus?.toUpperCase() === "PAID"
                    ? "bg-success/10 text-success border-success/20"
                    : "bg-warning/10 text-warning border-warning/20"}
                >
                  {order.paymentStatus?.toUpperCase() || "PENDING"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Order Status</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Badge className={`${statusColors[currentStatus] || statusColors.PENDING} text-sm px-4 py-1.5 w-full justify-center`}>
              {currentStatus}
            </Badge>
            <div className="space-y-2 mt-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Update status</p>
              <Select value={currentStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="text-[10px] text-muted-foreground pt-2 border-t mt-4">
              <p>Created: {order.createdAt ? format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a") : "N/A"}</p>
              {order.updatedAt && <p>Updated: {format(new Date(order.updatedAt), "dd MMM yyyy, hh:mm a")}</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex justify-between">
            <span>Order Items</span>
            <span className="text-muted-foreground font-normal">{order.items?.length || 0} Products</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {order.items?.map((item, i) => {
              const product = typeof item.productId === 'object' ? item.productId : null;
              const name = item.name || product?.name || `Product ID: ${item.productId}`;
              const price = item.price || product?.price || 0;
              const unit = item.unit || product?.unit || "";

              return (
                <div key={i} className="flex justify-between items-center py-4">
                  <div className="flex gap-4 items-center">
                    {product?.images?.[0] && (
                      <img src={product.images[0]} alt={name} className="h-12 w-12 rounded-lg object-cover border" />
                    )}
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{name}</p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity} {unit}
                        {price ? ` @ ₹${price.toLocaleString()}` : ""}
                      </p>
                    </div>
                  </div>
                  {price > 0 && (
                    <p className="font-semibold text-sm">₹{(item.quantity * price).toLocaleString()}</p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="bg-muted/30 p-4 rounded-xl mt-4 border border-dashed border-primary/20">
            <div className="flex justify-between items-center text-lg font-bold">
              <span className="text-primary">Total Amount</span>
              <span className="text-primary">₹{order.totalAmount?.toLocaleString() || "0"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default OrderDetailPage;
