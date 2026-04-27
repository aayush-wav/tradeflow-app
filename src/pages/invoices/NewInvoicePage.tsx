import { useEffect, useState } from "react";
import { useInvoiceStore, usePartyStore, useProductStore, useProfileStore } from "../../stores";
import { api } from "../../api";
import { PageHeader, PageLoader, Toast } from "../../components/shared";
import { formatCurrency, rupeesToPaisa, paisaToRupees, numberToWords, getCurrentNepalFiscalYear } from "../../utils";
import { INVOICE_TYPES, CURRENCIES, INCOTERMS, VAT_RATE } from "../../constants";
import { Plus, Trash2, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Invoice, InvoiceItem } from "../../types";

export function NewInvoicePage() {
  const navigate = useNavigate();
  const { addInvoice } = useInvoiceStore();
  const { parties, fetchParties } = usePartyStore();
  const { products, fetchProducts } = useProductStore();
  const { profile, fetchProfile } = useProfileStore();
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [invoiceType, setInvoiceType] = useState("Tax Invoice");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [partyId, setPartyId] = useState("");
  const [shipToName, setShipToName] = useState("");
  const [shipToAddress] = useState("");
  const [incoterm, setIncoterm] = useState("FOB");
  const [portOfLoading, setPortOfLoading] = useState("");
  const [portOfDischarge] = useState("");
  const [countryOfOrigin] = useState("Nepal");
  const [countryOfDest] = useState("");
  const [currency, setCurrency] = useState("NPR");
  const [exchangeRate, setExchangeRate] = useState("1");
  const [applyVat, setApplyVat] = useState(true);
  const [freight, setFreight] = useState("");
  const [insurance, setInsurance] = useState("");
  const [discountTotal, setDiscountTotal] = useState("");
  const [terms, setTerms] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [noOfCartons, setNoOfCartons] = useState("");
  const [transportMode, setTransportMode] = useState("Truck");

  const [items, setItems] = useState<
    {
      product_id: string;
      hs_code: string;
      description: string;
      quantity: number | string;
      unit: string;
      unit_price: number | string;
      discount_percent: number | string;
    }[]
  >([{ product_id: "", hs_code: "", description: "", quantity: 1, unit: "piece", unit_price: "", discount_percent: "" }]);

  useEffect(() => {
    Promise.all([
      fetchParties(),
      fetchProducts(),
      fetchProfile(),
    ]).then(() => setMounted(true));
  }, [fetchParties, fetchProducts, fetchProfile]);

  useEffect(() => {
    const fy = getCurrentNepalFiscalYear();
    const prefix = `INV-${fy}`;
    api.getNextInvoiceNumber(prefix).then(setInvoiceNumber).catch(() => {});
  }, []);

  useEffect(() => {
    if (profile?.terms_and_conditions && !terms) {
      setTerms(profile.terms_and_conditions);
    }
  }, [profile, terms]);

  const selectedParty = parties.find((p) => p.id === partyId);

  const addLineItem = () => {
    setItems([...items, { product_id: "", hs_code: "", description: "", quantity: 1, unit: "piece", unit_price: "", discount_percent: "" }]);
  };

  const removeLineItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateLineItem = (idx: number, field: string, value: unknown) => {
    const next = [...items];
    (next[idx] as Record<string, unknown>)[field] = value;
    if (field === "product_id") {
      const prod = products.find((p) => p.id === value);
      if (prod) {
        next[idx].hs_code = prod.hs_code;
        next[idx].description = prod.name;
        next[idx].unit = prod.unit_of_measure;
        next[idx].unit_price = paisaToRupees(prod.selling_price_paisa);
      }
    }
    setItems(next);
  };

  const lineTotal = (item: (typeof items)[0]) => {
    const qty = typeof item.quantity === "number" ? item.quantity : parseFloat(item.quantity) || 0;
    const price = typeof item.unit_price === "number" ? item.unit_price : parseFloat(item.unit_price) || 0;
    const discPct = typeof item.discount_percent === "number" ? item.discount_percent : parseFloat(item.discount_percent) || 0;
    const gross = qty * price;
    const disc = gross * (discPct / 100);
    return gross - disc;
  };

  const subtotal = items.reduce((s, item) => s + lineTotal(item), 0);
  const discountAmount = parseFloat(discountTotal) || 0;
  const taxableAmount = subtotal - discountAmount + (parseFloat(freight) || 0) + (parseFloat(insurance) || 0);
  const vatAmount = applyVat ? taxableAmount * VAT_RATE : 0;
  const grandTotal = taxableAmount + vatAmount;

  const handleSave = async () => {
    if (!partyId || !invoiceNumber) return;
    setSaving(true);
    try {
      const invoice: Invoice = {
        id: "",
        invoice_number: invoiceNumber,
        invoice_type: invoiceType,
        invoice_date: invoiceDate,
        due_date: dueDate || null,
        party_id: partyId,
        party_name: selectedParty?.company_name || "",
        party_address: selectedParty?.address || null,
        party_country: selectedParty?.country || null,
        party_pan: selectedParty?.pan_number || null,
        ship_to_name: shipToName || null,
        ship_to_address: shipToAddress || null,
        incoterm,
        port_of_loading: portOfLoading || null,
        port_of_discharge: portOfDischarge || null,
        country_of_origin: countryOfOrigin || null,
        country_of_destination: countryOfDest || null,
        subtotal_paisa: rupeesToPaisa(subtotal),
        freight_paisa: rupeesToPaisa(parseFloat(freight) || 0),
        insurance_paisa: rupeesToPaisa(parseFloat(insurance) || 0),
        discount_paisa: rupeesToPaisa(discountAmount),
        vat_paisa: rupeesToPaisa(vatAmount),
        grand_total_paisa: rupeesToPaisa(grandTotal),
        currency,
        exchange_rate: parseFloat(exchangeRate) || 1,
        status: "Draft",
        terms_and_conditions: terms || null,
        notes: null,
        shipment_record_id: null,
        weight_kg: parseFloat(weightKg) || null,
        no_of_cartons: parseInt(noOfCartons) || null,
        transport_mode: transportMode || null,
        created_at: "",
        updated_at: "",
      };

      const invoiceItems: InvoiceItem[] = items.map((item) => {
        const qty = typeof item.quantity === "number" ? item.quantity : parseFloat(item.quantity) || 0;
        const price = typeof item.unit_price === "number" ? item.unit_price : parseFloat(item.unit_price) || 0;
        const discPct = typeof item.discount_percent === "number" ? item.discount_percent : parseFloat(item.discount_percent) || 0;
        
        return {
          id: "",
          invoice_id: "",
          product_id: item.product_id || null,
          hs_code: item.hs_code || null,
          description: item.description,
          quantity: qty,
          unit: item.unit,
          unit_price_paisa: rupeesToPaisa(price),
          discount_percent: discPct,
          discount_paisa: rupeesToPaisa(qty * price * (discPct / 100)),
          amount_paisa: rupeesToPaisa(lineTotal(item)),
        };
      });

      await addInvoice(invoice, invoiceItems);
      setToast({ message: "Invoice created successfully", type: "success" });
      setTimeout(() => navigate("/invoices"), 1500);
    } catch (err: any) {
      setToast({ message: err.message || "Failed to save invoice", type: "error" });
      setSaving(false);
    }
  };

  if (!mounted) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="New Invoice"
        actions={
          <button onClick={handleSave} disabled={saving || !partyId} className="btn-primary flex items-center gap-2">
            <Save size={16} /> {saving ? "Saving..." : "Save Invoice"}
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card">
          <h3 className="section-title mb-3">Invoice Details</h3>
          <div className="space-y-3">
            <div>
              <label className="label-text">Invoice Type</label>
              <select className="select-field" value={invoiceType} onChange={(e) => setInvoiceType(e.target.value)}>
                {INVOICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text">Invoice Number</label>
              <input className="input-field font-mono" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
            </div>
            <div>
              <label className="label-text">Invoice Date</label>
              <input type="date" className="input-field" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
            </div>
            <div>
              <label className="label-text">Due Date</label>
              <input type="date" className="input-field" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title mb-3">Bill To</h3>
          <div className="space-y-3">
            <div>
              <label className="label-text">Party</label>
              <select className="select-field" value={partyId} onChange={(e) => setPartyId(e.target.value)}>
                <option value="">Select party...</option>
                {parties.map((p) => <option key={p.id} value={p.id}>{p.company_name}</option>)}
              </select>
            </div>
            {selectedParty && (
              <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                <p className="font-medium text-slate-900 dark:text-white">{selectedParty.company_name}</p>
                <p>{selectedParty.address || "No address"}</p>
                <p>{selectedParty.country}</p>
                {selectedParty.pan_number && <p className="mt-1 font-mono uppercase text-xs">PAN: {selectedParty.pan_number}</p>}
              </div>
            )}
            <div>
              <label className="label-text">Ship To (if different)</label>
              <input className="input-field" value={shipToName} onChange={(e) => setShipToName(e.target.value)} placeholder="Name" />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title mb-3">Shipping Details</h3>
          <div className="space-y-3">
            <div>
              <label className="label-text">INCOTERM</label>
              <select className="select-field" value={incoterm} onChange={(e) => setIncoterm(e.target.value)}>
                {INCOTERMS.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text">Currency</label>
              <select className="select-field" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
              </select>
            </div>
            {currency !== "NPR" && (
              <div>
                <label className="label-text">Exchange Rate (1 {currency} = NPR)</label>
                <input type="number" className="input-field" value={exchangeRate} placeholder="1.00" onChange={(e) => setExchangeRate(e.target.value)} />
              </div>
            )}
            <div>
              <label className="label-text">Port of Loading</label>
              <input className="input-field" value={portOfLoading} onChange={(e) => setPortOfLoading(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
               <div>
                  <label className="label-text">Weight (kg)</label>
                   <input type="number" className="input-field" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="0.00" />
               </div>
               <div>
                  <label className="label-text">No. Cartons</label>
                   <input type="number" className="input-field" value={noOfCartons} onChange={(e) => setNoOfCartons(e.target.value)} placeholder="0" />
               </div>
            </div>
            <div>
              <label className="label-text">Transport Mode</label>
              <select className="select-field" value={transportMode} onChange={(e) => setTransportMode(e.target.value)}>
                 <option value="Truck">Truck</option>
                 <option value="Sea">Sea Freight</option>
                 <option value="Air">Air Freight</option>
                 <option value="Train">Railway</option>
                 <option value="Courier">Courier</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <h3 className="section-title mb-4">Line Items</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="px-3 py-2">Product</th>
              <th className="px-3 py-2">HS Code</th>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2 text-right w-20">Qty</th>
              <th className="px-3 py-2 w-20">Unit</th>
              <th className="px-3 py-2 text-right w-28">Unit Price</th>
              <th className="px-3 py-2 text-right w-20">Disc%</th>
              <th className="px-3 py-2 text-right w-32">Amount</th>
              <th className="px-3 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="px-3 py-2">
                  <select
                    className="select-field text-xs"
                    value={item.product_id}
                    onChange={(e) => updateLineItem(idx, "product_id", e.target.value)}
                  >
                    <option value="">Manual</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input className="input-field text-xs font-mono" value={item.hs_code} onChange={(e) => updateLineItem(idx, "hs_code", e.target.value)} />
                </td>
                <td className="px-3 py-2">
                  <input className="input-field text-xs" value={item.description} onChange={(e) => updateLineItem(idx, "description", e.target.value)} />
                </td>
                <td className="px-3 py-2">
                  <input type="number" className="input-field text-xs text-right" value={item.quantity} placeholder="0" onChange={(e) => updateLineItem(idx, "quantity", e.target.value)} />
                </td>
                <td className="px-3 py-2">
                  <input className="input-field text-xs" value={item.unit} onChange={(e) => updateLineItem(idx, "unit", e.target.value)} />
                </td>
                <td className="px-3 py-2">
                  <input type="number" className="input-field text-xs text-right" value={item.unit_price} placeholder="0" onChange={(e) => updateLineItem(idx, "unit_price", e.target.value)} />
                </td>
                <td className="px-3 py-2">
                  <input type="number" className="input-field text-xs text-right" value={item.discount_percent} placeholder="0" onChange={(e) => updateLineItem(idx, "discount_percent", e.target.value)} />
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {formatCurrency(rupeesToPaisa(lineTotal(item)), currency)}
                </td>
                <td className="px-3 py-2">
                  <button onClick={() => removeLineItem(idx)} className="p-1 text-slate-400 hover:text-red-600" disabled={items.length <= 1}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addLineItem} className="btn-secondary flex items-center gap-2 mt-3 text-sm">
          <Plus size={14} /> Add Line Item
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h3 className="section-title mb-3">Terms & Conditions</h3>
          <textarea className="input-field" rows={5} value={terms} onChange={(e) => setTerms(e.target.value)} />
          <div className="mt-3 flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer text-slate-700 dark:text-slate-300">
              <input type="checkbox" checked={applyVat} onChange={(e) => setApplyVat(e.target.checked)} className="rounded border-slate-300 dark:border-slate-700 dark:bg-slate-800" />
              Apply VAT (13%)
            </label>
          </div>
        </div>

        <div className="card">
          <h3 className="section-title mb-4">Totals</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{formatCurrency(rupeesToPaisa(subtotal), currency)}</span></div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Freight</span>
              <input type="number" className="input-field w-36 text-right text-sm" value={freight} placeholder="0" onChange={(e) => setFreight(e.target.value)} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Insurance</span>
              <input type="number" className="input-field w-36 text-right text-sm" value={insurance} placeholder="0" onChange={(e) => setInsurance(e.target.value)} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Discount</span>
              <input type="number" className="input-field w-36 text-right text-sm" value={discountTotal} placeholder="0" onChange={(e) => setDiscountTotal(e.target.value)} />
            </div>
            {applyVat && (
              <div className="flex justify-between"><span className="text-slate-500">VAT (13%)</span><span>{formatCurrency(rupeesToPaisa(vatAmount), currency)}</span></div>
            )}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between font-bold text-base text-slate-900 dark:text-white">
              <span>Grand Total</span>
              <span className="text-blue-600 dark:text-blue-400">{formatCurrency(rupeesToPaisa(grandTotal), currency)}</span>
            </div>
            <p className="text-xs text-slate-500 italic mt-2">
              {numberToWords(paisaToRupees(rupeesToPaisa(grandTotal)))}
            </p>
          </div>
        </div>
      </div>

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
