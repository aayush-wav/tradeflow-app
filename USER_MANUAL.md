# TradeFlow Nepal — User Manual & Operations Guide

Welcome to **TradeFlow Nepal**, your premium desktop solution for managing trade, inventory, and automated invoicing. This guide is designed to help you and your team master the application from day one.

---

## 1. Getting Started

### 🔓 Initial Setup & Login
- **Loading Screen**: When you launch the app, you will see a splash screen while the database initializes.
- **Demo Mode**: If you want to explore the features without creating an account, click the **"View Live Demo"** button on the bottom of the login page.
- **Account Creation**: For your actual business, create an account with a secure password. You will be required to confirm your password for security.

### 🏢 Company Profile
Before creating your first invoice, go to **Settings > Company Profile**. 
- Fill in your **PAN number**, **VAT registration**, and **Bank Details**. 
- This information will automatically appear on all generated invoices.

---

## 2. Managing Products & Inventory

### 📦 Adding Products
1. Navigate to the **Products** page.
2. Click **"Add Product"**.
3. **HS Code**: Essential for international trade labels.
4. **Reorder Level**: Set a minimum stock count. When your stock hits this level, the item will highlight in **red** on your dashboard.
5. **Auto-ID**: The system automatically assigns IDs like `PRD-0001` based on your history.

### 📊 Inventory Automation
**TradeFlow Nepal** features "Smart Sync" inventory:
- **Sale Sync**: Every time you create an **Invoice**, the system automatically deducts those items from your warehouse stock.
- **Shipment Sync**: When you record a new **Shipment Record** (Import), it adds items back into your inventory.
- **Manual Adjustments**: Use the **Stock Ledger** page to manually add or remove stock for adjustments or damage.

---

## 3. Invoicing System

### 📄 Creating Tax Invoices
1. Go to **Invoices > New Invoice**.
2. **Select Party**: Choose a customer from your saved parties.
3. **Add Items**: Select products from your list. The system will automatically fetch the price and current stock.
4. **Currency & Exchange**: If billing in USD or EUR, enter the exchange rate to NPR.
5. **VAT**: Toggle the **"Apply VAT (13%)"** checkbox for professional tax compliance.

### 💰 Recording Payments
- On the **Invoice Details** page, you can click **"Record Payment"**.
- This tracks partial or full payments. 
- The status will automatically change from **"Sent"** to **"Partially Paid"** or **"Paid"**.

---

## 4. Analytics & Reporting

### 📈 Dashboard
Your dashboard provides a "Bird's Eye View" of your business:
- **Revenue tracking**: See your monthly income growth.
- **Low Stock Alerts**: Instantly see which items need re-ordering.
- **Unpaid Invoices**: Track who owes you money.

---

## 5. Maintenance & Support

### 💾 Backup
The application stores all data locally in your **AppData** folder for privacy and speed. We recommend backing up the `tradeflow.db` file periodically.

---

### 📄 Exporting this Guide to PDF
To share this manual as a PDF with your client:
1. Open this file in **Microsoft Edge** or **Google Chrome**.
2. Press `Ctrl + P` (Print).
3. Select **"Save as PDF"**.
4. You now have a professional, formatted document!

---
**Build Version:** 1.0.0
**Region:** Nepal Business Edition
