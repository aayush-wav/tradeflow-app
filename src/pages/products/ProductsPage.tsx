import { useEffect, useState } from "react";
import { useProductStore } from "../../stores";
import {
  PageHeader,
  PageLoader,
  EmptyState,
  SearchInput,
  StatusBadge,
  ConfirmDialog,
  Modal,
  Toast,
} from "../../components/shared";
import { formatCurrency, rupeesToPaisa, paisaToRupees } from "../../utils";
import {
  PRODUCT_CATEGORIES,
  UNITS_OF_MEASURE,
  PRODUCT_STATUSES,
} from "../../constants";
import { Plus, Edit2, Trash2, Package, Calculator } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Product } from "../../types";

const EMPTY_PRODUCT: Partial<Product> = {
  id: "",
  product_id: "",
  name: "",
  category: "Raw Material",
  hs_code: "",
  unit_of_measure: "kg",
  country_of_origin: "Nepal",
  description: "",
  current_stock: 0,
  reorder_level: 0,
  buying_price_paisa: 0,
  selling_price_paisa: 0,
  status: "Active",
  carton_size: 1,
  carton_weight_kg: 0,
};

export function ProductsPage() {
  const navigate = useNavigate();
  const { products, isLoading, fetchProducts, addProduct, editProduct, removeProduct } =
    useProductStore();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [buyingPrice, setBuyingPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openCreate = () => {
    setEditing({ 
      ...EMPTY_PRODUCT,
      current_stock: "" as any,
      reorder_level: "" as any,
      carton_size: "" as any,
      carton_weight_kg: "" as any,
    });
    setBuyingPrice("");
    setSellingPrice("");
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing({ ...p });
    setBuyingPrice(String(paisaToRupees(p.buying_price_paisa)));
    setSellingPrice(String(paisaToRupees(p.selling_price_paisa || 0)));
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editing?.name || !editing?.hs_code) return;
    setSaving(true);
    try {
      const product = {
        ...EMPTY_PRODUCT,
        ...editing,
        buying_price_paisa: rupeesToPaisa(parseFloat(buyingPrice) || 0),
        selling_price_paisa: rupeesToPaisa(parseFloat(sellingPrice) || 0),
        current_stock: Number(editing.current_stock) || 0,
        reorder_level: Number(editing.reorder_level) || 0,
        carton_size: Number(editing.carton_size) || 1,
        carton_weight_kg: Number(editing.carton_weight_kg) || 0,
      } as Product;
      if (editing.id) {
        await editProduct(product);
        setToast({ message: "Product updated successfully", type: "success" });
      } else {
        await addProduct(product);
        setToast({ message: "Product added successfully", type: "success" });
      }
      setShowModal(false);
      setEditing(null);
    } catch (err: any) {
      setToast({ message: err.message || "Failed to save product", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeProduct(deleteTarget.id);
      setToast({ message: "Product deleted successfully", type: "success" });
    } catch (err: any) {
      setToast({ message: err.message || "Failed to delete product", type: "error" });
    }
    setDeleteTarget(null);
  };

  const filtered = products.filter((p) => {
    const nameMatch = (p.name || "").toLowerCase().includes(search.toLowerCase());
    const idMatch = (p.product_id || "").toLowerCase().includes(search.toLowerCase());
    const hsMatch = (p.hs_code || "").includes(search);
    
    const matchSearch = !search || nameMatch || idMatch || hsMatch;
    const matchCategory = !categoryFilter || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  if (isLoading && products.length === 0) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${products.length} product${products.length !== 1 ? "s" : ""}`}
        actions={
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Product
          </button>
        }
      />

      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by name, ID, or HS code..."
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="select-field w-48"
          >
            <option value="">All Categories</option>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Package size={48} />}
            title="No products found"
            description={search ? "Try adjusting your search." : "Add your first product to get started."}
            action={
              !search && (
                <button onClick={openCreate} className="btn-primary">
                  Add Product
                </button>
              )
            }
          />
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">HS Code</th>
                  <th className="px-4 py-3 text-right">Sold</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3 text-right">Carton Details</th>
                  <th className="px-4 py-3 text-right">Buying</th>
                  <th className="px-4 py-3 text-right">Selling</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${
                      p.current_stock <= p.reorder_level && p.status === "Active"
                        ? "bg-red-50/50 dark:bg-red-900/10"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-mono text-slate-600 dark:text-slate-400">
                      {p.product_id}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                      {p.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{p.category}</td>
                    <td className="px-4 py-3 text-sm font-mono text-slate-600 dark:text-slate-400">
                      {p.hs_code}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-blue-600 dark:text-blue-400">
                      {p.total_sold || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span
                        className={
                          p.current_stock <= p.reorder_level && p.status === "Active"
                            ? "text-red-600 dark:text-red-400 font-semibold"
                            : "text-slate-900 dark:text-slate-300"
                        }
                      >
                        {p.current_stock}
                      </span>
                      <span className="text-slate-400 dark:text-slate-600 ml-1 text-xs">
                        {p.unit_of_measure}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                       <div className="flex flex-col items-end">
                         <span className="font-bold text-slate-700 dark:text-slate-300">{p.carton_size} pcs/ctn</span>
                         <span className="text-xs text-slate-400">{p.carton_weight_kg} kg/ctn</span>
                       </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-slate-600 dark:text-slate-400">
                      {formatCurrency(p.buying_price_paisa)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(p.selling_price_paisa || 0)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          title="Edit Product"
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          title="Delete Product"
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                        >
                          <Trash2 size={15} />
                        </button>
                        <button
                           className="p-1.5 text-slate-400 hover:text-green-600 rounded"
                           title="Go to Landed Cost Calculator"
                           onClick={() => navigate("/forex")}
                        >
                           <Calculator size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing?.id ? "Edit Product" : "Add Product"}
        size="lg"
      >
        {editing && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label-text">Product Name</label>
              <input
                className="input-field"
                value={editing.name || ""}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder="Product name"
              />
            </div>
            <div>
              <label className="label-text">Category</label>
              <select
                className="select-field"
                value={editing.category || ""}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
              >
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">HS Code</label>
              <input
                className="input-field"
                value={editing.hs_code || ""}
                onChange={(e) => setEditing({ ...editing, hs_code: e.target.value })}
                placeholder="e.g., 0901.11"
              />
            </div>
            <div>
              <label className="label-text">Unit of Measure</label>
              <select
                className="select-field"
                value={editing.unit_of_measure || "kg"}
                onChange={(e) =>
                  setEditing({ ...editing, unit_of_measure: e.target.value })
                }
              >
                {UNITS_OF_MEASURE.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">Country of Origin</label>
              <input
                className="input-field"
                value={editing.country_of_origin || "Nepal"}
                onChange={(e) =>
                  setEditing({ ...editing, country_of_origin: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label-text">Buying Price (NPR)</label>
              <input
                type="number"
                className="input-field"
                value={buyingPrice}
                onChange={(e) => setBuyingPrice(e.target.value)}
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div>
              <label className="label-text">Selling Price (NPR)</label>
              <input
                type="number"
                className="input-field"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div>
              <label className="label-text">{editing.id ? "Current Stock Correction" : "Initial Stock"}</label>
              <input
                type="number"
                className="input-field"
                value={editing.current_stock}
                placeholder="0"
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    current_stock: e.target.value as any,
                  })
                }
              />
            </div>
            <div>
              <label className="label-text">Reorder Level</label>
                <input
                  type="number"
                  className="input-field"
                  value={editing.reorder_level}
                  placeholder="0"
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      reorder_level: e.target.value as any,
                    })
                  }
                />
            </div>
            <div>
              <label className="label-text">Status</label>
              <select
                className="select-field"
                value={editing.status || "Active"}
                onChange={(e) => setEditing({ ...editing, status: e.target.value })}
              >
                {PRODUCT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
               <div className="col-span-2">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">Snack Business Details</h4>
               </div>
               <div>
                 <label className="label-text">Quantity per Carton</label>
                  <input
                    type="number"
                    className="input-field"
                    value={editing.carton_size}
                    placeholder="1"
                    onChange={(e) => setEditing({ ...editing, carton_size: e.target.value as any })}
                  />
               </div>
               <div>
                 <label className="label-text">Weight per Carton (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={editing.carton_weight_kg}
                    placeholder="0.00"
                    onChange={(e) => setEditing({ ...editing, carton_weight_kg: e.target.value as any })}
                  />
               </div>
            </div>
            <div className="col-span-2">
              <label className="label-text">Description</label>
              <textarea
                className="input-field"
                rows={2}
                value={editing.description || ""}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
                placeholder="Optional description"
              />
            </div>
            <div className="col-span-2 flex justify-end gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? "Saving..." : editing.id ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
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
