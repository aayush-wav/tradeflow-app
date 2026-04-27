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
  Banknote,
  Factory,
  Building2,
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
  { label: "Production", path: "/production", icon: <Factory size={20} /> },
  { label: "Bank History", path: "/bank-history", icon: <Building2 size={20} /> },
  { label: "New Invoice", path: "/invoices/new", icon: <FilePlus size={20} /> },
  { label: "All Invoices", path: "/invoices", icon: <FileText size={20} /> },
  { label: "Customers", path: "/customers", icon: <Users size={20} /> },
  { label: "Suppliers", path: "/suppliers", icon: <Truck size={20} /> },
  { label: "New Cost Sheet", path: "/costing/new", icon: <Calculator size={20} /> },
  { label: "Cost Sheets", path: "/costing", icon: <FolderOpen size={20} /> },
  { label: "Forex & Duty", path: "/forex", icon: <Banknote size={20} /> },
  { label: "Routes", path: "/routes", icon: <MapPin size={20} /> },
  { label: "Profit Targets", path: "/profit-targets", icon: <Target size={20} /> },
  { label: "Reports", path: "/reports", icon: <BarChart3 size={20} /> },
  { label: "Accounting", path: "/accounting", icon: <FileText size={20} /> },
  { label: "Settings", path: "/settings", icon: <Settings size={20} /> },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const profile = useProfileStore((s) => s.profile);
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();

  return (
    <aside
      className={`print:hidden ${sidebarCollapsed ? "w-16" : "w-64"} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full transition-all duration-300 flex-shrink-0 z-20 shadow-xl shadow-slate-200/50 dark:shadow-none`}
    >
      <div className="flex items-center gap-3 px-4 py-6 border-b border-slate-100 dark:border-slate-800/50">
        {!sidebarCollapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tighter">
              {profile?.company_name || "TradeFlow"}
            </p>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white flex-shrink-0 transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className={`flex-shrink-0 transition-transform ${isActive ? "scale-110" : ""}`}>{item.icon}</span>
              {!sidebarCollapsed && <span className="tracking-tight">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
      <div className="border-t border-slate-100 dark:border-slate-800/50 p-3">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all w-full"
          title={sidebarCollapsed ? "Log Out" : undefined}
        >
          <LogOut size={20} />
          {!sidebarCollapsed && <span className="tracking-tight">Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
