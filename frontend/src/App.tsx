import { Navigate, Route, Routes } from "react-router-dom";
import { MainLayout } from "./layout/MainLayout";
import { HomePage } from "./pages/HomePage";
import { ListingPage } from "./pages/ListingPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { AssistantPage } from "./pages/AssistantPage";
import { ComparePage } from "./pages/ComparePage";
import { CartPage } from "./pages/CartPage";
import { SupportPage } from "./pages/SupportPage";
import { AdminConversationsPage, AdminMetricsPage, AdminProductsPage } from "./pages/AdminPages";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:category" element={<ListingPage mode="category" />} />
        <Route path="/search" element={<ListingPage mode="search" />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/admin/products" element={<AdminProductsPage />} />
        <Route path="/admin/conversations" element={<AdminConversationsPage />} />
        <Route path="/admin/metrics" element={<AdminMetricsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
