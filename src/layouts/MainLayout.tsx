import React from "react";
import { Layout, Menu, Avatar } from "antd";
import {
    HomeOutlined,
    CoffeeOutlined,
    DatabaseOutlined,
    DollarOutlined,
    GiftOutlined,
    BarcodeOutlined,
    ShoppingCartOutlined,
    FileTextOutlined,
    BarChartOutlined,
    UserOutlined,
    LogoutOutlined,
    ClusterOutlined,
    MobileOutlined,
} from "@ant-design/icons";
import { useNavigate, Outlet, useLocation } from "react-router-dom";

const { Header, Sider, Content } = Layout;

// Menu cấu trúc nhóm
const menuGroups = [
    {
        label: "Quản lý & Quy trình",
        children: [
            { key: "orders", icon: <HomeOutlined style={{ color: "#1890ff" }} />, label: "Trang chủ (Bán hàng)" },
            { key: "menu", icon: <CoffeeOutlined style={{ color: "#fa8c16" }} />, label: "Menu" },
            { key: "inventory", icon: <DatabaseOutlined style={{ color: "#52c41a" }} />, label: "Nguyên liệu" },
            { key: "recipe", icon: <ClusterOutlined style={{ color: "#722ed1" }} />, label: "Công thức" },
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
            { key: "smart-dashboard", icon: <BarChartOutlined style={{ color: "#1890ff" }} />, label: "Dashboard Thông Minh AI" },
            { key: "app-download", icon: <MobileOutlined style={{ color: "#13c2c2" }} />, label: "Tải ứng dụng Mobile" },
            { key: "users", icon: <UserOutlined style={{ color: "#eb2f96" }} />, label: "Tài khoản" },
        ],
    },
];

// Map đường dẫn sang key menu
const pathToKey: Record<string, string> = {
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

const MainLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleMenuClick = ({ key }: { key: string }) => {
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
        <Layout style={{ minHeight: "100vh" }}>
            <Sider
                breakpoint="lg"
                collapsedWidth="0"
                style={{ background: "#fff", borderRight: "1px solid #eee" }}
                width={240}
            >
                <div className="flex flex-col items-center py-6">
                    <Avatar size={48} icon={<UserOutlined />} className="mb-2 bg-user" />
                    <span className="font-semibold text-black">Xin chào, Admin</span>
                </div>
                <div className="flex flex-col h-[calc(100vh-80px)] relative">
                    <div className="flex-1 overflow-y-auto pb-16">
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
                    {/* Nút đăng xuất stickey ở cuối */}
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
                </div>
            </Sider>
            <Layout>
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
                    {/*<div className="px-4"> /!* chỉ padding trái/phải *!/*/}
                        <Outlet />
                    {/*</div>*/}
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
