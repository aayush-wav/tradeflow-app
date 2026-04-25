import { NavLink, useLocation } from "react-router-dom";
import { useUIStore, useProfileStore } from "../stores";
import {
  LayoutDashboard,
  Package,
  BookOpen,
  FileText,
  FilePlus,
  Users,
  Calculator,
  FolderOpen,
  MapPin,
  Target,
  Truck,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "../stores";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  children?: { label: string; path: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
  { label: "Products", path: "/products", icon: <Package size={20} /> },
  { label: "Stock Ledger", path: "/stock-ledger", icon: <BookOpen size={20} /> },
  { label: "New Invoice", path: "/invoices/new", icon: <FilePlus size={20} /> },
  { label: "All Invoices", path: "/invoices", icon: <FileText size={20} /> },
  { label: "Customers", path: "/customers", icon: <Users size={20} /> },
  { label: "Suppliers", path: "/suppliers", icon: <Truck size={20} /> },
  { label: "New Cost Sheet", path: "/costing/new", icon: <Calculator size={20} /> },
  { label: "Cost Sheets", path: "/costing", icon: <FolderOpen size={20} /> },
  { label: "Routes", path: "/routes", icon: <MapPin size={20} /> },
  { label: "Profit Targets", path: "/profit-targets", icon: <Target size={20} /> },
  { label: "Reports", path: "/reports", icon: <BarChart3 size={20} /> },
  { label: "Settings", path: "/settings", icon: <Settings size={20} /> },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const profile = useProfileStore((s) => s.profile);
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();

  return (
    <aside
      className={`${sidebarCollapsed ? "w-16" : "w-60"} bg-slate-900 text-white flex flex-col h-full transition-all duration-200 flex-shrink-0`}
    >
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-700/50">
        {!sidebarCollapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {profile?.company_name || "TradeFlow Nepal"}
            </p>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex-shrink-0"
        >
          {sidebarCollapsed ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/invoices/new" &&
              item.path !== "/costing/new" &&
              location.pathname.startsWith(item.path) &&
              item.path !== "/dashboard");
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
      <div className="border-t border-slate-700/50 p-2">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 mx-0 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 w-full"
          title={sidebarCollapsed ? "Log Out" : undefined}
        >
          <LogOut size={20} />
          {!sidebarCollapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
