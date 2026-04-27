# TradeFlow
## Complete Business Operations Manual
### Version 1.0 | For Import/Export Firms in Nepal

---

> **This manual explains how a real Nepalese import/export business uses TradeFlow from day one — from company setup through daily operations, invoicing, cost analysis, and financial reporting.**

---

## TABLE OF CONTENTS

1. [Understanding the Software Architecture](#1-understanding-the-software-architecture)
2. [First-Time Setup (Do This Once)](#2-first-time-setup-do-this-once)
3. [Setting Up Your Product Catalog](#3-setting-up-your-product-catalog)
4. [Managing Buyers & Suppliers (Parties)](#4-managing-buyers--suppliers-parties)
5. [The Trade Routes System](#5-the-trade-routes-system)
6. [Shipment Costing — Calculating True Landed Cost](#6-shipment-costing--calculating-true-landed-cost)
7. [Creating & Managing Invoices](#7-creating--managing-invoices)
8. [Recording Payments](#8-recording-payments)
9. [Inventory & Stock Management](#9-inventory--stock-management)
10. [Profit Targets & Margin Planning](#10-profit-targets--margin-planning)
11. [The Dashboard — Your Morning Briefing](#11-the-dashboard--your-morning-briefing)
12. [Forex & Landed Cost Calculator (Live NRB)](#12-forex--landed-cost-calculator-live-nrb)
13. [Business Reports & Analytics](#13-business-reports--analytics)
14. [Financial Accounting Reports](#14-financial-accounting-reports)
15. [Production Tracking (Batch Management)](#15-production-tracking-batch-management)
16. [Bank History & Wire Transfers](#16-bank-history--wire-transfers)
17. [Nepal-Specific Regulatory Guidance](#17-nepal-specific-regulatory-guidance)
18. [Practical Month-by-Month Workflow](#18-practical-month-by-month-workflow)
19. [Frequently Asked Questions](#19-frequently-asked-questions)

---

## 1. Understanding the Software Architecture

TradeFlow is a **desktop application** — it runs entirely on your computer, requires no internet connection for daily operations, and stores all data locally in an encrypted SQLite database on your machine at:

```
C:\Users\[YourName]\AppData\Local\TradeFlow\tradeflow.db
```

**What this means for your business:**
- Your financial data never leaves your computer. No cloud risk.
- Works offline at all times — no internet subscription required.
- Data persists between sessions automatically.
- You can back up your data by copying the `.db` file above to an external drive.

### How the modules connect:

```
Products (Inventory)
     ↓
Shipment Costing → Landed Cost Per Unit → Updates Product Cost
     ↓
Invoices → Auto-deduct stock → Payment Tracking
     ↓
Dashboard / Reports ← pulls from all of the above in real time
```

---

## 2. First-Time Setup (Do This Once)

### Step 2.1 — Create Your Account

When you first open TradeFlow, you will be asked to create an account. This is a **local account** — it just protects the software on your PC with a password. No internet registration.

1. Choose **Create New Account**
2. Enter your email (used as your username) and a password
3. Click **Sign Up**

> **Note:** There is only ever one account per installation. If you forget your password, you must reinstall the software (your data in the `.db` file is preserved separately).

---

### Step 2.2 — Set Up Your Company Profile

Navigate to **Settings → Company Profile**. This is the most important step because the information here appears on **every invoice and document** you generate.

Fill in every field:

| Field | What to Enter | Why It Matters |
|---|---|---|
| **Company Name** | Your registered firm name exactly as on your PAN certificate | Appears on all invoices |
| **Owner Name** | Authorized signatory name | For document signing |
| **PAN Number** | Your 9-digit PAN from IRD Nepal | Required on all tax invoices by Nepal law |
| **VAT Number** | If VAT-registered, your 9-digit VAT number | Required if you apply VAT on invoices |
| **Registration Number** | OCR/Company registration number | Legal document compliance |
| **Phone (Primary)** | Main office number | Customer-facing contact |
| **Email** | Official company email | Appears on invoices |
| **Website** | (Optional) your website URL | Professional appearance |
| **Address** | Full address: Street, Ward No., Municipality, District, Province | Address block on invoices |
| **Bank Name** | e.g., Himalayan Bank Ltd. | Appears in payment section of invoices |
| **Account Number** | Your export account number | Buyers need this for wire transfers |
| **Account Name** | Name on the bank account | Must match exactly |
| **Branch** | Branch name | For correspondence |
| **SWIFT Code** | e.g., HIMANPKA | **Critical for international wire transfers** |
| **Logo** | Upload your company logo (PNG/JPG) | Professional invoice branding |
| **Default Currency** | NPR (for domestic) or USD (if you invoice in USD) | Sets the default on new invoices |
| **Fiscal Year Start** | Month 4 (Shrawan/July) for Nepal fiscal year | Correct fiscal year labeling |
| **Terms & Conditions** | Standard payment and legal terms | Printed at the bottom of every invoice |

**Sample Terms & Conditions text:**
```
1. Payment is due within 30 days of invoice date unless otherwise agreed in writing.
2. All goods remain the property of [Your Company] until full payment is received.
3. Export goods comply with all Nepal customs regulations and international trade laws.
4. Disputes shall be resolved under the laws of Nepal, jurisdiction of Kathmandu courts.
5. Interest of 18% per annum applies to invoices unpaid after the due date.
```

---

## 3. Setting Up Your Product Catalog

Navigate to **Products (Inventory)**. Every item you buy or sell must be registered here first.

### Step 3.1 — Add a New Product

Click **+ Add Product** and fill in the form:

| Field | Guidance |
|---|---|
| **Product Name** | Descriptive name, e.g., "Ilam First Flush Orthodox Black Tea" |
| **Category** | Group products logically, e.g., "Tea & Spices", "Handicraft", "Food Products" |
| **HS Code** | **Mandatory.** The Harmonized System code for customs. See Section 14. |
| **Unit of Measure** | KG, Piece, Litre, Box, MT — choose what you count stock in |
| **Country of Origin** | Usually "Nepal" for exports |
| **Description** | A one-line product description for invoices |
| **Current Stock** | How many units you have right now in the warehouse |
| **Reorder Level** | When stock drops to this number, the dashboard alerts you. Set to ~10-15% of your usual order quantity |
| **Buying Price (NPR)** | Your **landed cost per unit** — the true cost after all freight and duties (see Section 6) |
| **Selling Price (NPR)** | Your standard export price per unit |
| **Status** | Active = visible everywhere. Inactive = archived, hidden from dropdowns |

### Step 3.2 — Understanding Stock Flow

Stock in TradeFlow moves automatically:

- **Stock INCREASES** when: You save a new Shipment Cost Record (the system assumes goods arrived) or a Production record.
- **Stock DECREASES** when: You create an invoice with this product as a line item.

You can also manually adjust stock using **Inventory → Stock Ledger → Add Transaction** for corrections, returns, or adjustments.

### Step 3.3 — The Stock Ledger

Click any product's **"View Ledger"** button to see a full chronological history of every stock movement — purchases, sales, adjustments, or production batches.

### Step 3.4 — Costing Shortcut
You will notice a **Calculator Icon** next to each product. Clicking this takes you directly to the **Forex & Landed Cost** module to instantly analyze the profitability of that specific item.

> **UX Tip:** All numeric fields in TradeFlow are designed for speed. When you click into a field, it clears automatically so you can type your numbers immediately without deleting "0"s manually.

---

## 4. Managing Buyers & Suppliers (Parties)

Navigate to **Customers** (for buyers) or **Suppliers** (for your vendors). Internally both use the same "Parties" system.

### Step 4.1 — Adding a Customer (Buyer)

| Field | Guidance |
|---|---|
| **Type** | Customer |
| **Company Name** | Their registered business name |
| **Contact Person** | The person you deal with |
| **Email / Phone** | Communication details |
| **Country** | Their country, e.g., "United Arab Emirates" |
| **Address** | Full mailing address for the invoice "Bill To" block |
| **PAN / Tax ID** | Their VAT/TRN number if required |
| **Payment Terms** | "Net 30", "Net 45", "Advance Payment", "Letter of Credit" etc. |
| **Default Currency** | USD for UAE/USA, EUR for Germany, GBP for UK, CAD for Canada |
| **Notes** | Any important information: preferred incoterm, special packaging requirements, etc. |

### Step 4.2 — Adding a Supplier (Vendor)

Same form, but select **Type = Supplier**. Suppliers are the farmers, cooperatives, or factories you buy from:

- Ilam Tea Estate Cooperative → tea supplier
- Carpet weavers cooperative → handicraft supplier
- Lamjung honey producers → food supplier

Keeping suppliers in the system means you can:
- Track which supplier provides which products
- Record buying prices against supplier names
- Reference supplier names on shipment cost sheets

---

## 5. The Trade Routes System

Navigate to **Trade Routes**. This is a reference library of your standard shipping pathways.

### Why Routes Matter

Every real export follows a physical path from your warehouse to the buyer's door. The route determines:
- Transit time (estimated days)
- Freight cost range
- Border crossing requirements
- Documentary requirements (ICP clearance, transit permits)

### Adding a Route

| Field | Example |
|---|---|
| **Route Name** | "Kathmandu to Dubai (Air Cargo)" |
| **Border Crossing** | "Tribhuvan International Airport (TIA)" |
| **Transit Country** | "None" (for air) or "India" (for sea via Kolkata) |
| **Freight Mode** | Air / Sea / Road |
| **Est. Freight Cost** | Approximate cost in NPR for a standard shipment |
| **Est. Transit Days** | 3 days (air to Dubai), 45 days (sea to Germany) |
| **Notes** | Carrier names, booking contacts, special notes |

### Common Nepal Export Routes

| Route | Border | Mode | Days |
|---|---|---|---|
| KTM → Dubai | TIA | Air | 3 |
| KTM → London | TIA | Air | 5 |
| KTM → New York | TIA | Air | 5-6 |
| Birgunj → Hamburg | Birgunj-Raxaul ICP → Kolkata Port | Sea | 40-50 |
| Birgunj → Mundra | Birgunj-Raxaul ICP | Road+Sea | 25-35 |

> **Tip:** Save all your regular routes once. When doing Shipment Costing, you can reference these for freight price estimates.

---

## 6. Shipment Costing — Calculating True Landed Cost

Navigate to **Shipment Costing**. This is the **most powerful and most important** tool in TradeFlow. 

### Why This Matters (The Real-Business Problem)

A common mistake among new exporters: they look at the farm gate price of Rs. 125/KG for tea and think "I'm selling at Rs. 195/KG, so I'm making Rs. 70/KG profit."

**Wrong.** The actual cost to get tea from Ilam to Dubai includes:

| Cost Component | Approx. NPR per 150 KG |
|---|---|
| Farm buying price | 18,750 |
| Transport Ilam → Kathmandu | 8,500 |
| Packaging (food-grade, export) | 2,200 |
| Fumigation certificate | 650 |
| Customs Agent Fee (Nepal) | 3,500 |
| Export Declaration Fee | 1,500 |
| Customs Exam Fee | 800 |
| Certificate of Origin | 1,200 |
| Phytosanitary Certificate | 950 |
| Export Permit | 1,800 |
| Document Preparation | 750 |
| Terminal Handling (TIA) | 2,500 |
| Air Freight | 8,000 |
| Freight Insurance | 1,650 |
| AWB Charges | 950 |
| **Total Cost** | **~53,750** |
| **Per KG Landed Cost** | **Rs. 358/KG** |

vs. naive calculation of Rs. 125/KG. The true cost is **2.86x higher**.

**TradeFlow's Shipment Costing does this calculation automatically.**

### Step 6.1 — Creating a Cost Sheet

1. Click **+ New Cost Sheet**
2. Fill in the **Header**:
    - **Name**: e.g., "Tea Shipment - Dubai Q1 2082"
    - **Product**: Select from your product catalog
    - **Quantity**: e.g., 150 KG
    - **Unit Buying Price**: Price paid to supplier
    - **Incoterm**: CIF / FOB / EXW (see Section 14)

3. Fill in **Origin Costs** (Nepal-side):
    - Transport (farm/factory → Kathmandu or border)
    - Loading/Unloading
    - Packaging
    - Fumigation
    - Customs Agent Fee
    - Export Declaration Fee
    - Customs Exam Fee
    - Certificate of Origin
    - Phytosanitary Certificate
    - Export Permit
    - Document Preparation
    - Terminal Handling

4. Fill in **Freight**:
    - Mode: Air or Sea
    - Freight Cost (you can enter in USD/EUR and the app converts at your exchange rate)
    - Freight Insurance
    - BL/AWB Charges

5. Fill in **Destination Costs** (buyer's country, for CIF quotes):
    - Import Duty %
    - VAT/GST %
    - Customs Clearance
    - Last Mile Delivery
    - Other

6. Fill in **Finance Costs**:
    - LC (Letter of Credit) charges from your bank
    - Bank Commission
    - Wire Transfer fee

7. Set **Contingency %** (usually 2-3%) for unexpected costs.

8. Click **Calculate** — the app shows you:
   - Total Cost
   - **Cost Per Unit**
   - This is your **true landed cost / minimum break-even price**

> **New Integration:** You can now perform these calculations with **Live Exchange Rates** (see Section 12).

### Step 6.2 — Linking Cost Sheet to an Invoice

Once you know your cost, you can directly link the cost sheet to the invoice you create for this shipment. This automatically populates freight charges on the invoice and links the two records for reporting.

### Step 6.3 — After Saving

When you save a new Cost Sheet, the system **automatically adds the quantity to your product's stock** (it assumes goods have arrived). If the goods arrive later, you can adjust the stock manually via the Stock Ledger.

---

## 7. Creating & Managing Invoices

Navigate to **Invoices**. This is where you generate the legal commercial documents for your export sales.

### Step 7.1 — The Invoice Workflow

```
Draft → Sent → Partially Paid → Paid
             ↘
              Overdue (if past due date and unpaid)
```

### Step 7.2 — Creating a New Invoice

Click **+ New Invoice**:

**Section 1 — Invoice Details**
- **Invoice Number**: Auto-generated (e.g., TFL-2081-001). Do not change unless you have your own numbering system.
- **Invoice Type**: Commercial Invoice (standard export), Proforma Invoice (before shipment for LC/customs), Tax Invoice (domestic VAT purposes)
- **Invoice Date**: Date you are issuing
- **Due Date**: Payment due date (based on your agreed terms with that customer)
- **Currency**: USD/EUR/GBP/NPR — the currency you are charging in
- **Exchange Rate**: If billing in foreign currency, enter today's NRB rate

**Section 2 — Customer (Bill To)**
- Select your customer from the dropdown (parties you added in Section 4)
- The address, country, PAN fields fill automatically

**Section 3 — Shipping Details**
- **Ship To**: Can be different from Bill To (e.g., a different warehouse address)
- **Incoterm**: The trade term (CIF/FOB/EXW) — defines who pays freight and bears risk
- **Port of Loading**: Where goods leave Nepal (e.g., "Kathmandu TIA", "Kolkata Port")
- **Port of Discharge**: Where goods arrive at buyer (e.g., "Dubai Int'l Airport")
- **Country of Origin**: Nepal
- **Country of Destination**: Buyer's country

**Section 4 — Line Items**
- Click **+ Add Item**
- Select product from dropdown (or type a custom description)
- Enter **Quantity** and **Unit** (KG, Piece, etc.)
- **Unit Price** auto-fills from your product's selling price (you can override)
- **Discount %**: Apply line-item discounts if negotiated
- Add as many line items as needed (one product, multiple products, services, etc.)

**Section 5 — Totals**
- **Subtotal**: Auto-calculated from line items
- **Freight**: Enter the freight charge you're passing to the buyer (for CIF invoices)
- **Insurance**: Insurance charged to buyer
- **Discount**: Invoice-level discount
- **VAT (13%)**: Check this box if the sale is VAT-taxable (domestic) — do NOT apply for exports
- **Grand Total**: Final amount due

**Section 6 — Weights & Packaging**
- **Weight (KG)**: Total Gross Weight of the shipment
- **Cartons**: Total number of boxes/cartons
- **Transport Mode**: Air / Sea / Road / Courier

**Section 7 — Terms**
- Terms and Conditions auto-fill from your company profile
- Add any invoice-specific notes (LC number, PO reference, special instructions)

Click **Create Invoice**.

### Step 7.3 — Printing / Sharing Invoices

From the invoice detail page, click **Print Invoice**. This opens a print-ready, A4-formatted commercial invoice that you can:
- Print on paper (hand over at customs)
- Save as PDF (File → Print → Microsoft Print to PDF)
- Email the PDF to your buyer

The printed invoice includes: your logo, company details, buyer details, HS codes, line items, totals, bank details, terms, and all shipping fields.

### Step 7.4 — Stock Auto-Deduction

When you create a **Paid** or **Sent** invoice with product line items, the system **automatically deducts** those quantities from your product stock. This keeps your inventory accurate without any manual adjustment.

---

## 8. Recording Payments

When a buyer pays you, record it in the system to:
- Mark the invoice as Paid
- Update accounts receivable
- Keep accurate financial reports

### Steps:

1. Open the invoice from **Invoices** list
2. Click the **Record Payment** button on the invoice detail page
3. Fill in:
   - **Amount**: The amount received (can be less than total for partial payments)
   - **Date**: Date received
   - **Method**: Bank Transfer / Letter of Credit / Wire Transfer / Cheque / Cash
   - **Reference**: Bank transaction reference number (very important for audit)
   - **Notes**: Any useful notes

4. Click **Save Payment**

The system automatically:
- Updates the invoice status (Partially Paid → Paid when full amount received)
- Calculates total received vs. balance outstanding
- Reflects in the Dashboard's revenue figures

> **Important for Nepal Business:** Always record the bank's reference number (TT reference). IRD may audit your export payments and you need documentary evidence matching your invoices.

---

## 9. Inventory & Stock Management

Navigate to **Products → Stock Ledger** to view the full stock history for any product.

### Manual Stock Adjustments

Sometimes you need to adjust stock outside of invoices and cost sheets:

| Scenario | Transaction Type | Action |
|---|---|---|
| Goods returned by customer | Stock Return | Add quantity_in |
| Damaged/expired goods | Write-off | Add quantity_out |
| Opening balance correction | Opening Stock | Add quantity_in |
| Goods sent for inspection sample | Sample Out | Add quantity_out |
| Physical stock count correction | Adjustment | In or out as needed |

### Reading the Stock Ledger

Each row shows:
- Date
- Transaction Type (Purchase/Sale/Return/Adjustment)
- Quantity In / Quantity Out
- Reference (Invoice number or PO number)
- Notes

The **running balance** at any date is your stock level at that point in time.

### The Low Stock Alert System

When any product's **Current Stock** drops to or below its **Reorder Level**, it appears:
- On the Dashboard in the **Low Stock Alerts** panel (in red)
- The Dashboard KPI card "Low Stock Alerts" shows the count

---

## 10. Profit Targets & Margin Planning

Navigate to **Profit Targets**. This module lets you set, track, and compare your target profit margins against actuals.

### Setting a Target

For each product, set:
- **Target Margin %**: e.g., 35% gross margin on tea
- **Target Per Unit (NPR)**: e.g., Rs. 56 per KG expected profit
- **Notes**: The strategic rationale

### How to Use Targets

The Profit Targets page shows whether your **actual selling price and cost price** are meeting the target.

---

## 11. The Dashboard — Your Morning Briefing

The Dashboard is designed to be the first thing you look at every working day. Here's how to read it:

### KPI Cards (Top Row)

| Card | What it Shows | Action if Concerning |
|---|---|---|
| **Total Revenue** | Sum of all PAID invoices (actual cash received) | Compare month-over-month |
| **Gross Profit** | Revenue minus total shipment costs | Should be > 25% of revenue |
| **Paid Invoices** | Count of paid vs. pending invoices | Chase overdue payments |
| **Low Stock Alerts** | Products below reorder level | Contact supplier immediately |

### Charts & Analytics
The dashboard features interactive charts for revenue trends, country distribution, and product performance. Use these to visualize the pulse of your trade business at a glance.

---

## 12. Forex & Landed Cost Calculator (Live NRB)

Navigate to **Forex & Landed Cost**. This module is specifically designed for the Nepalese regulatory environment, integrating directly with **Nepal Rastra Bank (NRB)** data.

### 12.1 — Live Exchange Rates
The system automatically fetches the latest daily currency rates (USD, INR, EUR, etc.) from the NRB.
- **Auto-Sync**: Click "Refresh Rates" to get the latest published mid-rates.
- **Offline Support**: The last fetched rates are saved so you can work even without an internet connection.

### 12.2 — Advanced Custom Duty Calculator
Instead of manual math, use the HS Code integration:
1. **Search HS Code**: Type your product name (e.g., "Tea" or "Almonds").
2. **Apply Duties**: The system automatically pulls the latest Customs Duty (%), Excise Duty (%), and VAT (%) associated with that code in Nepal.
3. **Landed Cost Breakdown**: Enter your CIF value, and the calculator shows a transparent breakdown of every paisa you'll pay at the border.

### 12.3 — Historical Analysis
Every "Saved" calculation is stored in your **Calculation History**. This is vital for comparing how your per-unit landed costs change as exchange rates fluctuate over the months.

---

## 13. Business Reports & Analytics

Navigate to **Reports**. This section gives you management-level analytics.

### Revenue by Market (Pie Chart)
Total revenue distributed by buyer country. Useful for planning where to attend trade fairs and for credit risk assessment per market.

### Export to CSV
You can download your entire invoice activity log as a CSV to share with your accountant or for private analysis in Excel.

---

## 14. Financial Accounting Reports

Navigate to **Accounting**. This provides a simplified financial statement for business reviews.

### Income Statement (P&L)

| Line | Calculation |
|---|---|
| Gross Sales Revenue | Sum of all invoices (paid and unpaid) |
| Less: Cost of Goods Sold | Total shipment costs minus closing stock value |
| **Gross Profit** | Revenue minus COGS |

> **Note for your accountant:** This is a simplified gross-profit P&L. It does not include operating expenses (rent, salaries, utilities).

---

## 15. Production Tracking (Batch Management)

Navigate to **Production Tracking**. For manufacturing operations, this module handles the conversion of raw work into finished inventory.

1. **Post Production**: Click "+ Post New Production".
2. **Select Product**: Choose the finished good (e.g., "Mero Snack 50g").
3. **Batch Number**: For quality control and ISO compliance.
4. **Automated Stock**: Saving a production record **instantly increases** your warehouse inventory for that product.
5. **Ledger Integration**: All production is logged in the Stock Ledger with a "Production" label for full traceability.

---

## 16. Bank History & Wire Transfers

Navigate to **Bank History**. This is your central hub for tracking cash-on-hand and international wire transfers.

- **Paisa Accuracy**: All financial tracking is handled at the paisa level for perfect auditing.
- **Exchange Rate Tracking**: When receiving or paying in foreign currency, record the specific exchange rate used by your bank.
- **Purpose Categories**: Tag transactions as "Customs Duty", "Supplier Payment", "Export Receipt", etc.
- **Net Position**: Instantly see your total inflows and outflows across all business channels.

---

## 17. Nepal-Specific Regulatory Guidance

### 14.1 HS Codes (Harmonized System Codes)

Every product exported from Nepal **must** have an HS Code declared to Customs. Common codes for Nepal exports:

| Product | HS Code |
|---|---|
| Black Tea (unprocessed) | 0902.10 |
| Green Tea | 0902.20 |
| Honey (natural) | 0409.00 |
| Hand-knotted carpets | 5701.10 |
| Pashmina/Cashmere | 5107.10 |
| Coffee (unroasted) | 0901.11 |

### 14.2 Incoterms (International Commercial Terms)
The agreed Incoterm (CIF, FOB, EXW) defines who bears freight cost and risk. **CIF** is recommended for most Nepali exporters as it gives you control over shipping.

---

## 18. Practical Month-by-Month Workflow

### Every Morning (5-10 minutes)
1. Open TradeFlow
2. Check the **Dashboard** for alerts and dues.

### When an Order Arrives
1. Add Party/Product if new.
2. Create Commercial Invoice.
3. Arrange shipment.
4. Create Shipment Cost Sheet.

### When Payment Arrives
1. Click **Record Payment** on the invoice.
2. Enter bank reference number.

---

## 19. Frequently Asked Questions

**Q: Can I use this for both import and export?**
A: Yes. For imports, your "Customers" are your domestic buyers. Enter the foreign seller as a "Supplier". The Cost Sheet will capture all import duties.

**Q: Can multiple people use this?**
A: Currently, the database is local to one computer. Share the `.db` file for multi-user scenarios.

---

*TradeFlow — Built for the modern Nepali trader.*
