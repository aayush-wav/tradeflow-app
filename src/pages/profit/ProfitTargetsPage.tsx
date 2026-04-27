import { useEffect, useState } from "react";
import { useProductStore, useRouteStore, useProfitTargetStore } from "../../stores";
import { PageHeader, PageLoader, EmptyState } from "../../components/shared";
import { formatCurrency, paisaToRupees, rupeesToPaisa, formatNumber } from "../../utils";
import { Target, TrendingUp, AlertCircle } from "lucide-react";
import type { ProfitTarget, Product, Route } from "../../types";

export function ProfitTargetsPage() {
  const { products, fetchProducts } = useProductStore();
  const { routes, fetchRoutes } = useRouteStore();
  const { targets, fetchTargets, saveTarget } = useProfitTargetStore();
  const [mounted, setMounted] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [targetMargin, setTargetMargin] = useState("10"); // percent
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchRoutes(), fetchTargets()]).then(() =>
      setMounted(true)
    );
  }, [fetchProducts, fetchRoutes, fetchTargets]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const productTarget = targets.find((t) => t.product_id === selectedProductId);

  useEffect(() => {
    if (productTarget) {
      setTargetMargin(String(productTarget.target_margin_percent));
    } else {
      setTargetMargin("10");
    }
  }, [productTarget, selectedProductId]);

  const handleSave = async () => {
    if (!selectedProductId) return;
    setSaving(true);
    try {
      const target: ProfitTarget = {
        id: productTarget?.id || "",
        product_id: selectedProductId,
        target_margin_percent: parseFloat(targetMargin) || 0,
        target_margin_per_unit_paisa: null,
        notes: null,
        created_at: "",
        updated_at: "",
      };
      await saveTarget(target);
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return <PageLoader />;

  // Comparison Logic
  const comparisonResults = selectedProduct
    ? routes.map((route) => {
        const baseCost = paisaToRupees(selectedProduct.buying_price_paisa);
        const routeCost = paisaToRupees(route.estimated_freight_cost_paisa);
        const totalUnitCost = baseCost + routeCost; // Simplified for comparison
        const margin = parseFloat(targetMargin) || 0;
        const minSellingPrice = totalUnitCost / (1 - margin / 100);
        const profit = minSellingPrice - totalUnitCost;

        return {
          route,
          totalUnitCost,
          minSellingPrice,
          profit,
        };
      })
    : [];

  const bestRoute = [...comparisonResults].sort((a, b) => a.totalUnitCost - b.totalUnitCost)[0];

  return (
    <div>
      <PageHeader
        title="Profit Margin & Route Optimizer"
        subtitle="Compare routes and calculate minimum selling price to hit target margins"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="card">
            <h3 className="section-title mb-4">Set Target</h3>
            <div className="space-y-4">
              <div>
                <label className="label-text">Product</label>
                <select
                  className="select-field"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                >
                  <option value="">Select product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.product_id} — {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-text">Target Profit Margin (%)</label>
                <div className="relative">
                  <input
                  type="number"
                  className="input-field"
                  value={targetMargin}
                  onChange={(e) => setTargetMargin(e.target.value)}
                  placeholder="0.00"
                />  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    %
                  </span>
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={saving || !selectedProductId}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <TrendingUp size={16} /> {saving ? "Saving..." : "Apply Margin Target"}
              </button>
            </div>
          </div>

          {selectedProduct && (
            <div className="card bg-blue-50 border-blue-100">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Product Summary</h3>
              <div className="space-y-2 text-xs text-blue-800">
                <div className="flex justify-between">
                  <span>Base Buying Price:</span>
                  <span className="font-medium">
                    {formatCurrency(selectedProduct.buying_price_paisa)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Current Selling Price:</span>
                  <span className="font-medium">
                    {formatCurrency(selectedProduct.selling_price_paisa)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {!selectedProductId ? (
              <div className="card h-full flex items-center justify-center">
                <EmptyState
                    icon={<Target size={48} />}
                    title="Select a product"
                    description="Choose a product to see profitability analysis across saved routes."
                />
              </div>
          ) : routes.length === 0 ? (
              <div className="card h-full flex items-center justify-center">
                <EmptyState
                    icon={<AlertCircle size={48} />}
                    title="No routes saved"
                    description="You need to save at least one shipping route first."
                />
              </div>
          ) : (
            <div className="card overflow-hidden p-0">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="section-title">Route Comparison Table</h3>
                {bestRoute && (
                  <span className="text-xs font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                    Most Economical: {bestRoute.route.name}
                  </span>
                )}
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="table-header">
                    <th className="px-6 py-3">Route</th>
                    <th className="px-6 py-3 text-right">Est. Route Cost</th>
                    <th className="px-6 py-3 text-right">Total Unit Cost</th>
                    <th className="px-6 py-3 text-right">Min. Sell Price</th>
                    <th className="px-6 py-3 text-right">Profit/Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparisonResults.map((res) => (
                    <tr key={res.route.id} className={bestRoute?.route.id === res.route.id ? "bg-green-50/30" : "hover:bg-slate-50"}>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{res.route.name}</p>
                        <p className="text-xs text-slate-500">{res.route.border_crossing}</p>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-600">
                        {formatCurrency(res.route.estimated_freight_cost_paisa)}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-600">
                        {formatCurrency(rupeesToPaisa(res.totalUnitCost))}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-slate-900">
                           {formatCurrency(rupeesToPaisa(res.minSellingPrice))}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-green-600 font-medium">
                        {formatCurrency(rupeesToPaisa(res.profit))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 bg-slate-50 text-xs text-slate-500 flex gap-2 items-start">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                  <p>Calculation logic: Selling Price = (Purchase Price + Route Cost) / (1 - Margin%). This is a tool for estimating minimum prices. Real costs in the Cost Sheet module will include customs, duties, and handling.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
