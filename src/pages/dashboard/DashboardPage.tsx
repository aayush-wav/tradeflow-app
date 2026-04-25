import { useEffect, useState } from "react";
import { useDashboardStore, useProductStore, useInvoiceStore } from "../../stores";
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
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  FileText,
  AlertTriangle,
  DollarSign,
  Package,
} from "lucide-react";

const CHART_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

export function DashboardPage() {
  const { stats, isLoading, fetchStats } = useDashboardStore();
  const { products, fetchProducts } = useProductStore();
  const { invoices, fetchInvoices } = useInvoiceStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    Promise.all([fetchStats(), fetchProducts(), fetchInvoices()]).then(() =>
      setMounted(true)
    );
  }, [fetchStats, fetchProducts, fetchInvoices]);

  if (!mounted || isLoading) return <PageLoader />;

  const fiscalYear = getCurrentNepalFiscalYear();
  const lowStockProducts = products.filter(
    (p) => p.status === "Active" && p.current_stock <= p.reorder_level
  );
  const recentInvoices = invoices.slice(0, 5);

  const invoiceStatusData = [
    {
      name: "Paid",
      value: invoices.filter((i) => i.status === "Paid").length,
    },
    {
      name: "Unpaid",
      value: invoices.filter((i) =>
        ["Draft", "Sent"].includes(i.status)
      ).length,
    },
    {
      name: "Overdue",
      value: invoices.filter((i) => i.status === "Overdue").length,
    },
    {
      name: "Partial",
      value: invoices.filter((i) => i.status === "Partially Paid").length,
    },
  ].filter((d) => d.value > 0);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`Fiscal Year ${fiscalYear}`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<DollarSign size={20} />}
          label="Total Revenue"
          value={formatCurrency(stats?.total_revenue_paisa || 0)}
          color="blue"
        />
        <StatCard
          icon={<FileText size={20} />}
          label="Paid Invoices"
          value={String(stats?.invoices_paid || 0)}
          sub={`${stats?.invoices_unpaid || 0} unpaid`}
          color="green"
        />
        <StatCard
          icon={<TrendingDown size={20} />}
          label="Overdue"
          value={String(stats?.invoices_overdue || 0)}
          color="red"
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          label="Low Stock Alerts"
          value={String(stats?.low_stock_count || 0)}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card lg:col-span-2">
          <h3 className="section-title mb-4">Revenue Overview</h3>
          {invoices.length === 0 ? (
            <EmptyState
              icon={<TrendingUp size={40} />}
              title="No revenue data yet"
              description="Revenue chart will appear here once you have paid invoices."
            />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={getMonthlyData(invoices)}
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  tickFormatter={(v) => `${(v / 100).toLocaleString()}`}
                />
                <Tooltip
                  formatter={(value: number) => [
                    formatCurrency(value),
                    "Revenue",
                  ]}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3 className="section-title mb-4">Invoice Status</h3>
          {invoiceStatusData.length === 0 ? (
            <EmptyState
              icon={<FileText size={40} />}
              title="No invoices yet"
            />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={invoiceStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {invoiceStatusData.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={CHART_COLORS[idx % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {invoiceStatusData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                  }}
                />
                {d.name}: {d.value}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="section-title mb-4">Recent Invoices</h3>
          {recentInvoices.length === 0 ? (
            <EmptyState
              icon={<FileText size={32} />}
              title="No recent invoices"
            />
          ) : (
            <div className="space-y-3">
              {recentInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {inv.invoice_number}
                    </p>
                    <p className="text-xs text-slate-500">{inv.party_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatCurrency(inv.grand_total_paisa, inv.currency)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatADDate(inv.invoice_date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="section-title mb-4">
            Low Stock Alerts
            {lowStockProducts.length > 0 && (
              <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                {lowStockProducts.length}
              </span>
            )}
          </h3>
          {lowStockProducts.length === 0 ? (
            <EmptyState
              icon={<Package size={32} />}
              title="All stock levels are healthy"
            />
          ) : (
            <div className="space-y-3">
              {lowStockProducts.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-red-50"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {p.name}
                    </p>
                    <p className="text-xs text-slate-500">{p.product_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">
                      {p.current_stock} {p.unit_of_measure}
                    </p>
                    <p className="text-xs text-slate-500">
                      Reorder: {p.reorder_level}
                    </p>
                  </div>
                </div>
              ))}
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  const bgColors: Record<string, string> = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    red: "bg-red-50",
    amber: "bg-amber-50",
  };
  const iconColors: Record<string, string> = {
    blue: "text-blue-600",
    green: "text-green-600",
    red: "text-red-600",
    amber: "text-amber-600",
  };
  return (
    <div className="card flex items-start gap-4">
      <div
        className={`p-2.5 rounded-lg ${bgColors[color]} ${iconColors[color]}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-xl font-bold text-slate-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function getMonthlyData(
  invoices: { invoice_date: string; grand_total_paisa: number; status: string }[]
) {
  const months: Record<string, number> = {};
  invoices
    .filter((i) => i.status === "Paid")
    .forEach((inv) => {
      const d = new Date(inv.invoice_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months[key] = (months[key] || 0) + inv.grand_total_paisa;
    });
  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, revenue]) => ({ month, revenue }));
}
