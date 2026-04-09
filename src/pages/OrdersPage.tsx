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
import {
  Package,
  Clock,
  User,
  CheckCircle2,
  Truck,
  AlertCircle,
  XCircle,
  ChevronRight,
  Search,
  Filter
} from "lucide-react";

const statusConfig: Record<string, { color: string, icon: any }> = {
  PENDING: { color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: Clock },
  CONFIRMED: { color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: CheckCircle2 },
  SHIPPED: { color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400", icon: Truck },
  DELIVERED: { color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: CheckCircle2 },
  CANCELLED: { color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400", icon: XCircle },
};

const STATUSES: OrderStatus[] = ["CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
const PAGE_SIZE = 8;

const OrdersPage = () => {
  const { vendor } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
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
    let list = [...orders]
      .filter(o => o.status?.toUpperCase() !== "PENDING")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (statusFilter !== "all") {
      list = list.filter(o => o.status.toUpperCase() === statusFilter.toUpperCase());
    }

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      list = list.filter(o =>
        o.orderId?.toLowerCase().includes(s) ||
        o.customerName?.toLowerCase().includes(s) ||
        (typeof o.customerId === "object" && (o.customerId as any)?.name?.toLowerCase().includes(s))
      );
    }

    return list;
  }, [orders, statusFilter, searchTerm]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  const renderStatus = (status: string) => {
    const s = status?.toUpperCase() || "PENDING";
    const config = statusConfig[s] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`flex items-center gap-1.5 py-1 px-3 rounded-full border-none font-medium shadow-sm ${config.color}`}>
        <Icon className="h-3.5 w-3.5" />
        {s}
      </Badge>
    );
  };

  const getCustomerName = (o: Order) => {
    if (o.customerName) return o.customerName;
    if (o.customerId) {
      if (typeof o.customerId === "object") {
        return (o.customerId as any).name || "Unknown Customer";
      }
      return `...${o.customerId.slice(-6)}`;
    }
    return "Unknown Customer";
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in p-2">
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-44" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-primary/5 via-primary/2 to-background p-6 rounded-3xl border border-primary/10 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Orders</h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              {orders.length} total orders managed
            </p>
          </div>

          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
            <div className="relative group flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search Order ID or Customer..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all text-sm shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[180px] h-11 bg-white dark:bg-slate-900 border-border rounded-xl shadow-sm text-sm">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
          <div className="h-16 w-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium text-foreground">No orders found</h3>
          <p className="text-muted-foreground mt-1 max-w-xs text-center">
            We couldn't find any orders matching your current filters or search terms.
          </p>
          {(statusFilter !== "all" || searchTerm) && (
            <Button variant="link" onClick={() => { setStatusFilter("all"); setSearchTerm(""); }} className="mt-4 text-primary">
              Clear all filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {paginated.map(o => (
              <Card
                key={o._id}
                className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer border-border/50 bg-white dark:bg-slate-950 shadow-sm"
                onClick={() => navigate(`/orders/${o._id}`)}
              >
                {/* Decorative Accent */}
                <div className={`absolute top-0 left-0 w-1.5 h-full transition-all duration-300 group-hover:w-2 ${statusConfig[o.status?.toUpperCase() || "PENDING"]?.color.split(' ')[0]}`} />

                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-primary uppercase tracking-wider">
                          {o.orderId || `ORD-${o._id.slice(-8).toUpperCase()}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-foreground font-semibold group-hover:text-primary transition-colors">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="truncate max-w-[180px]">{getCustomerName(o)}</span>
                      </div>
                    </div>
                    {renderStatus(o.status)}
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest letter-spacing-1 mb-0.5">Amount</span>
                      <span className="text-lg font-bold text-foreground">
                        ₹{o.totalAmount?.toLocaleString() || "0"}
                      </span>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-0.5">Date</span>
                      <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {o.createdAt ? format(new Date(o.createdAt), "dd MMM yyyy") : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-lg">
                      <Package className="h-3.5 w-3.5 text-primary/70" />
                      <span className="text-xs font-medium">{o.items?.length || 0} Products</span>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-12">
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-12">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setPage(p => p + 1)}
                className="rounded-2xl px-12 py-6 border-2 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-lg hover:shadow-primary/20"
              >
                Check more orders
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrdersPage;
