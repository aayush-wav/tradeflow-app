import { useEffect, useState, useCallback } from "react";
import { api } from "../../api";
import { PageHeader, PageLoader } from "../../components/shared";
import { RefreshCw, Search, Calculator, TrendingUp, TrendingDown, Minus, Clock, DollarSign, ArrowRight, Save } from "lucide-react";
import type { ForexSnapshot, ForexRate, HsTariffCode, LandedCostCalc } from "../../types";

const CURRENCY_FLAGS: Record<string, string> = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", CHF: "🇨🇭", AUD: "🇦🇺", CAD: "🇨🇦",
  SGD: "🇸🇬", JPY: "🇯🇵", CNY: "🇨🇳", SAR: "🇸🇦", QAR: "🇶🇦", THB: "🇹🇭",
  AED: "🇦🇪", MYR: "🇲🇾", KRW: "🇰🇷", SEK: "🇸🇪", DKK: "🇩🇰", HKD: "🇭🇰",
  KWD: "🇰🇼", BHD: "🇧🇭", OMR: "🇴🇲", INR: "🇮🇳",
};

const KEY_CURRENCIES = ["USD", "EUR", "GBP", "AED", "CNY", "INR", "JPY", "AUD", "CAD", "SAR"];

function formatNPR(n: number): string {
  return "NPR " + n.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function ForexLandedCostPage() {
  const [forex, setForex] = useState<ForexSnapshot | null>(null);
  const [forexLoading, setForexLoading] = useState(false);
  const [forexError, setForexError] = useState<string | null>(null);

  // HS Code Search
  const [hsQuery, setHsQuery] = useState("");
  const [hsResults, setHsResults] = useState<HsTariffCode[]>([]);
  const [selectedHs, setSelectedHs] = useState<HsTariffCode | null>(null);

  // Calculator
  const [cifValue, setCifValue] = useState("");
  const [calcCurrency, setCalcCurrency] = useState("USD");
  const [quantity, setQuantity] = useState("");
  const [calcResult, setCalcResult] = useState<LandedCostCalc | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);

  // History
  const [history, setHistory] = useState<LandedCostCalc[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const fetchForex = useCallback(async () => {
    setForexLoading(true);
    setForexError(null);
    try {
      const data = await api.fetchNrbForexRates();
      setForex(data);
    } catch (e: any) {
      try {
        const cached = await api.getCachedForexRates();
        setForex(cached);
        setForexError("Using cached rates (offline)");
      } catch {
        setForexError("No rates available. Connect to internet.");
      }
    } finally {
      setForexLoading(false);
    }
  }, []);

  useEffect(() => { fetchForex(); }, [fetchForex]);

  const searchHS = useCallback(async (q: string) => {
    if (q.length < 2) { setHsResults([]); return; }
    try {
      const r = await api.searchHsCodes(q);
      setHsResults(r);
    } catch { }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchHS(hsQuery), 300);
    return () => clearTimeout(t);
  }, [hsQuery, searchHS]);

  const getExchangeRate = (iso3: string): number => {
    if (!forex) return 1;
    const rate = forex.rates.find(r => r.iso3 === iso3);
    if (!rate) return 1;
    return parseFloat(rate.buy) / rate.unit;
  };

  const doCalculate = async (save: boolean) => {
    if (!selectedHs || !cifValue) return;
    setCalcLoading(true);
    try {
      const exRate = getExchangeRate(calcCurrency);
      const result = await api.calculateLandedCost(
        selectedHs.code,
        parseFloat(cifValue),
        calcCurrency,
        exRate,
        parseFloat(quantity) || 1,
        save
      );
      setCalcResult(result);
      if (save) {
        const h = await api.getLandedCostHistory();
        setHistory(h);
      }
    } catch (e: any) {
      alert(e.message || "Calculation failed");
    } finally {
      setCalcLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const h = await api.getLandedCostHistory();
      setHistory(h);
      setShowHistory(true);
    } catch { }
  };

  return (
    <div>
      <PageHeader
        title="Forex & Duty Calculator"
        subtitle="Live NRB Rates • Nepal Customs Duty • Landed Cost"
        actions={
          <div className="flex gap-3">
            <button onClick={loadHistory} className="btn-secondary flex items-center gap-2 text-sm">
              <Clock size={14} /> History
            </button>
            <button onClick={fetchForex} disabled={forexLoading} className="btn-primary flex items-center gap-2">
              <RefreshCw size={14} className={forexLoading ? "animate-spin" : ""} />
              {forexLoading ? "Fetching..." : "Refresh Rates"}
            </button>
          </div>
        }
      />

      {/* Live Forex Rates */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Nepal Rastra Bank Exchange Rates</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {forex ? `Published: ${forex.date}` : "Loading..."} • Source: nrb.org.np
              {forexError && <span className="text-amber-500 ml-2">⚠ {forexError}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold text-green-700 dark:text-green-400">LIVE</span>
          </div>
        </div>

        {!forex && !forexError && <PageLoader />}

        {forex && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {forex.rates
              .filter(r => KEY_CURRENCIES.includes(r.iso3))
              .sort((a, b) => KEY_CURRENCIES.indexOf(a.iso3) - KEY_CURRENCIES.indexOf(b.iso3))
              .map(rate => (
                <div
                  key={rate.iso3}
                  onClick={() => setCalcCurrency(rate.iso3)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                    calcCurrency === rate.iso3
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-lg shadow-blue-500/10"
                      : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{CURRENCY_FLAGS[rate.iso3] || "💱"}</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{rate.iso3}</span>
                    {rate.unit > 1 && <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-bold">{rate.unit} unit</span>}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Buy</span>
                      <span className="font-bold text-green-600 dark:text-green-400">{rate.buy}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Sell</span>
                      <span className="font-bold text-red-500 dark:text-red-400">{rate.sell}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* All currencies collapse */}
        {forex && forex.rates.length > KEY_CURRENCIES.length && (
          <details className="mt-4">
            <summary className="text-xs font-bold text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
              Show all {forex.rates.length} currencies →
            </summary>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 mt-3">
              {forex.rates
                .filter(r => !KEY_CURRENCIES.includes(r.iso3))
                .map(rate => (
                  <div
                    key={rate.iso3}
                    onClick={() => setCalcCurrency(rate.iso3)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span>{CURRENCY_FLAGS[rate.iso3] || "💱"}</span>
                      <span className="text-xs font-black text-slate-700 dark:text-slate-300">{rate.iso3}</span>
                    </div>
                    <p className="text-xs font-bold text-green-600 dark:text-green-400">{rate.buy}</p>
                  </div>
                ))}
            </div>
          </details>
        )}
      </div>

      {/* Calculator Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left: Calculator Form */}
        <div className="card">
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <Calculator size={20} className="text-blue-500" /> Landed Cost Calculator
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Calculate the true NPR cost including Customs Duty + Excise + VAT (13%)</p>

          {/* HS Code Search */}
          <div className="mb-4">
            <label className="label-text">HS Code / Product Search</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={hsQuery}
                onChange={(e) => { setHsQuery(e.target.value); setSelectedHs(null); setCalcResult(null); }}
                placeholder="Search: 0902, tea, carpet, electronics..."
                className="input-field pl-10"
              />
            </div>
            {hsResults.length > 0 && !selectedHs && (
              <div className="mt-2 max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg">
                {hsResults.map(hs => (
                  <button
                    key={hs.code}
                    onClick={() => { setSelectedHs(hs); setHsQuery(hs.code); setHsResults([]); setCalcResult(null); }}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-sm">{hs.code}</span>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">{hs.description}</p>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">{hs.category}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-xs font-black text-slate-900 dark:text-white">CD: {hs.customs_duty_pct}%</p>
                        {hs.excise_duty_pct > 0 && <p className="text-xs font-bold text-amber-600">ED: {hs.excise_duty_pct}%</p>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected HS Code Info */}
          {selectedHs && (
            <div className="mb-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-mono font-black text-blue-700 dark:text-blue-300">{selectedHs.code}</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{selectedHs.description}</p>
                  {selectedHs.notes && <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1 uppercase font-bold">ⓘ {selectedHs.notes}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900 dark:text-white">Customs: {selectedHs.customs_duty_pct}%</p>
                  <p className="text-sm font-black text-amber-600">{selectedHs.excise_duty_pct > 0 ? `Excise: ${selectedHs.excise_duty_pct}%` : "No Excise"}</p>
                  <p className="text-sm font-black text-green-600">VAT: 13%</p>
                </div>
              </div>
            </div>
          )}

          {/* CIF Value + Currency + Quantity */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="col-span-1">
              <label className="label-text">CIF Value</label>
              <input
                type="number"
                value={cifValue}
                onChange={(e) => { setCifValue(e.target.value); setCalcResult(null); }}
                placeholder="0"
                className="input-field"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="label-text">Currency</label>
              <select value={calcCurrency} onChange={e => { setCalcCurrency(e.target.value); setCalcResult(null); }} className="select-field">
                {forex?.rates.map(r => (
                  <option key={r.iso3} value={r.iso3}>{r.iso3} — {r.currency_name}</option>
                ))}
                {!forex && <option value="USD">USD</option>}
              </select>
            </div>
            <div>
              <label className="label-text">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => { setQuantity(e.target.value); setCalcResult(null); }}
                placeholder="1"
                className="input-field"
                min="1"
              />
            </div>
          </div>

          {/* Exchange Rate Display */}
          {forex && (
            <div className="mb-4 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
              NRB Rate: <span className="font-bold text-slate-700 dark:text-slate-300">1 {calcCurrency} = NPR {getExchangeRate(calcCurrency).toFixed(2)}</span>
              {cifValue && (
                <span className="ml-3">
                  • CIF in NPR: <span className="font-bold text-blue-600 dark:text-blue-400">{formatNPR(parseFloat(cifValue || "0") * getExchangeRate(calcCurrency))}</span>
                </span>
              )}
            </div>
          )}

          {/* Calculate Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => doCalculate(false)}
              disabled={!selectedHs || !cifValue || calcLoading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Calculator size={16} /> {calcLoading ? "Calculating..." : "Calculate"}
            </button>
            <button
              onClick={() => doCalculate(true)}
              disabled={!selectedHs || !cifValue || calcLoading}
              className="btn-secondary flex items-center gap-2 px-4"
              title="Calculate & Save to History"
            >
              <Save size={16} /> Save
            </button>
          </div>
        </div>

        {/* Right: Results */}
        <div className="card">
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <DollarSign size={20} className="text-green-500" /> Landed Cost Breakdown
          </h2>

          {!calcResult && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-600">
              <Calculator size={48} className="mb-4 opacity-40" />
              <p className="text-sm font-bold">Select HS Code & Enter CIF Value</p>
              <p className="text-xs mt-1">Results will appear here</p>
            </div>
          )}

          {calcResult && (
            <div className="space-y-3">
              {/* Header */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product</p>
                <p className="text-sm font-black text-slate-900 dark:text-white">{calcResult.description}</p>
                <p className="text-xs font-mono text-blue-600 dark:text-blue-400 mt-0.5">HS: {calcResult.hs_code}</p>
              </div>

              {/* Breakdown Table */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                      <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">CIF Value ({calcResult.currency})</td>
                      <td className="px-4 py-3 text-right font-mono font-bold">{calcResult.cif_value.toLocaleString()} {calcResult.currency}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        <span className="mr-2">×</span> Exchange Rate (NRB Buy)
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{calcResult.exchange_rate.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-blue-50 dark:bg-blue-900/20">
                      <td className="px-4 py-3 font-bold text-blue-700 dark:text-blue-300">CIF Value (NPR)</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-blue-700 dark:text-blue-300">{formatNPR(calcResult.cif_npr)}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        <span className="mr-2">+</span> Customs Duty ({calcResult.customs_duty_pct}%)
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-red-600">{formatNPR(calcResult.customs_duty_npr)}</td>
                    </tr>
                    {calcResult.excise_duty_pct > 0 && (
                      <tr>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                          <span className="mr-2">+</span> Excise Duty ({calcResult.excise_duty_pct}%)
                          <span className="text-[10px] text-slate-400 block ml-5">on (CIF + Customs)</span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-amber-600">{formatNPR(calcResult.excise_duty_npr)}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        <span className="mr-2">+</span> VAT ({calcResult.vat_pct}%)
                        <span className="text-[10px] text-slate-400 block ml-5">on (CIF + Customs + Excise)</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-purple-600">{formatNPR(calcResult.vat_npr)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-black uppercase tracking-wider opacity-80">Total Landed Cost</span>
                  <span className="text-2xl font-black">{formatNPR(calcResult.total_landed_cost_npr)}</span>
                </div>
                {calcResult.quantity > 1 && (
                  <div className="flex justify-between items-center pt-2 border-t border-white/20">
                    <span className="text-xs opacity-80">Cost per unit ({calcResult.quantity} units)</span>
                    <span className="text-lg font-bold">{formatNPR(calcResult.cost_per_unit_npr)}</span>
                  </div>
                )}
              </div>

              {/* Effective Rate */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <p className="text-[10px] font-bold text-purple-500 uppercase">Effective Duty %</p>
                  <p className="text-xl font-black text-purple-700 dark:text-purple-300">
                    {(((calcResult.total_landed_cost_npr - calcResult.cif_npr) / calcResult.cif_npr) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-[10px] font-bold text-amber-500 uppercase">Tax Added (NPR)</p>
                  <p className="text-xl font-black text-amber-700 dark:text-amber-300">
                    {formatNPR(calcResult.total_landed_cost_npr - calcResult.cif_npr)}
                  </p>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 text-center italic mt-2">
                ⚠ Estimates based on Nepal Customs Tariff Schedule. Verify with your customs broker for final assessment.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* History Section */}
      {showHistory && history.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock size={20} className="text-slate-400" /> Calculation History
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="px-3 py-2 text-left">HS Code</th>
                  <th className="px-3 py-2 text-left">Description</th>
                  <th className="px-3 py-2 text-right">CIF</th>
                  <th className="px-3 py-2 text-right">Total NPR</th>
                  <th className="px-3 py-2 text-right">Duty %</th>
                  <th className="px-3 py-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {history.map(h => (
                  <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="px-3 py-2 font-mono font-bold text-blue-600 dark:text-blue-400">{h.hs_code}</td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-300 max-w-[200px] truncate">{h.description}</td>
                    <td className="px-3 py-2 text-right font-mono">{h.cif_value.toLocaleString()} {h.currency}</td>
                    <td className="px-3 py-2 text-right font-mono font-bold text-green-600">{formatNPR(h.total_landed_cost_npr)}</td>
                    <td className="px-3 py-2 text-right font-bold">{(((h.total_landed_cost_npr - h.cif_npr) / h.cif_npr) * 100).toFixed(1)}%</td>
                    <td className="px-3 py-2 text-right text-slate-400">{h.created_at?.split("T")[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
