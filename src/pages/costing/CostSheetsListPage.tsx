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
            <tbody className="divide-y divide-slate-100">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {r.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {r.incoterm || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {r.freight_mode || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    {formatCurrency(r.total_cost_paisa)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {formatADDate(r.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setDeleteTarget(r)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded"
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
