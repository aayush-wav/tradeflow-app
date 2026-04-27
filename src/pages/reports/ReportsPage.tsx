import { useEffect, useState } from "react";
import { useInvoiceStore, useProductStore, usePartyStore, useShipmentStore, useUIStore } from "../../stores";
import { PageHeader, PageLoader, StatusBadge } from "../../components/shared";
import { formatCurrency, formatADDate, getCurrentNepalFiscalYear } from "../../utils";
import { BarChart3, FileDown, TrendingUp, Globe, Package, Activity } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from "recharts";

const COLORS = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#f97316"];

export function ReportsPage() {
  const { invoices, fetchInvoices } = useInvoiceStore();
  const { products, fetchProducts } = useProductStore();
  const { parties, fetchParties } = usePartyStore();
  const { records, fetchRecords } = useShipmentStore();
  const { theme: uiTheme } = useUIStore();
  const [mounted, setMounted] = useState(false);

  const theme = uiTheme === "system"
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : uiTheme;

  useEffect(() => {
    Promise.all([fetchInvoices(), fetchProducts(), fetchParties(), fetchRecords()]).then(() =>
      setMounted(true)
    );
  }, [fetchInvoices, fetchProducts, fetchParties, fetchRecords]);

  if (!mounted) return <PageLoader />;

  const fiscalYear = getCurrentNepalFiscalYear();

  // ── Aggregates ──
  const totalSales = invoices.reduce((sum, inv) => sum + inv.grand_total_paisa, 0);
  const paidSales  = invoices.filter(i => i.status === "Paid").reduce((sum, inv) => sum + inv.grand_total_paisa, 0);
  const pendingSales = totalSales - paidSales;
  const totalCosts = records.reduce((sum, r) => sum + r.total_cost_paisa, 0);
  const grossProfit = paidSales - totalCosts;
  const margin = paidSales > 0 ? ((grossProfit / paidSales) * 100).toFixed(1) : "0.0";

  // ── Chart data ──
  const productsByCategory = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const categoryChartData = Object.entries(productsByCategory).map(([name, count]) => ({ name, count }));

  const countryData = invoices.reduce((acc, inv) => {
    const c = inv.party_country || "Unknown";
    acc[c] = (acc[c] || 0) + inv.grand_total_paisa;
    return acc;
  }, {} as Record<string, number>);
  const countryChartData = Object.entries(countryData)
    .sort(([,a],[,b]) => b - a)
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  // Monthly bar chart
  const monthlyMap: Record<string, { paid: number; unpaid: number }> = {};
  invoices.forEach(inv => {
    const d = new Date(inv.invoice_date);
    const key = d.toLocaleDateString("en", { month: "short", year: "2-digit" });
    if (!monthlyMap[key]) monthlyMap[key] = { paid: 0, unpaid: 0 };
    if (inv.status === "Paid") monthlyMap[key].paid += inv.grand_total_paisa;
    else monthlyMap[key].unpaid += inv.grand_total_paisa;
  });
  const monthlyBarData = Object.entries(monthlyMap).slice(-8).map(([month, v]) => ({ month, ...v }));

  // Top customers
  const topCustomers = parties
    .filter(p => p.party_type === "Customer")
    .map(p => {
      const partyInvoices = invoices.filter(inv => inv.party_id === p.id);
      const total = partyInvoices.reduce((s, i) => s + i.grand_total_paisa, 0);
      return { ...p, total, count: partyInvoices.length };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Business Reports"
        subtitle={`Analytics Summary · Fiscal Year ${fiscalYear}`}
        actions={
          <button className="btn-secondary flex items-center gap-2">
            <FileDown size={16} /> Export CSV
          </button>
        }
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Invoiced</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(totalSales)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Realized (Paid)</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{formatCurrency(paidSales)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Outstanding</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{formatCurrency(pendingSales)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Gross Profit ({margin}%)</p>
          <p className={`text-2xl font-bold mt-1 ${grossProfit >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600"}`}>
            {formatCurrency(Math.abs(grossProfit))}
          </p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Paid vs Unpaid Bar */}
        <div className="card">
          <h3 className="section-title mb-5 flex items-center gap-2">
            <Activity size={16} className="text-blue-500" /> Monthly Revenue Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyBarData} margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === "dark" ? "#334155" : "#e2e8f0"} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }} tickFormatter={v => `${(v/10000000).toFixed(0)}M`} />
              <Tooltip
                contentStyle={{ backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", border: "1px solid " + (theme === "dark" ? "#1e293b" : "#e2e8f0"), borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                formatter={(v: number) => formatCurrency(v)}
              />
              <Legend wrapperStyle={{ fontSize: "11px", fontWeight: 600 }} />
              <Bar dataKey="paid" name="Paid" stackId="a" fill="#10b981" radius={[0,0,0,0]} />
              <Bar dataKey="unpaid" name="Pending/Draft" stackId="a" fill="#f59e0b" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Country Pie */}
        <div className="card">
          <h3 className="section-title mb-5 flex items-center gap-2">
            <Globe size={16} className="text-blue-500" /> Revenue by Market
          </h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={240}>
              <PieChart>
                <Pie data={countryChartData} cx="50%" cy="50%" outerRadius={90} innerRadius={55} paddingAngle={5} dataKey="value" stroke="none">
                  {countryChartData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff", borderRadius: "12px", border: "none" }}
                  formatter={(v: number) => formatCurrency(v)}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {countryChartData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 truncate max-w-[90px]">{d.name}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{formatCurrency(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Products by Category */}
        <div className="card">
          <h3 className="section-title mb-5 flex items-center gap-2">
            <Package size={16} className="text-blue-500" /> Product Portfolio
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryChartData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme === "dark" ? "#334155" : "#e2e8f0"} />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }} width={115} />
              <Tooltip contentStyle={{ backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", border: "1px solid " + (theme === "dark" ? "#1e293b" : "#e2e8f0"), borderRadius: "12px" }} />
              <Bar dataKey="count" name="Products" radius={[0, 4, 4, 0]}>
                {categoryChartData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Customers */}
        <div className="card">
          <h3 className="section-title mb-5 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-500" /> Top Customers by Revenue
          </h3>
          <div className="space-y-3">
            {topCustomers.map((p, idx) => {
              const pct = topCustomers[0]?.total > 0 ? (p.total / topCustomers[0].total) * 100 : 0;
              return (
                <div key={p.id}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-400">#{idx+1}</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{p.company_name}</p>
                        <p className="text-xs text-slate-400">{p.country} · {p.count} invoices</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatCurrency(p.total)}</p>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: COLORS[idx % COLORS.length] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activity Log Table */}
      <div className="card overflow-hidden p-0">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="section-title text-sm">Invoice Activity Log</h3>
          <span className="text-xs text-slate-400">{invoices.length} total records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Date</th>
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Invoice #</th>
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Customer</th>
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Market</th>
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Amount</th>
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.slice(0, 15).map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatADDate(inv.invoice_date)}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-blue-600 dark:text-blue-400">{inv.invoice_number}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{inv.party_name}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{inv.party_country || "Nepal"}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(inv.grand_total_paisa, inv.currency)}</td>
                  <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
