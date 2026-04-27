export const CURRENCIES = [
  { code: "NPR", name: "Nepalese Rupee", symbol: "Rs." },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
] as const;

export const PRODUCT_CATEGORIES = [
  "Raw Material",
  "Finished Good",
  "Semi-Finished",
] as const;

export const UNITS_OF_MEASURE = [
  "kg",
  "piece",
  "carton",
  "MT",
  "liter",
  "dozen",
  "gram",
  "meter",
  "sq. meter",
  "cu. meter",
  "pair",
  "set",
  "bundle",
  "roll",
  "bag",
] as const;

export const PRODUCT_STATUSES = ["Active", "Inactive"] as const;

export const PARTY_TYPES = ["Customer", "Supplier", "Both"] as const;

export const PAYMENT_TERMS = [
  "Advance",
  "Net 7",
  "Net 15",
  "Net 30",
  "Net 45",
  "Net 60",
  "Net 90",
  "Letter of Credit",
  "CAD (Cash Against Documents)",
  "On Delivery",
] as const;

export const INVOICE_TYPES = [
  "Proforma Invoice",
  "Commercial Invoice",
  "Tax Invoice",
  "Packing List",
  "Debit Note",
  "Credit Note",
] as const;

export const INVOICE_STATUSES = [
  "Draft",
  "Sent",
  "Paid",
  "Partially Paid",
  "Overdue",
  "Cancelled",
] as const;

export const INCOTERMS = [
  "EXW",
  "FCA",
  "FAS",
  "FOB",
  "CFR",
  "CIF",
  "CPT",
  "CIP",
  "DAP",
  "DPU",
  "DDP",
] as const;

export const BORDER_CROSSINGS = [
  "Tribhuwan International Airport (TIA)",
  "Birgunj (Raxaul)",
  "Biratnagar",
  "Bhairahawa (Sunauli)",
  "Tatopani",
  "Rasuwagadhi",
  "Kodari",
  "Nepalgunj",
  "Kakarbhitta",
  "Maheshpur",
] as const;

export const FREIGHT_MODES = [
  "Air",
  "Sea",
  "Road",
  "Rail",
  "Multimodal",
] as const;

export const TRANSPORT_MODES = ["Road", "Rail"] as const;

export const PROVINCES_NEPAL = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
] as const;

export const PAYMENT_METHODS = [
  "Bank Transfer",
  "Cash",
  "Cheque",
  "Letter of Credit",
  "Wire Transfer",
  "Mobile Payment",
] as const;

export const VAT_RATE = 0.13;

export const FISCAL_YEAR_START_MONTH = 7;

export const BS_MONTHS = [
  "Baishakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
] as const;

export const AD_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;
