import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
// Dashboard removed as we're using OrderPOS as home page
import MenuList from "./pages/Menu/MenuList";
import AppDownloadPage from "./pages/AppDownload/AppDownloadPage";
import IngredientList from "./pages/Ingredient/IngredientList";
import RecipeList from "./pages/Recipe/RecipeList";
import UserList from "./pages/Users/UserList";
import Login from "./pages/Auth/Login";
import PromotionList from "./pages/Promotion/PromotionList";
import CostList from "./pages/Cost/CostList";
import QRCodeList from "./pages/QRCode/QRCodeList";
import OrderPOS from "./pages/Order/OrderPOS";
import InvoiceList from "./pages/Invoice/InvoiceList";
// SuperDashboard removed as it's no longer needed
import SmartDashboard from "./pages/SmartDashboard/SmartDashboard";

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Các route cần đăng nhập nằm trong MainLayout */}
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<OrderPOS />} />
                    <Route path="menu" element={<MenuList />} />
                    <Route path="inventory" element={<IngredientList />} />
                    <Route path="recipe" element={<RecipeList />} />
                    <Route path="users" element={<UserList />} />
                    <Route path="promotion" element={<PromotionList />} />
                    <Route path="cost" element={<CostList />} />
                    <Route path="qrcode" element={<QRCodeList />} />
                    <Route path="orders" element={<OrderPOS />} />
                    <Route path="invoices" element={<InvoiceList />} />
                    <Route path="app-download" element={<AppDownloadPage />} />
                    <Route path="smart-dashboard" element={<SmartDashboard />} />
                </Route>
                {/* Route đăng nhập riêng biệt, không dùng layout */}
                <Route path="/login" element={<Login />} />
                {/* Redirect tất cả đường dẫn không hợp lệ về trang chủ */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
