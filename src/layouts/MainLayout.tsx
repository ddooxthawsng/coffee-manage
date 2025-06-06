import React from "react";
import { Avatar, Layout, Menu } from "antd";
import {
    BarChartOutlined,
    BarcodeOutlined,
    CoffeeOutlined,
    DatabaseOutlined,
    DollarOutlined,
    FileTextOutlined,
    GiftOutlined,
    HomeOutlined,
    LogoutOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;

// Menu cấu trúc nhóm
const menuGroups = [
    {
        label: "Quản lý & Quy trình",
        children: [
            { key: "orders", icon: <HomeOutlined style={{ color: "#1890ff" }} />, label: "Trang chủ (Bán hàng)" },
            { key: "menu", icon: <CoffeeOutlined style={{ color: "#fa8c16" }} />, label: "Menu" },
            { key: "inventory", icon: <DatabaseOutlined style={{ color: "#52c41a" }} />, label: "Nguyên liệu" },
            { key: "cost", icon: <DollarOutlined style={{ color: "#cf1322" }} />, label: "Chi phí" },
            { key: "promotion", icon: <GiftOutlined style={{ color: "#722ed1" }} />, label: "Khuyến mãi" },
        ],
    },
    {
        label: "Giao dịch",
        children: [
            { key: "qrcode", icon: <BarcodeOutlined style={{ color: "#13c2c2" }} />, label: "QR Code" },
            { key: "invoices", icon: <FileTextOutlined style={{ color: "#2f54eb" }} />, label: "Hóa đơn" },
        ],
    },
    {
        label: "Báo cáo & Hệ thống",
        children: [
            {
                key: "smart-dashboard",
                icon: <BarChartOutlined style={{ color: "#1890ff" }} />,
                label: "Dashboard Thông Minh AI"
            },
            { key: "users", icon: <UserOutlined style={{ color: "#eb2f96" }} />, label: "Tài khoản" },
        ],
    },
];

// Map đường dẫn sang key menu
const pathToKey = {
    "/": "orders",
    "/menu": "menu",
    "/inventory": "inventory",
    "/process-output": "process-output",
    "/recipe": "recipe",
    "/cost": "cost",
    "/promotion": "promotion",
    "/qrcode": "qrcode",
    "/orders": "orders",
    "/invoices": "invoices",
    "/smart-dashboard": "smart-dashboard",
    "/users": "users",
};

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleMenuClick = ({ key }) => {
        if (key === "logout") {
            // Xử lý đăng xuất (xóa token, clear state, ...)
            navigate("/login");
        } else {
            navigate(`/${key === "orders" ? "" : key}`);
        }
    };

    const selectedKey = pathToKey[location.pathname] || "orders";

    // Tạo mảng menu item chính (không gồm logout)
    const menuItems = menuGroups.flatMap((group) => [
        {
            type: "group",
            label: <span className="text-gray-400 text-xs uppercase">{group.label}</span>,
            children: group.children,
        },
    ]);

    // Nút đăng xuất tách riêng
    const logoutItem = [
        {
            key: "logout",
            icon: <LogoutOutlined style={{ color: "#cf1322" }} />,
            label: <span className="font-semibold text-danger">Đăng xuất</span>,
        },
    ];

    return (
        <Layout>
            <Sider
                breakpoint="lg"
                collapsedWidth="0"
                style={{
                    background: "#fff",
                    borderRight: "1px solid #eee",
                    height: "100vh",
                    position: "fixed",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 100,
                }}
                width={240}
            >
                <div className="flex flex-col items-center py-6">
                    <Avatar size={48} icon={<UserOutlined />} className="mb-2 bg-user" />
                    <span className="font-semibold text-black">Xin chào, Admin</span>
                </div>
                <div style={{ flex: 1, overflowY: "auto", height: "calc(100vh - 140px)" }}>
                    <Menu
                        mode="inline"
                        selectedKeys={[selectedKey]}
                        style={{ borderRight: 0, fontWeight: 500, fontSize: 16 }}
                        // @ts-ignore
                        items={menuItems}
                        onClick={handleMenuClick}
                        theme="light"
                    />
                </div>
                <div className="sticky bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-100">
                    <Menu
                        mode="inline"
                        selectedKeys={selectedKey === "logout" ? ["logout"] : []}
                        style={{
                            border: 0,
                            fontWeight: 600,
                            fontSize: 16,
                            background: "#fff",
                        }}
                        items={logoutItem}
                        onClick={handleMenuClick}
                        theme="light"
                    />
                </div>
            </Sider>
            <Layout style={{ marginLeft: 240, minHeight: "100vh" }}>
                <Header
                    style={{
                        background: "#fff",
                        padding: "0 24px",
                        borderBottom: "1px solid #eee",
                        fontWeight: 600,
                        fontSize: 18,
                        color: "#222",
                    }}
                >
                    Hệ thống quản lý Pickup
                </Header>
                <Content
                    style={{
                        margin: 0,
                        background: "#fff",
                        minHeight: "calc(100vh - 64px)",
                        boxSizing: "border-box"
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
