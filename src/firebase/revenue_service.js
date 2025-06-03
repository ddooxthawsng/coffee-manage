import db from './FirebaseConfigSetup';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';

export const getRevenueByDateRange = async (startDate, endDate) => {
    try {
        const salesRef = collection(db, 'sales');
        const q = query(
            salesRef,
            where('timestamp', '>=', Timestamp.fromDate(startDate)),
            where('timestamp', '<=', Timestamp.fromDate(endDate)),
            orderBy('timestamp', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const sales = [];

        querySnapshot.forEach((doc) => {
            sales.push({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate()
            });
        });

        return sales;
    } catch (error) {
        console.error('Error fetching revenue data:', error);
        return [];
    }
};

export const getRevenueStatsByPeriod = async (year, month = null) => {
    try {
        let startDate, endDate;

        if (month) {
            // Thống kê theo tháng
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 0, 23, 59, 59);
        } else {
            // Thống kê theo năm
            startDate = new Date(year, 0, 1);
            endDate = new Date(year, 11, 31, 23, 59, 59);
        }

        const sales = await getRevenueByDateRange(startDate, endDate);

        // Nhóm dữ liệu theo ngày/tháng
        const groupedData = {};
        let totalRevenue = 0;
        let totalOrders = 0;

        sales.forEach(sale => {
            if (!sale.timestamp) return;

            const key = month
                ? sale.timestamp.toISOString().split('T')[0] // Theo ngày
                : `${sale.timestamp.getFullYear()}-${String(sale.timestamp.getMonth() + 1).padStart(2, '0')}`; // Theo tháng

            if (!groupedData[key]) {
                groupedData[key] = {
                    period: key,
                    revenue: 0,
                    orderCount: 0,
                    date: sale.timestamp
                };
            }

            groupedData[key].revenue += sale.total || 0;
            groupedData[key].orderCount += 1;
            totalRevenue += sale.total || 0;
            totalOrders += 1;
        });

        return {
            data: Object.values(groupedData).sort((a, b) => new Date(b.period) - new Date(a.period)),
            totalRevenue,
            totalOrders
        };
    } catch (error) {
        console.error('Error getting revenue stats:', error);
        return { data: [], totalRevenue: 0, totalOrders: 0 };
    }
};
