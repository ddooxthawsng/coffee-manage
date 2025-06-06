import { db } from "../../firebase/config";
import { collection, getDocs, orderBy, query, Timestamp, where } from "firebase/firestore";
import dayjs from 'dayjs';

export const fetchDashboardData = async (dateRange, setDashboardData, setLoading, notification) => {
    setLoading(true);
    try {
        const startDate = dateRange[0].startOf('day').toDate();
        const endDate = dateRange[1].endOf('day').toDate();

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
            createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));

        const menuQuery = query(collection(db, "menu"), orderBy("name"));
        const menuSnapshot = await getDocs(menuQuery);
        const menuData = menuSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        calculateDashboardStats(invoicesData, menuData, dateRange, setDashboardData);
        setLoading(false);
    } catch (error) {
        setLoading(false);
        notification.error({
            message: 'Lỗi tải dữ liệu',
            description: 'Không thể tải dữ liệu từ máy chủ. Vui lòng thử lại sau.'
        });
    }
};

const calculateDashboardStats = (invoicesData, expensesData, dateRange, setDashboardData) => {
    const startDate = dateRange[0].startOf('day');
    const endDate = dateRange[1].endOf('day');
    const periodDays = endDate.diff(startDate, 'day') + 1;
    const previousStartDate = startDate.subtract(periodDays, 'day');
    const previousEndDate = startDate.subtract(1, 'day');

    const currentInvoices = invoicesData.filter(inv => {
        const date = dayjs(inv.createdAt);
        return date.isAfter(startDate) && date.isBefore(endDate);
    });
    const previousInvoices = invoicesData.filter(inv => {
        const date = dayjs(inv.createdAt);
        return date.isAfter(previousStartDate) && date.isBefore(previousEndDate);
    });

    const currentRevenue = currentInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const currentOrdersCount = currentInvoices.length;
    const currentCustomersCount = new Set(currentInvoices.map(inv => inv.customerId)).size;
    const currentAvgOrder = currentOrdersCount > 0 ? currentRevenue / currentOrdersCount : 0;

    const previousRevenue = previousInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const previousOrdersCount = previousInvoices.length;
    const previousCustomersCount = new Set(previousInvoices.map(inv => inv.customerId)).size;
    const previousAvgOrder = previousOrdersCount > 0 ? previousRevenue / previousOrdersCount : 0;

    const calculateGrowth = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    setDashboardData({
        revenue: {
            current: currentRevenue,
            previous: previousRevenue,
            growth: calculateGrowth(currentRevenue, previousRevenue)
        },
        orders: {
            current: currentOrdersCount,
            previous: previousOrdersCount,
            growth: calculateGrowth(currentOrdersCount, previousOrdersCount)
        },
        customers: {
            current: currentCustomersCount,
            previous: previousCustomersCount,
            growth: calculateGrowth(currentCustomersCount, previousCustomersCount)
        },
        avgOrder: {
            current: currentAvgOrder,
            previous: previousAvgOrder,
            growth: calculateGrowth(currentAvgOrder, previousAvgOrder)
        },
        profit: { current: 0, previous: 0, growth: 0 },
        dailySales: { current: 0, previous: 0, growth: 0 },
        conversionRate: { current: 0, previous: 0, growth: 0 },
        customerRetention: { current: 0, previous: 0, growth: 0 }
    });
};
