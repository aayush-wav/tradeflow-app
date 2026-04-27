import { useEffect, useState } from "react";
import { useProfileStore, useUIStore } from "../../stores";
import { PageHeader, PageLoader, Toast } from "../../components/shared";
import { CURRENCIES, PROVINCES_NEPAL, FISCAL_YEAR_START_MONTH } from "../../constants";
import { Save, Building2, Globe, Phone, Mail, MapPin, Upload, FileText, Moon, Sun, Monitor, Database } from "lucide-react";
import type { CompanyProfile } from "../../types";

export function SettingsPage() {
  const { profile, isLoading, fetchProfile, saveProfile } = useProfileStore();
  const { theme, setTheme } = useUIStore();
  const [editing, setEditing] = useState<Partial<CompanyProfile> | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchProfile().then(() => {
        // fetchProfile updates the store, we wait for profile in the next effect
    });
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setEditing({ ...profile });
    } else {
        setEditing({
            company_name: "",
            owner_name: "",
            pan_number: "",
            vat_number: "",
            registration_number: "",
            phone_primary: "",
            phone_secondary: "",
            email: "",
            website: "",
            street: "",
            ward_no: "",
            municipality: "",
            district: "",
            province: "Bagmati",
            bank_name: "",
            bank_account_number: "",
            bank_account_name: "",
            bank_branch: "",
            swift_code: "",
            default_currency: "NPR",
            fiscal_year_start_month: FISCAL_YEAR_START_MONTH,
            terms_and_conditions: "",
        });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.company_name) return;
    setSaving(true);
    try {
      await saveProfile(editing as CompanyProfile);
      setToast({ message: "Settings saved successfully", type: "success" });
    } catch (err: any) {
      setToast({ message: err.message || "Failed to save settings", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'image/png') {
        setToast({ message: "Only PNG files with transparent background are accepted.", type: "error" });
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setEditing({ ...editing, logo_base64: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading && !editing) return <PageLoader />;

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Settings"
        subtitle="Manage your company profile and business preferences"
      />

      <form onSubmit={handleSave} className="space-y-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold border-b border-slate-100 pb-2">
            <Building2 size={18} />
            <h3>Company Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="md:col-span-2 flex items-center gap-6 mb-4">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-lg bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                        {editing?.logo_base64 ? (
                            <img src={editing.logo_base64} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                            <Upload className="text-slate-400" />
                        )}
                    </div>
                    <label className="absolute inset-0 cursor-pointer opacity-0 group-hover:opacity-100 bg-black/40 flex items-center justify-center text-white text-xs font-medium transition-opacity rounded-lg">
                        Change Logo
                        <input type="file" className="hidden" accept="image/png" onChange={handleLogoUpload} />
                    </label>
                </div>
                <div>
                     <p className="text-sm font-medium text-slate-900">Company Logo</p>
                     <p className="text-xs text-slate-500 mt-1">PNG only with transparent background. Logo will appear on all invoices and reports.</p>
                </div>
             </div>

            <Field label="Company Name" value={editing?.company_name} onChange={(v) => setEditing({...editing, company_name: v})} required />
            <Field label="Owner / Authorized Signatory" value={editing?.owner_name} onChange={(v) => setEditing({...editing, owner_name: v})} required />
            <Field label="PAN Number" value={editing?.pan_number} onChange={(v) => setEditing({...editing, pan_number: v})} required />
            <Field label="VAT Number" value={editing?.vat_number} onChange={(v) => setEditing({...editing, vat_number: v})} required />
            <Field label="Registration Number" value={editing?.registration_number} onChange={(v) => setEditing({...editing, registration_number: v})} required />
            <div />
            <Field label="Email Address" value={editing?.email} onChange={(v) => setEditing({...editing, email: v})} icon={<Mail size={14}/>} required />
            <Field label="Website (optional)" value={editing?.website || ""} onChange={(v) => setEditing({...editing, website: v})} icon={<Globe size={14}/>} />
            <Field label="Primary Phone" value={editing?.phone_primary} onChange={(v) => setEditing({...editing, phone_primary: v})} icon={<Phone size={14}/>} required />
            <Field label="Secondary Phone (optional)" value={editing?.phone_secondary || ""} onChange={(v) => setEditing({...editing, phone_secondary: v})} icon={<Phone size={14}/>} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold border-b border-slate-100 pb-2">
            <MapPin size={18} />
            <h3>Business Address</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="md:col-span-2">
                <Field label="Street / Ward" value={editing?.street} onChange={(v) => setEditing({...editing, street: v})} required />
             </div>
             <Field label="Ward No." value={editing?.ward_no} onChange={(v) => setEditing({...editing, ward_no: v})} required />
             <Field label="Municipality / VDC" value={editing?.municipality} onChange={(v) => setEditing({...editing, municipality: v})} required />
             <Field label="District" value={editing?.district} onChange={(v) => setEditing({...editing, district: v})} required />
             <div>
                <label className="label-text">Province</label>
                <select
                    className="select-field"
                    value={editing?.province || ""}
                    onChange={(e) => setEditing({...editing, province: e.target.value})}
                >
                    {PROVINCES_NEPAL.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
             </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold border-b border-slate-100 pb-2">
            <Building2 size={18} />
            <h3>Banking Details (For Invoices)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Bank Name" value={editing?.bank_name || ""} onChange={(v) => setEditing({...editing, bank_name: v})} />
            <Field label="Bank Branch" value={editing?.bank_branch || ""} onChange={(v) => setEditing({...editing, bank_branch: v})} />
            <Field label="Account Holder Name" value={editing?.bank_account_name || ""} onChange={(v) => setEditing({...editing, bank_account_name: v})} />
            <Field label="Account Number" value={editing?.bank_account_number || ""} onChange={(v) => setEditing({...editing, bank_account_number: v})} />
            <Field label="SWIFT / BIC Code" value={editing?.swift_code || ""} onChange={(v) => setEditing({...editing, swift_code: v})} />
            <div>
                <label className="label-text">Default Currency</label>
                <select
                    className="select-field"
                    value={editing?.default_currency || "NPR"}
                    onChange={(e) => setEditing({...editing, default_currency: e.target.value})}
                >
                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
                </select>
            </div>
          </div>
        </div>

        <div className="card">
            <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold border-b border-slate-100 pb-2">
                <FileText size={18} />
                <h3>Default Terms & Conditions</h3>
            </div>
            <textarea
                className="input-field"
                rows={4}
                value={editing?.terms_and_conditions || ""}
                onChange={(e) => setEditing({...editing, terms_and_conditions: e.target.value})}
                placeholder="Enter default terms and conditions that will appear on your invoices..."
            />
        </div>



        <div className="card">
            <div className="flex items-center gap-2 mb-4 text-slate-800 dark:text-white font-semibold border-b border-slate-100 dark:border-slate-800 pb-2">
                <Moon size={18} />
                <h3>Appearance & Theme</h3>
            </div>
            <p className="text-sm text-slate-500 mb-4">Choose how TradeFlow looks on your computer.</p>
            <div className="grid grid-cols-3 gap-4">
                <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === "light" ? "border-brand-500 bg-brand-50 text-brand-700" : "border-transparent bg-slate-50 dark:bg-slate-900 text-slate-600"}`}
                >
                    <Sun size={24} />
                    <span className="text-sm font-medium">Light Mode</span>
                </button>
                <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === "dark" ? "border-brand-500 bg-slate-800 text-white" : "border-transparent bg-slate-50 dark:bg-slate-900 text-slate-600"}`}
                >
                    <Moon size={24} />
                    <span className="text-sm font-medium">Dark Mode</span>
                </button>
                <button
                    type="button"
                    onClick={() => setTheme("system")}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === "system" ? "border-brand-500 bg-slate-100 text-slate-900" : "border-transparent bg-slate-50 dark:bg-slate-900 text-slate-600"}`}
                >
                    <Monitor size={24} />
                    <span className="text-sm font-medium">System Preference</span>
                </button>
            </div>
        </div>

        <div className="flex items-center justify-between sticky bottom-0 bg-slate-50 py-4 border-t border-slate-200">
           <p className="text-slate-500 text-xs italic">All data is stored locally on this machine.</p>
           <button
             type="submit"
             disabled={saving}
             className="btn-primary flex items-center gap-2 shadow-lg"
           >
             <Save size={18} /> {saving ? "Saving..." : "Save Settings"}
           </button>
        </div>
      </form>

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

function Field({ label, value, onChange, required, icon }: { label: string, value: string | undefined, onChange: (v: string) => void, required?: boolean, icon?: React.ReactNode }) {
    return (
        <div>
            <label className="label-text">{label} {required && <span className="text-red-500">*</span>}</label>
            <div className="relative">
                {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
                <input
                    className={`input-field ${icon ? 'pl-9' : ''}`}
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    required={required}
                />
            </div>
        </div>
    )
}


