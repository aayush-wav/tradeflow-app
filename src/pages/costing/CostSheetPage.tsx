import { useEffect, useState, useMemo } from "react";
import { useProductStore, useShipmentStore } from "../../stores";
import { PageHeader, PageLoader, Toast } from "../../components/shared";
import {
  formatCurrency,
  rupeesToPaisa,
  paisaToRupees,
  formatNumber,
} from "../../utils";
import {
  BORDER_CROSSINGS,
  FREIGHT_MODES,
  TRANSPORT_MODES,
  CURRENCIES,
  INCOTERMS,
} from "../../constants";
import { Save, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { ShipmentRecord, CustomCostItem } from "../../types";

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left"
      >
        <h3 className="section-title">{title}</h3>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "number",
  placeholder = "0.00",
  prefix,
  suffix,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div>
      <label className="label-text">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
            {prefix}
          </span>
        )}
        <input
          type={type}
          className={`input-field ${prefix ? "pl-10" : ""} ${suffix ? "pr-12" : ""}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          step="0.01"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export function CostSheetPage() {
  const { products, fetchProducts } = useProductStore();
  const { saveRecord } = useShipmentStore();
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [name, setName] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [unitBuyingPrice, setUnitBuyingPrice] = useState("0");

  const [transportMode, setTransportMode] = useState("Road");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState<string>(BORDER_CROSSINGS[0]);
  const [transportCost, setTransportCost] = useState("0");
  const [loadingUnloading, setLoadingUnloading] = useState("0");
  const [packaging, setPackaging] = useState("0");
  const [fumigation, setFumigation] = useState("0");

  const [customsAgent, setCustomsAgent] = useState("0");
  const [exportDeclaration, setExportDeclaration] = useState("0");
  const [customsExam, setCustomsExam] = useState("0");
  const [certificateOrigin, setCertificateOrigin] = useState("0");
  const [phytosanitary, setPhytosanitary] = useState("0");
  const [exportPermit, setExportPermit] = useState("0");
  const [docPreparation, setDocPreparation] = useState("0");

  const [terminalHandling, setTerminalHandling] = useState("0");
  const [brokerTransit, setBrokerTransit] = useState("0");
  const [transitCharges, setTransitCharges] = useState("0");
  const [storageDemurrage, setStorageDemurrage] = useState("0");
  const [scannerCharges, setScannerCharges] = useState("0");

  const [freightMode, setFreightMode] = useState("Sea");
  const [freightCost, setFreightCost] = useState("0");
  const [freightCurrency, setFreightCurrency] = useState("USD");
  const [freightExRate, setFreightExRate] = useState("133.50");
  const [freightInsurance, setFreightInsurance] = useState("0");
  const [blAwbCharges, setBlAwbCharges] = useState("0");

  const [importDuty, setImportDuty] = useState("0");
  const [vatGst, setVatGst] = useState("0");
  const [customsClearanceDest, setCustomsClearanceDest] = useState("0");
  const [lastMile, setLastMile] = useState("0");
  const [otherDest, setOtherDest] = useState("0");

  const [lcCharges, setLcCharges] = useState("0");
  const [bankCommission, setBankCommission] = useState("0");
  const [wireTransfer, setWireTransfer] = useState("0");
  const [hedgingCost, setHedgingCost] = useState("0");

  const [customCosts, setCustomCosts] = useState<CustomCostItem[]>([]);
  const [contingencyPercent, setContingencyPercent] = useState("0");
  const [incoterm, setIncoterm] = useState("FOB");

  useEffect(() => {
    fetchProducts().then(() => setMounted(true));
  }, [fetchProducts]);

  useEffect(() => {
    if (productId) {
      const p = products.find((p) => p.id === productId);
      if (p) setUnitBuyingPrice(String(paisaToRupees(p.buying_price_paisa)));
    }
  }, [productId, products]);

  const p = (v: string) => rupeesToPaisa(parseFloat(v) || 0);
  const f = (v: string) => parseFloat(v) || 0;

  const totalProductCost = f(quantity) * f(unitBuyingPrice);
  const freightNPR = f(freightCost) * f(freightExRate);
  const cifValue = totalProductCost + freightNPR + f(freightInsurance);
  const importDutyAmount = cifValue * (f(importDuty) / 100);
  const vatGstAmount = (cifValue + importDutyAmount) * (f(vatGst) / 100);

  const subtotal = useMemo(() => {
    let total = totalProductCost;
    total += f(transportCost) + f(loadingUnloading) + f(packaging) + f(fumigation);
    total += f(customsAgent) + f(exportDeclaration) + f(customsExam) + f(certificateOrigin);
    total += f(phytosanitary) + f(exportPermit) + f(docPreparation);
    total += f(terminalHandling) + f(brokerTransit) + f(transitCharges);
    total += f(storageDemurrage) + f(scannerCharges);
    total += freightNPR + f(freightInsurance) + f(blAwbCharges);
    total += importDutyAmount + vatGstAmount;
    total += f(customsClearanceDest) + f(lastMile) + f(otherDest);
    total += f(lcCharges) + f(bankCommission) + f(wireTransfer) + f(hedgingCost);
    total += customCosts.reduce((s, c) => s + paisaToRupees(c.amount_paisa), 0);
    return total;
  }, [
    totalProductCost, transportCost, loadingUnloading, packaging, fumigation,
    customsAgent, exportDeclaration, customsExam, certificateOrigin,
    phytosanitary, exportPermit, docPreparation, terminalHandling,
    brokerTransit, transitCharges, storageDemurrage, scannerCharges,
    freightNPR, freightInsurance, blAwbCharges, importDutyAmount, vatGstAmount,
    customsClearanceDest, lastMile, otherDest, lcCharges, bankCommission,
    wireTransfer, hedgingCost, customCosts,
  ]);

  const contingencyAmount = subtotal * (f(contingencyPercent) / 100);
  const grandTotal = subtotal + contingencyAmount;
  const costPerUnit = f(quantity) > 0 ? grandTotal / f(quantity) : 0;
  const grandTotalUSD = f(freightExRate) > 0 ? grandTotal / f(freightExRate) : 0;

  const handleSave = async () => {
    if (!name) return;
    setSaving(true);
    try {
      const record: ShipmentRecord = {
        id: "",
        name,
        product_id: productId || null,
        quantity: f(quantity),
        unit_buying_price_paisa: p(unitBuyingPrice),
        total_product_cost_paisa: rupeesToPaisa(totalProductCost),
        transport_mode: transportMode,
        origin,
        destination,
        transport_cost_paisa: p(transportCost),
        loading_unloading_paisa: p(loadingUnloading),
        packaging_cost_paisa: p(packaging),
        fumigation_cost_paisa: p(fumigation),
        customs_agent_fee_paisa: p(customsAgent),
        export_declaration_fee_paisa: p(exportDeclaration),
        customs_exam_fee_paisa: p(customsExam),
        certificate_origin_fee_paisa: p(certificateOrigin),
        phytosanitary_fee_paisa: p(phytosanitary),
        export_permit_fee_paisa: p(exportPermit),
        doc_preparation_paisa: p(docPreparation),
        terminal_handling_paisa: p(terminalHandling),
        customs_broker_transit_paisa: p(brokerTransit),
        transit_charges_paisa: p(transitCharges),
        storage_demurrage_paisa: p(storageDemurrage),
        scanner_charges_paisa: p(scannerCharges),
        freight_mode: freightMode,
        freight_cost_original: p(freightCost),
        freight_currency: freightCurrency,
        freight_exchange_rate: f(freightExRate),
        freight_cost_npr_paisa: rupeesToPaisa(freightNPR),
        freight_insurance_paisa: p(freightInsurance),
        bl_awb_charges_paisa: p(blAwbCharges),
        import_duty_percent: f(importDuty),
        vat_gst_percent: f(vatGst),
        customs_clearance_dest_paisa: p(customsClearanceDest),
        last_mile_delivery_paisa: p(lastMile),
        other_destination_paisa: p(otherDest),
        lc_charges_paisa: p(lcCharges),
        bank_commission_paisa: p(bankCommission),
        wire_transfer_paisa: p(wireTransfer),
        hedging_cost_paisa: p(hedgingCost),
        contingency_percent: f(contingencyPercent),
        total_cost_paisa: rupeesToPaisa(grandTotal),
        custom_costs_json: customCosts.length > 0 ? JSON.stringify(customCosts) : null,
        incoterm,
        invoice_id: null,
        created_at: "",
        updated_at: "",
      };
      await saveRecord(record);
      setToast({ message: "Cost sheet saved successfully", type: "success" });
    } catch (err: any) {
      setToast({ message: err.message || "Failed to save record", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return <PageLoader />;

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
        <PageHeader
          title="Export Cost Calculator"
          actions={
            <button
              onClick={handleSave}
              disabled={saving || !name}
              className="btn-primary flex items-center gap-2"
            >
              <Save size={16} /> {saving ? "Saving..." : "Save Cost Sheet"}
            </button>
          }
        />

        <div className="card mb-4">
          <label className="label-text">Cost Sheet Name</label>
          <input
            className="input-field max-w-md"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Tea Export to Singapore - March 2025"
          />
        </div>

        <CollapsibleSection title="A. Product Base Cost" defaultOpen>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label-text">Product</label>
              <select
                className="select-field"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              >
                <option value="">Select product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.product_id} — {p.name}
                  </option>
                ))}
              </select>
            </div>
            <InputField label="Quantity" value={quantity} onChange={setQuantity} />
            <InputField label="Unit Buying Price (NPR)" value={unitBuyingPrice} onChange={setUnitBuyingPrice} prefix="Rs." />
          </div>
          <div className="mt-3 text-sm text-slate-600">
            Total Product Cost: <strong>{formatCurrency(rupeesToPaisa(totalProductCost))}</strong>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="B. Inland Transportation (Nepal-side)">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label-text">Transport Mode</label>
              <select className="select-field" value={transportMode} onChange={(e) => setTransportMode(e.target.value)}>
                {TRANSPORT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <InputField label="Origin (Warehouse)" value={origin} onChange={setOrigin} type="text" placeholder="e.g., Kathmandu" />
            <div>
              <label className="label-text">Destination / Border Point</label>
              <select className="select-field" value={destination} onChange={(e) => setDestination(e.target.value)}>
                {BORDER_CROSSINGS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <InputField label="Transportation Cost (NPR)" value={transportCost} onChange={setTransportCost} prefix="Rs." />
            <InputField label="Loading/Unloading (NPR)" value={loadingUnloading} onChange={setLoadingUnloading} prefix="Rs." />
            <InputField label="Packaging & Labelling (NPR)" value={packaging} onChange={setPackaging} prefix="Rs." />
            <InputField label="Fumigation/Inspection (NPR)" value={fumigation} onChange={setFumigation} prefix="Rs." />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="C. Customs & Documentation (Nepal Export)">
          <div className="grid grid-cols-3 gap-4">
            <InputField label="CHA Service Charge" value={customsAgent} onChange={setCustomsAgent} prefix="Rs." />
            <InputField label="Export Declaration Fee" value={exportDeclaration} onChange={setExportDeclaration} prefix="Rs." />
            <InputField label="Customs Examination Fee" value={customsExam} onChange={setCustomsExam} prefix="Rs." />
            <InputField label="Certificate of Origin Fee" value={certificateOrigin} onChange={setCertificateOrigin} prefix="Rs." />
            <InputField label="Phytosanitary/Health Cert" value={phytosanitary} onChange={setPhytosanitary} prefix="Rs." />
            <InputField label="Export Permit Fee" value={exportPermit} onChange={setExportPermit} prefix="Rs." />
            <InputField label="Document Preparation" value={docPreparation} onChange={setDocPreparation} prefix="Rs." />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="D. Port / Border Handling">
          <div className="grid grid-cols-3 gap-4">
            <InputField label="Terminal Handling" value={terminalHandling} onChange={setTerminalHandling} prefix="Rs." />
            <InputField label="Transit Broker Fee" value={brokerTransit} onChange={setBrokerTransit} prefix="Rs." />
            <InputField label="Transit Charges (India)" value={transitCharges} onChange={setTransitCharges} prefix="Rs." />
            <InputField label="Storage/Demurrage at ICD" value={storageDemurrage} onChange={setStorageDemurrage} prefix="Rs." />
            <InputField label="Scanner/X-Ray Charges" value={scannerCharges} onChange={setScannerCharges} prefix="Rs." />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="E. Freight">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label-text">Freight Mode</label>
              <select className="select-field" value={freightMode} onChange={(e) => setFreightMode(e.target.value)}>
                {FREIGHT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <InputField label="Freight Cost" value={freightCost} onChange={setFreightCost} />
            <div>
              <label className="label-text">Freight Currency</label>
              <select className="select-field" value={freightCurrency} onChange={(e) => setFreightCurrency(e.target.value)}>
                {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>
            </div>
            <InputField label="Exchange Rate (1 FCY = NPR)" value={freightExRate} onChange={setFreightExRate} />
            <div className="flex items-end pb-2 text-sm text-slate-600">
              Converted: <strong className="ml-1">{formatCurrency(rupeesToPaisa(freightNPR))}</strong>
            </div>
            <div />
            <InputField label="Freight Insurance (NPR)" value={freightInsurance} onChange={setFreightInsurance} prefix="Rs." />
            <InputField label="BL/AWB Charges (NPR)" value={blAwbCharges} onChange={setBlAwbCharges} prefix="Rs." />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="F. Destination Country Costs">
          <div className="grid grid-cols-3 gap-4">
            <InputField label="Import Duty at Destination (%)" value={importDuty} onChange={setImportDuty} suffix="%" />
            <InputField label="VAT/GST at Destination (%)" value={vatGst} onChange={setVatGst} suffix="%" />
            <div className="flex items-end pb-2 text-sm text-slate-500">
              Duty: {formatCurrency(rupeesToPaisa(importDutyAmount))} | Tax: {formatCurrency(rupeesToPaisa(vatGstAmount))}
            </div>
            <InputField label="Customs Clearance (NPR equiv.)" value={customsClearanceDest} onChange={setCustomsClearanceDest} prefix="Rs." />
            <InputField label="Last-mile Delivery (NPR equiv.)" value={lastMile} onChange={setLastMile} prefix="Rs." />
            <InputField label="Other Destination Charges" value={otherDest} onChange={setOtherDest} prefix="Rs." />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="G. Banking & Finance">
          <div className="grid grid-cols-3 gap-4">
            <InputField label="LC Opening Charges (NPR)" value={lcCharges} onChange={setLcCharges} prefix="Rs." />
            <InputField label="Bank Commission (NPR)" value={bankCommission} onChange={setBankCommission} prefix="Rs." />
            <InputField label="Wire Transfer/TT (NPR)" value={wireTransfer} onChange={setWireTransfer} prefix="Rs." />
            <InputField label="Currency Hedging (NPR)" value={hedgingCost} onChange={setHedgingCost} prefix="Rs." />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="H. Miscellaneous / Contingency">
          <div className="space-y-3 mb-4">
            {customCosts.map((cc, idx) => (
              <div key={idx} className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="label-text">Label</label>
                  <input
                    className="input-field"
                    value={cc.label}
                    onChange={(e) => {
                      const next = [...customCosts];
                      next[idx] = { ...cc, label: e.target.value };
                      setCustomCosts(next);
                    }}
                  />
                </div>
                <div className="w-48">
                  <label className="label-text">Amount (NPR)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={paisaToRupees(cc.amount_paisa)}
                    onChange={(e) => {
                      const next = [...customCosts];
                      next[idx] = { ...cc, amount_paisa: rupeesToPaisa(parseFloat(e.target.value) || 0) };
                      setCustomCosts(next);
                    }}
                  />
                </div>
                <button
                  onClick={() => setCustomCosts(customCosts.filter((_, i) => i !== idx))}
                  className="p-2 text-red-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={() => setCustomCosts([...customCosts, { label: "", amount_paisa: 0 }])}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Plus size={14} /> Add Custom Cost
            </button>
          </div>
          <div className="w-64">
            <InputField
              label="Contingency Buffer (%)"
              value={contingencyPercent}
              onChange={setContingencyPercent}
              suffix="%"
            />
          </div>
        </CollapsibleSection>
      </div>

      <div className="w-80 flex-shrink-0">
        <div className="card sticky top-6">
          <h3 className="section-title mb-4">Cost Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Product Cost</span>
              <span>{formatCurrency(rupeesToPaisa(totalProductCost))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Inland Transport</span>
              <span>{formatCurrency(rupeesToPaisa(f(transportCost) + f(loadingUnloading) + f(packaging) + f(fumigation)))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Customs & Docs</span>
              <span>{formatCurrency(rupeesToPaisa(f(customsAgent) + f(exportDeclaration) + f(customsExam) + f(certificateOrigin) + f(phytosanitary) + f(exportPermit) + f(docPreparation)))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Port/Border</span>
              <span>{formatCurrency(rupeesToPaisa(f(terminalHandling) + f(brokerTransit) + f(transitCharges) + f(storageDemurrage) + f(scannerCharges)))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Freight</span>
              <span>{formatCurrency(rupeesToPaisa(freightNPR + f(freightInsurance) + f(blAwbCharges)))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Destination</span>
              <span>{formatCurrency(rupeesToPaisa(importDutyAmount + vatGstAmount + f(customsClearanceDest) + f(lastMile) + f(otherDest)))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Banking</span>
              <span>{formatCurrency(rupeesToPaisa(f(lcCharges) + f(bankCommission) + f(wireTransfer) + f(hedgingCost)))}</span>
            </div>
            {contingencyAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">Contingency ({contingencyPercent}%)</span>
                <span>{formatCurrency(rupeesToPaisa(contingencyAmount))}</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-3">
              <div className="flex justify-between font-bold text-base">
                <span>Total Cost (NPR)</span>
                <span>{formatCurrency(rupeesToPaisa(grandTotal))}</span>
              </div>
              <div className="flex justify-between text-slate-500 mt-1">
                <span>Total Cost (USD)</span>
                <span>$ {formatNumber(grandTotalUSD)}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-slate-500">Cost per Unit</span>
                <span className="font-semibold">{formatCurrency(rupeesToPaisa(costPerUnit))}</span>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-3">
              <label className="label-text">INCOTERM</label>
              <select
                className="select-field"
                value={incoterm}
                onChange={(e) => setIncoterm(e.target.value)}
              >
                {INCOTERMS.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
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
