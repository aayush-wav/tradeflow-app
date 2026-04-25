use rusqlite::{Connection, Result, params};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;
use bcrypt::{hash, verify, DEFAULT_COST};
use uuid::Uuid;
use chrono::Utc;

pub struct DbState(pub Mutex<Connection>);

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub email: String,
    pub password_hash: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CompanyProfile {
    pub id: String,
    pub company_name: String,
    pub owner_name: String,
    pub pan_number: String,
    pub vat_number: String,
    pub registration_number: String,
    pub phone_primary: String,
    pub phone_secondary: Option<String>,
    pub email: String,
    pub website: Option<String>,
    pub street: String,
    pub ward_no: String,
    pub municipality: String,
    pub district: String,
    pub province: String,
    pub logo_base64: Option<String>,
    pub bank_name: Option<String>,
    pub bank_account_number: Option<String>,
    pub bank_account_name: Option<String>,
    pub bank_branch: Option<String>,
    pub swift_code: Option<String>,
    pub default_currency: String,
    pub fiscal_year_start_month: i32,
    pub terms_and_conditions: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Product {
    pub id: String,
    pub product_id: String,
    pub name: String,
    pub category: String,
    pub hs_code: String,
    pub unit_of_measure: String,
    pub country_of_origin: String,
    pub description: Option<String>,
    pub current_stock: i64,
    pub reorder_level: i64,
    pub buying_price_paisa: i64,
    pub selling_price_paisa: i64,
    pub status: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InventoryTransaction {
    pub id: String,
    pub product_id: String,
    pub transaction_type: String,
    pub quantity_in: i64,
    pub quantity_out: i64,
    pub reference: Option<String>,
    pub notes: Option<String>,
    pub transaction_date: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Party {
    pub id: String,
    pub party_type: String,
    pub company_name: String,
    pub contact_person: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub fax: Option<String>,
    pub country: String,
    pub address: Option<String>,
    pub pan_number: Option<String>,
    pub payment_terms: Option<String>,
    pub default_currency: String,
    pub notes: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Invoice {
    pub id: String,
    pub invoice_number: String,
    pub invoice_type: String,
    pub invoice_date: String,
    pub due_date: Option<String>,
    pub party_id: String,
    pub party_name: String,
    pub party_address: Option<String>,
    pub party_country: Option<String>,
    pub party_pan: Option<String>,
    pub ship_to_name: Option<String>,
    pub ship_to_address: Option<String>,
    pub incoterm: Option<String>,
    pub port_of_loading: Option<String>,
    pub port_of_discharge: Option<String>,
    pub country_of_origin: Option<String>,
    pub country_of_destination: Option<String>,
    pub subtotal_paisa: i64,
    pub freight_paisa: i64,
    pub insurance_paisa: i64,
    pub discount_paisa: i64,
    pub vat_paisa: i64,
    pub grand_total_paisa: i64,
    pub currency: String,
    pub exchange_rate: f64,
    pub status: String,
    pub terms_and_conditions: Option<String>,
    pub notes: Option<String>,
    pub shipment_record_id: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InvoiceItem {
    pub id: String,
    pub invoice_id: String,
    pub product_id: Option<String>,
    pub hs_code: Option<String>,
    pub description: String,
    pub quantity: f64,
    pub unit: String,
    pub unit_price_paisa: i64,
    pub discount_percent: f64,
    pub discount_paisa: i64,
    pub amount_paisa: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Payment {
    pub id: String,
    pub invoice_id: String,
    pub amount_paisa: i64,
    pub payment_date: String,
    pub payment_method: String,
    pub reference: Option<String>,
    pub notes: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ShipmentRecord {
    pub id: String,
    pub name: String,
    pub product_id: Option<String>,
    pub quantity: f64,
    pub unit_buying_price_paisa: i64,
    pub total_product_cost_paisa: i64,
    pub transport_mode: Option<String>,
    pub origin: Option<String>,
    pub destination: Option<String>,
    pub transport_cost_paisa: i64,
    pub loading_unloading_paisa: i64,
    pub packaging_cost_paisa: i64,
    pub fumigation_cost_paisa: i64,
    pub customs_agent_fee_paisa: i64,
    pub export_declaration_fee_paisa: i64,
    pub customs_exam_fee_paisa: i64,
    pub certificate_origin_fee_paisa: i64,
    pub phytosanitary_fee_paisa: i64,
    pub export_permit_fee_paisa: i64,
    pub doc_preparation_paisa: i64,
    pub terminal_handling_paisa: i64,
    pub customs_broker_transit_paisa: i64,
    pub transit_charges_paisa: i64,
    pub storage_demurrage_paisa: i64,
    pub scanner_charges_paisa: i64,
    pub freight_mode: Option<String>,
    pub freight_cost_original: i64,
    pub freight_currency: String,
    pub freight_exchange_rate: f64,
    pub freight_cost_npr_paisa: i64,
    pub freight_insurance_paisa: i64,
    pub bl_awb_charges_paisa: i64,
    pub import_duty_percent: f64,
    pub vat_gst_percent: f64,
    pub customs_clearance_dest_paisa: i64,
    pub last_mile_delivery_paisa: i64,
    pub other_destination_paisa: i64,
    pub lc_charges_paisa: i64,
    pub bank_commission_paisa: i64,
    pub wire_transfer_paisa: i64,
    pub hedging_cost_paisa: i64,
    pub contingency_percent: f64,
    pub total_cost_paisa: i64,
    pub custom_costs_json: Option<String>,
    pub incoterm: Option<String>,
    pub invoice_id: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Route {
    pub id: String,
    pub name: String,
    pub border_crossing: String,
    pub transit_country: Option<String>,
    pub freight_mode: String,
    pub estimated_freight_cost_paisa: i64,
    pub estimated_transit_days: i32,
    pub notes: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProfitTarget {
    pub id: String,
    pub product_id: String,
    pub target_margin_percent: f64,
    pub target_margin_per_unit_paisa: Option<i64>,
    pub notes: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

pub fn run_migrations(conn: &Connection) -> Result<()> {
    conn.execute_batch("PRAGMA journal_mode=WAL;")?;
    conn.execute_batch("PRAGMA foreign_keys=ON;")?;

    conn.execute_batch("
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS company_profile (
            id TEXT PRIMARY KEY NOT NULL,
            company_name TEXT NOT NULL,
            owner_name TEXT NOT NULL,
            pan_number TEXT NOT NULL,
            vat_number TEXT NOT NULL,
            registration_number TEXT NOT NULL,
            phone_primary TEXT NOT NULL,
            phone_secondary TEXT,
            email TEXT NOT NULL,
            website TEXT,
            street TEXT NOT NULL,
            ward_no TEXT NOT NULL,
            municipality TEXT NOT NULL,
            district TEXT NOT NULL,
            province TEXT NOT NULL,
            logo_base64 TEXT,
            bank_name TEXT,
            bank_account_number TEXT,
            bank_account_name TEXT,
            bank_branch TEXT,
            swift_code TEXT,
            default_currency TEXT NOT NULL DEFAULT 'NPR',
            fiscal_year_start_month INTEGER NOT NULL DEFAULT 7,
            terms_and_conditions TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY NOT NULL,
            product_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            hs_code TEXT NOT NULL,
            unit_of_measure TEXT NOT NULL,
            country_of_origin TEXT NOT NULL DEFAULT 'Nepal',
            description TEXT,
            current_stock INTEGER NOT NULL DEFAULT 0,
            reorder_level INTEGER NOT NULL DEFAULT 0,
            buying_price_paisa INTEGER NOT NULL DEFAULT 0,
            selling_price_paisa INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'Active',
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
        CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
        CREATE INDEX IF NOT EXISTS idx_products_hs_code ON products(hs_code);
        CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

        CREATE TABLE IF NOT EXISTS inventory_transactions (
            id TEXT PRIMARY KEY NOT NULL,
            product_id TEXT NOT NULL,
            transaction_type TEXT NOT NULL,
            quantity_in INTEGER NOT NULL DEFAULT 0,
            quantity_out INTEGER NOT NULL DEFAULT 0,
            reference TEXT,
            notes TEXT,
            transaction_date TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
        );

        CREATE INDEX IF NOT EXISTS idx_inv_trans_product ON inventory_transactions(product_id);
        CREATE INDEX IF NOT EXISTS idx_inv_trans_date ON inventory_transactions(transaction_date);

        CREATE TABLE IF NOT EXISTS parties (
            id TEXT PRIMARY KEY NOT NULL,
            party_type TEXT NOT NULL,
            company_name TEXT NOT NULL,
            contact_person TEXT,
            email TEXT,
            phone TEXT,
            fax TEXT,
            country TEXT NOT NULL DEFAULT 'Nepal',
            address TEXT,
            pan_number TEXT,
            payment_terms TEXT,
            default_currency TEXT NOT NULL DEFAULT 'NPR',
            notes TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_parties_type ON parties(party_type);
        CREATE INDEX IF NOT EXISTS idx_parties_name ON parties(company_name);

        CREATE TABLE IF NOT EXISTS invoices (
            id TEXT PRIMARY KEY NOT NULL,
            invoice_number TEXT UNIQUE NOT NULL,
            invoice_type TEXT NOT NULL,
            invoice_date TEXT NOT NULL,
            due_date TEXT,
            party_id TEXT NOT NULL,
            party_name TEXT NOT NULL,
            party_address TEXT,
            party_country TEXT,
            party_pan TEXT,
            ship_to_name TEXT,
            ship_to_address TEXT,
            incoterm TEXT,
            port_of_loading TEXT,
            port_of_discharge TEXT,
            country_of_origin TEXT,
            country_of_destination TEXT,
            subtotal_paisa INTEGER NOT NULL DEFAULT 0,
            freight_paisa INTEGER NOT NULL DEFAULT 0,
            insurance_paisa INTEGER NOT NULL DEFAULT 0,
            discount_paisa INTEGER NOT NULL DEFAULT 0,
            vat_paisa INTEGER NOT NULL DEFAULT 0,
            grand_total_paisa INTEGER NOT NULL DEFAULT 0,
            currency TEXT NOT NULL DEFAULT 'NPR',
            exchange_rate REAL NOT NULL DEFAULT 1.0,
            status TEXT NOT NULL DEFAULT 'Draft',
            terms_and_conditions TEXT,
            notes TEXT,
            shipment_record_id TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE RESTRICT
        );

        CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
        CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
        CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
        CREATE INDEX IF NOT EXISTS idx_invoices_party ON invoices(party_id);

        CREATE TABLE IF NOT EXISTS invoice_items (
            id TEXT PRIMARY KEY NOT NULL,
            invoice_id TEXT NOT NULL,
            product_id TEXT,
            hs_code TEXT,
            description TEXT NOT NULL,
            quantity REAL NOT NULL DEFAULT 1,
            unit TEXT NOT NULL DEFAULT 'piece',
            unit_price_paisa INTEGER NOT NULL DEFAULT 0,
            discount_percent REAL NOT NULL DEFAULT 0,
            discount_paisa INTEGER NOT NULL DEFAULT 0,
            amount_paisa INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);

        CREATE TABLE IF NOT EXISTS payments (
            id TEXT PRIMARY KEY NOT NULL,
            invoice_id TEXT NOT NULL,
            amount_paisa INTEGER NOT NULL,
            payment_date TEXT NOT NULL,
            payment_method TEXT NOT NULL DEFAULT 'Bank Transfer',
            reference TEXT,
            notes TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);

        CREATE TABLE IF NOT EXISTS shipment_records (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            product_id TEXT,
            quantity REAL NOT NULL DEFAULT 0,
            unit_buying_price_paisa INTEGER NOT NULL DEFAULT 0,
            total_product_cost_paisa INTEGER NOT NULL DEFAULT 0,
            transport_mode TEXT,
            origin TEXT,
            destination TEXT,
            transport_cost_paisa INTEGER NOT NULL DEFAULT 0,
            loading_unloading_paisa INTEGER NOT NULL DEFAULT 0,
            packaging_cost_paisa INTEGER NOT NULL DEFAULT 0,
            fumigation_cost_paisa INTEGER NOT NULL DEFAULT 0,
            customs_agent_fee_paisa INTEGER NOT NULL DEFAULT 0,
            export_declaration_fee_paisa INTEGER NOT NULL DEFAULT 0,
            customs_exam_fee_paisa INTEGER NOT NULL DEFAULT 0,
            certificate_origin_fee_paisa INTEGER NOT NULL DEFAULT 0,
            phytosanitary_fee_paisa INTEGER NOT NULL DEFAULT 0,
            export_permit_fee_paisa INTEGER NOT NULL DEFAULT 0,
            doc_preparation_paisa INTEGER NOT NULL DEFAULT 0,
            terminal_handling_paisa INTEGER NOT NULL DEFAULT 0,
            customs_broker_transit_paisa INTEGER NOT NULL DEFAULT 0,
            transit_charges_paisa INTEGER NOT NULL DEFAULT 0,
            storage_demurrage_paisa INTEGER NOT NULL DEFAULT 0,
            scanner_charges_paisa INTEGER NOT NULL DEFAULT 0,
            freight_mode TEXT,
            freight_cost_original INTEGER NOT NULL DEFAULT 0,
            freight_currency TEXT NOT NULL DEFAULT 'NPR',
            freight_exchange_rate REAL NOT NULL DEFAULT 1.0,
            freight_cost_npr_paisa INTEGER NOT NULL DEFAULT 0,
            freight_insurance_paisa INTEGER NOT NULL DEFAULT 0,
            bl_awb_charges_paisa INTEGER NOT NULL DEFAULT 0,
            import_duty_percent REAL NOT NULL DEFAULT 0,
            vat_gst_percent REAL NOT NULL DEFAULT 0,
            customs_clearance_dest_paisa INTEGER NOT NULL DEFAULT 0,
            last_mile_delivery_paisa INTEGER NOT NULL DEFAULT 0,
            other_destination_paisa INTEGER NOT NULL DEFAULT 0,
            lc_charges_paisa INTEGER NOT NULL DEFAULT 0,
            bank_commission_paisa INTEGER NOT NULL DEFAULT 0,
            wire_transfer_paisa INTEGER NOT NULL DEFAULT 0,
            hedging_cost_paisa INTEGER NOT NULL DEFAULT 0,
            contingency_percent REAL NOT NULL DEFAULT 0,
            total_cost_paisa INTEGER NOT NULL DEFAULT 0,
            custom_costs_json TEXT,
            incoterm TEXT,
            invoice_id TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS routes (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            border_crossing TEXT NOT NULL,
            transit_country TEXT,
            freight_mode TEXT NOT NULL,
            estimated_freight_cost_paisa INTEGER NOT NULL DEFAULT 0,
            estimated_transit_days INTEGER NOT NULL DEFAULT 0,
            notes TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS profit_targets (
            id TEXT PRIMARY KEY NOT NULL,
            product_id TEXT NOT NULL,
            target_margin_percent REAL NOT NULL DEFAULT 0,
            target_margin_per_unit_paisa INTEGER,
            notes TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS custom_cost_labels (
            id TEXT PRIMARY KEY NOT NULL,
            shipment_record_id TEXT NOT NULL,
            label TEXT NOT NULL,
            amount_paisa INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (shipment_record_id) REFERENCES shipment_records(id) ON DELETE CASCADE
        );
    ")?;

    Ok(())
}

pub fn open_db() -> Result<Connection> {
    let db_path = get_db_path();
    let conn = Connection::open(&db_path)?;
    run_migrations(&conn)?;
    Ok(conn)
}

fn get_db_path() -> std::path::PathBuf {
    let data_dir = dirs::data_local_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("."));
    let app_dir = data_dir.join("TradeFlowNepal");
    std::fs::create_dir_all(&app_dir).ok();
    app_dir.join("tradeflow.db")
}
