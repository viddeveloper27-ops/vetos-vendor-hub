import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut, User } from "lucide-react";
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
          toast.success("Push notifications enabled");
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

      // 5. Listen for foreground messages
      onMessageListener().then((payload: any) => {
        console.log("Notification received:", payload);
        toast.info(payload.notification?.title || "New Notification", {
          description: payload.notification?.body,
        });
      }).catch(err => console.log('FCM Listener failed: ', err));

      return () => {
        window.removeEventListener("fcmTokenReceived", handleTokenReceived);
      };
    }
  }, [vendor]);

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background font-sans">
        <AppSidebarContent />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between bg-primary text-primary-foreground px-4 shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-white hover:bg-white/20" />
              <span className="text-lg font-semibold tracking-tight">
                Vendor Panel
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 outline-none hover:opacity-80 transition-opacity">
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
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
