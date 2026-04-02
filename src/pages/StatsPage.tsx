import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Settings,
  LogOut,
  Wallet,
  AlertCircle,
  MapPin,
  Edit3,
  Phone
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { useNavigate } from "react-router-dom";
import { ProductService } from "@/services/ProductService";
import { OrderService } from "@/services/OrderService";
import { VendorService } from "@/services/VendorService";
import { VendorBank, Order, Product } from "@/types";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const StatsPage = () => {
  const { vendor, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeProducts: 0,
    growth: "+12.5%", // Placeholder for growth calculation
  });
  const [bankDetails, setBankDetails] = useState<VendorBank | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    if (vendor?._id) {
      loadData();
    }
  }, [vendor]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [products, orders, bank] = await Promise.all([
        ProductService.getByVendor(vendor!._id),
        OrderService.getByVendor(vendor!._id),
        VendorService.getBank(vendor!._id)
      ]);

      // Revenue from bank details
      const revenue = bank?.totalAmountReceived || 0;

      setStats({
        totalRevenue: revenue,
        totalOrders: orders.length,
        activeProducts: products.length,
        growth: "+12.5%",
      });

      setBankDetails(bank);

      // Prepare chart data (last 7 days of orders)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          date: d.toLocaleDateString('en-US', { weekday: 'short' }),
          fullDate: d.toISOString().split('T')[0],
          sales: 0,
        };
      });

      orders.forEach(order => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        const chartItem = last7Days.find(d => d.fullDate === orderDate);
        if (chartItem && (order.status === "CONFIRMED" || order.status === "DELIVERED")) {
          chartItem.sales += order.totalAmount;
        }
      });

      setChartData(last7Days);

    } catch (error) {
      console.error("Error loading profile data:", error);
      toast.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const handleWithdraw = async () => {
    if (!bankDetails?.pendingAmount || !vendor?._id) return;

    setWithdrawing(true);
    try {
      await VendorService.withdraw(vendor._id);
      setBankDetails(prev => prev ? ({ ...prev, pendingAmount: 0 }) : null);
      toast.success("Withdrawal request processed successfully!");
    } catch (error: any) {
      toast.error(error.message || "Withdrawal failed");
    } finally {
      setWithdrawing(false);
    }
  };

  const initials = vendor?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "V";

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      {/* Simplified Bio Section - Interactive Header */}
      <div className="flex flex-col items-center justify-center p-10 md:p-14 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none rounded-[3rem]"></div>
        <div className="absolute -right-32 -top-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000"></div>
        
        <div className="absolute top-6 right-6 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-10 w-10 bg-white/50 backdrop-blur-md rounded-full text-slate-400 hover:text-rose-600 hover:bg-white transition-all shadow-sm border border-white/20"
            title="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <button 
            onClick={() => navigate("/profile/details")}
            className="group/avatar relative transition-all duration-500 hover:scale-[1.05] active:scale-95"
          >
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-rose-400/20 rounded-full blur-xl opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-700"></div>
            <Avatar className="h-28 w-28 border-6 border-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] relative z-10">
              <AvatarImage src="" />
              <AvatarFallback className="bg-gradient-to-br from-primary to-rose-400 text-white text-3xl font-black italic">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>

          <div className="space-y-3">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter sm:text-5xl">{vendor?.name}</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 font-mono">
              <Phone className="h-3.5 w-3.5 text-rose-400" />
              {vendor?.phone}
            </p>
          </div>

        </div>
      </div>

      {/* Quick Insights - Premium Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Quick Insights</h2>
          <div className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">Live Updates</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 hover:border-rose-200 transition-all duration-500 group relative">
            <div className="absolute top-6 right-6 p-2 bg-emerald-50 rounded-2xl group-hover:bg-emerald-100 transition-colors">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="space-y-8">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Lifetime Revenue</span>
              <div className="text-5xl font-black text-slate-900 tracking-tighter flex items-center gap-2">
                <span className="text-3xl font-bold text-slate-300 translate-y-[2px]">₹</span>
                {stats.totalRevenue.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 text-emerald-500">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.15em]">Total Settlement</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 hover:border-rose-200 transition-all duration-500 group relative">
            <div className="absolute top-6 right-6 p-2 bg-orange-50 rounded-2xl group-hover:bg-orange-100 transition-colors">
              <ShoppingCart className="h-5 w-5 text-orange-600" />
            </div>
            <div className="space-y-8">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Total Orders</span>
              <div className="text-5xl font-black text-slate-900 tracking-tighter uppercase">{stats.totalOrders}</div>
              <div className="flex items-center gap-2 text-rose-500">
                <div className="h-2 w-2 rounded-full bg-rose-500"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.15em]">Lifetime Activity</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 hover:border-rose-200 transition-all duration-500 group relative">
            <div className="absolute top-6 right-6 p-2 bg-blue-50 rounded-2xl group-hover:bg-blue-100 transition-colors">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div className="space-y-8">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Inventory Status</span>
              <div className="text-5xl font-black text-slate-900 tracking-tighter uppercase">{stats.activeProducts}</div>
              <div className="flex items-center gap-2 text-rose-500">
                <div className="h-2 w-2 rounded-full bg-rose-500"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.15em]">Active Listing</span>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Charts Section - Integrated Design */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000"></div>
        <div className="relative z-10 space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-primary" />
                Performance
              </h2>
              <p className="text-slate-400 text-sm font-medium tracking-wide">Weekly sales and revenue growth tracking</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-100/50 p-2 rounded-2xl border border-slate-100 self-start md:self-auto backdrop-blur-sm">
              <Button variant="ghost" size="sm" className="rounded-xl px-5 text-xs font-black bg-white shadow-sm text-slate-900 hover:bg-white">Weekly</Button>
              <Button variant="ghost" size="sm" className="rounded-xl px-5 text-xs font-black text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors">Monthly</Button>
            </div>
          </div>
        <div className="pt-8">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontSize: '14px',
                    padding: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(var(--primary))"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default StatsPage;