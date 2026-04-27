import { useEffect } from "react";
import { useShipmentStore } from "../../stores";
import { PageHeader, PageLoader, EmptyState, ConfirmDialog } from "../../components/shared";
import { formatCurrency, formatADDate } from "../../utils";
import { FolderOpen, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { ShipmentRecord } from "../../types";

export function CostSheetsListPage() {
  const { records, isLoading, fetchRecords, removeRecord } = useShipmentStore();
  const [deleteTarget, setDeleteTarget] = useState<ShipmentRecord | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await removeRecord(deleteTarget.id);
    setDeleteTarget(null);
  };

  if (isLoading && records.length === 0) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Saved Cost Sheets"
        subtitle={`${records.length} record${records.length !== 1 ? "s" : ""}`}
        actions={
          <button onClick={() => navigate("/costing/new")} className="btn-primary">
            New Cost Sheet
          </button>
        }
      />

      {records.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<FolderOpen size={48} />}
            title="No cost sheets saved"
            description="Create your first export cost calculation."
            action={
              <button onClick={() => navigate("/costing/new")} className="btn-primary">
                New Cost Sheet
              </button>
            }
          />
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">INCOTERM</th>
                <th className="px-4 py-3">Freight Mode</th>
                <th className="px-4 py-3 text-right">Total Cost</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group cursor-pointer" onClick={() => navigate(`/costing/${r.id}`)}>
                  <td className="px-4 py-3 text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                    {r.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                    {r.incoterm || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                    {r.freight_mode || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-slate-900 dark:text-white">
                    {formatCurrency(r.total_cost_paisa)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-500">
                    {formatADDate(r.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/costing/${r.id}`); }}
                      className="p-1.5 text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 rounded transition-colors mr-2"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(r); }}
                      className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Cost Sheet"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
