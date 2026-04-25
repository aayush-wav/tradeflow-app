import { useEffect, useState } from "react";
import { usePartyStore } from "../../stores";
import {
  PageHeader,
  PageLoader,
  EmptyState,
  SearchInput,
  ConfirmDialog,
  Modal,
  Toast,
} from "../../components/shared";
import { PARTY_TYPES, PAYMENT_TERMS, CURRENCIES } from "../../constants";
import { Plus, Edit2, Trash2, Users } from "lucide-react";
import type { Party } from "../../types";

const EMPTY_PARTY: Partial<Party> = {
  id: "",
  party_type: "Customer",
  company_name: "",
  contact_person: "",
  email: "",
  phone: "",
  fax: "",
  country: "Nepal",
  address: "",
  pan_number: "",
  payment_terms: "Net 30",
  default_currency: "NPR",
  notes: "",
};

interface PartiesPageProps {
  partyType: "Customer" | "Supplier";
}

export function PartiesPage({ partyType }: PartiesPageProps) {
  const { parties, isLoading, fetchParties, addParty, editParty, removeParty } =
    usePartyStore();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Party> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Party | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchParties(partyType);
  }, [fetchParties, partyType]);

  const openCreate = () => {
    setEditing({ ...EMPTY_PARTY, party_type: partyType });
    setShowModal(true);
  };

  const openEdit = (p: Party) => {
    setEditing({ ...p });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editing?.company_name) return;
    setSaving(true);
    try {
      const party = { ...EMPTY_PARTY, ...editing } as Party;
      if (editing.id) {
        await editParty(party);
        setToast({ message: "Updated successfully", type: "success" });
      } else {
        await addParty(party);
        setToast({ message: "Added successfully", type: "success" });
      }
      setShowModal(false);
      setEditing(null);
      await fetchParties(partyType);
    } catch (err: any) {
      setToast({ message: err.message || "Operation failed", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeParty(deleteTarget.id);
      setToast({ message: "Deleted successfully", type: "success" });
      await fetchParties(partyType);
    } catch (err: any) {
      setToast({ message: err.message || "Failed to delete", type: "error" });
    }
    setDeleteTarget(null);
  };

  const filtered = parties.filter(
    (p) =>
      !search ||
      p.company_name.toLowerCase().includes(search.toLowerCase()) ||
      (p.contact_person || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.email || "").toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading && parties.length === 0) return <PageLoader />;

  const title = partyType === "Customer" ? "Customers" : "Suppliers";

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={`${parties.length} ${title.toLowerCase()}`}
        actions={
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add {partyType}
          </button>
        }
      />

      <div className="card mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={`Search ${title.toLowerCase()}...`}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Users size={48} />}
            title={`No ${title.toLowerCase()} found`}
            action={
              !search && (
                <button onClick={openCreate} className="btn-primary">
                  Add {partyType}
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
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Payment Terms</th>
                <th className="px-4 py-3">Currency</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">{p.company_name}</p>
                    {p.pan_number && (
                      <p className="text-xs text-slate-500">PAN: {p.pan_number}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-700">{p.contact_person || "—"}</p>
                    <p className="text-xs text-slate-500">{p.email || ""}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.country}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {p.payment_terms || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 font-mono">
                    {p.default_currency}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing?.id ? `Edit ${partyType}` : `Add ${partyType}`}
        size="lg"
      >
        {editing && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label-text">Company Name</label>
              <input
                className="input-field"
                value={editing.company_name || ""}
                onChange={(e) =>
                  setEditing({ ...editing, company_name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label-text">Contact Person</label>
              <input
                className="input-field"
                value={editing.contact_person || ""}
                onChange={(e) =>
                  setEditing({ ...editing, contact_person: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label-text">Type</label>
              <select
                className="select-field"
                value={editing.party_type || partyType}
                onChange={(e) =>
                  setEditing({ ...editing, party_type: e.target.value })
                }
              >
                {PARTY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">Email</label>
              <input
                type="email"
                className="input-field"
                value={editing.email || ""}
                onChange={(e) =>
                  setEditing({ ...editing, email: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label-text">Phone</label>
              <input
                className="input-field"
                value={editing.phone || ""}
                onChange={(e) =>
                  setEditing({ ...editing, phone: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label-text">Country</label>
              <input
                className="input-field"
                value={editing.country || "Nepal"}
                onChange={(e) =>
                  setEditing({ ...editing, country: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label-text">PAN / VAT / Tax ID</label>
              <input
                className="input-field"
                value={editing.pan_number || ""}
                onChange={(e) =>
                  setEditing({ ...editing, pan_number: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label-text">Payment Terms</label>
              <select
                className="select-field"
                value={editing.payment_terms || "Net 30"}
                onChange={(e) =>
                  setEditing({ ...editing, payment_terms: e.target.value })
                }
              >
                {PAYMENT_TERMS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">Default Currency</label>
              <select
                className="select-field"
                value={editing.default_currency || "NPR"}
                onChange={(e) =>
                  setEditing({ ...editing, default_currency: e.target.value })
                }
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label-text">Address</label>
              <textarea
                className="input-field"
                rows={2}
                value={editing.address || ""}
                onChange={(e) =>
                  setEditing({ ...editing, address: e.target.value })
                }
              />
            </div>
            <div className="col-span-2">
              <label className="label-text">Notes</label>
              <textarea
                className="input-field"
                rows={2}
                value={editing.notes || ""}
                onChange={(e) =>
                  setEditing({ ...editing, notes: e.target.value })
                }
              />
            </div>
            <div className="col-span-2 flex justify-end gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? "Saving..." : editing.id ? "Save Changes" : `Add ${partyType}`}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title={`Delete ${partyType}`}
        message={`Are you sure you want to delete "${deleteTarget?.company_name}"?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
