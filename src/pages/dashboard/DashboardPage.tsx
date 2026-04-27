import { useEffect, useState } from "react";
import { useDashboardStore, useProductStore, useInvoiceStore, useShipmentStore, useUIStore } from "../../stores";
import { PageHeader, PageLoader, EmptyState } from "../../components/shared";
import { formatCurrency, getCurrentNepalFiscalYear, formatADDate } from "../../utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  FileText,
  AlertTriangle,
  DollarSign,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  BoxIcon,
  Truck,
  Building2,
} from "lucide-react";

const CHART_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
];

export function DashboardPage() {
  const { stats, isLoading, fetchStats } = useDashboardStore();
  const { products, fetchProducts } = useProductStore();
  const { invoices, fetchInvoices } = useInvoiceStore();
  const { records, fetchRecords } = useShipmentStore();
  const { theme: uiTheme } = useUIStore();
  const [mounted, setMounted] = useState(false);

  const theme =
    uiTheme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : uiTheme;

  useEffect(() => {
    Promise.all([fetchStats(), fetchProducts(), fetchInvoices(), fetchRecords()]).then(() =>
      setMounted(true)
    );
  }, [fetchStats, fetchProducts, fetchInvoices, fetchRecords]);

  if (!mounted || isLoading) return <PageLoader />;

  const fiscalYear = getCurrentNepalFiscalYear();
  const lowStockProducts = products.filter(
    (p) => p.status === "Active" && p.current_stock <= p.reorder_level
  );
  const recentInvoices = invoices.slice(0, 5);
  const totalRevenue = stats?.total_revenue_paisa || 0;
  const totalExpenses = stats?.total_expenses_paisa || 0;
  const estimatedProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((estimatedProfit / totalRevenue) * 100).toFixed(1) : "0.0";

  const monthlyData = getMonthlyData(invoices);
  const countryData = getCountryDistribution(invoices);
  const categoryData = getCategoryBreakdown(products);
  const costVsRevData = getCostVsRevenue(invoices, records);
  const topProducts = [...products]
    .sort((a, b) => (b.total_sold || 0) - (a.total_sold || 0))
    .slice(0, 5)
    .filter((p) => (p.total_sold || 0) > 0);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={`Fiscal Year ${fiscalYear}`} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<DollarSign size={20} />}
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          sub={`${stats?.invoices_paid || 0} collections realized`}
          color="blue"
          trend="up"
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          label="Gross Profit"
          value={formatCurrency(estimatedProfit)}
          sub={`Margin: ${profitMargin}%`}
          color="green"
          trend="up"
        />
        <StatCard
          icon={<Building2 size={20} />}
          label="Bank balance"
          value={formatCurrency(stats?.cash_balance_paisa || 0)}
          sub="Net liquidity across accounts"
          color="blue"
          trend="neutral"
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          label="Low Stock Alerts"
          value={String(stats?.low_stock_count || 0)}
          sub="Products below reorder level"
          color={lowStockProducts.length > 0 ? "amber" : "green"}
          trend="neutral"
        />
      </div>

      {/* Row 2: Area chart + Pie chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card lg:col-span-2">
          <div className="flex items-baseline justify-between mb-6">
            <h3 className="section-title">Revenue Growth Analytics</h3>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
              Last 18 Months
            </p>
          </div>
          {invoices.length === 0 ? (
            <EmptyState
              icon={<TrendingUp size={40} />}
              title="No revenue data yet"
              description="Enter demo mode to see 18 months of revenue analytics."
            />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={monthlyData}
                margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={theme === "dark" ? "#334155" : "#e2e8f0"}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }}
                  tickFormatter={(v) => `Rs.${(v / 10000000).toFixed(0)}M`}
                />
                <Tooltip
                  cursor={{ stroke: "#3b82f6", strokeWidth: 2 }}
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
                    border: "1px solid " + (theme === "dark" ? "#1e293b" : "#e2e8f0"),
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                  itemStyle={{ fontSize: "12px", fontWeight: 700 }}
                  formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3 className="section-title mb-4 text-center">Revenue by Destination</h3>
          {invoices.length === 0 ? (
            <EmptyState icon={<Globe size={40} />} title="No market data yet" />
          ) : (
            <>
              <div className="relative">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={countryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={6}
                      dataKey="value"
                      stroke="none"
                    >
                      {countryData.map((_, idx) => (
                        <Cell
                          key={idx}
                          fill={CHART_COLORS[idx % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    {invoices.length}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Invoices
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-1.5 mt-3">
                {countryData.slice(0, 5).map((d, i) => (
                  <div
                    key={d.name}
                    className="flex items-center justify-between px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-800/60"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        {d.name}
                      </p>
                    </div>
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {d.value}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Row 3: Bar chart Cost vs Revenue + Category breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <div className="flex items-baseline justify-between mb-5">
            <h3 className="section-title">Revenue vs. Costs</h3>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
              Profit Analysis
            </p>
          </div>
          {costVsRevData.length === 0 ? (
            <EmptyState icon={<Truck size={40} />} title="No cost data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={costVsRevData} margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={theme === "dark" ? "#334155" : "#e2e8f0"}
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }}
                  tickFormatter={(v) => `Rs.${(v / 10000000).toFixed(0)}M`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
                    border: "1px solid " + (theme === "dark" ? "#1e293b" : "#e2e8f0"),
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value: number, name: string) => [formatCurrency(value), name]}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", fontWeight: 600 }}
                />
                <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cost" name="Shipment Cost" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3 className="section-title mb-5">Product Portfolio by Category</h3>
          {products.length === 0 ? (
            <EmptyState icon={<BoxIcon size={40} />} title="No products yet" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke={theme === "dark" ? "#334155" : "#e2e8f0"}
                />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }}
                  width={110}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
                    border: "1px solid " + (theme === "dark" ? "#1e293b" : "#e2e8f0"),
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar dataKey="count" name="Products" radius={[0, 4, 4, 0]}>
                  {categoryData.map((_, idx) => (
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row 4: Recent invoices + Top products + Low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="section-title mb-4">Recent Invoices</h3>
          {recentInvoices.length === 0 ? (
            <EmptyState icon={<FileText size={32} />} title="No recent invoices" />
          ) : (
            <div className="space-y-2">
              {recentInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {inv.invoice_number}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {inv.party_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatCurrency(inv.grand_total_paisa, inv.currency)}
                    </p>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        inv.status === "Paid"
                          ? "bg-green-100 text-green-700"
                          : inv.status === "Draft"
                          ? "bg-slate-100 text-slate-600"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="section-title mb-4">Top Selling Products</h3>
          {topProducts.length === 0 ? (
            <EmptyState
              icon={<TrendingUp size={32} />}
              title="No sales recorded yet"
            />
          ) : (
            <div className="space-y-2">
              {topProducts.map((p, idx) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-blue-50 dark:bg-blue-900/10"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-blue-400 w-4">#{idx + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[140px]">
                        {p.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {p.product_id} · {p.unit_of_measure}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {p.total_sold} sold
                    </p>
                    <p className="text-xs text-slate-500">
                      Stock: {p.current_stock}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="section-title mb-4 flex items-center gap-2">
            Low Stock Alerts
            {lowStockProducts.length > 0 && (
              <span className="ml-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full">
                {lowStockProducts.length}
              </span>
            )}
          </h3>
          {lowStockProducts.length === 0 ? (
            <EmptyState
              icon={<Package size={32} />}
              title="All stock levels healthy"
              description="No products are below their reorder level."
            />
          ) : (
            <div className="space-y-2">
              {lowStockProducts.slice(0, 6).map((p) => {
                const pct = Math.max(0, Math.min(100, (p.current_stock / p.reorder_level) * 100));
                return (
                  <div
                    key={p.id}
                    className="py-2 px-3 rounded-lg bg-red-50 dark:bg-red-900/10"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[160px]">
                        {p.name}
                      </p>
                      <p className="text-sm font-bold text-red-600 dark:text-red-400">
                        {p.current_stock} {p.unit_of_measure}
                      </p>
                    </div>
                    <div className="w-full bg-red-100 dark:bg-red-900/20 rounded-full h-1.5">
                      <div
                        className="bg-red-500 h-1.5 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Reorder at: {p.reorder_level} {p.unit_of_measure}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
  trend?: "up" | "down" | "neutral";
}) {
  const bgColors: Record<string, string> = {
    blue: "bg-blue-50 dark:bg-blue-900/20",
    green: "bg-green-50 dark:bg-green-900/20",
    red: "bg-red-50 dark:bg-red-900/20",
    amber: "bg-amber-50 dark:bg-amber-900/20",
  };
  const iconColors: Record<string, string> = {
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-green-600 dark:text-green-400",
    red: "text-red-600 dark:text-red-400",
    amber: "text-amber-600 dark:text-amber-400",
  };
  return (
    <div className="card flex items-start gap-4">
      <div className={`p-2.5 rounded-xl ${bgColors[color]} ${iconColors[color]}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {label}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xl font-bold text-slate-900 dark:text-white truncate">
            {value}
          </p>
          {trend === "up" && (
            <ArrowUpRight size={16} className="text-green-500 flex-shrink-0" />
          )}
          {trend === "down" && (
            <ArrowDownRight size={16} className="text-red-500 flex-shrink-0" />
          )}
        </div>
        {sub && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  );
}

function getMonthlyData(invoices: { invoice_date: string; grand_total_paisa: number; status: string }[]) {
  const months: Record<string, number> = {};
  invoices
    .filter((i) => ["Paid", "Sent", "Partially Paid"].includes(i.status))
    .forEach((inv) => {
      const d = new Date(inv.invoice_date);
      const key = d.toLocaleDateString("en", { month: "short", year: "2-digit" });
      months[key] = (months[key] || 0) + inv.grand_total_paisa;
    });
  // Sort by date and take last 12
  const sorted = Object.entries(months);
  return sorted.slice(-12).map(([month, revenue]) => ({ month, revenue }));
}

function getCountryDistribution(invoices: any[]) {
  const counts: Record<string, number> = {};
  invoices.forEach((inv) => {
    const country = inv.party_country || "Nepal";
    counts[country] = (counts[country] || 0) + 1;
  });
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value }));
}

function getCategoryBreakdown(products: any[]) {
  const cats: Record<string, number> = {};
  products.forEach((p) => {
    cats[p.category] = (cats[p.category] || 0) + 1;
  });
  return Object.entries(cats).map(([name, count]) => ({ name, count }));
}

function getCostVsRevenue(invoices: any[], records: any[]) {
  if (invoices.length === 0 && records.length === 0) return [];
  // Group by quarter
  const quarters: Record<string, { revenue: number; cost: number }> = {};
  invoices
    .filter((i) => ["Paid", "Sent", "Partially Paid"].includes(i.status))
    .forEach((inv) => {
      const d = new Date(inv.invoice_date);
      const q = `Q${Math.ceil((d.getMonth() + 1) / 3)} '${String(d.getFullYear()).slice(-2)}`;
      if (!quarters[q]) quarters[q] = { revenue: 0, cost: 0 };
      quarters[q].revenue += inv.grand_total_paisa;
    });
  records.forEach((rec) => {
    const d = new Date(rec.created_at || new Date());
    const q = `Q${Math.ceil((d.getMonth() + 1) / 3)} '${String(d.getFullYear()).slice(-2)}`;
    if (!quarters[q]) quarters[q] = { revenue: 0, cost: 0 };
    quarters[q].cost += rec.total_cost_paisa || 0;
  });
  return Object.entries(quarters)
    .slice(-6)
    .map(([label, { revenue, cost }]) => ({ label, revenue, cost }));
}
