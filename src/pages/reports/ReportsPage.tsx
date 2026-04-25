import { useEffect, useState } from "react";
import { useInvoiceStore, useProductStore, usePartyStore } from "../../stores";
import { PageHeader, PageLoader, StatusBadge } from "../../components/shared";
import { formatCurrency, formatADDate, getCurrentNepalFiscalYear } from "../../utils";
import { BarChart3, FileDown, Table as TableIcon, Filter } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function ReportsPage() {
  const { invoices, fetchInvoices } = useInvoiceStore();
  const { products, fetchProducts } = useProductStore();
  const { parties, fetchParties } = usePartyStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    Promise.all([fetchInvoices(), fetchProducts(), fetchParties()]).then(() =>
      setMounted(true)
    );
  }, [fetchInvoices, fetchProducts, fetchParties]);

  if (!mounted) return <PageLoader />;

  const fiscalYear = getCurrentNepalFiscalYear();
  
  // Calculate analytics
  const totalSales = invoices.reduce((sum, inv) => sum + inv.grand_total_paisa, 0);
  const paidSales = invoices.filter(i => i.status === 'Paid').reduce((sum, inv) => sum + inv.grand_total_paisa, 0);
  const pendingSales = totalSales - paidSales;

  const productsByCategory = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(productsByCategory).map(([name, count]) => ({ name, count }));

  return (
    <div>
      <PageHeader
        title="Business Reports"
        subtitle={`Summary for Fiscal Year ${fiscalYear}`}
        actions={
          <button className="btn-secondary flex items-center gap-2">
            <FileDown size={16} /> Export All (CSV)
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card text-center">
            <p className="text-xs font-medium text-slate-500 uppercase">Total Revenue Invoiced</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalSales)}</p>
        </div>
        <div className="card text-center">
            <p className="text-xs font-medium text-slate-500 uppercase">Total Realized (Paid)</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(paidSales)}</p>
        </div>
        <div className="card text-center">
            <p className="text-xs font-medium text-slate-500 uppercase">Outstanding Receivables</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{formatCurrency(pendingSales)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
            <h3 className="section-title mb-4 flex items-center gap-2">
                <BarChart3 size={18} /> Product Portfolio
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="card">
            <h3 className="section-title mb-4 flex items-center gap-2">
                <TableIcon size={18} /> Top Customers
            </h3>
            <div className="space-y-4">
                {parties.filter(p => p.party_type === 'Customer').slice(0, 5).map(p => {
                    const partyInvoices = invoices.filter(inv => inv.party_id === p.id);
                    const partyTotal = partyInvoices.reduce((s, i) => s + i.grand_total_paisa, 0);
                    return (
                        <div key={p.id} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                            <div>
                                <p className="font-medium text-slate-900">{p.company_name}</p>
                                <p className="text-xs text-slate-500">{partyInvoices.length} invoices</p>
                            </div>
                            <p className="font-bold text-slate-700">{formatCurrency(partyTotal)}</p>
                        </div>
                    )
                })}
            </div>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="section-title text-sm">Recent Activity Log</h3>
            <div className="flex gap-2">
                 <button className="p-1 px-2 text-xs bg-white border border-slate-200 rounded flex items-center gap-1 hover:bg-slate-50">
                    <Filter size={12} /> Filter
                 </button>
            </div>
        </div>
        <table className="w-full text-xs text-left">
            <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 py-3 font-semibold text-slate-600">Date</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Event</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Entity</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Amount</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {invoices.slice(0, 10).map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-500">{formatADDate(inv.invoice_date)}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">Invoice Generated</td>
                        <td className="px-4 py-3 text-blue-600 font-mono">{inv.invoice_number}</td>
                        <td className="px-4 py-3 font-semibold">{formatCurrency(inv.grand_total_paisa, inv.currency)}</td>
                        <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}
