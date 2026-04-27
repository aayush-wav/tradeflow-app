import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api";
import { useProfileStore, useProductStore } from "../../stores";
import { PageLoader } from "../../components/shared";
import { formatCurrency } from "../../utils";
import { Printer, ArrowLeft } from "lucide-react";
import type { ShipmentRecord, CustomCostItem } from "../../types";
import { DEMO_LOGO_BASE64 } from "../../assets/demo-logo";

/* ── Icon helpers (inline SVGs matching the reference invoice) ──────────── */
const IconPlane = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
  </svg>
);
const IconTruck = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M20 8h-3V4H1v13h2a3 3 0 006 0h6a3 3 0 006 0h2v-5l-3-4zM6 18.5A1.5 1.5 0 014.5 17 1.5 1.5 0 016 15.5 1.5 1.5 0 017.5 17 1.5 1.5 0 016 18.5zm13.5-9L21.5 12H17V9.5h2.5zM18 18.5a1.5 1.5 0 01-1.5-1.5 1.5 1.5 0 011.5-1.5 1.5 1.5 0 011.5 1.5 1.5 1.5 0 01-1.5 1.5z"/>
  </svg>
);
const IconPackage = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1.1-.9-2-2-2zm-1 18H5V9h14v11zm1-13H4V4h16v3z"/>
    <path d="M9 12h6v2H9z"/>
  </svg>
);
const IconCart = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0020 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
);
const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
  </svg>
);
const IconEmail = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);

export function CostSheetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, fetchProfile } = useProfileStore();
  const { products, fetchProducts } = useProductStore();
  const [record, setRecord] = useState<ShipmentRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchProfile(), fetchProducts()]).then(() => {
      if (id) {
        api.getShipmentRecords().then((records) => {
          const rec = records.find((r) => r.id === id);
          if (rec) setRecord(rec);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, [id, fetchProfile, fetchProducts]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <PageLoader />;
  if (!record) return <div>Cost sheet not found</div>;

  const product = products.find((p) => p.id === record.product_id);
  const customCosts: CustomCostItem[] = record.custom_costs_json
    ? JSON.parse(record.custom_costs_json)
    : [];

  const cifValue = record.total_product_cost_paisa + record.freight_cost_npr_paisa + record.freight_insurance_paisa;
  const importDutyAmount = cifValue * (record.import_duty_percent / 100);
  const vatGstAmount = (cifValue + importDutyAmount) * (record.vat_gst_percent / 100);

  const row1Freight = record.freight_cost_npr_paisa + record.freight_insurance_paisa + record.bl_awb_charges_paisa;
  const row2Transport = record.transport_cost_paisa + record.loading_unloading_paisa + record.transit_charges_paisa + record.last_mile_delivery_paisa;
  const row3Packaging = record.packaging_cost_paisa + record.terminal_handling_paisa + record.storage_demurrage_paisa + record.scanner_charges_paisa + record.fumigation_cost_paisa;
  const row4Product = record.total_product_cost_paisa;
  const row5CustomsMisc = record.customs_agent_fee_paisa + record.export_declaration_fee_paisa + record.customs_exam_fee_paisa + record.certificate_origin_fee_paisa + record.phytosanitary_fee_paisa + record.export_permit_fee_paisa + record.doc_preparation_paisa + record.customs_broker_transit_paisa + record.customs_clearance_dest_paisa + record.other_destination_paisa + record.lc_charges_paisa + record.bank_commission_paisa + record.wire_transfer_paisa + record.hedging_cost_paisa + importDutyAmount + vatGstAmount + customCosts.reduce((s, c) => s + c.amount_paisa, 0);

  const subtotal = record.total_cost_paisa / (1 + record.contingency_percent / 100);
  const contingencyAmount = record.total_cost_paisa - subtotal;
  const costPerUnit = record.quantity > 0 ? record.total_cost_paisa / record.quantity : 0;

  /* Color scheme matching the reference */
  const navy = "#0F1B3D";
  const orange = "#E87722";

  return (
    <div className="max-w-4xl mx-auto pt-6 pb-20 print:py-0 print:my-0">
      <div className="no-print flex items-center justify-between mb-8">
        <button
          onClick={() => navigate("/costing")}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to List
        </button>
        <button onClick={handlePrint} className="btn-primary flex items-center gap-2 px-6">
          <Printer size={18} /> Print Cost Sheet
        </button>
      </div>

      <div className="bg-white text-black shadow-2xl print:shadow-none flex flex-col font-sans print-text-black min-h-[1050px] print:min-h-[275mm] print:h-[275mm] print:overflow-hidden">
        {/* ═══════════ TOP HEADER ═══════════ */}
        <div className="flex justify-between items-start px-10 pt-8 pb-4" style={{ borderBottom: `3px solid ${orange}` }}>
          {/* Left: Logo + Company Info */}
          <div className="flex items-start gap-4">
            <img
              src={profile?.logo_base64 || DEMO_LOGO_BASE64}
              alt="Company Logo"
              className="h-20 w-auto object-contain"
              style={{ maxWidth: "100px" }}
              onError={(e) => {
                // Fallback to placeholder if even the demo logo fails
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-[8px] text-slate-400 uppercase font-bold">
              Logo
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight uppercase" style={{ color: navy }}>
                {profile?.company_name || "COMPANY NAME"}
              </h1>
              <p className="text-xs font-bold mt-0.5" style={{ color: orange }}>
                — {profile?.municipality}, {profile?.district}, {profile?.province} —
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-black">
                <span className="flex items-center gap-1"><IconPhone /> {profile?.phone_primary}</span>
                <span className="flex items-center gap-1"><IconEmail /> {profile?.email}</span>
              </div>
            </div>
          </div>

          {/* Right: COST SHEET title */}
          <div className="text-right">
            <h2 className="text-4xl font-black uppercase tracking-tight" style={{ color: navy }}>
              COST SHEET
            </h2>
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-end gap-2">
                <span className="text-slate-500">Ref No.</span>
                <span className="font-bold w-40 text-right border-b border-slate-300 pb-0.5">{record.id.split('-').pop()}</span>
              </div>
              <div className="flex justify-end gap-2">
                <span className="text-slate-500">Date</span>
                <span className="font-bold w-40 text-right border-b border-slate-300 pb-0.5">{record.created_at ? new Date(record.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════ CLIENT DETAILS ═══════════ */}
        <div className="px-10 mt-6">
          <div className="relative border border-[#A6B2D1] rounded p-4 pt-6">
            <div className="absolute -top-3 -left-0.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white rounded-sm" style={{ background: navy }}>
              PRODUCT DETAILS
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-y-1.5 text-sm">
              <span className="font-bold">Shipment Title</span>
              <span className="flex items-center gap-2">: <span className="font-semibold border-b border-slate-200 flex-1 pb-0.5 pl-2">{record.name}</span></span>
              <span className="font-bold">Product Name</span>
              <span className="flex items-center gap-2">: <span className="border-b border-slate-200 flex-1 pb-0.5 pl-2">{product?.name || "N/A"}</span></span>
              <span className="font-bold">HS Code</span>
              <span className="flex items-center gap-2">: <span className="border-b border-slate-200 flex-1 pb-0.5 pl-2">{product?.hs_code || "N/A"}</span></span>
            </div>
          </div>
        </div>

        {/* ═══════════ SHIPMENT DETAILS ═══════════ */}
        <div className="px-10 mt-5">
          <div className="relative border border-[#A6B2D1] rounded p-4 pt-6">
            <div className="absolute -top-3 -left-0.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white rounded-sm" style={{ background: navy }}>
              SHIPMENT DETAILS
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div className="flex gap-2">
                <span className="font-bold w-24">Origin</span>
                <span>: <span className="border-b border-slate-200 inline-block min-w-[140px] pb-0.5 pl-2">{record.origin || "N/A"}</span></span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold w-24">Quantity</span>
                <span>: <span className="border-b border-slate-200 inline-block min-w-[100px] pb-0.5 pl-2">{record.quantity}</span> {product?.unit_of_measure}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold w-24">Destination</span>
                <span>: <span className="border-b border-slate-200 inline-block min-w-[140px] pb-0.5 pl-2">{record.destination || "N/A"}</span></span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold w-24">Incoterm</span>
                <span>: <span className="border-b border-slate-200 inline-block min-w-[100px] pb-0.5 pl-2">{record.incoterm || "N/A"}</span></span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold w-24">Mode</span>
                <span>: 
                  <label className="inline-flex items-center gap-1 ml-2">
                    <input type="checkbox" checked={record.freight_mode === "Air"} readOnly className="rounded border-slate-400" /> Air
                  </label>
                  <label className="inline-flex items-center gap-1 ml-3">
                    <input type="checkbox" checked={record.freight_mode === "Sea"} readOnly className="rounded border-slate-400" /> Sea
                  </label>
                  <label className="inline-flex items-center gap-1 ml-3">
                    <input type="checkbox" checked={record.freight_mode === "Road" || record.transport_mode === "Road"} readOnly className="rounded border-slate-400" /> Road
                  </label>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════ COST TABLE ═══════════ */}
        <div className="px-10 mt-6 flex-1">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="py-2.5 px-4 text-left text-xs font-black uppercase tracking-widest text-white" style={{ background: navy }}>
                  Description
                </th>
                <th className="py-2.5 px-4 text-right text-xs font-black uppercase tracking-widest text-white w-48" style={{ background: navy }}>
                  AMOUNT (NPR)
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1: Freight */}
              <tr className="border-b border-slate-200">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-4">
                    <span className="text-slate-600 flex items-center justify-center w-8 h-8 rounded-full border border-slate-300 bg-slate-50"><IconPlane /></span>
                    <span className="font-semibold text-sm">International Freight ({record.freight_mode})</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-bold text-sm flex items-center justify-between">
                  <span className="text-slate-500 mr-2">NPR</span>
                  <span className="border-b border-slate-200 flex-1 text-right pb-0.5">
                    {formatCurrency(row1Freight).replace(/^[^\d]*/, '')}
                  </span>
                </td>
              </tr>
              {/* Row 2: Transport & Logistics */}
              <tr className="border-b border-slate-200">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-4">
                    <span className="text-slate-600 flex items-center justify-center w-8 h-8 rounded-full border border-slate-300 bg-slate-50"><IconTruck /></span>
                    <span className="font-semibold text-sm">Overall Transport Fee</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-bold text-sm flex items-center justify-between">
                  <span className="text-slate-500 mr-2">NPR</span>
                  <span className="border-b border-slate-200 flex-1 text-right pb-0.5">
                    {formatCurrency(row2Transport).replace(/^[^\d]*/, '')}
                  </span>
                </td>
              </tr>
              {/* Row 3: Packaging */}
              <tr className="border-b border-slate-200">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-4">
                    <span className="text-slate-600 flex items-center justify-center w-8 h-8 rounded-full border border-slate-300 bg-slate-50"><IconPackage /></span>
                    <span className="font-semibold text-sm">Total Packaging & Handling</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-bold text-sm flex items-center justify-between">
                  <span className="text-slate-500 mr-2">NPR</span>
                  <span className="border-b border-slate-200 flex-1 text-right pb-0.5">
                    {formatCurrency(row3Packaging).replace(/^[^\d]*/, '')}
                  </span>
                </td>
              </tr>
              {/* Row 4: Basic Product Cost */}
              <tr className="border-b border-slate-200">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-4">
                    <span className="text-slate-600 flex items-center justify-center w-8 h-8 rounded-full border border-slate-300 bg-slate-50"><IconCart /></span>
                    <span className="font-semibold text-sm">Total Product Cost</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-bold text-sm flex items-center justify-between">
                  <span className="text-slate-500 mr-2">NPR</span>
                  <span className="border-b border-slate-200 flex-1 text-right pb-0.5">
                    {formatCurrency(row4Product).replace(/^[^\d]*/, '')}
                  </span>
                </td>
              </tr>
              {/* Row 5: Customs & Others */}
              <tr className="border-b border-slate-200">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-4">
                    <span className="text-slate-600 flex items-center justify-center w-8 h-8 rounded-full border border-slate-300 bg-slate-50"><IconPackage /></span>
                    <span className="font-semibold text-sm">Customs, Duties, Banking & Misc</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-bold text-sm flex items-center justify-between">
                  <span className="text-slate-500 mr-2">NPR</span>
                  <span className="border-b border-slate-200 flex-1 text-right pb-0.5">
                    {formatCurrency(row5CustomsMisc).replace(/^[^\d]*/, '')}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ═══════════ TOTALS TABLE ═══════════ */}
        <div className="px-10 mt-4 mb-2">
          <div className="flex justify-end">
            <table className="border-collapse" style={{ width: "380px" }}>
              <tbody>
                <tr className="border border-slate-300">
                  <td className="py-2 px-4 text-xs font-black uppercase tracking-wider text-center" style={{ background: "#F1F5F9" }}>
                    TOTAL COSTING
                  </td>
                  <td className="py-2 px-4 text-right text-sm font-bold border border-slate-300 flex justify-between items-center">
                    <span className="text-slate-500 mr-2">NPR</span>
                    <span className="border-b border-slate-200 flex-1 text-right pb-0.5">
                      {formatCurrency(record.total_cost_paisa).replace(/^[^\d]*/, '')}
                    </span>
                  </td>
                </tr>
                <tr className="border border-slate-300">
                  <td className="py-2 px-4 text-xs font-black uppercase tracking-wider text-center" style={{ background: "#F1F5F9" }}>
                    COST PER UNIT
                  </td>
                  <td className="py-2 px-4 text-right text-sm font-bold border border-slate-300 flex justify-between items-center">
                    <span className="text-slate-500 mr-2">NPR</span>
                    <span className="border-b border-slate-200 flex-1 text-right pb-0.5">
                      {formatCurrency(costPerUnit).replace(/^[^\d]*/, '')}
                    </span>
                  </td>
                </tr>
                <tr className="border border-slate-300">
                  <td className="py-2 px-4 text-xs font-black uppercase tracking-wider text-center" style={{ background: "#F1F5F9" }}>
                    PROFIT / BUFFER
                  </td>
                  <td className="py-2 px-4 text-right text-sm font-bold border border-slate-300 flex justify-between items-center">
                    <span className="text-slate-500 mr-2">NPR</span>
                    <span className="border-b border-slate-200 flex-1 text-right pb-0.5">
                      {formatCurrency(contingencyAmount).replace(/^[^\d]*/, '')}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-xs font-black uppercase tracking-wider text-center text-white" style={{ background: navy }}>
                    GRAND TOTAL PAYABLE
                  </td>
                  <td className="py-3 px-4 text-right text-base font-black flex justify-between items-center" style={{ background: navy, color: "white" }}>
                    <span className="mr-2">NPR</span>
                    <span className="border-b border-white/50 flex-1 text-right pb-0.5">
                      {formatCurrency(record.total_cost_paisa).replace(/^[^\d]*/, '')}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ═══════════ SIGNATURES (matches reference exactly) ═══════════ */}
        <div className="px-10 mt-auto pt-8 pb-6">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs font-bold mb-1">Prepared By:</p>
              <div className="w-48 border-b border-black mt-10"></div>
              <p className="text-[10px] text-slate-500 mt-1">(Authorized Signature)</p>
            </div>
            <div>
              <p className="text-xs font-bold mb-1">Company Stamp:</p>
              <div className="w-48 h-20 border border-slate-300 rounded"></div>
            </div>
          </div>
        </div>

        {/* ═══════════ FOOTER STRIPE ═══════════ */}
        <div className="h-3 w-full" style={{ background: `linear-gradient(90deg, ${navy} 0%, ${navy} 50%, ${orange} 50%, ${orange} 100%)` }}></div>
      </div>
    </div>
  );
}
