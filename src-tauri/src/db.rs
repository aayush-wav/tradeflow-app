use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
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
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Product {
    pub id: String,
    pub product_id: Option<String>,
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
    pub total_sold: Option<i64>,
    pub carton_size: Option<i32>,
    pub carton_weight_kg: Option<f64>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
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
    pub created_at: Option<String>,
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
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
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
    pub weight_kg: Option<f64>,
    pub no_of_cartons: Option<i32>,
    pub transport_mode: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
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
    pub created_at: Option<String>,
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
    pub freight_cost_original: f64,
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
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
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
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProfitTarget {
    pub id: String,
    pub product_id: String,
    pub target_margin_percent: f64,
    pub target_margin_per_unit_paisa: Option<i64>,
    pub notes: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ForexRate {
    pub iso3: String,
    pub currency_name: String,
    pub unit: i32,
    pub buy: String,
    pub sell: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ForexSnapshot {
    pub date: String,
    pub rates: Vec<ForexRate>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HsTariffCode {
    pub code: String,
    pub description: String,
    pub customs_duty_pct: f64,
    pub excise_duty_pct: f64,
    pub category: String,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LandedCostCalc {
    pub id: String,
    pub hs_code: String,
    pub description: String,
    pub cif_value: f64,
    pub currency: String,
    pub exchange_rate: f64,
    pub cif_npr: f64,
    pub customs_duty_pct: f64,
    pub customs_duty_npr: f64,
    pub excise_duty_pct: f64,
    pub excise_duty_npr: f64,
    pub vat_pct: f64,
    pub vat_npr: f64,
    pub total_landed_cost_npr: f64,
    pub quantity: f64,
    pub cost_per_unit_npr: f64,
    pub created_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BankTransaction {
    pub id: Option<String>,
    pub bank_name: String,
    pub account_number: String,
    pub transaction_type: String, // Deposit / Withdrawal
    pub amount_paisa: i64,
    pub currency: String,
    pub exchange_rate: f64,
    pub purpose: Option<String>,
    pub party_id: Option<String>,
    pub reference: Option<String>,
    pub transaction_date: String,
    pub created_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProductionRecord {
    pub id: Option<String>,
    pub product_id: String,
    pub quantity: f64,
    pub unit: String,
    pub batch_number: Option<String>,
    pub production_date: String,
    pub expiry_date: Option<String>,
    pub notes: Option<String>,
    pub created_at: Option<String>,
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
            updated_at TEXT NOT NULL DEFAULT (datetime('now')),
            carton_size INTEGER DEFAULT 1,
            carton_weight_kg REAL DEFAULT 0.0
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
            weight_kg REAL,
            no_of_cartons INTEGER,
            transport_mode TEXT,
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
            freight_cost_original REAL NOT NULL DEFAULT 0.0,
            freight_currency TEXT NOT NULL DEFAULT 'USD',
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

        CREATE INDEX IF NOT EXISTS idx_shipment_records_name ON shipment_records(name);

        CREATE TABLE IF NOT EXISTS trade_routes (
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

        CREATE TABLE IF NOT EXISTS forex_rates (
            iso3 TEXT PRIMARY KEY NOT NULL,
            currency_name TEXT NOT NULL,
            unit INTEGER NOT NULL,
            buy TEXT NOT NULL,
            sell TEXT NOT NULL,
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS hs_tariff_codes (
            code TEXT PRIMARY KEY NOT NULL,
            description TEXT NOT NULL,
            customs_duty_pct REAL NOT NULL DEFAULT 0.0,
            excise_duty_pct REAL NOT NULL DEFAULT 0.0,
            category TEXT NOT NULL,
            notes TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS landed_cost_calculations (
            id TEXT PRIMARY KEY NOT NULL,
            hs_code TEXT NOT NULL,
            description TEXT NOT NULL,
            cif_value REAL NOT NULL,
            currency TEXT NOT NULL,
            exchange_rate REAL NOT NULL,
            cif_npr REAL NOT NULL,
            customs_duty_pct REAL NOT NULL,
            customs_duty_npr REAL NOT NULL,
            excise_duty_pct REAL NOT NULL,
            excise_duty_npr REAL NOT NULL,
            vat_pct REAL NOT NULL,
            vat_npr REAL NOT NULL,
            total_landed_cost_npr REAL NOT NULL,
            quantity REAL NOT NULL,
            cost_per_unit_npr REAL NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS bank_transactions (
            id TEXT PRIMARY KEY NOT NULL,
            bank_name TEXT NOT NULL,
            account_number TEXT NOT NULL,
            transaction_type TEXT NOT NULL,
            amount_paisa INTEGER NOT NULL,
            currency TEXT NOT NULL DEFAULT 'NPR',
            exchange_rate REAL NOT NULL DEFAULT 1.0,
            purpose TEXT,
            party_id TEXT,
            reference TEXT,
            transaction_date TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS production_records (
            id TEXT PRIMARY KEY NOT NULL,
            product_id TEXT NOT NULL,
            quantity REAL NOT NULL,
            unit TEXT NOT NULL,
            batch_number TEXT,
            production_date TEXT NOT NULL,
            expiry_date TEXT,
            notes TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
        );

        CREATE INDEX IF NOT EXISTS idx_landed_cost_created ON landed_cost_calculations(created_at);
    ")?;

    // --- MIGRATIONS (Add columns if they don't exist) ---
    // We swallow errors here because ALTER TABLE will fail if the column already exists
    let _ = conn.execute("ALTER TABLE products ADD COLUMN carton_size INTEGER DEFAULT 1", []);
    let _ = conn.execute("ALTER TABLE products ADD COLUMN carton_weight_kg REAL DEFAULT 0.0", []);
    let _ = conn.execute("ALTER TABLE invoices ADD COLUMN weight_kg REAL", []);
    let _ = conn.execute("ALTER TABLE invoices ADD COLUMN no_of_cartons INTEGER", []);
    let _ = conn.execute("ALTER TABLE invoices ADD COLUMN transport_mode TEXT", []);

    seed_hs_codes(conn);

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

fn seed_hs_codes(conn: &Connection) {
    let codes: Vec<(&str, &str, f64, f64, &str, &str)> = vec![
        // Food & Beverages
        ("0409.00", "Natural Honey", 10.0, 0.0, "Food & Beverages", "Preferential rate for SAARC: 5%"),
        ("0901.11", "Coffee (not roasted, not decaffeinated)", 10.0, 0.0, "Food & Beverages", ""),
        ("0901.21", "Coffee (roasted, not decaffeinated)", 15.0, 0.0, "Food & Beverages", ""),
        ("0902.10", "Green Tea (unfermented) up to 3kg", 10.0, 0.0, "Food & Beverages", "Nepal's major export product"),
        ("0902.20", "Green Tea (unfermented) over 3kg", 10.0, 0.0, "Food & Beverages", ""),
        ("0902.30", "Black Tea (fermented) up to 3kg", 10.0, 0.0, "Food & Beverages", ""),
        ("0902.40", "Black Tea (fermented) over 3kg", 10.0, 0.0, "Food & Beverages", ""),
        ("0904.11", "Pepper (not crushed/ground)", 10.0, 0.0, "Food & Beverages", ""),
        ("0910.11", "Ginger (not crushed/ground)", 5.0, 0.0, "Food & Beverages", ""),
        ("0910.30", "Turmeric (Curcuma)", 10.0, 0.0, "Food & Beverages", ""),
        ("1006.30", "Semi-milled or wholly milled Rice", 5.0, 0.0, "Food & Beverages", "Essential commodity"),
        ("1101.00", "Wheat Flour", 5.0, 0.0, "Food & Beverages", "Essential commodity"),
        ("1507.10", "Soybean Oil (crude)", 5.0, 0.0, "Food & Beverages", ""),
        ("1511.10", "Palm Oil (crude)", 5.0, 0.0, "Food & Beverages", "Major import item"),
        ("1701.99", "Refined Sugar", 15.0, 0.0, "Food & Beverages", ""),
        ("2106.90", "Food Preparations NES", 15.0, 0.0, "Food & Beverages", ""),
        ("2202.10", "Mineral/Aerated Waters with Sugar", 30.0, 15.0, "Food & Beverages", "Excise applies"),
        ("2203.00", "Beer made from Malt", 60.0, 80.0, "Food & Beverages", "High duty + excise"),
        ("2208.30", "Whisky", 80.0, 100.0, "Food & Beverages", "Highest duty category"),
        ("2402.20", "Cigarettes containing Tobacco", 80.0, 90.0, "Food & Beverages", "Sin tax category"),
        // Textiles & Clothing
        ("5007.20", "Woven Silk Fabric", 15.0, 0.0, "Textiles & Clothing", ""),
        ("5208.11", "Unbleached Cotton Fabric (plain weave)", 5.0, 0.0, "Textiles & Clothing", ""),
        ("5208.21", "Bleached Cotton Fabric (plain weave)", 10.0, 0.0, "Textiles & Clothing", ""),
        ("5209.11", "Unbleached Cotton Twill Fabric", 5.0, 0.0, "Textiles & Clothing", ""),
        ("5407.10", "Woven Nylon Fabric", 15.0, 0.0, "Textiles & Clothing", ""),
        ("5701.10", "Carpets (hand-knotted, wool/fine hair)", 5.0, 0.0, "Textiles & Clothing", "Major Nepal export"),
        ("5702.20", "Floor Coverings (coconut fibres)", 10.0, 0.0, "Textiles & Clothing", ""),
        ("5801.10", "Woven Pile Fabrics (wool)", 15.0, 0.0, "Textiles & Clothing", ""),
        ("6101.20", "Men's Overcoats (cotton, knit)", 20.0, 0.0, "Textiles & Clothing", ""),
        ("6104.43", "Women's Dresses (synthetic, knit)", 20.0, 0.0, "Textiles & Clothing", ""),
        ("6105.10", "Men's Shirts (cotton, knit)", 20.0, 0.0, "Textiles & Clothing", ""),
        ("6110.20", "Jerseys/Pullovers (cotton, knit)", 20.0, 0.0, "Textiles & Clothing", ""),
        ("6117.10", "Shawls/Scarves (knitted)", 15.0, 0.0, "Textiles & Clothing", "Pashmina export category"),
        ("6214.20", "Shawls/Scarves (wool/fine animal hair)", 15.0, 0.0, "Textiles & Clothing", "Premium Pashmina"),
        // Herbal & Medicinal
        ("1211.90", "Plants for pharmacy/perfumery/insecticide", 5.0, 0.0, "Herbal & Medicinal", "Yarsagumba, Chirata, etc."),
        ("1301.90", "Lac, Natural Gums & Resins", 5.0, 0.0, "Herbal & Medicinal", ""),
        ("1302.19", "Vegetable Saps & Extracts", 10.0, 0.0, "Herbal & Medicinal", ""),
        ("3003.90", "Medicaments (unmixed, not dosed)", 5.0, 0.0, "Herbal & Medicinal", ""),
        ("3004.90", "Medicaments (therapeutic/prophylactic)", 5.0, 0.0, "Herbal & Medicinal", "Essential medicine"),
        // Handicrafts & Art
        ("4421.99", "Articles of Wood NES", 15.0, 0.0, "Handicraft & Art", "Wooden handicrafts"),
        ("6802.99", "Worked Monumental Stone NES", 15.0, 0.0, "Handicraft & Art", "Stone sculptures"),
        ("6913.90", "Statuettes/Ornamental Ceramics", 15.0, 0.0, "Handicraft & Art", ""),
        ("7113.19", "Jewellery of Precious Metal", 15.0, 0.0, "Handicraft & Art", ""),
        ("7117.19", "Imitation Jewellery", 20.0, 0.0, "Handicraft & Art", ""),
        ("9703.00", "Original Sculptures/Statuary", 5.0, 0.0, "Handicraft & Art", "Thangka, Buddha statues"),
        // Electronics & Machinery
        ("8414.80", "Air Pumps/Compressors", 15.0, 0.0, "Electronics & Machinery", ""),
        ("8415.10", "Window/Wall Type Air Conditioners", 30.0, 15.0, "Electronics & Machinery", "Excise on AC"),
        ("8418.10", "Combined Refrigerator-Freezers", 30.0, 0.0, "Electronics & Machinery", ""),
        ("8418.40", "Freezers (upright type)", 30.0, 0.0, "Electronics & Machinery", ""),
        ("8443.32", "Printing Machines (printers)", 5.0, 0.0, "Electronics & Machinery", ""),
        ("8450.11", "Washing Machines (fully auto)", 30.0, 0.0, "Electronics & Machinery", ""),
        ("8471.30", "Laptop Computers", 0.0, 0.0, "Electronics & Machinery", "Duty free for education"),
        ("8471.41", "Desktop Computers", 0.0, 0.0, "Electronics & Machinery", "Duty free for education"),
        ("8504.40", "Static Converters (UPS/inverters)", 15.0, 0.0, "Electronics & Machinery", ""),
        ("8516.10", "Electric Water Heaters", 15.0, 0.0, "Electronics & Machinery", ""),
        ("8517.12", "Smartphones/Mobile Phones", 10.0, 0.0, "Electronics & Machinery", "High import volume"),
        ("8517.62", "Network Equipment (routers/modems)", 5.0, 0.0, "Electronics & Machinery", ""),
        ("8521.90", "Video Recording Apparatus", 15.0, 0.0, "Electronics & Machinery", ""),
        ("8528.72", "Television Sets", 20.0, 0.0, "Electronics & Machinery", ""),
        // Vehicles & Parts
        ("8703.22", "Motor Cars (1000-1500cc)", 80.0, 30.0, "Vehicles & Parts", "Highest duty category"),
        ("8703.23", "Motor Cars (1500-3000cc)", 80.0, 50.0, "Vehicles & Parts", "Extreme duty for large engines"),
        ("8703.24", "Motor Cars (over 3000cc)", 80.0, 80.0, "Vehicles & Parts", "Luxury vehicle penalty"),
        ("8703.80", "Electric Vehicles", 10.0, 5.0, "Vehicles & Parts", "Reduced duty for EVs"),
        ("8711.20", "Motorcycles (50-250cc)", 40.0, 20.0, "Vehicles & Parts", ""),
        ("8711.30", "Motorcycles (250-500cc)", 60.0, 30.0, "Vehicles & Parts", ""),
        ("8711.50", "Electric Motorcycles/Scooters", 10.0, 5.0, "Vehicles & Parts", "Green incentive"),
        ("8708.30", "Brake Parts for Vehicles", 15.0, 0.0, "Vehicles & Parts", ""),
        ("8708.99", "Vehicle Parts NES", 15.0, 0.0, "Vehicles & Parts", ""),
        ("4011.10", "New Pneumatic Rubber Tyres for Cars", 20.0, 0.0, "Vehicles & Parts", ""),
        // Construction & Building
        ("2523.29", "Portland Cement", 15.0, 0.0, "Construction & Building", "Major import item"),
        ("2515.11", "Marble (crude or roughly trimmed)", 15.0, 0.0, "Construction & Building", ""),
        ("6802.23", "Granite (simply cut)", 15.0, 0.0, "Construction & Building", ""),
        ("6907.21", "Ceramic Tiles (water absorption <0.5%)", 30.0, 0.0, "Construction & Building", ""),
        ("6907.23", "Ceramic Tiles (water absorption >10%)", 30.0, 0.0, "Construction & Building", ""),
        ("7005.29", "Float Glass (non-wired)", 15.0, 0.0, "Construction & Building", ""),
        ("7210.41", "Corrugated Galvanized Steel Sheets", 15.0, 0.0, "Construction & Building", ""),
        ("7213.10", "Steel Bars (hot-rolled)", 10.0, 0.0, "Construction & Building", "TMT bars"),
        ("7306.30", "Steel Tubes/Pipes (welded)", 15.0, 0.0, "Construction & Building", ""),
        ("7308.90", "Steel Structures/Parts", 15.0, 0.0, "Construction & Building", ""),
        ("7318.15", "Bolts/Screws (steel)", 15.0, 0.0, "Construction & Building", ""),
        ("7604.10", "Aluminium Bars/Rods", 15.0, 0.0, "Construction & Building", ""),
        ("3917.23", "PVC Pipes (rigid)", 15.0, 0.0, "Construction & Building", ""),
        ("3925.20", "Plastic Doors/Windows/Frames", 20.0, 0.0, "Construction & Building", ""),
        ("6810.11", "Concrete Blocks/Bricks", 15.0, 0.0, "Construction & Building", ""),
        // Petroleum & Energy
        ("2710.12", "Light Petroleum Oils (gasoline)", 15.0, 25.0, "Petroleum & Energy", "Excise on fuel"),
        ("2710.19", "Medium Petroleum Oils (diesel/kerosene)", 15.0, 20.0, "Petroleum & Energy", "Excise on diesel"),
        ("2711.12", "Propane (LPG)", 5.0, 0.0, "Petroleum & Energy", "Essential fuel"),
        ("8541.40", "Solar Cells/Panels", 0.0, 0.0, "Petroleum & Energy", "Duty free - green energy"),
        ("8507.60", "Lithium-ion Batteries", 5.0, 0.0, "Petroleum & Energy", ""),
        // Agriculture & Raw Materials
        ("1001.99", "Wheat (other)", 5.0, 0.0, "Agriculture", "Essential food grain"),
        ("1005.90", "Maize (other than seed)", 5.0, 0.0, "Agriculture", ""),
        ("0713.31", "Dried Beans", 5.0, 0.0, "Agriculture", ""),
        ("0802.32", "Walnuts (shelled)", 10.0, 0.0, "Agriculture", ""),
        ("0808.10", "Apples", 10.0, 0.0, "Agriculture", "Seasonal import"),
        ("0805.10", "Oranges", 10.0, 0.0, "Agriculture", ""),
        ("0803.90", "Bananas", 10.0, 0.0, "Agriculture", ""),
        ("2304.00", "Soybean Oilcake", 5.0, 0.0, "Agriculture", "Animal feed"),
        ("3102.30", "Ammonium Nitrate (fertilizer)", 0.0, 0.0, "Agriculture", "Duty free for agriculture"),
        ("3105.20", "NPK Fertilizers", 0.0, 0.0, "Agriculture", "Duty free"),
        // Cosmetics & Personal Care
        ("3303.00", "Perfumes & Toilet Waters", 30.0, 25.0, "Cosmetics & Personal Care", "Luxury excise"),
        ("3304.10", "Lip Make-up Preparations", 30.0, 0.0, "Cosmetics & Personal Care", ""),
        ("3304.99", "Beauty/Make-up Preparations NES", 30.0, 0.0, "Cosmetics & Personal Care", ""),
        ("3305.10", "Shampoos", 20.0, 0.0, "Cosmetics & Personal Care", ""),
        ("3306.10", "Dentifrices (Toothpaste)", 15.0, 0.0, "Cosmetics & Personal Care", ""),
        ("3401.11", "Soap (toilet use)", 15.0, 0.0, "Cosmetics & Personal Care", ""),
        // Paper & Stationery
        ("4802.56", "Uncoated Paper (40-150gsm, sheets)", 10.0, 0.0, "Paper & Stationery", ""),
        ("4810.13", "Coated Paper (roll, printing grade)", 10.0, 0.0, "Paper & Stationery", ""),
        ("4820.10", "Registers/Account Books/Notebooks", 15.0, 0.0, "Paper & Stationery", ""),
        ("4901.99", "Printed Books/Pamphlets", 0.0, 0.0, "Paper & Stationery", "Duty free for books"),
        ("4911.10", "Trade Advertising Material", 15.0, 0.0, "Paper & Stationery", ""),
        // Plastics & Rubber
        ("3901.10", "Polyethylene (specific gravity <0.94)", 5.0, 0.0, "Plastics & Rubber", "LDPE raw material"),
        ("3901.20", "Polyethylene (specific gravity >=0.94)", 5.0, 0.0, "Plastics & Rubber", "HDPE raw material"),
        ("3902.10", "Polypropylene (primary)", 5.0, 0.0, "Plastics & Rubber", ""),
        ("3923.30", "Plastic Carboys/Bottles", 15.0, 0.0, "Plastics & Rubber", ""),
        ("3924.10", "Tableware/Kitchenware (plastic)", 20.0, 0.0, "Plastics & Rubber", ""),
        ("3926.20", "Articles of Apparel (plastic)", 20.0, 0.0, "Plastics & Rubber", ""),
        ("4002.19", "Styrene-Butadiene Rubber (SBR)", 5.0, 0.0, "Plastics & Rubber", ""),
        // Furniture
        ("9401.30", "Swivel Seats (adjustable height)", 20.0, 0.0, "Furniture", ""),
        ("9401.61", "Wooden Seats (upholstered)", 20.0, 0.0, "Furniture", ""),
        ("9403.30", "Wooden Office Furniture", 20.0, 0.0, "Furniture", ""),
        ("9403.50", "Wooden Bedroom Furniture", 20.0, 0.0, "Furniture", ""),
        ("9403.60", "Other Wooden Furniture", 20.0, 0.0, "Furniture", ""),
        ("9404.21", "Mattresses (cellular rubber)", 20.0, 0.0, "Furniture", ""),
        // Gold & Precious Metals
        ("7108.12", "Gold (non-monetary, unwrought)", 10.0, 0.0, "Gold & Precious Metals", "NRB regulated import"),
        ("7106.91", "Silver (unwrought)", 10.0, 0.0, "Gold & Precious Metals", ""),
        ("7110.11", "Platinum (unwrought)", 10.0, 0.0, "Gold & Precious Metals", ""),
        // Misc Common Imports
        ("8544.49", "Electric Conductors (<=80V)", 15.0, 0.0, "Electrical", "Cables & wires"),
        ("8536.20", "Circuit Breakers", 15.0, 0.0, "Electrical", ""),
        ("8539.50", "LED Lamps", 5.0, 0.0, "Electrical", "Green incentive"),
        ("8501.10", "Electric Motors (<37.5W)", 5.0, 0.0, "Electrical", ""),
        ("9018.90", "Medical Instruments NES", 0.0, 0.0, "Medical Equipment", "Duty free for healthcare"),
        ("9022.14", "X-ray Apparatus (medical/dental)", 0.0, 0.0, "Medical Equipment", "Duty free"),
        ("9027.80", "Physical/Chemical Analysis Instruments", 5.0, 0.0, "Medical Equipment", ""),
        ("3808.91", "Insecticides (retail packing)", 5.0, 0.0, "Agriculture", ""),
        ("8424.41", "Portable Sprayers (agriculture)", 5.0, 0.0, "Agriculture", ""),
        ("8432.29", "Harrows/Cultivators", 0.0, 0.0, "Agriculture", "Duty free for agri-machinery"),
        ("8433.51", "Combine Harvester-Threshers", 0.0, 0.0, "Agriculture", "Duty free"),
        ("8701.91", "Agricultural Tractors (<18kW)", 0.0, 0.0, "Agriculture", "Duty free"),
    ];

    for (code, desc, cd, ed, cat, notes) in codes {
        let _ = conn.execute(
            "INSERT OR IGNORE INTO hs_tariff_codes (code, description, customs_duty_pct, excise_duty_pct, category, notes) VALUES (?1,?2,?3,?4,?5,?6)",
            rusqlite::params![code, desc, cd, ed, cat, notes],
        );
    }
}
