import { useEffect, useState } from "react";
import { useInvoiceStore } from "../../stores";
import {
  PageHeader,
  PageLoader,
  EmptyState,
  SearchInput,
  StatusBadge,
} from "../../components/shared";
import { formatCurrency, formatADDate } from "../../utils";
import { FileText, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function InvoicesListPage() {
  const { invoices, isLoading, fetchInvoices } = useInvoiceStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const filtered = invoices.filter((inv) => {
    const matchSearch =
      !search ||
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      inv.party_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (isLoading && invoices.length === 0) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle={`${invoices.length} total`}
        actions={
          <button
            onClick={() => navigate("/invoices/new")}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} /> New Invoice
          </button>
        }
      />

      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by invoice number or party name..."
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-field w-48"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Overdue">Overdue</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<FileText size={48} />}
            title="No invoices found"
            action={
              !search && (
                <button
                  onClick={() => navigate("/invoices/new")}
                  className="btn-primary"
                >
                  Create Invoice
                </button>
              )
            }
          />
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Party</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 cursor-pointer">
                  <td className="px-4 py-3 text-sm font-medium text-blue-600 font-mono">
                    {inv.invoice_number}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {inv.invoice_type}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">
                      {inv.party_name}
                    </p>
                    {inv.party_country && (
                      <p className="text-xs text-slate-500">
                        {inv.party_country}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {formatADDate(inv.invoice_date)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-slate-900">
                    {formatCurrency(inv.grand_total_paisa, inv.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={inv.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
