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
  AlertCircle
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

      // Calculate revenue from CONFIRMED or DELIVERED orders
      const revenue = orders
        .filter(o => o.status === "CONFIRMED" || o.status === "DELIVERED")
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

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
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Bio Section */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <Avatar className="h-24 w-24 border-4 border-primary/10">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-white text-3xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left space-y-1">
            <h1 className="text-3xl font-bold text-slate-900">{vendor?.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
              <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-100">
                {vendor?.phone}
              </Badge>
              {vendor?.email && (
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-100">
                  {vendor?.email}
                </Badge>
              )}
            </div>
            <p className="text-slate-500 max-w-lg mt-2">
              {vendor?.address?.city ? `Vendor based in ${vendor.address.city}, ${vendor.address.state}` : "Registered Vendor"}
            </p>
          </div>

          <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              className="flex-1 md:w-40 border-primary text-primary hover:bg-primary/5 gap-2"
              onClick={() => navigate("/settings")}
            >
              <Settings className="h-4 w-4" />
              Edit Profile
            </Button>
            <Button
              variant="ghost"
              className="flex-1 md:w-40 text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 px-1">Quick Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-none shadow-md bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
              <div className="p-2 bg-primary/20 rounded-lg">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">₹{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-emerald-600 flex items-center font-medium mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                Updated just now
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Orders</CardTitle>
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <ShoppingCart className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.totalOrders}</div>
              <p className="text-xs text-emerald-600 flex items-center font-medium mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                Lifetime orders
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Products</CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.activeProducts}</div>
              <p className="text-xs text-blue-600 flex items-center font-medium mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                Live on store
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Withdrawal Section */}
      {bankDetails?.pendingAmount !== undefined && bankDetails.pendingAmount > 0 && (
        <Card className="border-none shadow-lg overflow-hidden bg-white">
          <div className="flex flex-col md:flex-row">
            <div className="bg-primary p-6 flex items-center justify-center text-white">
              <Wallet className="h-10 w-10" />
            </div>
            <div className="p-6 flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">Pending Balance</p>
                  <h1 className="text-4xl font-bold text-slate-900">₹{bankDetails.pendingAmount}</h1>
                </div>
                <Badge variant="outline" className="text-primary border-primary">
                  Ready to withdraw
                </Badge>
              </div>
              <p className="text-sm text-slate-500">
                Your previous payout was manually settled. Withdraw the full amount to your linked {bankDetails.accountNumber ? "bank account" : "UPI ID"}.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-semibold py-6 px-8 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                      disabled={withdrawing}
                    >
                      {withdrawing ? "Processing..." : "Withdraw to Bank"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-3xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-2xl font-bold">Confirm Withdrawal</AlertDialogTitle>
                      <AlertDialogDescription className="text-slate-600">
                        Are you sure you want to withdraw <span className="font-bold text-slate-900">₹{bankDetails.pendingAmount}</span> to your registered {bankDetails.accountNumber ? `bank account ending in ${bankDetails.accountNumber.slice(-4)}` : "UPI ID"}?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4">
                      <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleWithdraw}
                        className="rounded-xl bg-primary hover:bg-primary/90"
                      >
                        Confirm Withdrawal
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button
                  variant="outline"
                  className="w-full sm:w-auto py-6 px-8 rounded-xl border-slate-200"
                  onClick={() => navigate("/settings")}
                >
                  Edit Bank Details
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Link to Bank if not linked */}
      {(!bankDetails || (!bankDetails.accountNumber && !bankDetails.upiId)) && (
        <div
          onClick={() => navigate("/settings")}
          className="p-6 bg-orange-50 border border-orange-100 rounded-3xl flex items-center justify-between cursor-pointer hover:bg-orange-100/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-2xl">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="font-bold text-orange-900">Link your bank account</p>
              <p className="text-sm text-orange-700">Receive payouts by adding your bank details or UPI ID.</p>
            </div>
          </div>
          <ArrowUpRight className="h-6 w-6 text-orange-400 mr-2" />
        </div>
      )}

      {/* Charts Section - Real Data */}
      <Card className="border-none shadow-md overflow-hidden bg-white">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800">
            <TrendingUp className="h-5 w-5 text-primary" />
            Sales Performance (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
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
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsPage;