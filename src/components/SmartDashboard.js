import React, {useEffect, useState} from 'react';
import {
    Alert,
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    DatePicker,
    Empty,
    List,
    Progress,
    Row,
    Space,
    Statistic,
    Table,
    Tag,
    Typography
} from 'antd';
import {
    ArrowDownOutlined,
    ArrowUpOutlined,
    BellOutlined,
    DollarOutlined,
    ShoppingCartOutlined,
    TrophyOutlined,
    UserOutlined,
    WarningOutlined
} from '@ant-design/icons';
import {getDrinks, getInvoices} from '../firebase/DrinkManagementService';
import {getProcessedIngredients} from '../firebase/ingredient_service';
import {getExpenses} from '../firebase/expense_management_service';
import dayjs from 'dayjs';

const {Title, Text} = Typography;
const {RangePicker} = DatePicker;

const SmartDashboard = () => {
    const [dateRange, setDateRange] = useState([
        dayjs().subtract(7, 'days'),
        dayjs()
    ]);
    const [dashboardData, setDashboardData] = useState({
        revenue: {current: 0, previous: 0, growth: 0},
        orders: {current: 0, previous: 0, growth: 0},
        customers: {current: 0, previous: 0, growth: 0},
        avgOrder: {current: 0, previous: 0, growth: 0}
    });
    const [topProducts, setTopProducts] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const [drinks, setDrinks] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [expenses, setExpenses] = useState([]);

    useEffect(() => {
        fetchAllData();
    }, [dateRange]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // Fetch tất cả data từ Firebase
            const [invoicesData, drinksData, ingredientsData, expensesData] = await Promise.all([
                getInvoices(),
                getDrinks(),
                getProcessedIngredients(),
                getExpenses()
            ]);

            setInvoices(invoicesData);
            setDrinks(drinksData);
            setIngredients(ingredientsData);
            setExpenses(expensesData);

            // Tính toán dashboard data
            calculateDashboardStats(invoicesData, drinksData, ingredientsData, expensesData);
            calculateTopProducts(invoicesData);
            generateNotifications(ingredientsData, invoicesData);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateDashboardStats = (invoicesData, drinksData, ingredientsData, expensesData) => {
        const [startDate, endDate] = dateRange;
        const previousStartDate = startDate.subtract(endDate.diff(startDate, 'days'), 'days');
        const previousEndDate = startDate;

        // Filter invoices theo date range
        const currentInvoices = invoicesData.filter(invoice => {
            const invoiceDate = dayjs(invoice.timestamp?.seconds ?
                new Date(invoice.timestamp.seconds * 1000) :
                invoice.timestamp
            );
            return invoiceDate.isAfter(startDate) && invoiceDate.isBefore(endDate) &&
                invoice.status !== 'cancelled';
        });

        const previousInvoices = invoicesData.filter(invoice => {
            const invoiceDate = dayjs(invoice.timestamp?.seconds ?
                new Date(invoice.timestamp.seconds * 1000) :
                invoice.timestamp
            );
            return invoiceDate.isAfter(previousStartDate) && invoiceDate.isBefore(previousEndDate) &&
                invoice.status !== 'cancelled';
        });

        // Tính doanh thu
        const currentRevenue = currentInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
        const previousRevenue = previousInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
        const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

        // Tính số đơn hàng
        const currentOrders = currentInvoices.length;
        const previousOrders = previousInvoices.length;
        const ordersGrowth = previousOrders > 0 ? ((currentOrders - previousOrders) / previousOrders) * 100 : 0;

        // Tính khách hàng unique (dựa trên số điện thoại nếu có)
        const currentCustomers = new Set(currentInvoices.map(inv => inv.customerPhone || 'anonymous')).size;
        const previousCustomers = new Set(previousInvoices.map(inv => inv.customerPhone || 'anonymous')).size;
        const customersGrowth = previousCustomers > 0 ? ((currentCustomers - previousCustomers) / previousCustomers) * 100 : 0;

        // Tính đơn hàng trung bình
        const currentAvgOrder = currentOrders > 0 ? currentRevenue / currentOrders : 0;
        const previousAvgOrder = previousOrders > 0 ? previousRevenue / previousOrders : 0;
        const avgOrderGrowth = previousAvgOrder > 0 ? ((currentAvgOrder - previousAvgOrder) / previousAvgOrder) * 100 : 0;

        setDashboardData({
            revenue: {current: currentRevenue, previous: previousRevenue, growth: revenueGrowth},
            orders: {current: currentOrders, previous: previousOrders, growth: ordersGrowth},
            customers: {current: currentCustomers, previous: previousCustomers, growth: customersGrowth},
            avgOrder: {current: currentAvgOrder, previous: previousAvgOrder, growth: avgOrderGrowth}
        });
    };

    const calculateTopProducts = (invoicesData) => {
        const [startDate, endDate] = dateRange;

        // Filter invoices theo date range
        const filteredInvoices = invoicesData.filter(invoice => {
            const invoiceDate = dayjs(invoice.timestamp?.seconds ?
                new Date(invoice.timestamp.seconds * 1000) :
                invoice.timestamp
            );
            return invoiceDate.isAfter(startDate) && invoiceDate.isBefore(endDate) &&
                invoice.status !== 'cancelled';
        });

        // Tính toán top products từ items trong invoices
        const productStats = {};

        filteredInvoices.forEach(invoice => {
            if (invoice.items && Array.isArray(invoice.items)) {
                invoice.items.forEach(item => {
                    const key = `${item.drinkName}_${item.size}`;
                    if (!productStats[key]) {
                        productStats[key] = {
                            name: `${item.drinkName} (${item.size})`,
                            quantity: 0,
                            revenue: 0,
                            growth: Math.random() * 20 - 10 // Random growth cho demo
                        };
                    }
                    productStats[key].quantity += item.quantity || 0;
                    productStats[key].revenue += item.total || (item.price * item.quantity) || 0;
                });
            }
        });

        // Sắp xếp theo quantity và lấy top 5
        const topProductsArray = Object.values(productStats)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        setTopProducts(topProductsArray);
    };

    const generateNotifications = (ingredientsData, invoicesData) => {
        const notificationsList = [];

        // Kiểm tra nguyên liệu sắp hết
        const lowStockIngredients = ingredientsData.filter(ing =>
            (ing.inventory || 0) <= (ing.minStock || 10)
        );

        lowStockIngredients.forEach(ing => {
            notificationsList.push({
                id: `low_stock_${ing.id}`,
                type: 'warning',
                title: 'Nguyên liệu sắp hết',
                message: `${ing.name} còn lại ${ing.inventory || 0} ${ing.unit}`,
                time: 'Vừa xong',
                icon: <WarningOutlined/>
            });
        });

        // Kiểm tra doanh thu hôm nay
        const today = dayjs();
        const todayInvoices = invoicesData.filter(invoice => {
            const invoiceDate = dayjs(invoice.timestamp?.seconds ?
                new Date(invoice.timestamp.seconds * 1000) :
                invoice.timestamp
            );
            return invoiceDate.isSame(today, 'day') && invoice.status !== 'cancelled';
        });

        const todayRevenue = todayInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

        if (todayRevenue > 2000000) { // Nếu doanh thu hôm nay > 2 triệu
            notificationsList.push({
                id: 'revenue_milestone',
                type: 'success',
                title: 'Đạt mục tiêu doanh thu',
                message: `Doanh thu hôm nay đã đạt ${todayRevenue.toLocaleString()}đ`,
                time: '1 giờ trước',
                icon: <TrophyOutlined/>
            });
        }

        // Thông báo về đơn hàng mới
        const recentInvoices = invoicesData
            .filter(invoice => {
                const invoiceDate = dayjs(invoice.timestamp?.seconds ?
                    new Date(invoice.timestamp.seconds * 1000) :
                    invoice.timestamp
                );
                return invoiceDate.isAfter(dayjs().subtract(1, 'hour'));
            })
            .length;

        if (recentInvoices > 0) {
            notificationsList.push({
                id: 'new_orders',
                type: 'info',
                title: 'Đơn hàng mới',
                message: `${recentInvoices} đơn hàng mới trong 1 giờ qua`,
                time: '30 phút trước',
                icon: <ShoppingCartOutlined/>
            });
        }

        setNotifications(notificationsList.slice(0, 5)); // Giới hạn 5 thông báo
    };

    const topProductsColumns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (value) => <Badge count={value} style={{backgroundColor: '#52c41a'}}/>
        },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (value) => `${value.toLocaleString()}đ`
        },
        {
            title: 'Tăng trưởng',
            dataIndex: 'growth',
            key: 'growth',
            render: (value) => (
                <Tag color={value >= 0 ? 'green' : 'red'}>
                    {value >= 0 ? <ArrowUpOutlined/> : <ArrowDownOutlined/>}
                    {Math.abs(value).toFixed(1)}%
                </Tag>
            )
        }
    ];

    return (
        <div style={{padding: '24px'}}>
            <Row justify="space-between" align="middle" style={{marginBottom: 24}}>
                <Col>
                    <Title level={2}>
                        📊 Dashboard thông minh
                    </Title>
                </Col>
                <Col>
                    <Space>
                        <RangePicker
                            value={dateRange}
                            onChange={setDateRange}
                            format="DD/MM/YYYY"
                        />
                        <Button
                            icon={<BellOutlined/>}
                            type="text"
                            badge={{count: notifications.length}}
                        >
                            Thông báo
                        </Button>
                    </Space>
                </Col>
            </Row>

            {/* Thống kê tổng quan */}
            <Row gutter={16} style={{marginBottom: 24}}>
                <Col span={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Doanh thu"
                            value={dashboardData.revenue.current}
                            precision={0}
                            valueStyle={{color: '#3f8600'}}
                            prefix={<DollarOutlined/>}
                            suffix="đ"
                            formatter={(value) => value.toLocaleString()}
                        />
                        <div style={{marginTop: 8}}>
                            <Text type={dashboardData.revenue.growth >= 0 ? 'success' : 'danger'}>
                                {dashboardData.revenue.growth >= 0 ? <ArrowUpOutlined/> : <ArrowDownOutlined/>}
                                {Math.abs(dashboardData.revenue.growth).toFixed(1)}%
                            </Text>
                            <Text type="secondary"> so với kỳ trước</Text>
                        </div>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Đơn hàng"
                            value={dashboardData.orders.current}
                            valueStyle={{color: '#1890ff'}}
                            prefix={<ShoppingCartOutlined/>}
                        />
                        <div style={{marginTop: 8}}>
                            <Text type={dashboardData.orders.growth >= 0 ? 'success' : 'danger'}>
                                {dashboardData.orders.growth >= 0 ? <ArrowUpOutlined/> : <ArrowDownOutlined/>}
                                {Math.abs(dashboardData.orders.growth).toFixed(1)}%
                            </Text>
                            <Text type="secondary"> so với kỳ trước</Text>
                        </div>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Khách hàng"
                            value={dashboardData.customers.current}
                            valueStyle={{color: '#722ed1'}}
                            prefix={<UserOutlined/>}
                        />
                        <div style={{marginTop: 8}}>
                            <Text type={dashboardData.customers.growth >= 0 ? 'success' : 'danger'}>
                                {dashboardData.customers.growth >= 0 ? <ArrowUpOutlined/> : <ArrowDownOutlined/>}
                                {Math.abs(dashboardData.customers.growth).toFixed(1)}%
                            </Text>
                            <Text type="secondary"> so với kỳ trước</Text>
                        </div>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="Đơn hàng TB"
                            value={dashboardData.avgOrder.current}
                            precision={0}
                            valueStyle={{color: '#fa541c'}}
                            prefix={<TrophyOutlined/>}
                            suffix="đ"
                            formatter={(value) => value.toLocaleString()}
                        />
                        <div style={{marginTop: 8}}>
                            <Text type={dashboardData.avgOrder.growth >= 0 ? 'success' : 'danger'}>
                                {dashboardData.avgOrder.growth >= 0 ? <ArrowUpOutlined/> : <ArrowDownOutlined/>}
                                {Math.abs(dashboardData.avgOrder.growth).toFixed(1)}%
                            </Text>
                            <Text type="secondary"> so với kỳ trước</Text>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Placeholder cho biểu đồ - sẽ thêm charts sau */}
            <Row gutter={16} style={{marginBottom: 24}}>
                <Col span={16}>
                    <Card title="Xu hướng doanh thu" loading={loading}>
                        <Alert
                            message="Biểu đồ doanh thu theo thời gian"
                            description={`Doanh thu từ ${dateRange[0].format('DD/MM')} đến ${dateRange[1].format('DD/MM')}: ${dashboardData.revenue.current.toLocaleString()}đ`}
                            type="info"
                            style={{textAlign: 'center', padding: '40px 0'}}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="Tình trạng tồn kho" loading={loading}>
                        <div style={{textAlign: 'center', padding: '20px 0'}}>
                            <Progress
                                type="circle"
                                percent={Math.round((ingredients.filter(ing => (ing.inventory || 0) > (ing.minStock || 10)).length / Math.max(ingredients.length, 1)) * 100)}
                                format={percent => `${percent}%\nĐủ hàng`}
                            />
                            <div style={{marginTop: 16}}>
                                <Text type="secondary">
                                    {ingredients.filter(ing => (ing.inventory || 0) <= (ing.minStock || 10)).length} nguyên
                                    liệu sắp hết
                                </Text>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Top sản phẩm bán chạy" loading={loading}>
                        {topProducts.length > 0 ? (
                            <Table
                                columns={topProductsColumns}
                                dataSource={topProducts}
                                pagination={false}
                                size="small"
                            />
                        ) : (
                            <Empty description="Chưa có dữ liệu bán hàng trong khoảng thời gian này"/>
                        )}
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="Thông báo & Cảnh báo">
                        {notifications.length > 0 ? (
                            <List
                                dataSource={notifications}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar
                                                    icon={item.icon}
                                                    style={{
                                                        backgroundColor:
                                                            item.type === 'warning' ? '#faad14' :
                                                                item.type === 'success' ? '#52c41a' : '#1890ff'
                                                    }}
                                                />
                                            }
                                            title={item.title}
                                            description={
                                                <div>
                                                    <div>{item.message}</div>
                                                    <Text type="secondary" style={{fontSize: 12}}>
                                                        {item.time}
                                                    </Text>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty description="Không có thông báo mới"/>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default SmartDashboard;
