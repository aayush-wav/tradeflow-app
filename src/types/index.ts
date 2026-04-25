export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface CompanyProfile {
  id: string;
  company_name: string;
  owner_name: string;
  pan_number: string;
  vat_number: string;
  registration_number: string;
  phone_primary: string;
  phone_secondary: string | null;
  email: string;
  website: string | null;
  street: string;
  ward_no: string;
  municipality: string;
  district: string;
  province: string;
  logo_base64: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_name: string | null;
  bank_branch: string | null;
  swift_code: string | null;
  default_currency: string;
  fiscal_year_start_month: number;
  terms_and_conditions: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  product_id: string;
  name: string;
  category: string;
  hs_code: string;
  unit_of_measure: string;
  country_of_origin: string;
  description: string | null;
  current_stock: number;
  reorder_level: number;
  buying_price_paisa: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryTransaction {
  id: string;
  product_id: string;
  transaction_type: string;
  quantity_in: number;
  quantity_out: number;
  reference: string | null;
  notes: string | null;
  transaction_date: string;
  created_at: string;
}

export interface Party {
  id: string;
  party_type: string;
  company_name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  fax: string | null;
  country: string;
  address: string | null;
  pan_number: string | null;
  payment_terms: string | null;
  default_currency: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_type: string;
  invoice_date: string;
  due_date: string | null;
  party_id: string;
  party_name: string;
  party_address: string | null;
  party_country: string | null;
  party_pan: string | null;
  ship_to_name: string | null;
  ship_to_address: string | null;
  incoterm: string | null;
  port_of_loading: string | null;
  port_of_discharge: string | null;
  country_of_origin: string | null;
  country_of_destination: string | null;
  subtotal_paisa: number;
  freight_paisa: number;
  insurance_paisa: number;
  discount_paisa: number;
  vat_paisa: number;
  grand_total_paisa: number;
  currency: string;
  exchange_rate: number;
  status: string;
  terms_and_conditions: string | null;
  notes: string | null;
  shipment_record_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id: string | null;
  hs_code: string | null;
  description: string;
  quantity: number;
  unit: string;
  unit_price_paisa: number;
  discount_percent: number;
  discount_paisa: number;
  amount_paisa: number;
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount_paisa: number;
  payment_date: string;
  payment_method: string;
  reference: string | null;
  notes: string | null;
  created_at: string;
}

export interface ShipmentRecord {
  id: string;
  name: string;
  product_id: string | null;
  quantity: number;
  unit_buying_price_paisa: number;
  total_product_cost_paisa: number;
  transport_mode: string | null;
  origin: string | null;
  destination: string | null;
  transport_cost_paisa: number;
  loading_unloading_paisa: number;
  packaging_cost_paisa: number;
  fumigation_cost_paisa: number;
  customs_agent_fee_paisa: number;
  export_declaration_fee_paisa: number;
  customs_exam_fee_paisa: number;
  certificate_origin_fee_paisa: number;
  phytosanitary_fee_paisa: number;
  export_permit_fee_paisa: number;
  doc_preparation_paisa: number;
  terminal_handling_paisa: number;
  customs_broker_transit_paisa: number;
  transit_charges_paisa: number;
  storage_demurrage_paisa: number;
  scanner_charges_paisa: number;
  freight_mode: string | null;
  freight_cost_original: number;
  freight_currency: string;
  freight_exchange_rate: number;
  freight_cost_npr_paisa: number;
  freight_insurance_paisa: number;
  bl_awb_charges_paisa: number;
  import_duty_percent: number;
  vat_gst_percent: number;
  customs_clearance_dest_paisa: number;
  last_mile_delivery_paisa: number;
  other_destination_paisa: number;
  lc_charges_paisa: number;
  bank_commission_paisa: number;
  wire_transfer_paisa: number;
  hedging_cost_paisa: number;
  contingency_percent: number;
  total_cost_paisa: number;
  custom_costs_json: string | null;
  incoterm: string | null;
  invoice_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Route {
  id: string;
  name: string;
  border_crossing: string;
  transit_country: string | null;
  freight_mode: string;
  estimated_freight_cost_paisa: number;
  estimated_transit_days: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfitTarget {
  id: string;
  product_id: string;
  target_margin_percent: number;
  target_margin_per_unit_paisa: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_revenue_paisa: number;
  total_expenses_paisa: number;
  invoices_paid: number;
  invoices_unpaid: number;
  invoices_overdue: number;
  low_stock_count: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue_paisa: number;
  invoice_count: number;
}

export interface FinancialStatement {
  total_sales_revenue_paisa: number;
  total_purchases_paisa: number;
  closing_stock_paisa: number;
  cost_of_goods_sold_paisa: number;
  gross_profit_paisa: number;
  total_receivables_paisa: number;
  total_assets_paisa: number;
}

export interface CustomCostItem {
  label: string;
  amount_paisa: number;
}
