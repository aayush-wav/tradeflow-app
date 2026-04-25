mod db;
mod commands;

use std::sync::Mutex;
use db::{open_db, DbState};
use commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let conn = open_db().expect("Failed to open database");
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(DbState(Mutex::new(conn)))
        .invoke_handler(tauri::generate_handler![
            signup,
            login,
            has_account,
            save_company_profile,
            get_company_profile,
            create_product,
            update_product,
            get_products,
            delete_product,
            add_inventory_transaction,
            get_inventory_transactions,
            create_party,
            update_party,
            get_parties,
            delete_party,
            create_invoice,
            get_invoices,
            get_invoice_items,
            update_invoice_status,
            get_next_invoice_number,
            record_payment,
            get_payments,
            save_shipment_record,
            get_shipment_records,
            delete_shipment_record,
            save_route,
            get_routes,
            delete_route,
            save_profit_target,
            get_profit_targets,
            get_dashboard_stats,
            get_monthly_revenue,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
