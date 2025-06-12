import React from "react";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
// Dashboard removed as we're using OrderPOS as home page
import MenuList from "./pages/Menu/MenuList";
import IngredientList from "./pages/Ingredient/IngredientList";
import UserList from "./pages/Users/UserList";
import Login from "./pages/Auth/Login";
import PromotionList from "./pages/Promotion/PromotionList";
import CostList from "./pages/Cost/CostList";
import QRCodeList from "./pages/QRCode/QRCodeList";
import OrderPOS from "./pages/Order/OrderPOS";
import InvoiceList from "./pages/Invoice/InvoiceList";
// SuperDashboard removed as it's no longer needed
import SmartDashboard from "./pages/SmartDashboard/SmartDashboard";
import RequireAuth from "./pages/Auth/RequireAuth.tsx";
import {AuthProvider, useAuthLogin} from "./hooks/context/AuthContext.tsx";
import ReceiptList from "./pages/Reciep/RecipeList.tsx";

const App: React.FC = () => {
    const {role} = useAuthLogin();
    return (
        <BrowserRouter>
            <Routes>
                {/* Các route cần đăng nhập nằm trong MainLayout */}
                <Route path="/" element={<RequireAuth>
                    <MainLayout/>
                </RequireAuth>}>
                    {role ? <>
                        <Route index element={<OrderPOS/>}/>
                        <Route path="menu" element={<MenuList/>}/>
                        <Route path="inventory" element={<IngredientList/>}/>
                        <Route path="users" element={<UserList/>}/>
                        <Route path="promotion" element={<PromotionList/>}/>

                        <Route path="qrcode" element={<QRCodeList/>}/>
                        <Route path="orders" element={<OrderPOS/>}/>
                        <Route path="invoices" element={<InvoiceList/>}/>
                        <Route path="smart-dashboard" element={<SmartDashboard/>}/>
                        <Route path="receipt" element={<ReceiptList/>}/>
                    </> : <>
                        <Route path="cost" element={<CostList/>}/>
                        <Route index element={<OrderPOS/>}/>
                        {/*<Route path="smart-dashboard" element={<SmartDashboard/>}/>*/}
                        <Route path="receipt" element={<ReceiptList/>}/>
                    </>}

                </Route>
                {/* Route đăng nhập riêng biệt, không dùng layout */}
                <Route path="/login" element={<Login/>}/>
                {/* Redirect tất cả đường dẫn không hợp lệ về trang chủ */}
                <Route path="*" element={<Navigate to="/" replace/>}/>
            </Routes>
        </BrowserRouter>
    );
};

const AuthenApp = () => {
    return (<AuthProvider>
        <App/>
    </AuthProvider>)
}
export default AuthenApp;
