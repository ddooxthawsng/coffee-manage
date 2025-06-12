import React, {useEffect, useState} from "react";
import {Avatar, Layout, Menu} from "antd";
import {
    BarChartOutlined,
    BarcodeOutlined,
    BookOutlined,
    CoffeeOutlined,
    DatabaseOutlined,
    DollarOutlined,
    FileTextOutlined,
    GiftOutlined,
    HomeOutlined,
    LogoutOutlined,
    MenuOutlined,
    UserOutlined
} from "@ant-design/icons";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {getAuth, signOut} from "firebase/auth";
import {useAuthLogin} from "../hooks/context/AuthContext.tsx";

const {Sider, Content} = Layout;

// Menu cấu trúc nhóm
const menuGroups = (role: boolean) => [
    {
        label: "Quản lý & Quy trình",
        children: [
            {key: "orders", icon: <HomeOutlined style={{color: "#1890ff"}}/>, label: "Trang chủ (Bán hàng)"},
            role && {key: "menu", icon: <CoffeeOutlined style={{color: "#fa8c16"}}/>, label: "Menu"},
            role && {key: "inventory", icon: <DatabaseOutlined style={{color: "#52c41a"}}/>, label: "Nguyên liệu"},
            {key: "cost", icon: <DollarOutlined style={{color: "#cf1322"}}/>, label: "Chi phí"},
            role && {key: "promotion", icon: <GiftOutlined style={{color: "#722ed1"}}/>, label: "Khuyến mãi"},
            {key: "receipt", icon: <BookOutlined style={{color: "#722ed1"}}/>, label: "Công thức"},
        ].filter(Boolean),
    },
    role && {
        label: "Giao dịch",
        children: [
            {key: "qrcode", icon: <BarcodeOutlined style={{color: "#13c2c2"}}/>, label: "QR Code"},
            {key: "invoices", icon: <FileTextOutlined style={{color: "#2f54eb"}}/>, label: "Hóa đơn"},
        ],
    },
    {
        label: "Báo cáo & Hệ thống",
        children: [
            role && {
                key: "smart-dashboard",
                icon: <BarChartOutlined style={{color: "#1890ff"}}/>,
                label: "Thống kê"
            },
            role && {key: "users", icon: <UserOutlined style={{color: "#eb2f96"}}/>, label: "Tài khoản"},
            {
                key: "logout",
                icon: <LogoutOutlined style={{color: "#cf1322"}}/>,
                label: <span className="font-semibold text-danger">Đăng xuất</span>,
            },
        ].filter(Boolean),
    },

].filter(Boolean);

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
    "/receipt": "receipt",
};

const MainLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {role} = useAuthLogin();

    const [reload, setReload] = useState(0);
    useEffect(() => {
        console.log("ROLE CHANGE", role)
        setReload((pre) => pre++)
    }, [role]);

    const handleMenuClick = ({key}: { key: string }) => {
        if (key === "logout") {
            const auth = getAuth();
            if (auth)
                signOut(auth).then(() => {
                    localStorage.clear();
                    navigate("/login");
                });
            else {
                localStorage.clear();
                navigate("/login");
            }

        } else {
            navigate(`/${key === "orders" ? "" : key}`);
        }
    };

    const selectedKey = pathToKey[location.pathname] || "orders";

    // Tạo mảng menu item chính (không gồm logout)
    const menuItems = menuGroups(role).flatMap((group) => [
        {
            type: "group",
            label: <span className="text-gray-400 text-xs uppercase">{group.label}</span>,
            children: group.children,
        },
    ]);

    const [collapsed, setCollapsed] = React.useState(window.innerHeight < 900);
    return (
        <Layout style={{height: "100%"}}>
            <div
                onClick={() => setCollapsed(!collapsed)}
                style={{
                    position: "absolute",
                    top: 0,        // vị trí top tùy chỉnh
                    left: 0,        // nằm bên trái
                    zIndex: 1001,
                    background: "#001529",
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "0 6px 6px 0",
                    cursor: "pointer",
                    color: "#fff",
                }}
            >
                <MenuOutlined/>
            </div>
            <Sider
                breakpoint="lg"
                collapsed={collapsed}
                onCollapse={() => setCollapsed(collapsed)}
                collapsedWidth="0"
                style={{background: "#fff", borderRight: "1px solid #eee"}}
                width={240}
                trigger={null}
            >
                <div className="flex flex-col items-center py-6">
                    <Avatar size={48} icon={<UserOutlined/>} className="mb-2 bg-user"/>
                    <span className="font-semibold text-black">Xin chào, Admin</span>
                </div>
                <div className="flex flex-col relative">
                        <Menu
                            mode="inline"
                            selectedKeys={[selectedKey]}
                            style={{borderRight: 0, fontWeight: 500, fontSize: 16}}
                            // @ts-ignore
                            items={menuItems}
                            onClick={handleMenuClick}
                            theme="light"
                        />
                </div>
            </Sider>
            <Layout>
                <Content
                    style={{
                        margin: 0,
                        background: "#fff",
                        minHeight: "calc(100%)",
                        boxSizing: "border-box"
                    }}
                >
                    <Outlet/>
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
