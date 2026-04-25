import { useEffect, useState } from "react";
import { useRouteStore } from "../../stores";
import {
  PageHeader,
  PageLoader,
  EmptyState,
  ConfirmDialog,
  Modal,
} from "../../components/shared";
import { formatCurrency, rupeesToPaisa, paisaToRupees } from "../../utils";
import { BORDER_CROSSINGS, FREIGHT_MODES } from "../../constants";
import { Plus, Edit2, Trash2, MapPin } from "lucide-react";
import type { Route } from "../../types";

const EMPTY_ROUTE: Partial<Route> = {
  id: "",
  name: "",
  border_crossing: BORDER_CROSSINGS[0],
  transit_country: "India",
  freight_mode: "Sea",
  estimated_freight_cost_paisa: 0,
  estimated_transit_days: 0,
  notes: "",
};

export function RoutesPage() {
  const { routes, isLoading, fetchRoutes, saveRoute, removeRoute } = useRouteStore();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Route> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Route | null>(null);
  const [cost, setCost] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const openCreate = () => {
    setEditing({ ...EMPTY_ROUTE });
    setCost("");
    setShowModal(true);
  };

  const openEdit = (r: Route) => {
    setEditing({ ...r });
    setCost(String(paisaToRupees(r.estimated_freight_cost_paisa)));
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editing?.name) return;
    setSaving(true);
    try {
      const route = {
        ...EMPTY_ROUTE,
        ...editing,
        estimated_freight_cost_paisa: rupeesToPaisa(parseFloat(cost) || 0),
      } as Route;
      await saveRoute(route);
      setShowModal(false);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await removeRoute(deleteTarget.id);
    setDeleteTarget(null);
  };

  if (isLoading && routes.length === 0) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Shipping Routes"
        subtitle="Manage common export routes and estimated costs"
        actions={
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Route
          </button>
        }
      />

      {routes.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<MapPin size={48} />}
            title="No routes saved"
            description="Add common shipping routes to compare costs in the profit target module."
            action={
              <button onClick={openCreate} className="btn-primary">
                Add Route
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routes.map((r) => (
            <div key={r.id} className="card relative group">
              <div className="absolute right-4 top-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(r)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded bg-white shadow-sm border border-slate-200"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => setDeleteTarget(r)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded bg-white shadow-sm border border-slate-200"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{r.name}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Border Crossing</span>
                  <span className="text-slate-700">{r.border_crossing}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Freight Mode</span>
                  <span className="text-slate-700">{r.freight_mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Est. Cost</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(r.estimated_freight_cost_paisa)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transit Days</span>
                  <span className="text-slate-700">{r.estimated_transit_days} days</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing?.id ? "Edit Route" : "Add Route"}
      >
        {editing && (
          <div className="space-y-4">
            <div>
              <label className="label-text">Route Name</label>
              <input
                className="input-field"
                value={editing.name || ""}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder="e.g., Birgunj to Kolkata"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">Border Crossing</label>
                <select
                  className="select-field"
                  value={editing.border_crossing || ""}
                  onChange={(e) => setEditing({ ...editing, border_crossing: e.target.value })}
                >
                  {BORDER_CROSSINGS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-text">Freight Mode</label>
                <select
                  className="select-field"
                  value={editing.freight_mode || ""}
                  onChange={(e) => setEditing({ ...editing, freight_mode: e.target.value })}
                >
                  {FREIGHT_MODES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-text">Est. Cost (NPR)</label>
                <input
                  type="number"
                  className="input-field"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="label-text">Transit Days</label>
                <input
                  type="number"
                  className="input-field"
                  value={editing.estimated_transit_days || 0}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      estimated_transit_days: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <label className="label-text">Transit Country</label>
              <input
                className="input-field"
                value={editing.transit_country || ""}
                onChange={(e) => setEditing({ ...editing, transit_country: e.target.value })}
                placeholder="e.g., India"
              />
            </div>
            <div>
              <label className="label-text">Notes</label>
              <textarea
                className="input-field"
                rows={2}
                value={editing.notes || ""}
                onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? "Saving..." : "Save Route"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Route"
        message={`Are you sure you want to delete route "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
