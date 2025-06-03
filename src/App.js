import React, {useState} from 'react';
import {ConfigProvider, Layout, Menu, Button, Typography, Space} from 'antd';
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

    // Menu items được tối ưu hóa
    const getMenuItems = () => {
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
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#1890ff',
                    borderRadius: 8,
                },
            }}
        >
            <Layout style={{ minHeight: '100vh' }}>
                <Sider
                    collapsible
                    collapsed={collapsed}
                    onCollapse={handleCollapse}
                    width={280}
                    collapsedWidth={80}
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
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        padding: collapsed ? '0' : '0 24px',
                        background: 'rgba(255,255,255,0.1)',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                    }}>
                        {!collapsed ? (
                            <Space>
                                <CoffeeOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                                <Title level={4} style={{ color: 'white', margin: 0 }}>
                                    Cafe Manager
                                </Title>
                            </Space>
                        ) : (
                            <CoffeeOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                        )}
                    </div>

                    {/* Menu */}
                    <Menu
                        theme="dark"
                        selectedKeys={[selectedKey]}
                        openKeys={openKeys}
                        mode="inline"
                        items={getMenuItems()}
                        onClick={({ key }) => setSelectedKey(key)}
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
                        background: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <Space>
                            <Button
                                type="text"
                                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                                onClick={() => handleCollapse(!collapsed)}
                                style={{
                                    fontSize: '16px',
                                    width: 40,
                                    height: 40,
                                }}
                            />
                            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                                {getCurrentPageName()}
                            </Title>
                        </Space>

                        <Space>
                            <Button type="text" icon={<UserOutlined />}>
                                Admin
                            </Button>
                            <Button type="text" icon={<SettingOutlined />} />
                        </Space>
                    </Header>

                    {/* Content */}
                    <Content style={{
                        margin: '24px',
                        padding: '24px',
                        background: 'white',
                        borderRadius: 8,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        minHeight: 'calc(100vh - 112px)',
                    }}>
                        {renderContent()}
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default App;
