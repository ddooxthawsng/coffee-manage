import React, {useState, useEffect} from 'react';
import {ConfigProvider, Layout, Menu, Button, Typography, Space, Drawer} from 'antd';
import {
    BarChartOutlined,
    CoffeeOutlined,
    ExperimentOutlined,
    QrcodeOutlined,
    ShoppingCartOutlined,
    ToolOutlined,
    CrownOutlined,
    GiftOutlined,
    DashboardOutlined,
    MobileOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    HomeOutlined,
    UserOutlined,
    SettingOutlined
} from '@ant-design/icons';

import ExpenseManagement from "./components/ExpenseManagement";
import IngredientManagement from "./components/ingredient_management";
import ProcessedIngredientManagement from "./components/processed_ingredient_management";
import DrinkManagement from "./components/DrinkManagementComponent";
import SalesPage from "./components/SalesPageComponent";
import SalesStatistics from "./components/SalesStatisticsComponent";
import QRCodeManagement from "./components/QRCodeManagement";
import CustomerLoyalty from "./components/CustomerLoyaltyComponent";
import SmartDashboard from "./components/SmartDashboard";
import PromotionManagement from "./components/PromotionManagement";
import CustomerMobileApp from "./components/CustomerMobileApp";

const {Header, Sider, Content} = Layout;
const {Title} = Typography;

const App = () => {
    const [selectedKey, setSelectedKey] = useState('5');
    const [collapsed, setCollapsed] = useState(false);
    const [openKeys, setOpenKeys] = useState(['ingredients']);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

    // Detect mobile screen
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
            if (window.innerWidth <= 768) {
                setCollapsed(true);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Menu items tối ưu cho order
    const getMenuItems = () => {
        // Menu đơn giản cho mobile order
        if (isMobile) {
            return [
                {
                    key: '5',
                    icon: <ShoppingCartOutlined />,
                    label: 'Bán Hàng',
                },
                {
                    key: '6',
                    icon: <BarChartOutlined />,
                    label: 'Thống Kê',
                },
                {
                    key: '4',
                    icon: <CoffeeOutlined />,
                    label: 'Đồ Uống',
                },
                {
                    key: '9',
                    icon: <DashboardOutlined />,
                    label: 'Dashboard',
                },
                {
                    type: 'divider',
                },
                {
                    key: '7',
                    icon: <QrcodeOutlined />,
                    label: 'QR Code',
                },
                {
                    key: '2',
                    icon: <ExperimentOutlined />,
                    label: 'Nguyên Liệu',
                },
            ];
        }

        // Menu đầy đủ cho desktop
        const baseItems = [
            {
                key: 'dashboard-section',
                label: 'DASHBOARD',
                type: 'group',
            },
            {
                key: '9',
                icon: <DashboardOutlined />,
                label: 'Dashboard Thông Minh',
            },
            {
                key: '5',
                icon: <ShoppingCartOutlined />,
                label: 'Bán Hàng',
            },
            {
                key: '6',
                icon: <BarChartOutlined />,
                label: 'Thống Kê & Doanh Thu',
            },
            {
                type: 'divider',
            },
            {
                key: 'product-section',
                label: 'SẢN PHẨM',
                type: 'group',
            },
            {
                key: '4',
                icon: <CoffeeOutlined />,
                label: 'Quản Lý Đồ Uống',
            },
            {
                key: 'ingredients',
                icon: <ExperimentOutlined />,
                label: 'Nguyên Liệu',
                children: [
                    {
                        key: '2',
                        label: 'Nguyên Liệu Thô',
                    },
                    {
                        key: '3',
                        label: 'Nguyên Liệu Thành Phẩm',
                    }
                ],
            },
            {
                type: 'divider',
            },
            {
                key: 'customer-section',
                label: 'KHÁCH HÀNG',
                type: 'group',
            },
            {
                key: '8',
                icon: <CrownOutlined />,
                label: 'Khách Hàng VIP',
            },
            {
                key: '10',
                icon: <GiftOutlined />,
                label: 'Khuyến Mãi & Combo',
            },
            {
                key: '11',
                icon: <MobileOutlined />,
                label: 'Mobile App',
            },
            {
                type: 'divider',
            },
            {
                key: 'system-section',
                label: 'HỆ THỐNG',
                type: 'group',
            },
            {
                key: '1',
                icon: <ToolOutlined />,
                label: 'Quản Lý Chi Phí',
            },
            {
                key: '7',
                icon: <QrcodeOutlined />,
                label: 'Quản Lý QR Code',
            },
        ];

        if (collapsed) {
            return baseItems.filter(item => item.key && !item.type && item.key !== 'ingredients');
        }

        return baseItems;
    };

    const handleCollapse = (collapsed) => {
        setCollapsed(collapsed);
        if (collapsed) {
            setOpenKeys([]);
        } else {
            setOpenKeys(['ingredients']);
        }
    };

    const handleOpenChange = (keys) => {
        if (!collapsed) {
            setOpenKeys(keys);
        }
    };

    const handleMenuClick = (key) => {
        setSelectedKey(key);
        if (isMobile) {
            setMobileMenuVisible(false);
        }
    };

    const getCurrentPageName = () => {
        const pageNames = {
            '1': 'Quản Lý Chi Phí',
            '2': 'Nguyên Liệu Thô',
            '3': 'Nguyên Liệu Thành Phẩm',
            '4': 'Quản Lý Đồ Uống',
            '5': 'Bán Hàng',
            '6': 'Thống Kê & Doanh Thu',
            '7': 'Quản Lý QR Code',
            '8': 'Khách Hàng VIP',
            '9': 'Dashboard Thông Minh',
            '10': 'Khuyến Mãi & Combo',
            '11': 'Mobile App'
        };
        return pageNames[selectedKey] || 'Cafe Management System';
    };

    const renderContent = () => {
        switch (selectedKey) {
            case '1':
                return <ExpenseManagement />;
            case '2':
                return <IngredientManagement />;
            case '3':
                return <ProcessedIngredientManagement />;
            case '4':
                return <DrinkManagement />;
            case '5':
                return <SalesPage />;
            case '6':
                return <SalesStatistics />;
            case '7':
                return <QRCodeManagement />;
            case '8':
                return <CustomerLoyalty />;
            case '9':
                return <SmartDashboard />;
            case '10':
                return <PromotionManagement />;
            case '11':
                return <CustomerMobileApp />;
            default:
                return <SalesPage />;
        }
    };

    // Mobile Menu Component
    const MobileMenu = () => (
        <Menu
            selectedKeys={[selectedKey]}
            items={getMenuItems()}
            onClick={({key}) => handleMenuClick(key)}
            mode="vertical"
            style={{
                border: 'none',
                background: 'transparent',
            }}
        />
    );

    // Desktop Layout
    if (!isMobile) {
        return (
            <ConfigProvider
                theme={{
                    token: {
                        colorPrimary: '#667eea',
                    },
                }}
            >
                <Layout style={{ minHeight: '100vh' }}>
                    <Sider
                        collapsible
                        collapsed={collapsed}
                        onCollapse={handleCollapse}
                        style={{
                            background: 'linear-gradient(180deg, #001529 0%, #002140 100%)',
                            boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
                        }}
                    >
                        {/* Logo Section */}
                        <div style={{
                            height: 64,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(255,255,255,0.1)',
                            margin: '16px 12px',
                            borderRadius: '12px',
                        }}>
                            {!collapsed ? (
                                <Title level={4} style={{ color: 'white', margin: 0 }}>
                                    <CoffeeOutlined /> Cafe Manager
                                </Title>
                            ) : (
                                <CoffeeOutlined style={{ color: 'white', fontSize: '24px' }} />
                            )}
                        </div>

                        {/* Menu */}
                        <Menu
                            theme="dark"
                            selectedKeys={[selectedKey]}
                            openKeys={openKeys}
                            items={getMenuItems()}
                            onClick={({key}) => setSelectedKey(key)}
                            onOpenChange={handleOpenChange}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                marginTop: 16,
                            }}
                        />
                    </Sider>

                    <Layout>
                        {/* Header */}
                        <Header style={{
                            padding: '0 24px',
                            background: '#fff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}>
                            <Title level={3} style={{ margin: 0, color: '#333' }}>
                                {getCurrentPageName()}
                            </Title>
                        </Header>

                        {/* Content */}
                        <Content style={{
                            margin: 0,
                            padding: 0,
                            background: '#f5f5f5',
                            minHeight: 'calc(100vh - 64px)',
                        }}>
                            {renderContent()}
                        </Content>
                    </Layout>
                </Layout>
            </ConfigProvider>
        );
    }

    // Mobile Layout
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#667eea',
                },
            }}
        >
            <Layout style={{ minHeight: '100vh' }}>
                {/* Mobile Header */}
                <Header className="mobile-header" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    padding: '0 16px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: 56,
                }}>
                    <Button
                        type="text"
                        icon={<MenuFoldOutlined />}
                        onClick={() => setMobileMenuVisible(true)}
                        style={{
                            color: 'white',
                            fontSize: '18px',
                            border: 'none',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                        }}
                    />

                    <Title level={4} style={{
                        color: 'white',
                        margin: 0,
                        fontSize: '16px',
                        textAlign: 'center',
                        flex: 1,
                        marginLeft: 16,
                    }}>
                        <CoffeeOutlined /> {getCurrentPageName()}
                    </Title>

                    {selectedKey === '5' && (
                        <Button
                            type="primary"
                            size="small"
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                borderRadius: '6px',
                            }}
                        >
                            Order
                        </Button>
                    )}
                </Header>

                {/* Mobile Menu Drawer */}
                <Drawer
                    title={
                        <Space>
                            <CoffeeOutlined style={{ color: '#667eea' }} />
                            <span style={{ color: '#333', fontWeight: 600 }}>Cafe Manager</span>
                        </Space>
                    }
                    placement="left"
                    onClose={() => setMobileMenuVisible(false)}
                    open={mobileMenuVisible}
                    width={280}
                    bodyStyle={{ padding: 0 }}
                    headerStyle={{
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        borderBottom: '1px solid #dee2e6',
                    }}
                >
                    <div style={{ padding: '16px 0' }}>
                        <MobileMenu />
                    </div>
                </Drawer>

                {/* Mobile Content */}
                <Content style={{
                    marginTop: 56,
                    padding: 0,
                    background: '#f5f5f5',
                    minHeight: 'calc(100vh - 56px)',
                }}>
                    {renderContent()}
                </Content>
            </Layout>
        </ConfigProvider>
    );
};

export default App;
