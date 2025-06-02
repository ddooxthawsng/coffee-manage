import React, {useState} from 'react';
import {ConfigProvider, Layout, Menu} from 'antd';
import {
    BarChartOutlined,
    CoffeeOutlined,
    ExperimentOutlined,
    ShoppingCartOutlined,
    ShoppingOutlined
} from '@ant-design/icons';
import DrinkManagement from './components/DrinkManagementComponent';
import IngredientManagement from './components/ingredient_management';
import SalesPage from './components/SalesPageComponent';
import SalesStatistics from './components/SalesStatisticsComponent';
import ExpenseManagement from './components/ExpenseManagement';
import './App.css';

const {Header, Content} = Layout;

const App = () => {
    const [selectedKey, setSelectedKey] = useState('1');

    const menuItems = [
        {
            key: '1',
            icon: <ShoppingOutlined/>,
            label: 'Quản Lý Chi Phí',
        },
        {
            key: '2',
            icon: <ExperimentOutlined/>,
            label: 'Quản Lý Nguyên Liệu',
        },
        {
            key: '3',
            icon: <CoffeeOutlined/>,
            label: 'Quản Lý Đồ Uống',
        },
        {
            key: '4',
            icon: <ShoppingCartOutlined/>,
            label: 'Bán Hàng',
        },
        {
            key: '5',
            icon: <BarChartOutlined/>,
            label: 'Thống Kê Doanh Thu',
        },

    ];

    const renderContent = () => {
        switch (selectedKey) {
            case '1':
                return <ExpenseManagement/>;
            case '2':
                return <IngredientManagement/>;
            case '3':
                return <DrinkManagement/>;
            case '4':
                return <SalesPage/>;
            case '5':
                return <SalesStatistics/>;
            default:
                return <IngredientManagement/>;
        }
    };

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#8B4513',
                    borderRadius: 8,
                },
            }}
        >
            <Layout style={{minHeight: '100vh'}}>
                {/* Fixed Header Menu */}
                <Header
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        background: '#fff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        padding: '0 24px',
                        height: '64px',
                        lineHeight: '64px'
                    }}
                >
                    <div style={{display: 'flex', alignItems: 'center', height: '100%'}}>
                        {/* Logo */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginRight: '40px',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: '#8B4513'
                        }}>
                            <CoffeeOutlined style={{fontSize: '24px', marginRight: '8px'}}/>
                            PICKUP
                        </div>

                        {/* Menu Items */}
                        <Menu
                            theme="light"
                            mode="horizontal"
                            selectedKeys={[selectedKey]}
                            onClick={({key}) => setSelectedKey(key)}
                            items={menuItems}
                            style={{
                                flex: 1,
                                border: 'none',
                                background: 'transparent'
                            }}
                        />
                    </div>
                </Header>

                {/* Content */}
                <Layout style={{marginTop: '64px'}}>
                    <Content
                        style={{
                            padding: '24px',
                            minHeight: 'calc(100vh - 64px)',
                            background: '#f5f5f5'
                        }}
                    >
                        {renderContent()}
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default App;