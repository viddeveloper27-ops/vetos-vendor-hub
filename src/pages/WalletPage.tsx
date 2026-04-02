import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  CreditCard,
  QrCode,
  IndianRupee
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { OrderService } from "@/services/OrderService";
import { VendorService } from "@/services/VendorService";
import { VendorBank, Order } from "@/types";
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
import { format } from "date-fns";

const WalletPage = () => {
  const { vendor } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bankDetails, setBankDetails] = useState<VendorBank | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    if (vendor?._id) {
      loadWalletData();
    }
  }, [vendor]);

  const loadWalletData = async () => {
    setLoading(true);
    try {
      const [bank, orders] = await Promise.all([
        VendorService.getBank(vendor!._id),
        OrderService.getByVendor(vendor!._id)
      ]);

      setBankDetails(bank);

      // Derive "real data" transactions from delivered orders
      const orderTransactions = orders
        .filter(order => order.status === "DELIVERED" || order.status === "CONFIRMED")
        .map(order => ({
          id: order._id,
          type: 'credit',
          amount: order.totalAmount,
          title: `Order #${order.orderId || order._id.slice(-6).toUpperCase()}`,
          subtitle: 'Payment Received',
          date: new Date(order.createdAt),
          status: 'completed'
        }));

      // Sort by date descending
      setTransactions(orderTransactions.sort((a, b) => b.date.getTime() - a.date.getTime()));

    } catch (error) {
      console.error("Error loading wallet data:", error);
      toast.error("Failed to load wallet details");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!bankDetails?.pendingAmount || !vendor?._id) return;

    setWithdrawing(true);
    try {
      await VendorService.withdraw(vendor._id);
      setBankDetails(prev => prev ? ({ ...prev, pendingAmount: 0 }) : null);
      toast.success("Withdrawal request processed successfully!");
      loadWalletData(); // Refresh to show updated totals
    } catch (error: any) {
      toast.error(error.message || "Withdrawal failed");
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-24">

      {/* Stats Cards - Integrated Redesign */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pending Balance - Integrated White Card */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 hover:border-rose-200 transition-all duration-500 group relative shadow-sm h-full flex flex-col justify-between">
          <div className="space-y-8">
            <div className="space-y-6">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Available Balance</span>
              <div className="text-5xl font-black text-slate-900 tracking-tighter flex items-center gap-2">
                <span className="text-3xl font-bold text-slate-300 translate-y-[2px]">₹</span>
                {bankDetails?.pendingAmount?.toLocaleString() || "0"}
              </div>
              
              <div className="flex items-center gap-2 text-emerald-500">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.15em]">Withdrawable</span>
              </div>
            </div>

            <div className="pt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    disabled={!bankDetails?.pendingAmount || bankDetails.pendingAmount <= 0 || withdrawing}
                    className="w-full bg-primary text-white hover:bg-primary/90 font-black py-7 rounded-2xl shadow-xl shadow-primary/20 border-none transition-all duration-300 hover:scale-[1.02] active:scale-95 text-lg"
                  >
                    {withdrawing ? "Processing..." : "Transfer to Bank"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-bold">Confirm Withdrawal</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-600">
                      You are about to withdraw <span className="font-bold text-slate-900">₹{bankDetails?.pendingAmount}</span> to your linked account.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Destination</span>
                      <span className="font-semibold text-slate-900 truncate max-w-[200px]">
                        {bankDetails?.accountNumber ? `${bankDetails.bankName} (...${bankDetails.accountNumber.slice(-4)})` : bankDetails?.upiId || "Not Linked"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Amount</span>
                      <span className="font-bold text-primary italic">₹{bankDetails?.pendingAmount}</span>
                    </div>
                  </div>
                  <AlertDialogFooter className="mt-4 sm:space-x-3">
                    <AlertDialogCancel className="rounded-xl border-slate-200">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleWithdraw}
                      className="rounded-xl bg-primary hover:bg-primary/90 px-8"
                    >
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        {/* Total Earnings Card - Integrated Design */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 relative group transition-all duration-500 overflow-hidden shadow-sm">
          <div className="absolute top-6 right-6 p-3 bg-emerald-50 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
            <TrendingUp className="h-5 w-5 text-emerald-600 group-hover:text-white" />
          </div>
          <div className="space-y-8">
            <div className="space-y-6">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Total Settlement</span>
              <div className="text-5xl font-black text-slate-900 tracking-tighter flex items-center gap-2">
                <span className="text-3xl font-bold text-slate-300 translate-y-[2px]">₹</span>
                {bankDetails?.totalAmountReceived?.toLocaleString() || "0"}
              </div>
              
              <div className="flex items-center gap-2 text-rose-500">
                <div className="h-2 w-2 rounded-full bg-rose-500"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.15em]">Paid to Bank</span>
              </div>
            </div>

            <div className="mt-12 p-8 bg-slate-50/80 rounded-[2rem] border border-slate-100 group-hover:border-primary/20 transition-all duration-300 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:rotate-6 transition-transform">
                    {bankDetails?.accountNumber ? <CreditCard className="h-7 w-7 text-slate-700" /> : <QrCode className="h-7 w-7 text-slate-700" />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-slate-900">
                      {bankDetails?.accountNumber ? bankDetails.bankName : "Primary UPI"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium font-mono tracking-wider">
                      {bankDetails?.accountNumber ? `**** ${bankDetails.accountNumber.slice(-4)}` : bankDetails?.upiId ? `@${bankDetails.upiId.split('@')[1] || bankDetails.upiId}` : "Identity verified"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:bg-primary/10 text-xs font-black rounded-xl px-5 py-5"
                  onClick={() => navigate("/settings")}
                >
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl font-bold text-slate-900">Recent Transactions</h2>
          <Button variant="ghost" className="text-slate-500 text-sm font-medium">View All</Button>
        </div>

        {transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-[2rem] p-6 group cursor-pointer overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-2xl transition-all duration-500 ${tx.type === 'credit' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-rose-50 text-rose-600 group-hover:bg-rose-500 group-hover:text-white'}`}>
                      {tx.type === 'credit' ? <ArrowDownRight className="h-7 w-7" /> : <ArrowUpRight className="h-7 w-7" />}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-base tracking-tight">{tx.title}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3" />
                        {format(tx.date, "MMM dd, hh:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-xl tracking-tighter ${tx.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                    </p>
                    <div className={`text-[10px] uppercase font-black tracking-[0.3em] mt-1 ${tx.status === 'completed' ? 'text-emerald-500' : 'text-orange-500'}`}>
                      {tx.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-dashed border-2 border-slate-200 bg-slate-50/50 rounded-[2.5rem] py-20">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-6 bg-white rounded-full shadow-sm text-slate-300">
                < IndianRupee className="h-12 w-12" />
              </div>
              <p className="text-slate-500 font-bold tracking-tight">No Transactions Recorded</p>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Orders will appear here once confirmed</p>
            </div>
          </div>
        )}
      </div>

      {/* Bank Account Linking Alert (if not linked) */}
      {(!bankDetails || (!bankDetails.accountNumber && !bankDetails.upiId)) && (
        <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
          <div className="p-4 bg-orange-100 rounded-2xl text-orange-600 shrink-0">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-bold text-orange-900 text-lg">Bank Account Not Linked</h3>
            <p className="text-orange-700 text-sm">Please update your bank details to receive payouts directly to your account.</p>
          </div>
          <Button
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-8"
            onClick={() => navigate("/settings")}
          >
            Fix Now
          </Button>
        </div>
      )}
    </div>
  );
};

export default WalletPage;
