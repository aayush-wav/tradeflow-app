import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api";
import { useProfileStore } from "../../stores";
import { PageLoader } from "../../components/shared";
import { formatCurrency, paisaToRupees, numberToWords } from "../../utils";
import { Printer, ArrowLeft } from "lucide-react";
import type { Invoice, InvoiceItem } from "../../types";
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

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, fetchProfile } = useProfileStore();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
    if (id) {
      Promise.all([
        api.getInvoiceById(id),
        api.getInvoiceItems(id)
      ]).then(([inv, its]) => {
        setInvoice(inv);
        setItems(its);
      }).catch(err => {
        console.error(err);
        setErrorMsg(err.message || String(err));
      }).finally(() => setLoading(false));
    }
  }, [id, fetchProfile]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <PageLoader />;
  if (errorMsg) return <div className="p-8 text-red-500 font-bold">Error: {errorMsg}</div>;
  if (!invoice) return <div className="p-8 font-bold">Invoice not found</div>;

  /* Color scheme matching the reference */
  const navy = "#0F1B3D";
  const orange = "#E87722";

  return (
    <div className="max-w-4xl mx-auto pt-6 pb-20 print:py-0 print:my-0">
      <div className="no-print flex items-center justify-between mb-8">
        <button
          onClick={() => navigate("/invoices")}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to List
        </button>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="btn-primary flex items-center gap-2 px-6">
            <Printer size={18} /> Print Invoice
          </button>
        </div>
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

          {/* Right: INVOICE title */}
          <div className="text-right">
            <h2 className="text-5xl font-black uppercase tracking-tight" style={{ color: navy }}>
              INVOICE
            </h2>
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-end gap-2">
                <span className="text-slate-500">Invoice No.</span>
                <span className="font-bold w-40 text-right border-b border-slate-300 pb-0.5">{invoice.invoice_number}</span>
              </div>
              <div className="flex justify-end gap-2">
                <span className="text-slate-500">Date</span>
                <span className="font-bold w-40 text-right border-b border-slate-300 pb-0.5">{invoice.invoice_date}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════ CLIENT DETAILS ═══════════ */}
        <div className="px-10 mt-6">
          <div className="relative border border-[#A6B2D1] rounded p-4 pt-6">
            <div className="absolute -top-3 -left-0.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white rounded-sm" style={{ background: navy }}>
              CLIENT DETAILS
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-y-1.5 text-sm">
              <span className="font-bold">Client Name</span>
              <span className="flex items-center gap-2">: <span className="font-semibold border-b border-slate-200 flex-1 pb-0.5 pl-2">{invoice.party_name}</span></span>
              <span className="font-bold">Address</span>
              <span className="flex items-center gap-2">: <span className="border-b border-slate-200 flex-1 pb-0.5 pl-2">{invoice.party_address || "—"}</span></span>
              <span></span>
              <span className="flex items-center gap-2">  <span className="border-b border-slate-200 flex-1 pb-0.5 pl-2">{invoice.party_country || ""}</span></span>
              <span className="font-bold">Contact</span>
              <span className="flex items-center gap-2">: <span className="border-b border-slate-200 flex-1 pb-0.5 pl-2">{invoice.party_pan || "—"}</span></span>
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
                <span>: <span className="border-b border-slate-200 inline-block min-w-[140px] pb-0.5 pl-2">{invoice.port_of_loading || "—"}</span></span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold w-24">Weight</span>
                <span>: <span className="border-b border-slate-200 inline-block min-w-[100px] pb-0.5 pl-2">{invoice.weight_kg ? `${invoice.weight_kg}` : "—"}</span> kg</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold w-24">Destination</span>
                <span>: <span className="border-b border-slate-200 inline-block min-w-[140px] pb-0.5 pl-2">{invoice.port_of_discharge || "—"}</span></span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold w-24">No. of Cartons</span>
                <span>: <span className="border-b border-slate-200 inline-block min-w-[100px] pb-0.5 pl-2">{invoice.no_of_cartons || "—"}</span></span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold w-24">Mode</span>
                <span>: 
                  <label className="inline-flex items-center gap-1 ml-2">
                    <input type="checkbox" checked={invoice.transport_mode === "Air"} readOnly className="rounded border-slate-400" /> Air
                  </label>
                  <label className="inline-flex items-center gap-1 ml-3">
                    <input type="checkbox" checked={invoice.transport_mode === "Sea"} readOnly className="rounded border-slate-400" /> Sea
                  </label>
                  <label className="inline-flex items-center gap-1 ml-3">
                    <input type="checkbox" checked={invoice.transport_mode === "Truck" || invoice.transport_mode === "Road"} readOnly className="rounded border-slate-400" /> Road
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
                <th className="py-2.5 px-4 text-right text-xs font-black uppercase tracking-widest text-white" style={{ background: navy }}>
                  Amount ({invoice.currency})
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-200">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-4">
                      <span className="text-slate-600 flex items-center justify-center w-8 h-8 rounded-full border border-slate-300 bg-slate-50">
                        {idx === 0 ? <IconPlane /> : idx === 1 ? <IconTruck /> : idx === 2 ? <IconPackage /> : <IconCart />}
                      </span>
                      <div>
                        <span className="font-semibold text-sm">{item.description}</span>
                        {item.hs_code && <span className="text-[10px] text-slate-400 ml-2 font-mono">HS: {item.hs_code}</span>}
                        <span className="text-xs text-slate-400 ml-2">({item.quantity} {item.unit} × {formatCurrency(item.unit_price_paisa, invoice.currency)})</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-sm">
                    {invoice.currency} <span className="border-b border-slate-200 inline-block min-w-[120px] text-right pb-0.5">{formatCurrency(item.amount_paisa, invoice.currency).replace(/^[^\d]*/, '')}</span>
                  </td>
                </tr>
              ))}
              {/* Empty rows to fill space */}
              {[...Array(Math.max(0, 4 - items.length))].map((_, i) => (
                <tr key={`empty-${i}`} className="border-b border-slate-100 h-12">
                  <td></td><td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ═══════════ TOTALS TABLE ═══════════ */}
        <div className="px-10 mt-4 mb-2">
          <div className="flex justify-end">
            <table className="border-collapse" style={{ width: "340px" }}>
              <tbody>
                <tr className="border border-slate-300">
                  <td className="py-2 px-4 text-xs font-black uppercase tracking-wider text-center text-white" style={{ background: navy }}>
                    Total Costing
                  </td>
                  <td className="py-2 px-4 text-right text-sm font-bold border border-slate-300">
                    {invoice.currency} <span className="border-b border-slate-200 inline-block min-w-[100px] text-right pb-0.5">{formatCurrency(invoice.subtotal_paisa, invoice.currency).replace(/^[^\d]*/, '')}</span>
                  </td>
                </tr>
                {invoice.freight_paisa > 0 && (
                  <tr className="border border-slate-300">
                    <td className="py-2 px-4 text-xs font-black uppercase tracking-wider text-center text-white" style={{ background: navy }}>
                      Freight
                    </td>
                    <td className="py-2 px-4 text-right text-sm font-bold border border-slate-300">
                      {invoice.currency} {formatCurrency(invoice.freight_paisa, invoice.currency).replace(/^[^\d]*/, '')}
                    </td>
                  </tr>
                )}
                {invoice.discount_paisa > 0 && (
                  <tr className="border border-slate-300">
                    <td className="py-2 px-4 text-xs font-black uppercase tracking-wider text-center text-white" style={{ background: navy }}>
                      Discount
                    </td>
                    <td className="py-2 px-4 text-right text-sm font-bold border border-slate-300 text-red-600">
                      -{invoice.currency} {formatCurrency(invoice.discount_paisa, invoice.currency).replace(/^[^\d]*/, '')}
                    </td>
                  </tr>
                )}
                {invoice.vat_paisa > 0 && (
                  <tr className="border border-slate-300">
                    <td className="py-2 px-4 text-xs font-black uppercase tracking-wider text-center text-white" style={{ background: navy }}>
                      VAT (13%)
                    </td>
                    <td className="py-2 px-4 text-right text-sm font-bold border border-slate-300">
                      {invoice.currency} {formatCurrency(invoice.vat_paisa, invoice.currency).replace(/^[^\d]*/, '')}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="py-3 px-4 text-xs font-black uppercase tracking-wider text-center text-white" style={{ background: orange }}>
                    Grand Total Payable
                  </td>
                  <td className="py-3 px-4 text-right text-base font-black" style={{ background: orange, color: "white" }}>
                    {invoice.currency} {formatCurrency(invoice.grand_total_paisa, invoice.currency).replace(/^[^\d]*/, '')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ═══════════ TOTAL IN WORDS ═══════════ */}
        <div className="px-10 mt-2 mb-6">
          <p className="text-xs italic text-slate-500">
            <span className="font-bold">In Words:</span> {numberToWords(paisaToRupees(invoice.grand_total_paisa))} {invoice.currency} Only.
          </p>
        </div>

        {/* ═══════════ BANK DETAILS ═══════════ */}
        {profile?.bank_name && (
          <div className="px-10 mb-4">
            <div className="border border-slate-200 rounded p-3 bg-slate-50 text-xs">
              <h4 className="font-black uppercase tracking-wider text-[10px] mb-2" style={{ color: navy }}>Bank Details for Wire Transfer</h4>
              <div className="grid grid-cols-2 gap-x-8 gap-y-0.5">
                <span><span className="font-bold">Bank:</span> {profile.bank_name}</span>
                <span><span className="font-bold">A/C No:</span> <span className="font-mono">{profile.bank_account_number}</span></span>
                <span><span className="font-bold">A/C Name:</span> {profile.bank_account_name}</span>
                <span><span className="font-bold">SWIFT:</span> <span className="font-mono">{profile.swift_code || "N/A"}</span></span>
                {profile.bank_branch && <span><span className="font-bold">Branch:</span> {profile.bank_branch}</span>}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ TERMS ═══════════ */}
        {invoice.terms_and_conditions && (
          <div className="px-10 mb-4">
            <p className="text-[10px] text-slate-400 whitespace-pre-wrap leading-relaxed">
              <span className="font-bold uppercase text-slate-500">Terms:</span> {invoice.terms_and_conditions}
            </p>
          </div>
        )}

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
