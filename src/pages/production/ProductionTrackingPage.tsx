import React, { useState, useEffect } from "react";
import { 
  Factory, 
  Plus, 
  Search, 
  Calendar, 
  Package, 
  Trash2,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  Tag
} from "lucide-react";
import { useProductionStore, useProductStore } from "../../stores";
import type { ProductionRecord, Product } from "../../types";

export default function ProductionTrackingPage() {
  const { records, isLoading, fetchRecords, addRecord } = useProductionStore();
  const { products, fetchProducts } = useProductStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState<Partial<ProductionRecord>>({
    product_id: "",
    quantity: "" as any,
    unit: "piece",
    batch_number: "",
    production_date: new Date().toISOString().split("T")[0],
    expiry_date: "",
    notes: "",
  });

  useEffect(() => {
    fetchRecords();
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_id) return;
    
    // Find the product to get unit
    const prod = products.find(p => p.id === formData.product_id);
    const finalData = {
      ...formData,
      quantity: parseFloat(formData.quantity as any) || 0,
      unit: prod?.unit_of_measure || "piece"
    } as ProductionRecord;

    await addRecord(finalData);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      product_id: "",
      quantity: "" as any,
      unit: "piece",
      batch_number: "",
      production_date: new Date().toISOString().split("T")[0],
      expiry_date: "",
      notes: "",
    });
  };

  const filtered = records.filter(r => {
    const prod = products.find(p => p.id === r.product_id);
    return (
      prod?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.batch_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getProductName = (id: string) => products.find(p => p.id === id)?.name || "Unknown Product";

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600">
            <Factory size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Production Tracking</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Monitor manufacturing and stock entries</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 active:scale-95"
        >
          <Plus size={18} />
          <span>Post Production</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-3">
             <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600"><CheckCircle2 size={18}/></div>
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Today's Batch</p>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {filtered.filter(r => r.production_date === new Date().toISOString().split("T")[0]).length} Batches
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-3">
             <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600"><TrendingUp size={18}/></div>
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Produced</p>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {filtered.reduce((sum, r) => sum + r.quantity, 0).toLocaleString()} Units
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between bg-slate-50/50 dark:bg-slate-800/20">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by product or batch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-left">Product</th>
                <th className="px-6 py-4">Batch Number</th>
                <th className="px-6 py-4 text-right">Quantity</th>
                <th className="px-6 py-4">Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-bold italic">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-bold italic">No records found</td></tr>
              ) : (
                filtered.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                       <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{record.production_date}</span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                         <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><Package size={16}/></div>
                         <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{getProductName(record.product_id)}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[11px] font-black font-mono">{record.batch_number || "NO BATCH"}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <span className="text-sm font-black text-green-600">+{record.quantity.toLocaleString()} {record.unit}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="text-xs font-bold text-slate-500">{record.expiry_date || "—"}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                <Factory className="text-purple-600" /> Post New Production
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Select Product</label>
                <select
                  required
                  value={formData.product_id}
                  onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-sm outline-none"
                >
                  <option value="">Choose a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.product_id})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Quantity</label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value as any})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-sm h-12"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Batch Number</label>
                  <input
                    type="text"
                    required
                    placeholder="BATCH-001"
                    value={formData.batch_number}
                    onChange={(e) => setFormData({...formData, batch_number: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-sm h-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Prod. Date</label>
                  <input
                    type="date"
                    required
                    value={formData.production_date}
                    onChange={(e) => setFormData({...formData, production_date: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-sm h-12"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-sm h-12"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Notes</label>
                <textarea
                  placeholder="Additional production details..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-sm h-20 resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all h-12"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 h-12"
                >
                  Confirm Posting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
