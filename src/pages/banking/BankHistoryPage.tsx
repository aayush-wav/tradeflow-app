import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar,
  MoreVertical,
  Banknote
} from "lucide-react";
import { useBankStore, usePartyStore } from "../../stores";
import type { BankTransaction } from "../../types";
import { format } from "date-fns";

export default function BankHistoryPage() {
  const { transactions, isLoading, fetchTransactions, addTransaction, removeTransaction } = useBankStore();
  const { parties, fetchParties } = usePartyStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<BankTransaction | null>(null);

  const [formData, setFormData] = useState<Partial<BankTransaction>>({
    bank_name: "",
    account_number: "",
    transaction_type: "Deposit",
    amount_paisa: "" as any,
    currency: "NPR",
    exchange_rate: "" as any,
    purpose: "",
    transaction_date: new Date().toISOString().split("T")[0],
    reference: "",
  });

  useEffect(() => {
    fetchTransactions();
    fetchParties();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const finalData = {
        ...formData,
        id: "",
        amount_paisa: Math.round(parseFloat(formData.amount_paisa as any || "0") * 100),
        exchange_rate: parseFloat(formData.exchange_rate as any || "1") || 1.0,
        party_id: null,
        created_at: "",
      } as BankTransaction;
      await addTransaction(finalData);
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error("Failed to add bank transaction:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      bank_name: "",
      account_number: "",
      transaction_type: "Deposit",
      amount_paisa: "" as any,
      currency: "NPR",
      exchange_rate: "" as any,
      purpose: "",
      transaction_date: new Date().toISOString().split("T")[0],
      reference: "",
    });
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await removeTransaction(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const filtered = transactions.filter(t => 
    t.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.reference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalIn = filtered.filter(t => t.transaction_type === "Deposit").reduce((sum, t) => sum + (t.amount_paisa * t.exchange_rate), 0);
  const totalOut = filtered.filter(t => t.transaction_type === "Withdrawal").reduce((sum, t) => sum + (t.amount_paisa * t.exchange_rate), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Bank History</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Manage bank transactions and expenses</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 active:scale-95"
        >
          <Plus size={18} />
          <span>New Entry</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Inflow</p>
          <p className="text-2xl font-black text-green-600">Rs. {(totalIn / 100).toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Outflow</p>
          <p className="text-2xl font-black text-red-600">Rs. {(totalOut / 100).toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Net Balance</p>
          <p className="text-2xl font-black text-blue-600">Rs. {((totalIn - totalOut) / 100).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50 dark:bg-slate-800/20">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-bold text-sm flex items-center gap-2">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Bank / Account</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Ref / Purpose</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-bold italic">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-bold italic">No transactions found</td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {tx.transaction_date}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{tx.bank_name}</p>
                        <p className="text-xs font-bold text-slate-400">{tx.account_number}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{tx.purpose || "—"}</p>
                        <p className="text-xs font-medium text-slate-400 tracking-tight">{tx.reference || "None"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`flex flex-col items-end`}>
                        <div className={`flex items-center gap-1 text-sm font-black ${tx.transaction_type === 'Deposit' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.transaction_type === 'Deposit' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                          Rs. {(tx.amount_paisa * tx.exchange_rate / 100).toLocaleString()}
                        </div>
                        {tx.currency !== 'NPR' && (
                          <span className="text-[10px] font-bold text-slate-400">
                            {tx.currency} {tx.amount_paisa/100} @ {tx.exchange_rate}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => setDeleteTarget(tx)}
                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                <Plus className="text-blue-600" /> New Transaction
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.transaction_date}
                    onChange={(e) => setFormData({...formData, transaction_date: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Type</label>
                  <select
                    value={formData.transaction_type}
                    onChange={(e) => setFormData({...formData, transaction_type: e.target.value as any})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                  >
                    <option value="Deposit">Deposit (In)</option>
                    <option value="Withdrawal">Withdrawal (Out)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Bank Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nabil Bank"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-sm placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Account Number</label>
                <input
                  type="text"
                  placeholder="Acc No / ID"
                  value={formData.account_number}
                  onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-sm placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Amount</label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={formData.amount_paisa}
                    onChange={(e) => setFormData({...formData, amount_paisa: e.target.value as any})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Ex. Rate</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="1.0"
                    value={formData.exchange_rate}
                    onChange={(e) => setFormData({...formData, exchange_rate: e.target.value as any})}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Purpose / Note</label>
                <textarea
                  placeholder="What is this for?"
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-sm h-20 resize-none placeholder:text-slate-400"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}></div>
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Delete Entry?</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6">Are you sure you want to remove this bank transaction? This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all"
              >
                No, Keep
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-500/25"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
