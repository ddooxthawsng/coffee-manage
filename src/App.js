import React, {useState} from 'react';
import {ConfigProvider, Layout, Menu} from 'antd';
import {
    BarChartOutlined,
    CoffeeOutlined,
    ExperimentOutlined,
    QrcodeOutlined,
    ShoppingCartOutlined,
    ShoppingOutlined,
    ToolOutlined
} from '@ant-design/icons';
import DrinkManagement from './components/DrinkManagementComponent';
import IngredientManagement from './components/ingredient_management';
import ProcessedIngredientManagement from './components/processed_ingredient_management';
import SalesPage from './components/SalesPageComponent';
import SalesStatistics from './components/SalesStatisticsComponent';
import ExpenseManagement from './components/ExpenseManagement';
import QRCodeManagement from './components/QRCodeManagement';
import './App.css';

const {Header, Content} = Layout;

const App = () => {
    const [selectedKey, setSelectedKey] = useState('1');

    const menuItems = [
        {
            key: '1',
            icon: <ShoppingOutlined />,
            label: 'Quản Lý Chi Phí',
        },
        {
            key: '2',
            icon: <ExperimentOutlined />,
            label: 'Quản Lý Nguyên Liệu Thô',
        },
        {
            key: '3',
            icon: <ToolOutlined />,
            label: 'Quản Lý Nguyên Liệu Thành Phẩm',
        },
        {
            key: '4',
            icon: <CoffeeOutlined />,
            label: 'Quản Lý Đồ Uống',
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
            key: '7',
            icon: <QrcodeOutlined />,
            label: 'Quản Lý QR Code',
        },
    ];

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
            default:
                return <ExpenseManagement />;
        }
    };

    return (
        <ConfigProvider>
            <Layout style={{ minHeight: '100vh' }}>
                <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
                    <Menu
                        theme="dark"
                        mode="horizontal"
                        selectedKeys={[selectedKey]}
                        items={menuItems}
                        onClick={({ key }) => setSelectedKey(key)}
                        style={{ lineHeight: '64px' }}
                    />
                </Header>
                <Content style={{ marginTop: 64, padding: '24px' }}>
                    {renderContent()}
                </Content>
            </Layout>
        </ConfigProvider>
    );
};

export default App;
