import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/auth/LoginPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { ProductsPage } from "./pages/products/ProductsPage";
import { StockLedgerPage } from "./pages/products/StockLedgerPage";
import { PartiesPage } from "./pages/parties/PartiesPage";
import { InvoicesListPage } from "./pages/invoices/InvoicesListPage";
import { NewInvoicePage } from "./pages/invoices/NewInvoicePage";
import { CostSheetPage } from "./pages/costing/CostSheetPage";
import { CostSheetsListPage } from "./pages/costing/CostSheetsListPage";
import { RoutesPage } from "./pages/routes/RoutesPage";
import { ProfitTargetsPage } from "./pages/profit/ProfitTargetsPage";
import { SettingsPage } from "./pages/settings/SettingsPage";
import { ReportsPage } from "./pages/reports/ReportsPage";

export default function App() {
  const { isLoggedIn } = useAuthStore();

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!isLoggedIn ? <LoginPage /> : <Navigate to="/dashboard" />}
        />

        {isLoggedIn ? (
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Inventory */}
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/stock-ledger" element={<StockLedgerPage />} />
            
            {/* Sales & Invoicing */}
            <Route path="/invoices" element={<InvoicesListPage />} />
            <Route path="/invoices/new" element={<NewInvoicePage />} />
            <Route path="/customers" element={<PartiesPage partyType="Customer" />} />
            
            {/* Costing */}
            <Route path="/costing" element={<CostSheetsListPage />} />
            <Route path="/costing/new" element={<CostSheetPage />} />
            <Route path="/routes" element={<RoutesPage />} />
            
            {/* Business Analysis */}
            <Route path="/profit-targets" element={<ProfitTargetsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            
            {/* Suppliers */}
            <Route path="/suppliers" element={<PartiesPage partyType="Supplier" />} />
            
            {/* App Settings */}
            <Route path="/settings" element={<SettingsPage />} />

            {/* Default redirect to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
}
