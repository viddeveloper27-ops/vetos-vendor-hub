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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { OrderService } from "@/services/OrderService";
import { VendorService } from "@/services/VendorService";
import { VendorBank } from "@/types";
import { format } from "date-fns";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CreditCard,
  Edit3,
  IndianRupee,
  QrCode,
  TrendingUp
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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

      {/* Refined Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Pending Balance - Glassmorphism Card */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-5 border border-white hover:bg-white transition-all duration-500 group relative shadow-2xl shadow-slate-200/50 h-full flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none group-hover:bg-primary/10 transition-colors"></div>

          <div className="space-y-10 relative z-10 text-center md:text-left">
            <div className="space-y-6">
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">Current Payout Balance</span>
              <div className="text-5xl font-bold text-slate-900 tracking-tight flex justify-center md:justify-start items-center gap-2">
                <span className="text-3xl font-medium text-slate-300 translate-y-[2px]">₹</span>
                {bankDetails?.pendingAmount?.toLocaleString() || "0"}
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-500/80">
                <div className="h-2 w-2 rounded-full bg-emerald-500/50 animate-pulse"></div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Ready for Settlement</span>
              </div>
            </div>

            <div className="pt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={!bankDetails?.pendingAmount || bankDetails.pendingAmount <= 0 || withdrawing}
                    className="w-full bg-slate-900 text-white hover:bg-slate-800 font-semibold py-7 rounded-2xl shadow-xl shadow-slate-200 border-none transition-all duration-300 hover:translate-y-[-2px] active:translate-y-[0px] text-lg"
                  >
                    {withdrawing ? "Processing..." : "Transfer to Bank"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-white/90 backdrop-blur-xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-bold">Confirm Payout</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-500 font-medium">
                      Funds will be wired to your linked destination.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="bg-slate-100/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-100 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Destination Account</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                        {bankDetails?.accountNumber ? `${bankDetails.bankName} (...${bankDetails.accountNumber.slice(-4)})` : bankDetails?.upiId || "Unlinked"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Net Payout</span>
                      <span className="font-bold text-slate-900 text-xl tracking-tight">₹{bankDetails?.pendingAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                  <AlertDialogFooter className="mt-6 sm:space-x-3">
                    <AlertDialogCancel className="rounded-xl border-slate-100 font-semibold px-6">Review again</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleWithdraw}
                      className="rounded-xl bg-primary hover:bg-primary/90 px-8 font-semibold shadow-lg shadow-primary/20"
                    >
                      Authorize Transfer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        {/* Total Earnings Card - Glassmorphism Design */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-5 border border-white relative group transition-all duration-500 overflow-hidden shadow-2xl shadow-slate-200/50">
          <div className="absolute top-8 right-8 p-3 bg-emerald-50 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
            <TrendingUp className="h-5 w-5 text-emerald-600 group-hover:text-white" />
          </div>
          <div className="space-y-10">
            <div className="space-y-6">
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">Lifetime Settlements</span>
              <div className="text-5xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="text-3xl font-medium text-slate-300 translate-y-[2px]">₹</span>
                {bankDetails?.totalAmountReceived?.toLocaleString() || "0"}
              </div>

              <div className="flex items-center gap-2 text-rose-500/80">
                <div className="h-2 w-2 rounded-full bg-rose-500/50"></div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Verified Disbursals</span>
              </div>
            </div>

            <div className="mt-8 relative group/bank">
              <div className="bg-slate-100/40 p-5 rounded-3xl border border-slate-100/50 flex items-center justify-between transition-all duration-500 group-hover/bank:bg-white group-hover/bank:shadow-lg">
                <div className="flex items-center gap-4 text-left">

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[12px] font-bold text-slate-900 leading-none">
                        {bankDetails?.accountNumber ? bankDetails.bankName : bankDetails?.upiId ? "UPI Hub" : "Cash Settlements"}
                      </p>
                      <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] h-3.5 px-1.5 font-bold uppercase">Active</Badge>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium font-mono uppercase tracking-wider">
                      {bankDetails?.accountNumber ? `•••• ${bankDetails.accountNumber.slice(-4)}` : bankDetails?.upiId ? `@${bankDetails.upiId.split('@')[1] || bankDetails.upiId}` : "Identity Verified"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-300 hover:text-primary hover:bg-primary/5 transition-colors"
                  onClick={() => navigate("/settings")}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History - Refined List */}
      <div className="space-y-6 pt-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-semibold text-slate-800 tracking-tight">Recent Activity</h2>
          <Button 
            variant="ghost" 
            className="text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-primary/5 px-4 rounded-xl transition-all"
            onClick={() => navigate("/transactions")}
          >
            View Statement
          </Button>
        </div>

        {transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="bg-white/60 backdrop-blur-md border border-white shadow-xl shadow-slate-200/30 hover:bg-white transition-all duration-500 rounded-3xl p-6 group cursor-pointer relative overflow-hidden">
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-5">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm tracking-tight">{tx.title}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-[0.1em] flex items-center gap-2 mt-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(tx.date, "MMM dd, hh:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-xl tracking-tight ${tx.type === 'credit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                    </p>
                    <div className={`text-[9px] uppercase font-bold tracking-[0.2em] mt-1.5 px-2 py-0.5 rounded-full inline-block ${tx.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                      {tx.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-dashed border-2 border-slate-100 bg-slate-50/20 backdrop-blur-sm rounded-[2.5rem] py-24">
            <div className="flex flex-col items-center justify-center space-y-6 text-center px-4">
              <div className="h-20 w-20 bg-white rounded-full shadow-2xl shadow-slate-200 flex items-center justify-center text-slate-200">
                <IndianRupee className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <p className="text-slate-500 font-semibold text-lg tracking-tight">No Transactions Recorded</p>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em] max-w-xs leading-relaxed">Confirmed orders will appear here for settlement</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bank Account Linking Alert - Refined */}
      {(!bankDetails || (!bankDetails.accountNumber && !bankDetails.upiId)) && (
        <div className="bg-amber-50/50 backdrop-blur-sm border border-amber-100 rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-amber-200/20">
          <div className="h-16 w-16 bg-white rounded-2xl text-amber-500 flex items-center justify-center shadow-sm shrink-0">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-1">
            <h3 className="font-semibold text-amber-900 text-lg tracking-tight">Financial Identity Undefined</h3>
            <p className="text-amber-700/80 text-sm font-medium">Please link your bank account or UPI ID to enable seamless payouts from the platform.</p>
          </div>
          <Button
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-2xl px-10 h-14 shadow-lg shadow-amber-600/20 transition-all hover:scale-[1.02]"
            onClick={() => navigate("/settings")}
          >
            Update Profile
          </Button>
        </div>
      )}
    </div>
  );
};

export default WalletPage;
