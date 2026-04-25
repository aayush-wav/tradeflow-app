import { useEffect, useState } from "react";
import { useProductStore } from "../../stores";
import { api } from "../../api";
import { PageHeader, PageLoader, EmptyState } from "../../components/shared";
import { formatADDate } from "../../utils";
import { BookOpen } from "lucide-react";
import type { InventoryTransaction, Product } from "../../types";

export function StockLedgerPage() {
  const { products, fetchProducts } = useProductStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetchProducts().then(() => setMounted(true));
  }, [fetchProducts]);

  useEffect(() => {
    if (selectedProduct) {
      setLoading(true);
      api
        .getInventoryTransactions(selectedProduct.id)
        .then(setTransactions)
        .catch(() => setTransactions([]))
        .finally(() => setLoading(false));
    }
  }, [selectedProduct]);

  if (!mounted) return <PageLoader />;

  return (
    <div>
      <PageHeader title="Stock Ledger" subtitle="Transaction history by product" />

      <div className="card mb-6">
        <label className="label-text">Select Product</label>
        <select
          className="select-field max-w-md"
          value={selectedProduct?.id || ""}
          onChange={(e) => {
            const p = products.find((p) => p.id === e.target.value);
            setSelectedProduct(p || null);
          }}
        >
          <option value="">Choose a product...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.product_id} — {p.name} (Stock: {p.current_stock} {p.unit_of_measure})
            </option>
          ))}
        </select>
      </div>

      {selectedProduct && (
        <div className="card mb-6">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Product ID:</span>
              <span className="ml-2 font-medium">{selectedProduct.product_id}</span>
            </div>
            <div>
              <span className="text-slate-500">Current Stock:</span>
              <span className="ml-2 font-bold">{selectedProduct.current_stock}</span>
              <span className="text-slate-400 ml-1">{selectedProduct.unit_of_measure}</span>
            </div>
            <div>
              <span className="text-slate-500">Reorder Level:</span>
              <span className="ml-2">{selectedProduct.reorder_level}</span>
            </div>
            <div>
              <span className="text-slate-500">HS Code:</span>
              <span className="ml-2 font-mono">{selectedProduct.hs_code}</span>
            </div>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="card overflow-hidden p-0">
          {loading ? (
            <div className="p-8"><PageLoader /></div>
          ) : transactions.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<BookOpen size={40} />}
                title="No transactions yet"
                description="Stock transactions will appear here as you create invoices and purchase orders."
              />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">In</th>
                  <th className="px-4 py-3 text-right">Out</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm">
                      {formatADDate(tx.transaction_date)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          tx.transaction_type === "Purchase"
                            ? "bg-green-100 text-green-700"
                            : tx.transaction_type === "Sale"
                              ? "bg-blue-100 text-blue-700"
                              : tx.transaction_type === "Return"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {tx.transaction_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">
                      {tx.quantity_in > 0 ? `+${tx.quantity_in}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">
                      {tx.quantity_out > 0 ? `-${tx.quantity_out}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 font-mono">
                      {tx.reference || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {tx.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
