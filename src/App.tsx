import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore, useUIStore } from "./stores";
import { SplashScreen } from "./components/shared";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/auth/LoginPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { ProductsPage } from "./pages/products/ProductsPage";
import { StockLedgerPage } from "./pages/products/StockLedgerPage";
import { PartiesPage } from "./pages/parties/PartiesPage";
import { InvoicesListPage } from "./pages/invoices/InvoicesListPage";
import { NewInvoicePage } from "./pages/invoices/NewInvoicePage";
import { InvoiceDetailPage } from "./pages/invoices/InvoiceDetailPage";
import { CostSheetPage } from "./pages/costing/CostSheetPage";
import { CostSheetsListPage } from "./pages/costing/CostSheetsListPage";
import { CostSheetDetailPage } from "./pages/costing/CostSheetDetailPage";
import { RoutesPage } from "./pages/routes/RoutesPage";
import { ProfitTargetsPage } from "./pages/profit/ProfitTargetsPage";
import { SettingsPage } from "./pages/settings/SettingsPage";
import { ReportsPage } from "./pages/reports/ReportsPage";
import { AccountingPage } from "./pages/reports/AccountingPage";
import { ForexLandedCostPage } from "./pages/forex/ForexLandedCostPage";
import BankHistoryPage from "./pages/banking/BankHistoryPage";
import ProductionTrackingPage from "./pages/production/ProductionTrackingPage";

export default function App() {
  const { isLoggedIn, checkExistingAccount } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  const { theme } = useUIStore();

  useEffect(() => {
    const applyTheme = () => {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");

      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    };

    applyTheme();

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  useEffect(() => {
    // Simulate a professional boot sequence to ensure the splash screen is visible
    const timer = setTimeout(() => {
        checkExistingAccount().finally(() => {
            setIsInitializing(false);
        });
    }, 2500);

    return () => clearTimeout(timer);
  }, [checkExistingAccount]);

  if (isInitializing) {
    return <SplashScreen />;
  }

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
            <Route path="/production" element={<ProductionTrackingPage />} />
            <Route path="/bank-history" element={<BankHistoryPage />} />
            
            {/* Sales & Invoicing */}
            <Route path="/invoices" element={<InvoicesListPage />} />
            <Route path="/invoices/new" element={<NewInvoicePage />} />
            <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
            <Route path="/customers" element={<PartiesPage partyType="Customer" />} />
            
            {/* Costing */}
            <Route path="/costing" element={<CostSheetsListPage />} />
            <Route path="/costing/new" element={<CostSheetPage />} />
            <Route path="/costing/:id" element={<CostSheetDetailPage />} />
            <Route path="/routes" element={<RoutesPage />} />
            
            {/* Business Analysis */}
            <Route path="/profit-targets" element={<ProfitTargetsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/accounting" element={<AccountingPage />} />
            <Route path="/forex" element={<ForexLandedCostPage />} />
            
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
