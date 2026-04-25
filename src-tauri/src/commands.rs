use crate::db::*;
use rusqlite::params;
use serde::{Deserialize, Serialize};
use tauri::State;
use uuid::Uuid;
use chrono::Utc;
use bcrypt::{hash, verify, DEFAULT_COST};

#[derive(Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T> ApiResponse<T> {
    pub fn ok(data: T) -> Self {
        ApiResponse { success: true, data: Some(data), error: None }
    }
    pub fn err(msg: &str) -> ApiResponse<T> {
        ApiResponse { success: false, data: None, error: Some(msg.to_string()) }
    }
}

// ─── AUTH ────────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn signup(state: State<DbState>, email: String, password: String) -> ApiResponse<String> {
    let conn = state.0.lock().unwrap();
    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM users", [], |r| r.get(0))
        .unwrap_or(0);
    if count > 0 {
        return ApiResponse::err("Account already exists. Please log in.");
    }
    let pw_hash = match hash(&password, DEFAULT_COST) {
        Ok(h) => h,
        Err(e) => return ApiResponse::err(&e.to_string()),
    };
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    match conn.execute(
        "INSERT INTO users (id, email, password_hash, created_at) VALUES (?1,?2,?3,?4)",
        params![id, email, pw_hash, now],
    ) {
        Ok(_) => ApiResponse::ok(id),
        Err(e) => ApiResponse::err(&e.to_string()),
    }
}

#[tauri::command]
pub fn login(state: State<DbState>, email: String, password: String) -> ApiResponse<String> {
    let conn = state.0.lock().unwrap();
    let result: rusqlite::Result<(String, String)> = conn.query_row(
        "SELECT id, password_hash FROM users WHERE email = ?1",
        params![email],
        |r| Ok((r.get(0)?, r.get(1)?)),
    );
    match result {
        Ok((id, hash)) => {
            if verify(&password, &hash).unwrap_or(false) {
                ApiResponse::ok(id)
            } else {
                ApiResponse::err("Invalid email or password.")
            }
        }
        Err(_) => ApiResponse::err("Invalid email or password."),
    }
}

#[tauri::command]
pub fn has_account(state: State<DbState>) -> ApiResponse<bool> {
    let conn = state.0.lock().unwrap();
    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM users", [], |r| r.get(0))
        .unwrap_or(0);
    ApiResponse::ok(count > 0)
}

// ─── COMPANY PROFILE ─────────────────────────────────────────────────────────

#[tauri::command]
pub fn save_company_profile(state: State<DbState>, profile: CompanyProfile) -> ApiResponse<String> {
    let conn = state.0.lock().unwrap();
    let now = Utc::now().to_rfc3339();
    let existing: rusqlite::Result<String> =
        conn.query_row("SELECT id FROM company_profile LIMIT 1", [], |r| r.get(0));
    match existing {
        Ok(existing_id) => {
            let r = conn.execute(
                "UPDATE company_profile SET company_name=?1,owner_name=?2,pan_number=?3,
                 vat_number=?4,registration_number=?5,phone_primary=?6,phone_secondary=?7,
                 email=?8,website=?9,street=?10,ward_no=?11,municipality=?12,district=?13,
                 province=?14,logo_base64=?15,bank_name=?16,bank_account_number=?17,
                 bank_account_name=?18,bank_branch=?19,swift_code=?20,default_currency=?21,
                 fiscal_year_start_month=?22,terms_and_conditions=?23,updated_at=?24
                 WHERE id=?25",
                params![
                    profile.company_name, profile.owner_name, profile.pan_number,
                    profile.vat_number, profile.registration_number, profile.phone_primary,
                    profile.phone_secondary, profile.email, profile.website,
                    profile.street, profile.ward_no, profile.municipality,
                    profile.district, profile.province, profile.logo_base64,
                    profile.bank_name, profile.bank_account_number, profile.bank_account_name,
                    profile.bank_branch, profile.swift_code, profile.default_currency,
                    profile.fiscal_year_start_month, profile.terms_and_conditions,
                    now, existing_id
                ],
            );
            match r { Ok(_) => ApiResponse::ok(existing_id), Err(e) => ApiResponse::err(&e.to_string()) }
        }
        Err(_) => {
            let id = Uuid::new_v4().to_string();
            let r = conn.execute(
                "INSERT INTO company_profile (id,company_name,owner_name,pan_number,vat_number,
                 registration_number,phone_primary,phone_secondary,email,website,street,ward_no,
                 municipality,district,province,logo_base64,bank_name,bank_account_number,
                 bank_account_name,bank_branch,swift_code,default_currency,fiscal_year_start_month,
                 terms_and_conditions,created_at,updated_at)
                 VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?21,?22,?23,?24,?25,?26)",
                params![
                    id, profile.company_name, profile.owner_name, profile.pan_number,
                    profile.vat_number, profile.registration_number, profile.phone_primary,
                    profile.phone_secondary, profile.email, profile.website,
                    profile.street, profile.ward_no, profile.municipality,
                    profile.district, profile.province, profile.logo_base64,
                    profile.bank_name, profile.bank_account_number, profile.bank_account_name,
                    profile.bank_branch, profile.swift_code, profile.default_currency,
                    profile.fiscal_year_start_month, profile.terms_and_conditions,
                    now, now
                ],
            );
            match r { Ok(_) => ApiResponse::ok(id), Err(e) => ApiResponse::err(&e.to_string()) }
        }
    }
}

#[tauri::command]
pub fn get_company_profile(state: State<DbState>) -> ApiResponse<CompanyProfile> {
    let conn = state.0.lock().unwrap();
    let r = conn.query_row(
        "SELECT id,company_name,owner_name,pan_number,vat_number,registration_number,
         phone_primary,phone_secondary,email,website,street,ward_no,municipality,district,
         province,logo_base64,bank_name,bank_account_number,bank_account_name,bank_branch,
         swift_code,default_currency,fiscal_year_start_month,terms_and_conditions,
         created_at,updated_at FROM company_profile LIMIT 1",
        [],
        |r| Ok(CompanyProfile {
            id: r.get(0)?, company_name: r.get(1)?, owner_name: r.get(2)?,
            pan_number: r.get(3)?, vat_number: r.get(4)?, registration_number: r.get(5)?,
            phone_primary: r.get(6)?, phone_secondary: r.get(7)?, email: r.get(8)?,
            website: r.get(9)?, street: r.get(10)?, ward_no: r.get(11)?,
            municipality: r.get(12)?, district: r.get(13)?, province: r.get(14)?,
            logo_base64: r.get(15)?, bank_name: r.get(16)?, bank_account_number: r.get(17)?,
            bank_account_name: r.get(18)?, bank_branch: r.get(19)?, swift_code: r.get(20)?,
            default_currency: r.get(21)?, fiscal_year_start_month: r.get(22)?,
            terms_and_conditions: r.get(23)?, created_at: r.get(24)?, updated_at: r.get(25)?,
        }),
    );
    match r { Ok(p) => ApiResponse::ok(p), Err(_) => ApiResponse::err("No profile found.") }
}

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn create_product(state: State<DbState>, product: Product) -> ApiResponse<String> {
    let conn = state.0.lock().unwrap();
    
    // Find the max sequence number from existing product_ids like PRD-XXXX
    let max_seq: i64 = conn
        .query_row(
            "SELECT COALESCE(MAX(CAST(SUBSTR(product_id, 5) AS INTEGER)), 0) FROM products",
            [],
            |r| r.get(0)
        )
        .unwrap_or(0);
        
    let product_id = format!("PRD-{:04}", max_seq + 1);
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    let r = conn.execute(
        "INSERT INTO products (id,product_id,name,category,hs_code,unit_of_measure,
         country_of_origin,description,current_stock,reorder_level,buying_price_paisa,
         status,created_at,updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14)",
        params![
            id, product_id, product.name, product.category, product.hs_code,
            product.unit_of_measure, product.country_of_origin, product.description,
            product.current_stock, product.reorder_level, product.buying_price_paisa,
            product.status, now, now
        ],
    );
    match r { Ok(_) => ApiResponse::ok(id), Err(e) => ApiResponse::err(&e.to_string()) }
}

#[tauri::command]
pub fn update_product(state: State<DbState>, product: Product) -> ApiResponse<String> {
    let conn = state.0.lock().unwrap();
    let now = Utc::now().to_rfc3339();
    let r = conn.execute(
        "UPDATE products SET name=?1,category=?2,hs_code=?3,unit_of_measure=?4,
         country_of_origin=?5,description=?6,reorder_level=?7,buying_price_paisa=?8,
         status=?9,updated_at=?10 WHERE id=?11",
        params![
            product.name, product.category, product.hs_code, product.unit_of_measure,
            product.country_of_origin, product.description, product.reorder_level,
            product.buying_price_paisa, product.status, now, product.id
        ],
    );
    match r { Ok(_) => ApiResponse::ok(product.id), Err(e) => ApiResponse::err(&e.to_string()) }
}

#[tauri::command]
pub fn get_products(state: State<DbState>) -> ApiResponse<Vec<Product>> {
    let conn = state.0.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id,product_id,name,category,hs_code,unit_of_measure,country_of_origin,
         description,current_stock,reorder_level,buying_price_paisa,selling_price_paisa,
         status,created_at,updated_at FROM products ORDER BY product_id ASC"
    ).unwrap();
    let items: Vec<Product> = stmt.query_map([], |r| Ok(Product {
        id: r.get(0)?, product_id: r.get(1)?, name: r.get(2)?, category: r.get(3)?,
        hs_code: r.get(4)?, unit_of_measure: r.get(5)?, country_of_origin: r.get(6)?,
        description: r.get(7)?, current_stock: r.get(8)?, reorder_level: r.get(9)?,
        buying_price_paisa: r.get(10)?,
        status: r.get(11)?, created_at: r.get(12)?, updated_at: r.get(13)?,
    })).unwrap().filter_map(|r| r.ok()).collect();
    ApiResponse::ok(items)
}

#[tauri::command]
pub fn delete_product(state: State<DbState>, id: String) -> ApiResponse<bool> {
    let conn = state.0.lock().unwrap();
    match conn.execute("DELETE FROM products WHERE id=?1", params![id]) {
        Ok(_) => ApiResponse::ok(true),
        Err(e) => ApiResponse::err(&e.to_string()),
    }
}

#[tauri::command]
pub fn add_inventory_transaction(state: State<DbState>, tx: InventoryTransaction) -> ApiResponse<String> {
    let conn = state.0.lock().unwrap();
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    let r = conn.execute(
        "INSERT INTO inventory_transactions (id,product_id,transaction_type,quantity_in,
         quantity_out,reference,notes,transaction_date,created_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)",
        params![
            id, tx.product_id, tx.transaction_type, tx.quantity_in, tx.quantity_out,
            tx.reference, tx.notes, tx.transaction_date, now
        ],
    );
    if r.is_err() { return ApiResponse::err(&r.unwrap_err().to_string()); }
    let stock_delta = tx.quantity_in - tx.quantity_out;
    let _ = conn.execute(
        "UPDATE products SET current_stock = current_stock + ?1, updated_at=?2 WHERE id=?3",
        params![stock_delta, now, tx.product_id],
    );
    ApiResponse::ok(id)
}

#[tauri::command]
pub fn get_inventory_transactions(state: State<DbState>, product_id: String) -> ApiResponse<Vec<InventoryTransaction>> {
    let conn = state.0.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id,product_id,transaction_type,quantity_in,quantity_out,reference,notes,
         transaction_date,created_at FROM inventory_transactions
         WHERE product_id=?1 ORDER BY transaction_date DESC"
    ).unwrap();
    let items: Vec<InventoryTransaction> = stmt.query_map(params![product_id], |r| Ok(InventoryTransaction {
        id: r.get(0)?, product_id: r.get(1)?, transaction_type: r.get(2)?,
        quantity_in: r.get(3)?, quantity_out: r.get(4)?, reference: r.get(5)?,
        notes: r.get(6)?, transaction_date: r.get(7)?, created_at: r.get(8)?,
    })).unwrap().filter_map(|r| r.ok()).collect();
    ApiResponse::ok(items)
}

// ─── PARTIES ─────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn create_party(state: State<DbState>, party: Party) -> ApiResponse<String> {
    let conn = state.0.lock().unwrap();
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    let r = conn.execute(
        "INSERT INTO parties (id,party_type,company_name,contact_person,email,phone,fax,
         country,address,pan_number,payment_terms,default_currency,notes,created_at,updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15)",
        params![
            id, party.party_type, party.company_name, party.contact_person,
            party.email, party.phone, party.fax, party.country, party.address,
            party.pan_number, party.payment_terms, party.default_currency,
            party.notes, now, now
        ],
    );
    match r { Ok(_) => ApiResponse::ok(id), Err(e) => ApiResponse::err(&e.to_string()) }
}

#[tauri::command]
pub fn update_party(state: State<DbState>, party: Party) -> ApiResponse<String> {
    let conn = state.0.lock().unwrap();
    let now = Utc::now().to_rfc3339();
    let r = conn.execute(
        "UPDATE parties SET party_type=?1,company_name=?2,contact_person=?3,email=?4,
         phone=?5,fax=?6,country=?7,address=?8,pan_number=?9,payment_terms=?10,
         default_currency=?11,notes=?12,updated_at=?13 WHERE id=?14",
        params![
            party.party_type, party.company_name, party.contact_person, party.email,
            party.phone, party.fax, party.country, party.address, party.pan_number,
            party.payment_terms, party.default_currency, party.notes, now, party.id
        ],
    );
    match r { Ok(_) => ApiResponse::ok(party.id), Err(e) => ApiResponse::err(&e.to_string()) }
}

#[tauri::command]
pub fn get_parties(state: State<DbState>, party_type: Option<String>) -> ApiResponse<Vec<Party>> {
    let conn = state.0.lock().unwrap();
    let sql = match &party_type {
        Some(_) => "SELECT id,party_type,company_name,contact_person,email,phone,fax,country,
                    address,pan_number,payment_terms,default_currency,notes,created_at,updated_at
                    FROM parties WHERE party_type=?1 OR party_type='Both' ORDER BY company_name",
        None => "SELECT id,party_type,company_name,contact_person,email,phone,fax,country,
                 address,pan_number,payment_terms,default_currency,notes,created_at,updated_at
                 FROM parties ORDER BY company_name",
    };
    let mut stmt = conn.prepare(sql).unwrap();
    let map_row = |r: &rusqlite::Row| Ok(Party {
        id: r.get(0)?, party_type: r.get(1)?, company_name: r.get(2)?,
        contact_person: r.get(3)?, email: r.get(4)?, phone: r.get(5)?,
        fax: r.get(6)?, country: r.get(7)?, address: r.get(8)?,
        pan_number: r.get(9)?, payment_terms: r.get(10)?, default_currency: r.get(11)?,
        notes: r.get(12)?, created_at: r.get(13)?, updated_at: r.get(14)?,
    });
    let items: Vec<Party> = match party_type {
        Some(pt) => stmt.query_map(params![pt], map_row),
        None => stmt.query_map([], map_row),
    }.unwrap().filter_map(|r| r.ok()).collect();
    ApiResponse::ok(items)
}

#[tauri::command]
pub fn delete_party(state: State<DbState>, id: String) -> ApiResponse<bool> {
    let conn = state.0.lock().unwrap();
    match conn.execute("DELETE FROM parties WHERE id=?1", params![id]) {
        Ok(_) => ApiResponse::ok(true),
        Err(e) => ApiResponse::err(&e.to_string()),
    }
}

// ─── INVOICES ────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn create_invoice(state: State<DbState>, invoice: Invoice, items: Vec<InvoiceItem>) -> ApiResponse<String> {
    let conn = state.0.lock().unwrap();
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    let r = conn.execute(
        "INSERT INTO invoices (id,invoice_number,invoice_type,invoice_date,due_date,party_id,
         party_name,party_address,party_country,party_pan,ship_to_name,ship_to_address,
         incoterm,port_of_loading,port_of_discharge,country_of_origin,country_of_destination,
         subtotal_paisa,freight_paisa,insurance_paisa,discount_paisa,vat_paisa,grand_total_paisa,
         currency,exchange_rate,status,terms_and_conditions,notes,shipment_record_id,
         created_at,updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?21,?22,?23,?24,?25,?26,?27,?28,?29,?30,?31)",
        params![
            id, invoice.invoice_number, invoice.invoice_type, invoice.invoice_date,
            invoice.due_date, invoice.party_id, invoice.party_name, invoice.party_address,
            invoice.party_country, invoice.party_pan, invoice.ship_to_name, invoice.ship_to_address,
            invoice.incoterm, invoice.port_of_loading, invoice.port_of_discharge,
            invoice.country_of_origin, invoice.country_of_destination,
            invoice.subtotal_paisa, invoice.freight_paisa, invoice.insurance_paisa,
            invoice.discount_paisa, invoice.vat_paisa, invoice.grand_total_paisa,
            invoice.currency, invoice.exchange_rate, invoice.status,
            invoice.terms_and_conditions, invoice.notes, invoice.shipment_record_id,
            now, now
        ],
    );
    if let Err(e) = r { return ApiResponse::err(&e.to_string()); }
    
    for item in items {
        let item_id = Uuid::new_v4().to_string();
        let _ = conn.execute(
            "INSERT INTO invoice_items (id,invoice_id,product_id,hs_code,description,quantity,
             unit,unit_price_paisa,discount_percent,discount_paisa,amount_paisa)
             VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11)",
            params![
                item_id, id, item.product_id, item.hs_code, item.description,
                item.quantity, item.unit, item.unit_price_paisa, item.discount_percent,
                item.discount_paisa, item.amount_paisa
            ],
        );

        // --- NEW: Automated Stock Deduction ---
        if let Some(pid) = item.product_id {
            if !pid.is_empty() {
                let tx_id = Uuid::new_v4().to_string();
                let tx_date = invoice.invoice_date.clone();
                let ref_val = format!("Invoice: {}", invoice.invoice_number);
                
                // 1. Create Inventory Transaction record
                let _ = conn.execute(
                    "INSERT INTO inventory_transactions (id,product_id,transaction_type,quantity_in,
                     quantity_out,reference,notes,transaction_date,created_at)
                     VALUES (?1,?2,'Sale',0,?3,?4,'Auto-generated from invoice',?5,?6)",
                    params![tx_id, pid, item.quantity as i64, ref_val, tx_date, now],
                );

                // 2. Update Product current_stock
                let _ = conn.execute(
                    "UPDATE products SET current_stock = current_stock - ?1, updated_at=?2 WHERE id=?3",
                    params![item.quantity as i64, now, pid],
                );
            }
        }
    }
    ApiResponse::ok(id)
}

#[tauri::command]
pub fn get_invoices(state: State<DbState>) -> ApiResponse<Vec<Invoice>> {
    let conn = state.0.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id,invoice_number,invoice_type,invoice_date,due_date,party_id,party_name,
         party_address,party_country,party_pan,ship_to_name,ship_to_address,incoterm,
         port_of_loading,port_of_discharge,country_of_origin,country_of_destination,
         subtotal_paisa,freight_paisa,insurance_paisa,discount_paisa,vat_paisa,grand_total_paisa,
         currency,exchange_rate,status,terms_and_conditions,notes,shipment_record_id,
         created_at,updated_at FROM invoices ORDER BY created_at DESC"
    ).unwrap();
    let items: Vec<Invoice> = stmt.query_map([], |r| Ok(Invoice {
        id: r.get(0)?, invoice_number: r.get(1)?, invoice_type: r.get(2)?,
        invoice_date: r.get(3)?, due_date: r.get(4)?, party_id: r.get(5)?,
        party_name: r.get(6)?, party_address: r.get(7)?, party_country: r.get(8)?,
        party_pan: r.get(9)?, ship_to_name: r.get(10)?, ship_to_address: r.get(11)?,
        incoterm: r.get(12)?, port_of_loading: r.get(13)?, port_of_discharge: r.get(14)?,
        country_of_origin: r.get(15)?, country_of_destination: r.get(16)?,
        subtotal_paisa: r.get(17)?, freight_paisa: r.get(18)?, insurance_paisa: r.get(19)?,
        discount_paisa: r.get(20)?, vat_paisa: r.get(21)?, grand_total_paisa: r.get(22)?,
        currency: r.get(23)?, exchange_rate: r.get(24)?, status: r.get(25)?,
        terms_and_conditions: r.get(26)?, notes: r.get(27)?, shipment_record_id: r.get(28)?,
        created_at: r.get(29)?, updated_at: r.get(30)?,
    })).unwrap().filter_map(|r| r.ok()).collect();
    ApiResponse::ok(items)
}

#[tauri::command]
pub fn get_invoice_items(state: State<DbState>, invoice_id: String) -> ApiResponse<Vec<InvoiceItem>> {
    let conn = state.0.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id,invoice_id,product_id,hs_code,description,quantity,unit,
         unit_price_paisa,discount_percent,discount_paisa,amount_paisa
         FROM invoice_items WHERE invoice_id=?1"
    ).unwrap();
    let items: Vec<InvoiceItem> = stmt.query_map(params![invoice_id], |r| Ok(InvoiceItem {
        id: r.get(0)?, invoice_id: r.get(1)?, product_id: r.get(2)?,
        hs_code: r.get(3)?, description: r.get(4)?, quantity: r.get(5)?,
        unit: r.get(6)?, unit_price_paisa: r.get(7)?, discount_percent: r.get(8)?,
        discount_paisa: r.get(9)?, amount_paisa: r.get(10)?,
    })).unwrap().filter_map(|r| r.ok()).collect();
    ApiResponse::ok(items)
}

#[tauri::command]
pub fn update_invoice_status(state: State<DbState>, id: String, status: String) -> ApiResponse<bool> {
    let conn = state.0.lock().unwrap();
    let now = Utc::now().to_rfc3339();
    match conn.execute("UPDATE invoices SET status=?1,updated_at=?2 WHERE id=?3", params![status, now, id]) {
        Ok(_) => ApiResponse::ok(true),
        Err(e) => ApiResponse::err(&e.to_string()),
    }
}

#[tauri::command]
pub fn get_next_invoice_number(state: State<DbState>, prefix: String) -> ApiResponse<String> {
    let conn = state.0.lock().unwrap();
    let pattern = format!("{}%", prefix);
    let max_seq: i64 = conn
        .query_row(
            "SELECT COALESCE(MAX(CAST(SUBSTR(invoice_number, LENGTH(?1) + 2) AS INTEGER)), 0) 
             FROM invoices WHERE invoice_number LIKE ?1",
            params![pattern],
            |r| r.get(0)
        )
        .unwrap_or(0);
    ApiResponse::ok(format!("{}-{:04}", prefix, max_seq + 1))
}

#[tauri::command]
pub fn record_payment(state: State<DbState>, payment: Payment) -> ApiResponse<String> {
    let conn = state.0.lock().unwrap();
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    let r = conn.execute(
        "INSERT INTO payments (id,invoice_id,amount_paisa,payment_date,payment_method,reference,notes,created_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8)",
        params![id, payment.invoice_id, payment.amount_paisa, payment.payment_date,
            payment.payment_method, payment.reference, payment.notes, now],
    );
    if let Err(e) = r { return ApiResponse::err(&e.to_string()); }
    let total_paid: i64 = conn.query_row(
        "SELECT COALESCE(SUM(amount_paisa),0) FROM payments WHERE invoice_id=?1",
        params![payment.invoice_id], |r| r.get(0)).unwrap_or(0);
    let grand_total: i64 = conn.query_row(
        "SELECT grand_total_paisa FROM invoices WHERE id=?1",
        params![payment.invoice_id], |r| r.get(0)).unwrap_or(0);
    let new_status = if total_paid >= grand_total { "Paid" }
        else if total_paid > 0 { "Partially Paid" } else { "Sent" };
    let _ = conn.execute("UPDATE invoices SET status=?1,updated_at=?2 WHERE id=?3",
        params![new_status, now, payment.invoice_id]);
    ApiResponse::ok(id)
}

#[tauri::command]
pub fn get_payments(state: State<DbState>, invoice_id: String) -> ApiResponse<Vec<Payment>> {
    let conn = state.0.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id,invoice_id,amount_paisa,payment_date,payment_method,reference,notes,created_at
         FROM payments WHERE invoice_id=?1 ORDER BY payment_date DESC"
    ).unwrap();
    let items: Vec<Payment> = stmt.query_map(params![invoice_id], |r| Ok(Payment {
        id: r.get(0)?, invoice_id: r.get(1)?, amount_paisa: r.get(2)?,
        payment_date: r.get(3)?, payment_method: r.get(4)?, reference: r.get(5)?,
        notes: r.get(6)?, created_at: r.get(7)?,
    })).unwrap().filter_map(|r| r.ok()).collect();
    ApiResponse::ok(items)
}

// ─── SHIPMENT RECORDS ────────────────────────────────────────────────────────

#[tauri::command]
pub fn save_shipment_record(state: State<DbState>, record: ShipmentRecord) -> ApiResponse<String> {
    let conn = state.0.lock().unwrap();
    let now = Utc::now().to_rfc3339();
    let id = if record.id.is_empty() { Uuid::new_v4().to_string() } else { record.id.clone() };
    let existing: bool = conn.query_row(
        "SELECT COUNT(*) FROM shipment_records WHERE id=?1", params![id], |r| r.get::<_,i64>(0)
    ).unwrap_or(0) > 0;
        let res = if existing {
            conn.execute(
                "UPDATE shipment_records SET name=?1,product_id=?2,quantity=?3,unit_buying_price_paisa=?4,
                 total_product_cost_paisa=?5,transport_mode=?6,origin=?7,destination=?8,
                 transport_cost_paisa=?9,loading_unloading_paisa=?10,packaging_cost_paisa=?11,
                 fumigation_cost_paisa=?12,customs_agent_fee_paisa=?13,export_declaration_fee_paisa=?14,
                 customs_exam_fee_paisa=?15,certificate_origin_fee_paisa=?16,phytosanitary_fee_paisa=?17,
                 export_permit_fee_paisa=?18,doc_preparation_paisa=?19,terminal_handling_paisa=?20,
                 customs_broker_transit_paisa=?21,transit_charges_paisa=?22,storage_demurrage_paisa=?23,
                 scanner_charges_paisa=?24,freight_mode=?25,freight_cost_original=?26,
                 freight_currency=?27,freight_exchange_rate=?28,freight_cost_npr_paisa=?29,
                 freight_insurance_paisa=?30,bl_awb_charges_paisa=?31,import_duty_percent=?32,
                 vat_gst_percent=?33,customs_clearance_dest_paisa=?34,last_mile_delivery_paisa=?35,
                 other_destination_paisa=?36,lc_charges_paisa=?37,bank_commission_paisa=?38,
                 wire_transfer_paisa=?39,hedging_cost_paisa=?40,contingency_percent=?41,
                 total_cost_paisa=?42,custom_costs_json=?43,incoterm=?44,invoice_id=?45,
                 updated_at=?46 WHERE id=?47",
                params![
                    record.name, record.product_id, record.quantity, record.unit_buying_price_paisa,
                    record.total_product_cost_paisa, record.transport_mode, record.origin, record.destination,
                    record.transport_cost_paisa, record.loading_unloading_paisa, record.packaging_cost_paisa,
                    record.fumigation_cost_paisa, record.customs_agent_fee_paisa, record.export_declaration_fee_paisa,
                    record.customs_exam_fee_paisa, record.certificate_origin_fee_paisa, record.phytosanitary_fee_paisa,
                    record.export_permit_fee_paisa, record.doc_preparation_paisa, record.terminal_handling_paisa,
                    record.customs_broker_transit_paisa, record.transit_charges_paisa, record.storage_demurrage_paisa,
                    record.scanner_charges_paisa, record.freight_mode, record.freight_cost_original,
                    record.freight_currency, record.freight_exchange_rate, record.freight_cost_npr_paisa,
                    record.freight_insurance_paisa, record.bl_awb_charges_paisa, record.import_duty_percent,
                    record.vat_gst_percent, record.customs_clearance_dest_paisa, record.last_mile_delivery_paisa,
                    record.other_destination_paisa, record.lc_charges_paisa, record.bank_commission_paisa,
                    record.wire_transfer_paisa, record.hedging_cost_paisa, record.contingency_percent,
                    record.total_cost_paisa, record.custom_costs_json, record.incoterm, record.invoice_id,
                    now, id
                ],
            )
        } else {
            let insert_res = conn.execute(
                "INSERT INTO shipment_records (id,name,product_id,quantity,unit_buying_price_paisa,
                 total_product_cost_paisa,transport_mode,origin,destination,transport_cost_paisa,
                 loading_unloading_paisa,packaging_cost_paisa,fumigation_cost_paisa,customs_agent_fee_paisa,
                 export_declaration_fee_paisa,customs_exam_fee_paisa,certificate_origin_fee_paisa,
                 phytosanitary_fee_paisa,export_permit_fee_paisa,doc_preparation_paisa,terminal_handling_paisa,
                 customs_broker_transit_paisa,transit_charges_paisa,storage_demurrage_paisa,scanner_charges_paisa,
                 freight_mode,freight_cost_original,freight_currency,freight_exchange_rate,freight_cost_npr_paisa,
                 freight_insurance_paisa,bl_awb_charges_paisa,import_duty_percent,vat_gst_percent,
                 customs_clearance_dest_paisa,last_mile_delivery_paisa,other_destination_paisa,lc_charges_paisa,
                 bank_commission_paisa,wire_transfer_paisa,hedging_cost_paisa,contingency_percent,
                 total_cost_paisa,custom_costs_json,incoterm,invoice_id,created_at,updated_at)
                 VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,
                 ?21,?22,?23,?24,?25,?26,?27,?28,?29,?30,?31,?32,?33,?34,?35,?36,?37,?38,?39,?40,
                 ?41,?42,?43,?44,?45,?46,?47,?48)",
                params![
                    id, record.name, record.product_id, record.quantity, record.unit_buying_price_paisa,
                    record.total_product_cost_paisa, record.transport_mode, record.origin, record.destination,
                    record.transport_cost_paisa, record.loading_unloading_paisa, record.packaging_cost_paisa,
                    record.fumigation_cost_paisa, record.customs_agent_fee_paisa, record.export_declaration_fee_paisa,
                    record.customs_exam_fee_paisa, record.certificate_origin_fee_paisa, record.phytosanitary_fee_paisa,
                    record.export_permit_fee_paisa, record.doc_preparation_paisa, record.terminal_handling_paisa,
                    record.customs_broker_transit_paisa, record.transit_charges_paisa, record.storage_demurrage_paisa,
                    record.scanner_charges_paisa, record.freight_mode, record.freight_cost_original,
                    record.freight_currency, record.freight_exchange_rate, record.freight_cost_npr_paisa,
                    record.freight_insurance_paisa, record.bl_awb_charges_paisa, record.import_duty_percent,
                    record.vat_gst_percent, record.customs_clearance_dest_paisa, record.last_mile_delivery_paisa,
                    record.other_destination_paisa, record.lc_charges_paisa, record.bank_commission_paisa,
                    record.wire_transfer_paisa, record.hedging_cost_paisa, record.contingency_percent,
                    record.total_cost_paisa, record.custom_costs_json, record.incoterm, record.invoice_id,
                    now, now
                ],
            );

            // --- STOCK AUTOMATION: Trigger only on successful first save ---
            if insert_res.is_ok() {
                if let Some(pid) = record.product_id {
                    if !pid.is_empty() && record.quantity > 0.0 {
                        let tx_id = Uuid::new_v4().to_string();
                        let ref_val = format!("Inward: {}", record.name);
                        
                        // 1. Create Inward Ledger Entry
                        let _ = conn.execute(
                            "INSERT INTO inventory_transactions (id,product_id,transaction_type,quantity_in,
                            quantity_out,reference,notes,transaction_date,created_at)
                            VALUES (?1,?2,'Shipment Inward',?3,0,?4,'Inventory added from costing',?5,?6)",
                            params![tx_id, pid, record.quantity as i64, ref_val, now, now],
                        );

                        // 2. Increase Physical Stock
                        let _ = conn.execute(
                            "UPDATE products SET current_stock = current_stock + ?1, updated_at=?2 WHERE id=?3",
                            params![record.quantity as i64, now, pid],
                        );
                    }
                }
            }
            insert_res
        };
    match res { Ok(_) => ApiResponse::ok(id), Err(e) => ApiResponse::err(&e.to_string()) }
}

#[tauri::command]
pub fn get_shipment_records(state: State<DbState>) -> ApiResponse<Vec<ShipmentRecord>> {
    let conn = state.0.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id,name,product_id,quantity,unit_buying_price_paisa,total_product_cost_paisa,
         transport_mode,origin,destination,transport_cost_paisa,loading_unloading_paisa,
         packaging_cost_paisa,fumigation_cost_paisa,customs_agent_fee_paisa,
         export_declaration_fee_paisa,customs_exam_fee_paisa,certificate_origin_fee_paisa,
         phytosanitary_fee_paisa,export_permit_fee_paisa,doc_preparation_paisa,
         terminal_handling_paisa,customs_broker_transit_paisa,transit_charges_paisa,
         storage_demurrage_paisa,scanner_charges_paisa,freight_mode,freight_cost_original,
         freight_currency,freight_exchange_rate,freight_cost_npr_paisa,freight_insurance_paisa,
         bl_awb_charges_paisa,import_duty_percent,vat_gst_percent,customs_clearance_dest_paisa,
         last_mile_delivery_paisa,other_destination_paisa,lc_charges_paisa,bank_commission_paisa,
         wire_transfer_paisa,hedging_cost_paisa,contingency_percent,total_cost_paisa,
         custom_costs_json,incoterm,invoice_id,created_at,updated_at
         FROM shipment_records ORDER BY created_at DESC"
    ).unwrap();
    let items: Vec<ShipmentRecord> = stmt.query_map([], |r| Ok(ShipmentRecord {
        id: r.get(0)?, name: r.get(1)?, product_id: r.get(2)?, quantity: r.get(3)?,
        unit_buying_price_paisa: r.get(4)?, total_product_cost_paisa: r.get(5)?,
        transport_mode: r.get(6)?, origin: r.get(7)?, destination: r.get(8)?,
        transport_cost_paisa: r.get(9)?, loading_unloading_paisa: r.get(10)?,
        packaging_cost_paisa: r.get(11)?, fumigation_cost_paisa: r.get(12)?,
        customs_agent_fee_paisa: r.get(13)?, export_declaration_fee_paisa: r.get(14)?,
        customs_exam_fee_paisa: r.get(15)?, certificate_origin_fee_paisa: r.get(16)?,
        phytosanitary_fee_paisa: r.get(17)?, export_permit_fee_paisa: r.get(18)?,
        doc_preparation_paisa: r.get(19)?, terminal_handling_paisa: r.get(20)?,
        customs_broker_transit_paisa: r.get(21)?, transit_charges_paisa: r.get(22)?,
        storage_demurrage_paisa: r.get(23)?, scanner_charges_paisa: r.get(24)?,
        freight_mode: r.get(25)?, freight_cost_original: r.get(26)?,
        freight_currency: r.get(27)?, freight_exchange_rate: r.get(28)?,
        freight_cost_npr_paisa: r.get(29)?, freight_insurance_paisa: r.get(30)?,
        bl_awb_charges_paisa: r.get(31)?, import_duty_percent: r.get(32)?,
        vat_gst_percent: r.get(33)?, customs_clearance_dest_paisa: r.get(34)?,
        last_mile_delivery_paisa: r.get(35)?, other_destination_paisa: r.get(36)?,
        lc_charges_paisa: r.get(37)?, bank_commission_paisa: r.get(38)?,
        wire_transfer_paisa: r.get(39)?, hedging_cost_paisa: r.get(40)?,
        contingency_percent: r.get(41)?, total_cost_paisa: r.get(42)?,
        custom_costs_json: r.get(43)?, incoterm: r.get(44)?, invoice_id: r.get(45)?,
        created_at: r.get(46)?, updated_at: r.get(47)?,
    })).unwrap().filter_map(|r| r.ok()).collect();
    ApiResponse::ok(items)
}

#[tauri::command]
pub fn delete_shipment_record(state: State<DbState>, id: String) -> ApiResponse<bool> {
    let conn = state.0.lock().unwrap();
    match conn.execute("DELETE FROM shipment_records WHERE id=?1", params![id]) {
        Ok(_) => ApiResponse::ok(true),
        Err(e) => ApiResponse::err(&e.to_string()),
    }
}

// ─── ROUTES ──────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn save_route(state: State<DbState>, route: Route) -> ApiResponse<String> {
    let conn = state.0.lock().unwrap();
    let now = Utc::now().to_rfc3339();
    let id = if route.id.is_empty() { Uuid::new_v4().to_string() } else { route.id.clone() };
    let existing: bool = conn.query_row(
        "SELECT COUNT(*) FROM routes WHERE id=?1", params![id], |r| r.get::<_,i64>(0)
    ).unwrap_or(0) > 0;
    let r = if existing {
        conn.execute(
            "UPDATE routes SET name=?1,border_crossing=?2,transit_country=?3,freight_mode=?4,
             estimated_freight_cost_paisa=?5,estimated_transit_days=?6,notes=?7,updated_at=?8 WHERE id=?9",
            params![route.name, route.border_crossing, route.transit_country, route.freight_mode,
                route.estimated_freight_cost_paisa, route.estimated_transit_days, route.notes, now, id],
        )
    } else {
        conn.execute(
            "INSERT INTO routes (id,name,border_crossing,transit_country,freight_mode,
             estimated_freight_cost_paisa,estimated_transit_days,notes,created_at,updated_at)
             VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10)",
            params![id, route.name, route.border_crossing, route.transit_country, route.freight_mode,
                route.estimated_freight_cost_paisa, route.estimated_transit_days, route.notes, now, now],
        )
    };
    match r { Ok(_) => ApiResponse::ok(id), Err(e) => ApiResponse::err(&e.to_string()) }
}

#[tauri::command]
pub fn get_routes(state: State<DbState>) -> ApiResponse<Vec<Route>> {
    let conn = state.0.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id,name,border_crossing,transit_country,freight_mode,estimated_freight_cost_paisa,
         estimated_transit_days,notes,created_at,updated_at FROM routes ORDER BY name"
    ).unwrap();
    let items: Vec<Route> = stmt.query_map([], |r| Ok(Route {
        id: r.get(0)?, name: r.get(1)?, border_crossing: r.get(2)?, transit_country: r.get(3)?,
        freight_mode: r.get(4)?, estimated_freight_cost_paisa: r.get(5)?,
        estimated_transit_days: r.get(6)?, notes: r.get(7)?,
        created_at: r.get(8)?, updated_at: r.get(9)?,
    })).unwrap().filter_map(|r| r.ok()).collect();
    ApiResponse::ok(items)
}

#[tauri::command]
pub fn delete_route(state: State<DbState>, id: String) -> ApiResponse<bool> {
    let conn = state.0.lock().unwrap();
    match conn.execute("DELETE FROM routes WHERE id=?1", params![id]) {
        Ok(_) => ApiResponse::ok(true),
        Err(e) => ApiResponse::err(&e.to_string()),
    }
}

// ─── PROFIT TARGETS ──────────────────────────────────────────────────────────

#[tauri::command]
pub fn save_profit_target(state: State<DbState>, target: ProfitTarget) -> ApiResponse<String> {
    let conn = state.0.lock().unwrap();
    let now = Utc::now().to_rfc3339();
    let existing: rusqlite::Result<String> = conn.query_row(
        "SELECT id FROM profit_targets WHERE product_id=?1", params![target.product_id], |r| r.get(0)
    );
    match existing {
        Ok(eid) => {
            let r = conn.execute(
                "UPDATE profit_targets SET target_margin_percent=?1,target_margin_per_unit_paisa=?2,notes=?3,updated_at=?4 WHERE id=?5",
                params![target.target_margin_percent, target.target_margin_per_unit_paisa, target.notes, now, eid],
            );
            match r { Ok(_) => ApiResponse::ok(eid), Err(e) => ApiResponse::err(&e.to_string()) }
        }
        Err(_) => {
            let id = Uuid::new_v4().to_string();
            let r = conn.execute(
                "INSERT INTO profit_targets (id,product_id,target_margin_percent,target_margin_per_unit_paisa,notes,created_at,updated_at)
                 VALUES (?1,?2,?3,?4,?5,?6,?7)",
                params![id, target.product_id, target.target_margin_percent, target.target_margin_per_unit_paisa, target.notes, now, now],
            );
            match r { Ok(_) => ApiResponse::ok(id), Err(e) => ApiResponse::err(&e.to_string()) }
        }
    }
}

#[tauri::command]
pub fn get_profit_targets(state: State<DbState>) -> ApiResponse<Vec<ProfitTarget>> {
    let conn = state.0.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id,product_id,target_margin_percent,target_margin_per_unit_paisa,notes,created_at,updated_at
         FROM profit_targets"
    ).unwrap();
    let items: Vec<ProfitTarget> = stmt.query_map([], |r| Ok(ProfitTarget {
        id: r.get(0)?, product_id: r.get(1)?, target_margin_percent: r.get(2)?,
        target_margin_per_unit_paisa: r.get(3)?, notes: r.get(4)?,
        created_at: r.get(5)?, updated_at: r.get(6)?,
    })).unwrap().filter_map(|r| r.ok()).collect();
    ApiResponse::ok(items)
}

// ─── ANALYTICS ───────────────────────────────────────────────────────────────

#[derive(Serialize)]
pub struct DashboardStats {
    pub total_revenue_paisa: i64,
    pub total_expenses_paisa: i64,
    pub invoices_paid: i64,
    pub invoices_unpaid: i64,
    pub invoices_overdue: i64,
    pub low_stock_count: i64,
}

#[derive(Serialize)]
pub struct FinancialStatement {
    pub total_sales_revenue_paisa: i64,
    pub total_purchases_paisa: i64,
    pub closing_stock_paisa: i64,
    pub cost_of_goods_sold_paisa: i64,
    pub gross_profit_paisa: i64,
    pub total_receivables_paisa: i64,
    pub total_assets_paisa: i64,
}

#[tauri::command]
pub fn get_financial_statement(state: State<DbState>) -> ApiResponse<FinancialStatement> {
    let conn = state.0.lock().unwrap();

    let total_sales: i64 = conn.query_row(
        "SELECT COALESCE(SUM(grand_total_paisa), 0) FROM invoices",
        [],
        |r| r.get(0)
    ).unwrap_or(0);

    let total_payments_received: i64 = conn.query_row(
        "SELECT COALESCE(SUM(amount_paisa), 0) FROM payments",
        [],
        |r| r.get(0)
    ).unwrap_or(0);

    let total_receivables = total_sales - total_payments_received;

    let total_purchases: i64 = conn.query_row(
        "SELECT COALESCE(SUM(total_cost_paisa), 0) FROM shipment_records",
        [],
        |r| r.get(0)
    ).unwrap_or(0);

    let closing_stock: i64 = conn.query_row(
        "SELECT COALESCE(SUM(current_stock * buying_price_paisa), 0) FROM products WHERE status='Active'",
        [],
        |r| r.get(0)
    ).unwrap_or(0);

    // Basic accounting logic: COGS = Opening(0) + Purchases - Closing
    // Ensure COGS doesn't go negative if closing stock > purchases
    let cogs = (total_purchases - closing_stock).max(0);
    
    let gross_profit = total_sales - cogs;
    let bank_balance_proxy = 0; // We lack a true cash ledger, but total_assets needs filling
    let total_assets = closing_stock + total_receivables + bank_balance_proxy;

    ApiResponse::ok(FinancialStatement {
        total_sales_revenue_paisa: total_sales,
        total_purchases_paisa: total_purchases,
        closing_stock_paisa: closing_stock,
        cost_of_goods_sold_paisa: cogs,
        gross_profit_paisa: gross_profit,
        total_receivables_paisa: total_receivables,
        total_assets_paisa: total_assets,
    })
}

#[tauri::command]
pub fn get_dashboard_stats(state: State<DbState>) -> ApiResponse<DashboardStats> {
    let conn = state.0.lock().unwrap();
    let total_revenue: i64 = conn.query_row(
        "SELECT COALESCE(SUM(grand_total_paisa),0) FROM invoices WHERE status='Paid'",
        [], |r| r.get(0)).unwrap_or(0);
    let total_expenses: i64 = conn.query_row(
        "SELECT COALESCE(SUM(total_cost_paisa),0) FROM shipment_records",
        [], |r| r.get(0)).unwrap_or(0);
    let invoices_paid: i64 = conn.query_row(
        "SELECT COUNT(*) FROM invoices WHERE status='Paid'", [], |r| r.get(0)).unwrap_or(0);
    let invoices_unpaid: i64 = conn.query_row(
        "SELECT COUNT(*) FROM invoices WHERE status IN ('Draft','Sent','Partially Paid')", [], |r| r.get(0)).unwrap_or(0);
    let invoices_overdue: i64 = conn.query_row(
        "SELECT COUNT(*) FROM invoices WHERE status='Overdue'", [], |r| r.get(0)).unwrap_or(0);
    let low_stock_count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM products WHERE current_stock <= reorder_level AND status='Active'",
        [], |r| r.get(0)).unwrap_or(0);
    ApiResponse::ok(DashboardStats {
        total_revenue_paisa: total_revenue,
        total_expenses_paisa: total_expenses,
        invoices_paid, invoices_unpaid, invoices_overdue, low_stock_count,
    })
}

#[derive(Serialize)]
pub struct MonthlyRevenue {
    pub month: String,
    pub revenue_paisa: i64,
    pub invoice_count: i64,
}

#[tauri::command]
pub fn get_monthly_revenue(state: State<DbState>) -> ApiResponse<Vec<MonthlyRevenue>> {
    let conn = state.0.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT strftime('%Y-%m', invoice_date) as month,
         COALESCE(SUM(grand_total_paisa), 0) as revenue,
         COUNT(*) as cnt
         FROM invoices WHERE status='Paid'
         GROUP BY month ORDER BY month DESC LIMIT 12"
    ).unwrap();
    let items: Vec<MonthlyRevenue> = stmt.query_map([], |r| Ok(MonthlyRevenue {
        month: r.get(0)?, revenue_paisa: r.get(1)?, invoice_count: r.get(2)?,
    })).unwrap().filter_map(|r| r.ok()).collect();
    ApiResponse::ok(items)
}
