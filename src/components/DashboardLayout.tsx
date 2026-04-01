import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut, User, Bell, TrendingUp } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  // { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Products", url: "/products", icon: Package },
  { title: "Orders", url: "/orders", icon: ShoppingCart },
];

function AppSidebarContent() {
  const { state, setOpenMobile, isMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const handleItemClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <div className="p-4 border-b border-white/10 bg-primary text-white">
        {!collapsed && (
          <Link to="/dashboard" className="text-xl font-bold tracking-tight">
            Dogs & <span className="text-white/80">Joys</span>
          </Link>
        )}
        {collapsed && (
          <Link to="/dashboard" className="text-xl font-bold">D</Link>
        )}
      </div>
      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-auto">
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      onClick={handleItemClick}
                      className="hover:bg-primary/10 transition-colors py-3 px-4 flex items-center w-full"
                      activeClassName="bg-primary text-white font-semibold shadow-sm"
                    >
                      <item.icon className="mr-3 h-6 w-6 shrink-0" />
                      {!collapsed && <span className="text-base tracking-wide">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

import { messaging, requestForToken, onMessageListener } from "@/lib/firebase";
import { useEffect } from "react";
import { VendorService } from "@/services/VendorService";
import { toast } from "sonner";

const DashboardLayout = () => {
  const { vendor, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (vendor && vendor._id) {
      const syncFcmToken = async (token: string) => {
        try {
          console.log(`[FCM Sync] Orchestrating sync for vendor: ${vendor._id}`);
          const updatedVendor = await VendorService.update(vendor._id, { fcmToken: token });
          console.log("[FCM Sync] Successfully stored token in database:", updatedVendor.fcmToken ? "YES" : "NO");
          localStorage.removeItem("pending_fcm_token");
          // toast.success("Push notifications enabled");
        } catch (err) {
          console.error("[FCM Sync] Critical failure while saving token:", err);
        }
      };

      // 1. Initial check for pending tokens from startup
      const pending = localStorage.getItem("pending_fcm_token");
      if (pending) {
        console.log("Found pending FCM token from startup, syncing now...");
        syncFcmToken(pending);
      }

      // 2. React to dynamic token injection
      const handleTokenReceived = (e: any) => {
        const token = e.detail;
        if (token) {
          console.log("New FCM token received dynamically:", token);
          syncFcmToken(token);
        }
      };
      window.addEventListener("fcmTokenReceived", handleTokenReceived);

      // 3. Keep the bridge updated with the current vendor context
      (window as any).setFCMToken = (token: string) => {
        console.log("Native Bridge: Received FCM Token:", token);
        syncFcmToken(token);
      };
      (window as any).setFcmTokenFromNative = (window as any).setFCMToken;

      // 4. Web FCM Fallback
      const handleWebFcm = async () => {
        const token = await requestForToken();
        if (token) {
          console.log("Web FCM Token secured:", token);
          syncFcmToken(token);
        }
      };
      handleWebFcm();

      // 5. Native Bridge: Expose navigation to Flutter
      (window as any).navigateToPath = (path: string) => {
        console.log("Native Bridge: Navigation requested to:", path);
        navigate(path);
      };

      // 6. Listen for foreground messages
      const unsubscribe = onMessageListener((payload: any) => {
        console.log("Notification received:", payload);
        const orderId = payload.data?.orderId || payload.data?.id;

        toast.info(payload.notification?.title || "New Notification", {
          description: payload.notification?.body,
          action: orderId ? {
            label: "View Order",
            onClick: () => navigate(`/orders/${orderId}`)
          } : undefined,
        });
      });

      return () => {
        window.removeEventListener("fcmTokenReceived", handleTokenReceived);
        unsubscribe();
      };
    }
  }, [vendor]);

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50 font-sans">
        {/* <AppSidebarContent /> */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 h-16 flex items-center justify-between bg-primary text-primary-foreground px-4 shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              {/* <SidebarTrigger className="text-white hover:bg-white/20" /> */}
              <span className="text-lg font-semibold tracking-tight">
                Vendor Panel
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
                <Bell className="h-6 w-6 text-white" />
                {/* Notification marker - only show if there are new alerts */}
                {/* <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-white rounded-full border-2 border-primary shadow-sm" /> */}
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 outline-none hover:opacity-80 transition-opacity ml-1">
                  <div className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-sm font-bold border border-white/30">
                    {vendor?.name?.charAt(0) || "V"}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">{vendor?.name}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{vendor?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {vendor?.email || "Vendor Account"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>View Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 overflow-auto pb-24">
            <Outlet />
          </main>

          <nav className="fixed bottom-0 left-0 right-0 bg-primary h-20 flex items-center justify-around px-6 pb-2 safe-area-pb z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] rounded-t-[20px]">
            {navItems.map(item => {
              const isActive = location.pathname === item.url;
              return (
                <NavLink
                  key={item.title}
                  to={item.url}
                  className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-white' : 'text-white/60 hover:text-white/80'}`}
                >
                  <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-white/20' : ''}`}>
                    <item.icon className={`h-6 w-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
                  </div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                    {item.title.split(' ').pop()}
                  </span>
                </NavLink>
              );
            })}
            <NavLink
              to="/profile"
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${location.pathname === "/profile" ? 'text-white' : 'text-white/60 hover:text-white/80'}`}
            >
              <div className={`p-2 rounded-xl transition-all ${location.pathname === "/profile" ? 'bg-white/20' : ''}`}>
                <User className={`h-6 w-6 ${location.pathname === "/profile" ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
              </div>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${location.pathname === "/profile" ? 'opacity-100' : 'opacity-80'}`}>
                Profile
              </span>
            </NavLink>
          </nav>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
