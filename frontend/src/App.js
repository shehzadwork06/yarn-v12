
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { Toaster } from "sonner";
// import LoginPage from "@/pages/LoginPage";
// import DashboardPage from "@/pages/DashboardPage";
// import ProductsPage from "@/pages/ProductsPage";
// import InventoryPage from "@/pages/InventoryPage";
// import LotsPage from "@/pages/LotsPage";
// import SuppliersPage from "@/pages/SuppliersPage";
// import CustomersPage from "@/pages/CustomersPage";
// import PurchasesPage from "@/pages/PurchasesPage";
// import ManufacturingPage from "@/pages/ManufacturingPage";
// import SalesPage from "@/pages/SalesPage";
// import GatePassPage from "@/pages/GatePassPage";
// import EmployeesPage from "@/pages/EmployeesPage";
// import AttendancePage from "@/pages/AttendancePage";
// import PayrollPage from "@/pages/PayrollPage";
// import FinancePage from "@/pages/FinancePage";
// import WastagePage from "@/pages/WastagePage";
// import AuditLogsPage from "@/pages/AuditLogsPage";
// import { AppLayout } from "@/components/AppLayout";
// import Categories from "@/pages/Categories";
// import PurchaseReturnsPage from "@/pages/PurchaseReturnsPage";
// import SaleReturnsPage from "@/pages/SaleReturnsPage";
// function ProtectedRoute({ children }) {
//   const token = localStorage.getItem("erp_token");
//   if (!token) return <Navigate to="/login" replace />;
//   return children;
// }

// function App() {
//   return (
//     <div className="min-h-screen bg-[#020408]">
//       <Toaster position="top-right" theme="dark" richColors />
//       <BrowserRouter>
//         <Routes>
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/*" element={
//             <ProtectedRoute>
//               <AppLayout>
//                 <Routes>
//                   <Route index element={<DashboardPage />} />
//                   <Route path="products" element={<ProductsPage />} />
//                   <Route path="categories" element={<Categories />} />
//                   <Route path="inventory" element={<InventoryPage />} />
//                   <Route path="lots" element={<LotsPage />} />
//                   <Route path="suppliers" element={<SuppliersPage />} />
//                   <Route path="customers" element={<CustomersPage />} />
//                   <Route path="purchases" element={<PurchasesPage />} />
//                   <Route path="manufacturing" element={<ManufacturingPage />} />
//                   <Route path="sales" element={<SalesPage />} />
//                   <Route path="gate-passes" element={<GatePassPage />} />
//                   <Route path="employees" element={<EmployeesPage />} />
//                   <Route path="attendance" element={<AttendancePage />} />
//                   <Route path="payroll" element={<PayrollPage />} />
//                   <Route path="finance" element={<FinancePage />} />
//                   <Route path="wastage" element={<WastagePage />} />
//                   <Route path="audit-logs" element={<AuditLogsPage />} />
//                   <Route path="purchase-returns" element={<PurchaseReturnsPage />} />
//                   <Route path="sale-returns" element={<SaleReturnsPage />} />
//                 </Routes>
//               </AppLayout>
//             </ProtectedRoute>
//           } />
//         </Routes>
//       </BrowserRouter>
//     </div>
//   );
// }

// export default App;
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

// Use relative paths for new files to avoid alias issues
import { BusinessModeProvider, useBusinessMode } from "./context/BusinessModeContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import ModeSelectPage from "./pages/ModeSelectPage";

// Existing pages — keep @/ alias as before (already working)
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import ProductsPage from "@/pages/ProductsPage";
import InventoryPage from "@/pages/InventoryPage";
import LotsPage from "@/pages/LotsPage";
import SuppliersPage from "@/pages/SuppliersPage";
import CustomersPage from "@/pages/CustomersPage";
import PurchasesPage from "@/pages/PurchasesPage";
import ManufacturingPage from "@/pages/ManufacturingPage";
import SalesPage from "@/pages/SalesPage";
import GatePassPage from "@/pages/GatePassPage";
import EmployeesPage from "@/pages/EmployeesPage";
import AttendancePage from "@/pages/AttendancePage";
import PayrollPage from "@/pages/PayrollPage";
import FinancePage from "@/pages/FinancePage";
import WastagePage from "@/pages/WastagePage";
import AuditLogsPage from "@/pages/AuditLogsPage";
import PurchaseReturnsPage from "@/pages/PurchaseReturnsPage";
import SaleReturnsPage from "@/pages/SaleReturnsPage";
import ExpensesPage from "@/pages/ExpensesPage";
import { AppLayout } from "@/components/AppLayout";
import Categories from "@/pages/Categories";

// ─── Requires a valid login token ────────────────────────────────────────────
function AuthRoute({ children }) {
  const token = localStorage.getItem("erp_token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

// ─── Requires login AND a chosen business mode ────────────────────────────────
// useBusinessMode() called first — never conditionally
function ModeRoute({ children }) {
  const { businessMode } = useBusinessMode();
  const token = localStorage.getItem("erp_token");
  if (!token) return <Navigate to="/login" replace />;
  if (!businessMode) return <Navigate to="/select-mode" replace />;
  return children;
}

// ─── All routes, rendered inside the Provider ─────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/select-mode"
        element={
          <AuthRoute>
            <ModeSelectPage />
          </AuthRoute>
        }
      />

      <Route
        path="/*"
        element={
          <ModeRoute>
            <AppLayout>
              <Routes>
                <Route index element={<DashboardPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="categories" element={<Categories />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="lots" element={<LotsPage />} />
                <Route path="suppliers" element={<SuppliersPage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="purchases" element={<PurchasesPage />} />
                <Route path="manufacturing" element={<ManufacturingPage />} />
                <Route path="sales" element={<SalesPage />} />
                <Route path="gate-passes" element={<GatePassPage />} />
                <Route path="employees" element={<EmployeesPage />} />
                <Route path="attendance" element={<AttendancePage />} />
                <Route path="payroll" element={<PayrollPage />} />
                <Route path="finance" element={<FinancePage />} />
                <Route path="expenses" element={<ExpensesPage />} />
                <Route path="wastage" element={<WastagePage />} />
                <Route path="audit-logs" element={<AuditLogsPage />} />
                <Route path="purchase-returns" element={<PurchaseReturnsPage />} />
                <Route path="sale-returns" element={<SaleReturnsPage />} />
              </Routes>
            </AppLayout>
          </ModeRoute>
        }
      />
    </Routes>
  );
}

// ─── Themed Toaster Component ─────────────────────────────────────────────────
function ThemedToaster() {
  const { theme } = useTheme();
  return <Toaster position="top-right" theme={theme} richColors />;
}

// ─── Root App ──────────────────────────────────────────────────────────────────
function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background transition-colors duration-300">
        <HashRouter>
          <BusinessModeProvider>
            <ThemedToaster />
            <AppRoutes />
          </BusinessModeProvider>
        </HashRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;