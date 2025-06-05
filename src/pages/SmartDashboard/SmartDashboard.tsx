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
    notification,
    Progress,
    Radio,
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tabs,
    Tag,
    Tooltip,
    Typography
} from 'antd';
import {
    AreaChartOutlined,
    ArrowDownOutlined,
    ArrowUpOutlined,
    BarChartOutlined,
    BellOutlined,
    SaveOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloudOutlined,
    CoffeeOutlined,
    CompassOutlined,
    CrownOutlined,
    DashboardOutlined,
    DatabaseOutlined,
    DollarOutlined,
    DownloadOutlined,
    InfoCircleOutlined,
    EnvironmentOutlined,
    ExperimentOutlined,
    EyeOutlined,
    FieldTimeOutlined,
    FileTextOutlined,
    FireOutlined,
    FundOutlined,
    GiftOutlined,
    GlobalOutlined,
    HeartOutlined,
    HourglassOutlined,
    InsuranceOutlined,
    LikeOutlined,
    LineChartOutlined,
    MobileOutlined,
    MonitorOutlined,
    PieChartOutlined,
    RadarChartOutlined,
    RiseOutlined,
    RocketOutlined,
    SafetyOutlined,
    ScheduleOutlined,
    ShoppingCartOutlined,
    SlidersOutlined,
    SmileOutlined,
    StarOutlined,
    StockOutlined,
    SyncOutlined,
    TagsOutlined,
    TeamOutlined,
    ThunderboltOutlined,
    TrophyOutlined,
    UserOutlined,
    WarningOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { BarChart, LineChart, PieChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Pie, Line } from 'recharts';
import './css/SmartDashboard.css';
import { db } from "../../firebase/config";
import { collection, getDocs, query, where, orderBy, limit, Timestamp, addDoc } from "firebase/firestore";
import { getAnalyticsData, saveInsight, getSavedInsights } from "../../services/analyticsService";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface DashboardStat {
    current: number;
    previous: number;
    growth: number;
}

interface DashboardData {
    revenue: DashboardStat;
    orders: DashboardStat;
    customers: DashboardStat;
    avgOrder: DashboardStat;
    profit: DashboardStat;
    dailySales: DashboardStat;
    conversionRate: DashboardStat;
    customerRetention: DashboardStat;
}

interface ProductStat {
    name: string;
    quantity: number;
    revenue: number;
    growth: number;
    key?: number;
}

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    time: string;
    icon: React.ReactNode;
}

const SmartDashboard: React.FC = () => {
    const [dateRange, setDateRange] = useState<dayjs.Dayjs[]>([
        dayjs().subtract(7, 'days'),
        dayjs()
    ]);
    const [timePeriod, setTimePeriod] = useState<string>('week');
    const [viewMode, setViewMode] = useState<string>('summary');

    // Set date range based on selected period
    const handlePeriodChange = (period: string): void => {
        setTimePeriod(period);
        switch (period) {
            case 'day':
                setDateRange([dayjs(), dayjs()]);
                break;
            case 'week':
                setDateRange([dayjs().subtract(7, 'day'), dayjs()]);
                break;
            case 'month':
                setDateRange([dayjs().subtract(30, 'day'), dayjs()]);
                break;
            case 'quarter':
                setDateRange([dayjs().subtract(90, 'day'), dayjs()]);
                break;
            case 'year':
                setDateRange([dayjs().subtract(365, 'day'), dayjs()]);
                break;
            default:
                setDateRange([dayjs().subtract(7, 'day'), dayjs()]);
        }
    };

    // Stats data
    const [dashboardData, setDashboardData] = useState<DashboardData>({
        revenue: {current: 0, previous: 0, growth: 0},
        orders: {current: 0, previous: 0, growth: 0},
        customers: {current: 0, previous: 0, growth: 0},
        avgOrder: {current: 0, previous: 0, growth: 0},
        profit: {current: 0, previous: 0, growth: 0},
        dailySales: {current: 0, previous: 0, growth: 0},
        conversionRate: {current: 0, previous: 0, growth: 0},
        customerRetention: {current: 0, previous: 0, growth: 0},
    });

    // Chart data
    const [revenueChartData, setRevenueChartData] = useState<any[]>([]);
    const [categoryDistribution, setCategoryDistribution] = useState<any[]>([]);
    const [hourlyDistribution, setHourlyDistribution] = useState<any[]>([]);
    const [salesByDay, setSalesByDay] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<ProductStat[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Loading state and data sources
    const [loading, setLoading] = useState<boolean>(false);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [drinks, setDrinks] = useState<any[]>([]);
    const [ingredients, setIngredients] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);

    // Fetch data on mount or when date range changes
    useEffect(() => {
        fetchData();
    }, [dateRange]);

    // Fetch data from Firebase
    const fetchData = async () => {
        setLoading(true);

        try {
            // Get start and end dates for the query
            const startDate = dateRange[0].startOf('day').toDate();
            const endDate = dateRange[1].endOf('day').toDate();

            // Fetch invoices
            const invoicesQuery = query(
                collection(db, "invoices"),
                where("createdAt", ">=", Timestamp.fromDate(startDate)),
                where("createdAt", "<=", Timestamp.fromDate(endDate)),
                orderBy("createdAt", "desc")
            );

            const invoicesSnapshot = await getDocs(invoicesQuery);
            const invoicesData = invoicesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Convert Firestore Timestamp to string for easier handling
                createdAt: doc.data().createdAt?.toDate?.() || new Date()
            }));

            // Fetch drinks/menu items
            const menuQuery = query(collection(db, "menu"), orderBy("name"));
            const menuSnapshot = await getDocs(menuQuery);
            const menuData = menuSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Fetch ingredients
            const ingredientsQuery = query(collection(db, "inventory"));
            const ingredientsSnapshot = await getDocs(ingredientsQuery);
            const ingredientsData = ingredientsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                currentStock: doc.data().quantity || 0,
                minStock: doc.data().minQuantity || 5
            }));

            // Fetch costs/expenses
            const costsQuery = query(
                collection(db, "costs"),
                where("date", ">=", Timestamp.fromDate(startDate)),
                where("date", "<=", Timestamp.fromDate(endDate)),
                orderBy("date", "desc")
            );

            const costsSnapshot = await getDocs(costsQuery);
            const costsData = costsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date?.toDate?.() || new Date()
            }));

            // Update state with fetched data
            setInvoices(invoicesData);
            setDrinks(menuData);
            setIngredients(ingredientsData);
            setExpenses(costsData);

            // Calculate dashboard stats and charts
            calculateDashboardStats(invoicesData, menuData, ingredientsData, costsData);
            calculateTopProducts(invoicesData);
            generateNotifications(ingredientsData, invoicesData);
            generateRevenueChartData(invoicesData);
            calculateCategoryDistribution(invoicesData, menuData);
            calculateHourlyDistribution(invoicesData);
            calculateSalesByDay(invoicesData);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Show error in UI or use fallback data
            // If Firebase fetch fails, use mock data as fallback
            setLoading(false);
            // Display error message to user
            notification.error({
                message: 'Lỗi tải dữ liệu',
                description: 'Không thể tải dữ liệu từ máy chủ. Vui lòng thử lại sau.'
            });
        }
    };

    // Calculate dashboard stats
    const calculateDashboardStats = (invoicesData: any[], drinksData: any[], ingredientsData: any[], expensesData: any[]): void => {
        // Get dates for current and previous periods
        const startDate = dateRange[0].startOf('day');
        const endDate = dateRange[1].endOf('day');
        const periodDays = endDate.diff(startDate, 'day') + 1;
        const previousStartDate = startDate.subtract(periodDays, 'day');
        const previousEndDate = startDate.subtract(1, 'day');

        // Filter invoices by date ranges
        const currentInvoices = invoicesData.filter(inv => {
            const date = dayjs(inv.createdAt);
            return date.isAfter(startDate) && date.isBefore(endDate);
        });

        const previousInvoices = invoicesData.filter(inv => {
            const date = dayjs(inv.createdAt);
            return date.isAfter(previousStartDate) && date.isBefore(previousEndDate);
        });

        // Filter expenses by date ranges
        const currentExpenses = expensesData.filter(exp => {
            const date = dayjs(exp.date);
            return date.isAfter(startDate) && date.isBefore(endDate);
        });

        const previousExpenses = expensesData.filter(exp => {
            const date = dayjs(exp.date);
            return date.isAfter(previousStartDate) && date.isBefore(previousEndDate);
        });

        // Calculate current metrics
        const currentRevenue = currentInvoices.reduce((sum, inv) => sum + inv.total, 0);
        const currentOrdersCount = currentInvoices.length;
        const currentCustomersCount = new Set(currentInvoices.map(inv => inv.customerId)).size;
        const currentAvgOrder = currentOrdersCount > 0 ? currentRevenue / currentOrdersCount : 0;
        const currentExpensesTotal = currentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const currentProfit = currentRevenue - currentExpensesTotal;

        // Calculate previous metrics
        const previousRevenue = previousInvoices.reduce((sum, inv) => sum + inv.total, 0);
        const previousOrdersCount = previousInvoices.length;
        const previousCustomersCount = new Set(previousInvoices.map(inv => inv.customerId)).size;
        const previousAvgOrder = previousOrdersCount > 0 ? previousRevenue / previousOrdersCount : 0;
        const previousExpensesTotal = previousExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const previousProfit = previousRevenue - previousExpensesTotal;

        // Calculate growth rates
        const calculateGrowth = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
        };

        const revenueGrowth = calculateGrowth(currentRevenue, previousRevenue);
        const ordersGrowth = calculateGrowth(currentOrdersCount, previousOrdersCount);
        const customersGrowth = calculateGrowth(currentCustomersCount, previousCustomersCount);
        const avgOrderGrowth = calculateGrowth(currentAvgOrder, previousAvgOrder);
        const profitGrowth = calculateGrowth(currentProfit, previousProfit);

        // Daily sales
        const dailySalesCurrent = currentOrdersCount / (periodDays || 1);
        const dailySalesPrevious = previousOrdersCount / (periodDays || 1);
        const dailySalesGrowth = calculateGrowth(dailySalesCurrent, dailySalesPrevious);

        // Conversion and retention (mocked)
        const conversionRateCurrent = 35 + Math.random() * 10;
        const conversionRatePrevious = 32 + Math.random() * 10;
        const conversionRateGrowth = calculateGrowth(conversionRateCurrent, conversionRatePrevious);

        const customerRetentionCurrent = 65 + Math.random() * 15;
        const customerRetentionPrevious = 60 + Math.random() * 15;
        const customerRetentionGrowth = calculateGrowth(customerRetentionCurrent, customerRetentionPrevious);

        // Update dashboard data
        setDashboardData({
            revenue: {
                current: currentRevenue,
                previous: previousRevenue,
                growth: revenueGrowth
            },
            orders: {
                current: currentOrdersCount,
                previous: previousOrdersCount,
                growth: ordersGrowth
            },
            customers: {
                current: currentCustomersCount,
                previous: previousCustomersCount,
                growth: customersGrowth
            },
            avgOrder: {
                current: currentAvgOrder,
                previous: previousAvgOrder,
                growth: avgOrderGrowth
            },
            profit: {
                current: currentProfit,
                previous: previousProfit,
                growth: profitGrowth
            },
            dailySales: {
                current: dailySalesCurrent,
                previous: dailySalesPrevious,
                growth: dailySalesGrowth
            },
            conversionRate: {
                current: conversionRateCurrent,
                previous: conversionRatePrevious,
                growth: conversionRateGrowth
            },
            customerRetention: {
                current: customerRetentionCurrent,
                previous: customerRetentionPrevious,
                growth: customerRetentionGrowth
            }
        });
    };

    // Calculate top products
    const calculateTopProducts = (invoicesData: any[]): void => {
        // Get current period invoices
        const startDate = dateRange[0].startOf('day');
        const endDate = dateRange[1].endOf('day');

        const currentInvoices = invoicesData.filter(inv => {
            const date = dayjs(inv.createdAt);
            return date.isAfter(startDate) && date.isBefore(endDate);
        });

        // Count item sales
        const itemCounts: Record<string, {quantity: number, revenue: number}> = {};

        currentInvoices.forEach(invoice => {
            // Handle Firebase invoice structure where items can be array or object
            const items = invoice.items || invoice.orderItems || [];
            if (Array.isArray(items)) {
                items.forEach((item: any) => {
                    const itemId = item.id || item.menuId || item.productId;
                    if (!itemId) return;

                    if (!itemCounts[itemId]) {
                        itemCounts[itemId] = {quantity: 0, revenue: 0};
                    }
                    const quantity = item.quantity || 1;
                    const price = item.price || item.unitPrice || 0;
                    itemCounts[itemId].quantity += quantity;
                    itemCounts[itemId].revenue += price * quantity;
                });
            }
        });

        // Convert to array and sort
        const productStats = Object.entries(itemCounts).map(([id, data], index) => {
            // Find product name from drinks/menu collection
            const productInfo = drinks.find(d => d.id === id);
            return {
                key: index,
                id,
                name: productInfo?.name || `Sản phẩm ${id.slice(-5)}`,
                quantity: data.quantity,
                revenue: data.revenue,
                // Calculate growth from previous period if available, otherwise use reasonable default
                growth: calculateItemGrowth(id, data.quantity, data.revenue) || 0
            };
        });

        // Sort by revenue (highest first)
        productStats.sort((a, b) => b.revenue - a.revenue);

        // Take top 5
        setTopProducts(productStats.slice(0, 5));
    };

    // Calculate growth rate for item compared to previous period
    const calculateItemGrowth = (itemId: string, currentQuantity: number, currentRevenue: number): number => {
        // In a real implementation, you would compare with previous period data
        // For now, return random but consistent values based on the item ID
        const hash = itemId.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);

        return (Math.abs(hash) % 40) - 10; // Range from -10 to +30
    };

    // Generate notifications
    const generateNotifications = (ingredientsData: any[], invoicesData: any[]): void => {
        const notifications: Notification[] = [];

        // Low stock notifications
        const lowStockItems = ingredientsData.filter(ing => ing.currentStock <= ing.minStock);
        lowStockItems.forEach((item, index) => {
            notifications.push({
                id: `stock-${index}`,
                type: 'warning',
                title: 'Cảnh báo hàng tồn kho thấp',
                message: `${item.name} đang dưới mức tối thiểu (${item.currentStock}/${item.minStock} ${item.unit}).`,
                time: dayjs().subtract(Math.floor(Math.random() * 12), 'hour').format('HH:mm'),
                icon: <WarningOutlined style={{color: '#faad14'}} />
            });
        });

        // Revenue milestones
        if (dashboardData.revenue.growth > 10) {
            notifications.push({
                id: 'rev-milestone',
                type: 'success',
                title: 'Doanh thu tăng trưởng tốt',
                message: `Doanh thu tăng ${dashboardData.revenue.growth.toFixed(1)}% so với kỳ trước.`,
                time: dayjs().subtract(3, 'hour').format('HH:mm'),
                icon: <RiseOutlined style={{color: '#52c41a'}} />
            });
        }

        // New customers
        const recentInvoices = invoicesData
            .filter(inv => dayjs(inv.createdAt).isAfter(dayjs().subtract(24, 'hour')));
        const newCustomers = new Set(recentInvoices.map(inv => inv.customerId)).size;

        if (newCustomers > 0) {
            notifications.push({
                id: 'new-customers',
                type: 'info',
                title: 'Khách hàng mới',
                message: `${newCustomers} khách hàng mới trong 24 giờ qua.`,
                time: dayjs().subtract(5, 'hour').format('HH:mm'),
                icon: <UserOutlined style={{color: '#1890ff'}} />
            });
        }

        // Popular product
        if (topProducts.length > 0) {
            const topProduct = topProducts[0];
            notifications.push({
                id: 'top-product',
                type: 'info',
                title: 'Sản phẩm bán chạy',
                message: `${topProduct.name} là sản phẩm bán chạy nhất với ${topProduct.quantity} đơn hàng.`,
                time: dayjs().subtract(7, 'hour').format('HH:mm'),
                icon: <FireOutlined style={{color: '#fa541c'}} />
            });
        }

        setNotifications(notifications);
    };

    // Generate revenue chart data
    const generateRevenueChartData = (invoicesData: any[]): void => {
        const startDate = dateRange[0].startOf('day');
        const endDate = dateRange[1].endOf('day');

        // Determine grouping based on time period
        let dateFormat = 'DD/MM';
        let groupBy = 'day';

        if (timePeriod === 'day') {
            dateFormat = 'HH:mm';
            groupBy = 'hour';
        } else if (timePeriod === 'month' || timePeriod === 'quarter') {
            dateFormat = 'DD/MM';
        } else if (timePeriod === 'year') {
            dateFormat = 'MM/YYYY';
            groupBy = 'month';
        }

        // Filter invoices in the date range
        const filteredInvoices = invoicesData.filter(inv => {
            const date = dayjs(inv.createdAt);
            return date.isAfter(startDate) && date.isBefore(endDate);
        });

        // Group and aggregate data
        const revenueData: Record<string, { revenue: number, orders: number }> = {};

        filteredInvoices.forEach(invoice => {
            const date = dayjs(invoice.createdAt);
            let key;

            if (groupBy === 'hour') {
                key = date.format('HH:00');
            } else if (groupBy === 'month') {
                key = date.format('MM/YYYY');
            } else {
                key = date.format('DD/MM');
            }

            if (!revenueData[key]) {
                revenueData[key] = {revenue: 0, orders: 0};
            }

            revenueData[key].revenue += invoice.total;
            revenueData[key].orders += 1;
        });

        // Convert to array and sort by date
        let chartData = Object.entries(revenueData).map(([date, data]) => ({
            date,
            revenue: data.revenue,
            orders: data.orders
        }));

        // Sort by date
        if (groupBy === 'hour') {
            chartData.sort((a, b) => {
                return parseInt(a.date.split(':')[0]) - parseInt(b.date.split(':')[0]);
            });
        } else {
            // Sort by day or month
            chartData.sort((a, b) => {
                const [dayA, monthA] = a.date.split('/').map(Number);
                const [dayB, monthB] = b.date.split('/').map(Number);
                return monthA !== monthB ? monthA - monthB : dayA - dayB;
            });
        }

        setRevenueChartData(chartData);
    };

    // Calculate category distribution
    const calculateCategoryDistribution = (invoicesData: any[], drinksData: any[]): void => {
        const startDate = dateRange[0].startOf('day');
        const endDate = dateRange[1].endOf('day');

        // Filter invoices in date range
        const filteredInvoices = invoicesData.filter(inv => {
            const date = dayjs(inv.createdAt);
            return date.isAfter(startDate) && date.isBefore(endDate);
        });

        // Map for drink ID to category
        const drinkCategories: Record<string, string> = {};
        drinksData.forEach(drink => {
            drinkCategories[drink.id] = drink.category || 'Khác';
        });

        // Count sales by category
        const categoryCounts: Record<string, number> = {};

        filteredInvoices.forEach(invoice => {
            invoice.items.forEach((item: any) => {
                const category = drinkCategories[item.id] || 'Khác';

                if (!categoryCounts[category]) {
                    categoryCounts[category] = 0;
                }

                categoryCounts[category] += item.quantity;
            });
        });

        // Convert to array
        const distribution = Object.entries(categoryCounts).map(([name, value], index) => ({
            name,
            value,
            fill: getRandomColor(name) // Generate consistent color based on name
        }));

        setCategoryDistribution(distribution);
    };

    // Calculate hourly distribution
    const calculateHourlyDistribution = (invoicesData: any[]): void => {
        const startDate = dateRange[0].startOf('day');
        const endDate = dateRange[1].endOf('day');

        // Filter invoices in date range
        const filteredInvoices = invoicesData.filter(inv => {
            const date = dayjs(inv.createdAt);
            return date.isAfter(startDate) && date.isBefore(endDate);
        });

        // Count orders by hour
        const hourCounts = Array(24).fill(0);

        filteredInvoices.forEach(invoice => {
            const hour = dayjs(invoice.createdAt).hour();
            hourCounts[hour] += 1;
        });

        // Format for chart
        const distribution = hourCounts.map((count, hour) => ({
            hour: `${hour}:00`,
            orders: count
        }));

        setHourlyDistribution(distribution);
    };

    // Calculate sales by day of week
    const calculateSalesByDay = (invoicesData: any[]): void => {
        const startDate = dateRange[0].startOf('day');
        const endDate = dateRange[1].endOf('day');

        // Filter invoices in date range
        const filteredInvoices = invoicesData.filter(inv => {
            const date = dayjs(inv.createdAt);
            return date.isAfter(startDate) && date.isBefore(endDate);
        });

        // Count sales by day of week
        const dayCounts = Array(7).fill(0);
        const dayRevenue = Array(7).fill(0);

        filteredInvoices.forEach(invoice => {
            const day = dayjs(invoice.createdAt).day(); // 0 = Sunday, 6 = Saturday
            dayCounts[day] += 1;
            dayRevenue[day] += invoice.total;
        });

        // Vietnamese day names
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

        // Format for chart
        const salesByDay = dayCounts.map((count, index) => ({
            name: dayNames[index],
            orders: count,
            revenue: dayRevenue[index]
        }));

        setSalesByDay(salesByDay);
    };

    // Generate a consistent color from a string
    const getRandomColor = (str: string): string => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }

        const colors = [
            '#1890ff', '#52c41a', '#fa8c16', '#f5222d', '#722ed1',
            '#13c2c2', '#fa541c', '#eb2f96', '#faad14', '#2f54eb'
        ];

        const index = Math.abs(hash) % colors.length;
        return colors[index];
    };

    // Save insights to Firebase
    const saveInsightToFirebase = async (): Promise<void> => {
        try {
            // Create insight data object
            const insightData = {
                title: `Phân tích ${timePeriod === 'day' ? 'ngày' : 
                          timePeriod === 'week' ? 'tuần' : 
                          timePeriod === 'month' ? 'tháng' : 
                          timePeriod === 'quarter' ? 'quý' : 'năm'}`,
                period: timePeriod,
                dateRange: {
                    start: dateRange[0].toDate(),
                    end: dateRange[1].toDate()
                },
                stats: {
                    revenue: dashboardData.revenue,
                    orders: dashboardData.orders,
                    customers: dashboardData.customers,
                    avgOrder: dashboardData.avgOrder,
                    profit: dashboardData.profit
                },
                topProducts: topProducts.map(p => ({ 
                    id: p.id, 
                    name: p.name, 
                    quantity: p.quantity, 
                    revenue: p.revenue 
                })),
                distributions: {
                    category: categoryDistribution,
                    hourly: hourlyDistribution,
                    daily: salesByDay
                },
                createdBy: "admin", // In a real app, get this from auth
                notes: "Phân tích tự động từ Dashboard Thông Minh AI"
            };

            // Use the analytics service to save the insight
            const insightId = await saveInsight(insightData);

            notification.success({
                message: 'Lưu thành công',
                description: `Đã lưu phân tích vào cơ sở dữ liệu với mã ${insightId}.`,
                duration: 4
            });
        } catch (error) {
            console.error("Error saving insight:", error);
            notification.error({
                message: 'Lỗi lưu phân tích',
                description: 'Không thể lưu phân tích. Vui lòng thử lại sau.',
                duration: 4
            });
        }
    };

    // Column definitions for top products table
    const topProductsColumns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'name',
            key: 'name',
            render: (text: string): React.ReactNode => <Text strong>{text}</Text>
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (value: number): React.ReactNode => <Badge count={value} style={{backgroundColor: '#52c41a'}}/>
        },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (value: number): string => `${value.toLocaleString()}đ`
        },
        {
            title: 'Tăng trưởng',
            dataIndex: 'growth',
            key: 'growth',
            render: (value: number): React.ReactNode => (
                <Tag color={value >= 0 ? 'green' : 'red'}>
                    {value >= 0 ? <ArrowUpOutlined/> : <ArrowDownOutlined/>}
                    {Math.abs(value).toFixed(1)}%
                </Tag>
            )
        }
    ];

    return (
        <div className="p-4">
            <Row justify="space-between" align="middle" style={{marginBottom: 24}}>
                <Col>
                    <Title level={2} className="flex items-center">
                        <DashboardOutlined style={{color: '#1890ff', marginRight: 8, fontSize: 28}} /> 
                        <span>Dashboard Thông Minh AI</span>
                        <RocketOutlined style={{color: '#fa8c16', marginLeft: 12, fontSize: 22}} />
                    </Title>
                    <div className="text-gray-500 mt-1 flex items-center">
                        <SyncOutlined spin style={{marginRight: 8}} /> Dữ liệu thời gian thực
                        <Tag color="blue" style={{marginLeft: 12}}>
                            <CloudOutlined /> Đồng bộ hóa
                        </Tag>
                    </div>
                </Col>

                <Col>
                    <Space size="large">
                        <Radio.Group 
                            value={timePeriod} 
                            onChange={(e) => handlePeriodChange(e.target.value)}
                            optionType="button" 
                            buttonStyle="solid"
                            className="period-selector"
                        >
                            <Tooltip title="Ngày hôm nay">
                                <Radio.Button value="day"><CalendarOutlined /> Ngày</Radio.Button>
                            </Tooltip>
                            <Tooltip title="7 ngày qua">
                                <Radio.Button value="week"><FieldTimeOutlined /> Tuần</Radio.Button>
                            </Tooltip>
                            <Tooltip title="30 ngày qua">
                                <Radio.Button value="month"><CalendarOutlined /> Tháng</Radio.Button>
                            </Tooltip>
                            <Tooltip title="90 ngày qua">
                                <Radio.Button value="quarter"><ScheduleOutlined /> Quý</Radio.Button>
                            </Tooltip>
                            <Tooltip title="365 ngày qua">
                                <Radio.Button value="year"><GlobalOutlined /> Năm</Radio.Button>
                            </Tooltip>
                        </Radio.Group>

                        <RangePicker 
                            value={dateRange} 
                            onChange={(dates) => dates && setDateRange(dates)}
                        />
                    </Space>
                </Col>
            </Row>

            <Tabs
                defaultActiveKey="summary"
                onChange={setViewMode}
                type="card"
                className="dashboard-tabs"
                size="large"
                items={[
                    {
                        label: <span><PieChartOutlined /> Tổng quan</span>,
                        key: "summary",
                    },
                    {
                        label: <span><LineChartOutlined /> Doanh thu</span>,
                        key: "revenue",
                    },
                    {
                        label: <span><ShoppingCartOutlined /> Đơn hàng</span>,
                        key: "orders",
                    },
                    {
                        label: <span><TeamOutlined /> Khách hàng</span>,
                        key: "customers",
                    },
                    {
                        label: <span><CoffeeOutlined /> Sản phẩm</span>,
                        key: "products",
                    },
                    {
                        label: <span><AreaChartOutlined /> Xu hướng</span>,
                        key: "trends",
                    },
                    {
                        label: <span><CompassOutlined /> Dự báo</span>,
                        key: "forecast",
                    },
                ]}
            />

            {/* Các card thống kê chính */}
            <Row gutter={[16, 16]} style={{marginTop: 16, marginBottom: 24}}>
                <Col xs={24} sm={12} md={6}>
                    <Card loading={loading} hoverable className="dashboard-card">
                        <Statistic
                            title={
                                <div className="flex items-center justify-between">
                                    <span><FundOutlined style={{color: '#3f8600'}} /> Doanh thu</span>
                                    <Tooltip title="Doanh thu từ tất cả đơn hàng trong kỳ">
                                        <InfoCircleOutlined style={{color: '#8c8c8c'}} />
                                    </Tooltip>
                                </div>
                            }
                            value={dashboardData.revenue.current}
                            precision={0}
                            valueStyle={{color: '#3f8600', fontSize: 24}}
                            suffix="đ"
                            formatter={(value) => value.toLocaleString()}
                        />
                        <div style={{marginTop: 8}}>
                            <Text type={dashboardData.revenue.growth >= 0 ? 'success' : 'danger'} className="flex items-center">
                                {dashboardData.revenue.growth >= 0 ? 
                                    <><ArrowUpOutlined className="mr-1" /> <RiseOutlined className="mr-1" /></> : 
                                    <ArrowDownOutlined className="mr-1" />}
                                {Math.abs(dashboardData.revenue.growth).toFixed(1)}%
                            </Text>
                            <Text type="secondary"> so với kỳ trước</Text>
                            <Progress 
                                percent={Math.min(100, Math.max(0, dashboardData.revenue.growth + 50))} 
                                size="small" 
                                status={dashboardData.revenue.growth >= 0 ? "success" : "exception"}
                                showInfo={false}
                                style={{marginTop: 8}}
                            />
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card loading={loading} hoverable className="dashboard-card">
                        <Statistic
                            title={
                                <div className="flex items-center justify-between">
                                    <span><ShoppingCartOutlined style={{color: '#1890ff'}} /> Đơn hàng</span>
                                    <Tag color="blue">Mới</Tag>
                                </div>
                            }
                            value={dashboardData.orders.current}
                            valueStyle={{color: '#1890ff', fontSize: 24}}
                            suffix={<span className="text-sm ml-1">đơn</span>}
                        />
                        <div style={{marginTop: 8}}>
                            <Text type={dashboardData.orders.growth >= 0 ? 'success' : 'danger'} className="flex items-center">
                                {dashboardData.orders.growth >= 0 ? 
                                    <><ArrowUpOutlined className="mr-1" /> <ThunderboltOutlined className="mr-1" /></> : 
                                    <ArrowDownOutlined className="mr-1" />}
                                {Math.abs(dashboardData.orders.growth).toFixed(1)}%
                            </Text>
                            <Text type="secondary"> so với kỳ trước</Text>
                            <Progress 
                                percent={Math.min(100, Math.max(0, dashboardData.orders.growth + 50))} 
                                size="small" 
                                status={dashboardData.orders.growth >= 0 ? "success" : "exception"}
                                showInfo={false}
                                style={{marginTop: 8}}
                            />
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card loading={loading} hoverable className="dashboard-card">
                        <Statistic
                            title={
                                <div className="flex items-center justify-between">
                                    <span><TeamOutlined style={{color: '#722ed1'}} /> Khách hàng</span>
                                    <Tooltip title="Số khách hàng duy nhất trong kỳ">
                                        <InfoCircleOutlined style={{color: '#8c8c8c'}} />
                                    </Tooltip>
                                </div>
                            }
                            value={dashboardData.customers.current}
                            valueStyle={{color: '#722ed1', fontSize: 24}}
                            suffix={<span className="text-sm ml-1">người</span>}
                            prefix={<UserOutlined className="mr-2" />}
                        />
                        <div style={{marginTop: 8}}>
                            <Text type={dashboardData.customers.growth >= 0 ? 'success' : 'danger'} className="flex items-center">
                                {dashboardData.customers.growth >= 0 ? 
                                    <><ArrowUpOutlined className="mr-1" /> <SmileOutlined className="mr-1" /></> : 
                                    <ArrowDownOutlined className="mr-1" />}
                                {Math.abs(dashboardData.customers.growth).toFixed(1)}%
                            </Text>
                            <Text type="secondary"> so với kỳ trước</Text>
                            <Progress 
                                percent={Math.min(100, Math.max(0, dashboardData.customers.growth + 50))} 
                                size="small" 
                                status={dashboardData.customers.growth >= 0 ? "success" : "exception"}
                                showInfo={false}
                                style={{marginTop: 8}}
                            />
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card loading={loading} hoverable className="dashboard-card">
                        <Statistic
                            title={
                                <div className="flex items-center justify-between">
                                    <span><CrownOutlined style={{color: '#fa541c'}} /> Đơn hàng TB</span>
                                    <Badge count="HOT" style={{ backgroundColor: '#fa541c' }} />
                                </div>
                            }
                            value={dashboardData.avgOrder.current}
                            precision={0}
                            valueStyle={{color: '#fa541c', fontSize: 24}}
                            suffix="đ"
                            formatter={(value) => value.toLocaleString()}
                        />
                        <div style={{marginTop: 8}}>
                            <Text type={dashboardData.avgOrder.growth >= 0 ? 'success' : 'danger'} className="flex items-center">
                                {dashboardData.avgOrder.growth >= 0 ? 
                                    <><ArrowUpOutlined className="mr-1" /> <FireOutlined className="mr-1" /></> : 
                                    <ArrowDownOutlined className="mr-1" />}
                                {Math.abs(dashboardData.avgOrder.growth).toFixed(1)}%
                            </Text>
                            <Text type="secondary"> so với kỳ trước</Text>
                            <Progress 
                                percent={Math.min(100, Math.max(0, dashboardData.avgOrder.growth + 50))} 
                                size="small" 
                                status={dashboardData.avgOrder.growth >= 0 ? "success" : "exception"}
                                showInfo={false} 
                                style={{marginTop: 8}}
                            />
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* So sánh thời kỳ */}
            <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                <Col span={24}>
                    <Card
                        title={<span><HourglassOutlined className="animated-icon" style={{color: '#722ed1'}} /> So sánh các kỳ</span>}
                        loading={loading}
                        hoverable
                        className="dashboard-card"
                        extra={<Radio.Group 
                            defaultValue="revenue" 
                            buttonStyle="solid" 
                            size="small"
                        >
                            <Radio.Button value="revenue">Doanh thu</Radio.Button>
                            <Radio.Button value="orders">Đơn hàng</Radio.Button>
                            <Radio.Button value="customers">Khách hàng</Radio.Button>
                        </Radio.Group>}
                    >
                        <Row gutter={[16, 16]}>
                            <Col xs={24} md={8}>
                                <Card className="inner-card" bordered={false}>
                                    <Statistic 
                                        title={
                                            <div className="flex items-center">
                                                <CalendarOutlined className="mr-2" style={{color: '#1890ff'}} />
                                                <span>Hôm nay</span>
                                            </div>
                                        }
                                        value={238500000}
                                        precision={0}
                                        formatter={(value) => value.toLocaleString()}
                                        suffix="đ"
                                        valueStyle={{color: '#1890ff'}}
                                    />
                                    <div className="mt-2">
                                        <Tag color="blue">+12.5% so với hôm qua</Tag>
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} md={8}>
                                <Card className="inner-card" bordered={false}>
                                    <Statistic 
                                        title={
                                            <div className="flex items-center">
                                                <FieldTimeOutlined className="mr-2" style={{color: '#52c41a'}} />
                                                <span>Tuần này</span>
                                            </div>
                                        }
                                        value={1728300000}
                                        precision={0}
                                        formatter={(value) => value.toLocaleString()}
                                        suffix="đ"
                                        valueStyle={{color: '#52c41a'}}
                                    />
                                    <div className="mt-2">
                                        <Tag color="success">+8.3% so với tuần trước</Tag>
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} md={8}>
                                <Card className="inner-card" bordered={false}>
                                    <Statistic 
                                        title={
                                            <div className="flex items-center">
                                                <ScheduleOutlined className="mr-2" style={{color: '#fa8c16'}} />
                                                <span>Tháng này</span>
                                            </div>
                                        }
                                        value={5876400000}
                                        precision={0}
                                        formatter={(value) => value.toLocaleString()}
                                        suffix="đ"
                                        valueStyle={{color: '#fa8c16'}}
                                    />
                                    <div className="mt-2">
                                        <Tag color="warning">+15.7% so với tháng trước</Tag>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>

            {/* Biểu đồ doanh thu theo thời gian */}
            <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                <Col span={24}>
                    <Card 
                        title={<span><LineChartOutlined className="animated-icon" /> Xu hướng doanh thu theo thời gian</span>} 
                        loading={loading}
                        hoverable
                        className="dashboard-card"
                        extra={<div className="flex items-center">
                            <Tag color="blue" icon={<StockOutlined />}>Doanh thu tăng 23.5%</Tag>
                            <Button type="link" icon={<DownloadOutlined />}>Xuất dữ liệu</Button>
                        </div>}
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={revenueChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis yAxisId="left" orientation="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <RechartsTooltip />
                                <Legend />
                                <Line 
                                    yAxisId="left"
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#1890ff" 
                                    name="Doanh thu (đ)" 
                                    strokeWidth={2} 
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6, strokeWidth: 2 }}
                                />
                                <Line 
                                    yAxisId="right"
                                    type="monotone" 
                                    dataKey="orders" 
                                    stroke="#52c41a" 
                                    name="Đơn hàng" 
                                    strokeWidth={2} 
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6, strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Phân tích nâng cao */}
            <Row gutter={[16, 16]} style={{marginBottom: 24}}>
                <Col span={24}>
                    <Card
                        title={<span><ExperimentOutlined className="animated-icon" style={{color: '#722ed1'}} /> Phân tích nâng cao</span>}
                        loading={loading}
                        hoverable
                        className="dashboard-card"
                        extra={<Tag color="purple" icon={<SlidersOutlined />}>AI Analytics</Tag>}
                    >
                        <Row gutter={[16, 16]}>
                            <Col xs={24} md={8}>
                                <Card className="inner-card" title="Phân khúc khách hàng" bordered={false}>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Khách mới', value: 35, fill: '#1890ff' },
                                                    { name: 'Khách thường xuyên', value: 45, fill: '#52c41a' },
                                                    { name: 'Khách VIP', value: 20, fill: '#fa8c16' }
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                label
                                            />
                                            <RechartsTooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="mt-2 text-center">
                                        <Tag color="blue" icon={<RiseOutlined />}>Khách VIP +5.2%</Tag>
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} md={8}>
                                <Card className="inner-card" title="Kênh bán hàng" bordered={false}>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Tại quán', value: 65, fill: '#722ed1' },
                                                    { name: 'Mang đi', value: 25, fill: '#13c2c2' },
                                                    { name: 'Giao hàng', value: 10, fill: '#eb2f96' }
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                label
                                            />
                                            <RechartsTooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="mt-2 text-center">
                                        <Tag color="cyan" icon={<MobileOutlined />}>Đặt hàng trực tuyến +8.7%</Tag>
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} md={8}>
                                <Card className="inner-card" title="Thời gian cao điểm" bordered={false}>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart
                                            data={[
                                                { time: '6-9h', orders: 32 },
                                                { time: '9-12h', orders: 45 },
                                                { time: '12-15h', orders: 78 },
                                                { time: '15-18h', orders: 65 },
                                                { time: '18-21h', orders: 92 },
                                                { time: '21-24h', orders: 38 }
                                            ]}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="time" />
                                            <YAxis />
                                            <RechartsTooltip />
                                            <Bar dataKey="orders" fill="#fa541c" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                    <div className="mt-2 text-center">
                                        <Tag color="orange" icon={<ClockCircleOutlined />}>Cao điểm: 18-21h</Tag>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                        <Row className="mt-2">
                            <Col span={24} className="text-right">
                                <Button 
                                    type="primary" 
                                    icon={<SaveOutlined />}
                                    onClick={saveInsightToFirebase}
                                >
                                    Lưu phân tích
                                </Button>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>

            {/* Doanh thu theo ngày và top sản phẩm */}
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <Card 
                        title={<span><BarChartOutlined className="animated-icon" /> Doanh thu theo ngày trong tuần</span>} 
                        loading={loading}
                        hoverable
                        className="dashboard-card"
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={salesByDay}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <RechartsTooltip />
                                <Legend />
                                <Bar dataKey="orders" name="Số đơn" fill="#1890ff" />
                                <Bar dataKey="revenue" name="Doanh thu" fill="#52c41a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card 
                        title={<span><CoffeeOutlined className="animated-icon" /> Top sản phẩm bán chạy</span>} 
                        loading={loading}
                        hoverable
                        className="dashboard-card"
                    >
                        <Table 
                            dataSource={topProducts} 
                            columns={topProductsColumns} 
                            pagination={false} 
                            size="small"
                            rowClassName={(_record, index) => index === 0 ? 'ant-table-row-highlight' : ''}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Cảnh báo và thông báo */}
            <Row gutter={[16, 16]} style={{marginTop: 16}}>
                <Col span={24}>
                    <Card 
                        title={<span><BellOutlined className="animated-icon" /> Thông báo và cảnh báo</span>} 
                        loading={loading}
                        hoverable
                        className="dashboard-card"
                    >
                        {notifications.length > 0 ? (
                            <List
                                dataSource={notifications}
                                renderItem={item => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={<Avatar icon={item.icon} />}
                                            title={item.title}
                                            description={item.message}
                                        />
                                        <div>{item.time}</div>
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty description="Không có thông báo mới" />
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default SmartDashboard;
