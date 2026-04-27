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
              <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold">HS Code:</span>
              <span className="ml-2 font-mono dark:text-slate-200">{selectedProduct.hs_code}</span>
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
                description="Stock transactions will appear here as you create invoices, production logs or purchases."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4 text-right text-green-600">In (+)</th>
                    <th className="px-6 py-4 text-right text-red-600">Out (-)</th>
                    <th className="px-6 py-4 text-right text-blue-600">Balance</th>
                    <th className="px-6 py-4 text-center">Ref / Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(() => {
                    // Calculate running balance
                    const withBalance = [...transactions]
                      .sort((a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime())
                      .reduce((acc, tx, idx) => {
                        const prevBalance = idx === 0 ? 0 : acc[idx - 1].balance;
                        const balance = prevBalance + tx.quantity_in - tx.quantity_out;
                        acc.push({ ...tx, balance });
                        return acc;
                      }, [] as (InventoryTransaction & { balance: number })[])
                      .reverse();

                    return withBalance.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">
                          {formatADDate(tx.transaction_date)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${
                              tx.transaction_type === "Purchase" || tx.transaction_type === "Production"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                                : tx.transaction_type === "Sale"
                                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            {tx.transaction_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-green-600 font-black">
                          {tx.quantity_in > 0 ? `+${tx.quantity_in}` : "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-red-600 font-black">
                          {tx.quantity_out > 0 ? `-${tx.quantity_out}` : "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-slate-900 dark:text-white font-black">
                          {tx.balance}
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col">
                             <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{tx.reference || "—"}</span>
                             <span className="text-[10px] italic text-slate-400">{tx.notes}</span>
                           </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
