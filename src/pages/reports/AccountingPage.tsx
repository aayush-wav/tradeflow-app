import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { PageHeader, PageLoader, EmptyState } from "../../components/shared";
import { formatCurrency, getCurrentNepalFiscalYear } from "../../utils";
import type { FinancialStatement } from "../../types";
import { Building2, Briefcase, TrendingUp, DollarSign } from "lucide-react";

export function AccountingPage() {
  const [statement, setStatement] = useState<FinancialStatement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await invoke<{ success: boolean; data: FinancialStatement | null; error: string | null }>(
          "get_financial_statement"
        );
        if (response.success && response.data) {
          setStatement(response.data);
        } else {
          setError(response.error || "Failed to load financial statement");
        }
      } catch (e: any) {
        setError(e.toString());
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) return <PageLoader />;

  if (error || !statement) {
    return (
      <EmptyState
        icon={<TrendingUp size={48} />}
        title="Accounting Data Unavailable"
        description={error || "Could not generate top-notch financial reports."}
      />
    );
  }

  const fiscalYear = getCurrentNepalFiscalYear();

  return (
    <div className="pb-8 animate-in fade-in duration-300">
      <PageHeader
        title="Financial Reports"
        subtitle={`Real-time Accounting & Balance Sheet · FY ${fiscalYear}`}
      />

      {/* Income Statement (P&L) */}
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 mt-6 flex items-center gap-2">
        <TrendingUp className="text-blue-500" /> Income Statement (P&L)
      </h2>
      <div className="card max-w-4xl">
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-600 dark:text-slate-400 font-medium tracking-wide">Gross Sales Revenue</span>
            <span className="text-lg font-semibold text-slate-900 dark:text-white">
              {formatCurrency(statement.total_sales_revenue_paisa)}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800 pl-4">
            <span className="text-slate-500 dark:text-slate-400 italic">Less: Cost of Goods Sold (approx)</span>
            <span className="text-slate-600 dark:text-slate-300">
              ({formatCurrency(statement.cost_of_goods_sold_paisa)})
            </span>
          </div>

          <div className="flex justify-between items-center py-4 bg-slate-50 dark:bg-slate-900/50 -mx-6 px-6 border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Gross Profit</span>
            <span className="text-xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(statement.gross_profit_paisa)}
            </span>
          </div>

          <div className="pt-4 space-y-2 mt-4 opacity-75">
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <span>* Total Inventory Purchases: {formatCurrency(statement.total_purchases_paisa)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <span>* Closing Stock Assessed Value: {formatCurrency(statement.closing_stock_paisa)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Sheet Preview */}
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 mt-10 flex items-center gap-2">
        <Building2 className="text-amber-500" /> Balance Sheet Preview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <Briefcase size={16} className="text-slate-400" /> Assets
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">Accounts Receivable</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {formatCurrency(statement.total_receivables_paisa)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">Cash & Bank Balance</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {formatCurrency(statement.cash_balance_paisa)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">Closing Inventory (Stock)</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {formatCurrency(statement.closing_stock_paisa)}
              </span>
            </div>
          </div>
          <div className="mt-6 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center font-bold">
            <span className="text-slate-900 dark:text-white">Total Assets</span>
            <span className="text-blue-600 dark:text-blue-400">
              {formatCurrency(statement.total_assets_paisa)}
            </span>
          </div>
        </div>

        <div className="card bg-slate-50 dark:bg-slate-900/20">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <DollarSign size={16} className="text-slate-400" /> Liabilities & Equity
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400 border-b border-dashed border-slate-300 dark:border-slate-700 cursor-help" title="Comprehensive A/P tracking requires standalone ledger features">Accounts Payable (Suppliers)</span>
              <span className="font-bold text-slate-400 dark:text-slate-600 italic uppercase text-[10px] tracking-widest bg-slate-100 dark:bg-slate-800/50 px-2 py-0.5 rounded">Not Tracked</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">Net Earned Equity (P&L)</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {formatCurrency(statement.gross_profit_paisa)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
