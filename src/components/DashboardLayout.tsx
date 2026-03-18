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
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      onClick={handleItemClick}
                      className="hover:bg-primary/10 transition-colors"
                      activeClassName="bg-primary text-white font-semibold shadow-sm"
                    >
                      <item.icon className="mr-2 h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
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

const DashboardLayout = () => {
  const { vendor, logout } = useAuth();
  const navigate = useNavigate();

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
