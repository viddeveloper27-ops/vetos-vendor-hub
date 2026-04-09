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
    <div className="space-y-8 md:space-y-10 animate-fade-in pb-20">
      {/* Refined Bio Section - Interactive Header */}
      <div className="flex flex-col items-center justify-center px-6 py-12 md:p-20 relative overflow-hidden group rounded-[2rem] md:rounded-[3rem]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-rose-50/30 to-transparent pointer-events-none"></div>
        <div className="absolute -right-32 -top-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000"></div>
        <div className="absolute -left-32 -bottom-32 w-80 h-80 bg-rose-200/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="absolute top-8 right-8 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-11 w-11 bg-white/40 backdrop-blur-xl rounded-full text-slate-400 hover:text-rose-600 hover:bg-white transition-all shadow-sm border border-white/50"
            title="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
          <button
            onClick={() => navigate("/profile/details")}
            className="group/avatar relative transition-all duration-500 hover:scale-105 active:scale-95"
          >
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-rose-400/20 rounded-full blur-2xl opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-700"></div>
            <Avatar className="h-28 w-28 md:h-32 md:w-32 border-8 border-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] relative z-10">
              <AvatarImage src={vendor?.image} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-primary/80 to-rose-400 text-white text-3xl font-bold tracking-tighter">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>

          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight sm:text-5xl">{vendor?.name}</h1>
            <div className="flex flex-col items-center gap-3">
              <p className="text-slate-500 text-[11px] font-medium uppercase tracking-[0.25em] flex items-center justify-center gap-2 font-mono">
                <Phone className="h-3.5 w-3.5 text-rose-400" />
                {vendor?.phone}
              </p>
              <Badge variant="outline" className="bg-white/50 backdrop-blur-sm border-slate-200 text-slate-500 font-medium px-4 py-1 rounded-full">
                Professional Vendor
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Insights Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-lg font-medium text-slate-800 tracking-tight">Business Metrics</h2>
          <div className="px-4 py-1.5 rounded-full bg-slate-100/50 border border-slate-200/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Live</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/60 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 border border-white shadow-xl shadow-slate-200/50 hover:bg-white transition-all duration-500 group relative">
            <div className="absolute top-6 right-6 p-2 bg-emerald-50 rounded-2xl group-hover:bg-emerald-100 transition-colors">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="space-y-6">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Total Revenue</span>
              <div className="text-4xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="text-2xl font-medium text-slate-300">₹</span>
                {stats.totalRevenue.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 text-emerald-600/80">
                <span className="text-[9px] font-semibold uppercase tracking-[0.1em]">Verified Lifetime Earnings</span>
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 border border-white shadow-xl shadow-slate-200/50 hover:bg-white transition-all duration-500 group relative">
            <div className="absolute top-6 right-6 p-2 bg-orange-50 rounded-2xl group-hover:bg-orange-100 transition-colors">
              <ShoppingCart className="h-5 w-5 text-orange-600" />
            </div>
            <div className="space-y-6">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Total Orders</span>
              <div className="text-4xl font-semibold text-slate-900 tracking-tight">{stats.totalOrders}</div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-[9px] font-semibold uppercase tracking-[0.1em]">All-time processing</span>
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] p-8 border border-white shadow-xl shadow-slate-200/50 hover:bg-white transition-all duration-500 group relative">
            <div className="absolute top-6 right-6 p-2 bg-blue-50 rounded-2xl group-hover:bg-blue-100 transition-colors">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div className="space-y-6">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Active Listing</span>
              <div className="text-4xl font-semibold text-slate-900 tracking-tight">{stats.activeProducts}</div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-[9px] font-semibold uppercase tracking-[0.1em]">Live in marketplace</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet & Payouts Section - High Priority */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-lg font-medium text-slate-800 tracking-tight">Wallet & Payouts</h2>
          <button
            onClick={() => navigate("/wallet")}
            className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest flex items-center gap-1.5"
          >
            View Details
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>

        <div className="bg-white/60 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 border border-white shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-500 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none group-hover:bg-primary/10 transition-colors duration-1000"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Available for Payout</span>
                  <div className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tighter flex items-center gap-2">
                    <span className="text-2xl font-medium text-slate-300">₹</span>
                    {bankDetails?.pendingAmount?.toLocaleString() || "0"}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Settlement Safe</span>
                </div>
                <p className="text-xs text-slate-400 font-medium tracking-tight">Next payout window: <span className="text-slate-600 font-bold">Within 24-48 Hours</span></p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={!bankDetails?.pendingAmount || withdrawing}
                    className="w-full md:w-auto h-14 md:h-16 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95 text-sm font-bold tracking-wide uppercase gap-2"
                  >
                    {withdrawing ? (
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5" />
                    )}
                    Request Withdrawal
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-bold text-slate-900">Confirm Withdrawal</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-500 text-sm py-2">
                      You are requesting to withdraw <span className="font-bold text-slate-900">₹{bankDetails?.pendingAmount?.toLocaleString()}</span>.
                      The amount will be transferred to your registered bank account.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel className="rounded-xl border-slate-200">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleWithdraw}
                      className="rounded-xl bg-primary text-white hover:bg-primary/90"
                    >
                      Confirm & Request
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>


    </div >
  );
};

export default StatsPage;