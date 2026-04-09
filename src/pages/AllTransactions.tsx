import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { OrderService } from "@/services/OrderService";
import { format } from "date-fns";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  Filter,
  IndianRupee,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const AllTransactions = () => {
  const { vendor } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "credit" | "debit">("all");

  useEffect(() => {
    if (vendor?._id) {
      loadTransactions();
    }
  }, [vendor]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const orders = await OrderService.getByVendor(vendor!._id);

      const orderTransactions = orders
        .filter(order => order.status === "DELIVERED" || order.status === "CONFIRMED")
        .map(order => ({
          id: order._id,
          type: 'credit',
          amount: order.totalAmount,
          title: `Order #${order.orderId || order._id.slice(-6).toUpperCase()}`,
          date: new Date(order.createdAt),
          status: 'completed',
          customerName: order.customerName || "Customer"
        }));

      setTransactions(orderTransactions.sort((a, b) => b.date.getTime() - a.date.getTime()));
    } catch (error) {
      console.error("Error loading transactions:", error);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || tx.type === filterType;
    return matchesSearch && matchesType;
  });

  const groupTransactions = (txs: any[]) => {
    const groups: { [key: string]: any[] } = {};
    txs.forEach(tx => {
      const today = format(new Date(), "yyyy-MM-dd");
      const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd");
      const dateStr = format(tx.date, "yyyy-MM-dd");

      let label = format(tx.date, "MMMM dd, yyyy");
      if (dateStr === today) label = "Today";
      else if (dateStr === yesterday) label = "Yesterday";

      if (!groups[label]) groups[label] = [];
      groups[label].push(tx);
    });
    return groups;
  };

  const grouped = groupTransactions(filteredTransactions);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-5xl mx-auto pb-24 px-2 sm:px-4 pt-4">
      {/* Header & Breadcrumbs */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-4 sm:p-8 rounded-[2rem] sm:rounded-3xl border border-primary/10 shadow-sm space-y-4 sm:space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/wallet")}
          className="group -ml-2 text-primary hover:text-primary/80 hover:bg-primary/5 transition-all rounded-xl px-2 sm:px-4 flex items-center gap-2 font-bold uppercase tracking-widest text-[9px] sm:text-[10px]"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Wallet
        </Button>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-tight">Transaction History</h1>
            <p className="text-[13px] sm:text-sm text-slate-500 font-medium">Verified settlements and order registries from the ecosystem</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm shrink-0">
            <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time Ledger</span>
          </div>
        </div>
      </div>

      {/* Controls: Search & Filter */}
      <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search Order ID..."
            className="w-full h-11 sm:h-12 pl-11 pr-4 bg-white border-slate-200 rounded-xl sm:rounded-2xl shadow-sm focus-visible:ring-primary/20 text-slate-800 font-medium placeholder:text-slate-400 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-12">
        {loading ? (
          <div className="space-y-8">
            {[1, 2].map(i => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-4 w-32 rounded-full" />
                <div className="grid grid-cols-1 gap-4">
                  <Skeleton className="h-28 w-full rounded-[2.5rem]" />
                  <Skeleton className="h-28 w-full rounded-[2.5rem]" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTransactions.length > 0 ? (
          Object.entries(grouped).map(([dateLabel, groupTxs]) => (
            <div key={dateLabel} className="space-y-6">
              <div className="flex items-center gap-3 sm:gap-6 px-1 sm:px-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-slate-300"></div>
                  <span className="text-[10px] sm:text-[12px] font-black text-slate-900 uppercase tracking-widest sm:tracking-[0.4em] whitespace-nowrap">{dateLabel}</span>
                </div>
                <div className="h-[1px] sm:h-[2px] flex-1 bg-gradient-to-r from-slate-100 to-transparent"></div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {groupTxs.map((tx) => (
                  <div
                    key={tx.id}
                    className="bg-white border border-slate-100 hover:border-primary/20 shadow-sm hover:shadow-lg hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-all duration-300 rounded-2xl sm:rounded-3xl p-4 sm:p-5 group cursor-pointer relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                        <div className={`h-11 w-11 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0 ${tx.type === 'credit'
                          ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
                          : 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white'
                          }`}>
                          {tx.type === 'credit' ? <ArrowDownRight className="h-5 w-5 sm:h-6 sm:w-6" /> : <ArrowUpRight className="h-5 w-5 sm:h-6 sm:w-6" />}
                        </div>

                        <div className="space-y-0.5 sm:space-y-1 min-w-0">
                          <p className="font-bold text-slate-900 text-[15px] sm:text-lg tracking-tight truncate">{tx.title}</p>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <p className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold tracking-widest flex items-center gap-1 sm:gap-1.5">
                              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> {format(tx.date, "hh:mm a")}
                            </p>
                            <span className="h-0.5 w-0.5 sm:h-1 sm:w-1 rounded-full bg-slate-200"></span>
                            <p className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold tracking-widest truncate">{tx.customerName}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 sm:gap-2 shrink-0">
                        <p className={`font-black text-xl sm:text-2xl tracking-tighter ${tx.type === 'credit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {tx.type === 'credit' ? '+' : '-'} <span className="text-[11px] sm:text-sm font-medium opacity-60">₹</span>{tx.amount.toLocaleString()}
                        </p>
                        <div className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[9px] font-bold uppercase tracking-widest ${tx.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-orange-50 text-orange-600'
                          }`}>
                          <div className={`h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full ${tx.status === 'completed' ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                          {tx.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2rem] sm:rounded-[2.5rem] py-20 sm:py-32 flex flex-col items-center justify-center space-y-4 sm:space-y-6 text-center px-6 sm:px-12">
            <div className="h-16 w-16 sm:h-20 sm:w-20 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-200">
              <IndianRupee className="h-8 w-8 sm:h-10 sm:w-10 text-slate-200" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">No match found</h3>
              <p className="text-[13px] sm:text-sm text-slate-400 font-medium max-w-xs leading-relaxed">
                We couldn't find any financial records matching your current search.
              </p>
              <Button
                variant="link"
                onClick={() => { setSearchTerm(""); setFilterType("all"); }}
                className="mt-2 text-primary font-bold uppercase tracking-widest text-[9px] sm:text-[10px]"
              >
                Clear all filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllTransactions;
