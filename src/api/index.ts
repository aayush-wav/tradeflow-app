import { invoke } from "@tauri-apps/api/core";
import type {
  ApiResponse,
  CompanyProfile,
  Product,
  InventoryTransaction,
  Party,
  Invoice,
  InvoiceItem,
  Payment,
  ShipmentRecord,
  Route,
  ProfitTarget,
  DashboardStats,
  MonthlyRevenue,
  ForexSnapshot,
  HsTariffCode,
  LandedCostCalc,
  BankTransaction,
  ProductionRecord,
} from "../types";

async function call<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  const response = await invoke<ApiResponse<T>>(cmd, args);
  if (!response.success || response.data === null) {
    throw new Error(response.error || "Unknown error");
  }
  return response.data;
}

export const api = {
  signup: (email: string, password: string) =>
    call<string>("signup", { email, password }),

  login: (email: string, password: string) =>
    call<string>("login", { email, password }),

  hasAccount: () => call<boolean>("has_account"),

  saveCompanyProfile: (profile: CompanyProfile) =>
    call<string>("save_company_profile", { profile }),

  getCompanyProfile: () => call<CompanyProfile>("get_company_profile"),

  createProduct: (product: Product) =>
    call<string>("create_product", { product }),

  updateProduct: (product: Product) =>
    call<string>("update_product", { product }),

  getProducts: () => call<Product[]>("get_products"),

  deleteProduct: (id: string) => call<boolean>("delete_product", { id }),

  addInventoryTransaction: (tx: InventoryTransaction) =>
    call<string>("add_inventory_transaction", { tx }),

  getInventoryTransactions: (productId: string) =>
    call<InventoryTransaction[]>("get_inventory_transactions", {
      productId,
    }),

  createParty: (party: Party) => call<string>("create_party", { party }),

  updateParty: (party: Party) => call<string>("update_party", { party }),

  getParties: (partyType?: string) =>
    call<Party[]>("get_parties", { partyType: partyType || null }),

  deleteParty: (id: string) => call<boolean>("delete_party", { id }),

  createInvoice: (invoice: Invoice, items: InvoiceItem[]) =>
    call<string>("create_invoice", { invoice, items }),

  getInvoices: () => call<Invoice[]>("get_invoices"),

  getInvoiceById: (id: string) => call<Invoice>("get_invoice_by_id", { id }),

  getInvoiceItems: (invoiceId: string) =>
    call<InvoiceItem[]>("get_invoice_items", { invoiceId }),

  updateInvoiceStatus: (id: string, status: string) =>
    call<boolean>("update_invoice_status", { id, status }),

  getNextInvoiceNumber: (prefix: string) =>
    call<string>("get_next_invoice_number", { prefix }),

  recordPayment: (payment: Payment) =>
    call<string>("record_payment", { payment }),

  getPayments: (invoiceId: string) =>
    call<Payment[]>("get_payments", { invoiceId }),

  saveShipmentRecord: (record: ShipmentRecord) =>
    call<string>("save_shipment_record", { record }),

  getShipmentRecords: () => call<ShipmentRecord[]>("get_shipment_records"),

  deleteShipmentRecord: (id: string) =>
    call<boolean>("delete_shipment_record", { id }),

  saveRoute: (route: Route) => call<string>("save_route", { route }),

  getRoutes: () => call<Route[]>("get_routes"),

  deleteRoute: (id: string) => call<boolean>("delete_route", { id }),

  saveProfitTarget: (target: ProfitTarget) =>
    call<string>("save_profit_target", { target }),

  getProfitTargets: () => call<ProfitTarget[]>("get_profit_targets"),

  getDashboardStats: () => call<DashboardStats>("get_dashboard_stats"),

  getMonthlyRevenue: () => call<MonthlyRevenue[]>("get_monthly_revenue"),
  seedDemoData: () => call<boolean>("seed_demo_data"),

  // ========== FOREX & LANDED COST ==========
  fetchNrbForexRates: () => call<ForexSnapshot>("fetch_nrb_forex_rates"),
  getCachedForexRates: () => call<ForexSnapshot>("get_cached_forex_rates"),
  searchHsCodes: (query: string) => call<HsTariffCode[]>("search_hs_codes", { query }),
  getAllHsCategories: () => call<string[]>("get_all_hs_categories"),
  calculateLandedCost: (hsCode: string, cifValue: number, currency: string, exchangeRate: number, quantity: number, save: boolean) =>
    call<LandedCostCalc>("calculate_landed_cost", { hsCode, cifValue, currency, exchangeRate, quantity, save }),
  getLandedCostHistory: () => call<LandedCostCalc[]>("get_landed_cost_history"),

  // ========== BANK & PRODUCTION ==========
  getBankTransactions: () => call<BankTransaction[]>("get_bank_transactions"),
  createBankTransaction: (tx: BankTransaction) => call<string>("create_bank_transaction", { tx }),
  deleteBankTransaction: (id: string) => call<boolean>("delete_bank_transaction", { id }),
  getProductionRecords: () => call<ProductionRecord[]>("get_production_records"),
  createProductionRecord: (record: ProductionRecord) => call<string>("create_production_record", { record }),
};
