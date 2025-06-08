import { db } from "../../firebase/config";
import { collection, getDocs, orderBy, query, Timestamp, where } from "firebase/firestore";
import dayjs from 'dayjs';
import { getIngredientsByType } from "../../services/ingredientService.js";

// Hàm lấy costMin của thành phẩm (outputs là mảng truyền vào)
const getOutputCost = (outputId, outputs) => {
    const found = outputs.find(o => o.id === outputId);
    return found?.costMin ?? 0;
};

export const fetchDashboardData = async (dateRange, setDashboardData, setLoading, notification) => {
    setLoading(true);
    try {
        const startDate = dateRange[0].startOf('day').toDate();
        const endDate = dateRange[1].endOf('day').toDate();

        // Lấy hóa đơn
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

        // Lấy menu
        const menuQuery = query(collection(db, "menu"), orderBy("name"));
        const menuSnapshot = await getDocs(menuQuery);
        const menuData = menuSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Lấy outputs (thành phẩm)
        const outputs = await getIngredientsByType("output");

        calculateDashboardStats(invoicesData, menuData, outputs, dateRange, setDashboardData);
        setLoading(false);
    } catch (error) {
        setLoading(false);
        notification.error({
            message: 'Lỗi tải dữ liệu',
            description: 'Không thể tải dữ liệu từ máy chủ. Vui lòng thử lại sau.'
        });
    }
};

const calculateDashboardStats = (invoicesData, menuData, outputs, dateRange, setDashboardData) => {
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

    // Thống kê từng món và từng size, có cost và lãi (tất cả đơn)
    const itemStats = {};
    invoicesData.filter(i=>i.status !="deleted").forEach(inv => {
        if (!inv.items) return;
        inv.items.forEach(item => {
            if (!itemStats[item.id]) {
                itemStats[item.id] = {
                    name: item.name,
                    totalQty: 0,
                    sizes: {},
                    totalOriginal: 0,
                    totalCost: 0,
                    totalProfit: 0
                };
            }
            itemStats[item.id].totalQty += item.quantity;
            itemStats[item.id].totalOriginal += (item.price || 0) * item.quantity;

            // Tính cost/lãi từng size
            const menuItem = menuData.find(m => m.id === item.id);
            const sizeInfo = menuItem?.sizes?.find(s => s.size === item.size);
            let costPerOne = 0;
            if (sizeInfo?.outputs?.length) {
                costPerOne = sizeInfo.outputs.reduce((sum, out) => {
                    return sum + getOutputCost(out.outputId, outputs) * (out.quantity || 0);
                }, 0);
            }
            const totalCost = costPerOne * item.quantity;
            itemStats[item.id].totalCost += totalCost;
            const profit = (item.price || 0) * item.quantity - totalCost;
            itemStats[item.id].totalProfit += profit;

            // Thống kê theo từng size
            if (item.size) {
                if (!itemStats[item.id].sizes[item.size]) {
                    itemStats[item.id].sizes[item.size] = {
                        qty: 0,
                        original: 0,
                        cost: 0,
                        profit: 0
                    };
                }
                itemStats[item.id].sizes[item.size].qty += item.quantity;
                itemStats[item.id].sizes[item.size].original += (item.price || 0) * item.quantity;
                itemStats[item.id].sizes[item.size].cost += totalCost;
                itemStats[item.id].sizes[item.size].profit += profit;
            }
        });
    });

    // const itemStatsCancel = {};
    // invoicesData.filter(i=>i.status == "deleted").forEach(inv => {
    //     if (!inv.items) return;
    //     inv.items.forEach(item => {
    //         if (!itemStatsCancel[item.id]) {
    //             itemStatsCancel[item.id] = {
    //                 name: item.name,
    //                 totalQty: 0,
    //                 sizes: {},
    //                 totalOriginal: 0,
    //                 totalCost: 0,
    //                 totalProfit: 0
    //             };
    //         }
    //         itemStatsCancel[item.id].totalQty += item.quantity;
    //         itemStatsCancel[item.id].totalOriginal += (item.price || 0) * item.quantity;
    //
    //         // Tính cost/lãi từng size
    //         const menuItem = menuData.find(m => m.id === item.id);
    //         const sizeInfo = menuItem?.sizes?.find(s => s.size === item.size);
    //         let costPerOne = 0;
    //         if (sizeInfo?.outputs?.length) {
    //             costPerOne = sizeInfo.outputs.reduce((sum, out) => {
    //                 return sum + getOutputCost(out.outputId, outputs) * (out.quantity || 0);
    //             }, 0);
    //         }
    //         const totalCost = costPerOne * item.quantity;
    //         itemStatsCancel[item.id].totalCost += totalCost;
    //         const profit = (item.price || 0) * item.quantity - totalCost;
    //         itemStatsCancel[item.id].totalProfit += profit;
    //
    //         // Thống kê theo từng size
    //         if (item.size) {
    //             if (!itemStatsCancel[item.id].sizes[item.size]) {
    //                 itemStatsCancel[item.id].sizes[item.size] = {
    //                     qty: 0,
    //                     original: 0,
    //                     cost: 0,
    //                     profit: 0
    //                 };
    //             }
    //             itemStatsCancel[item.id].sizes[item.size].qty += item.quantity;
    //             itemStatsCancel[item.id].sizes[item.size].original += (item.price || 0) * item.quantity;
    //             itemStatsCancel[item.id].sizes[item.size].cost += totalCost;
    //             itemStatsCancel[item.id].sizes[item.size].profit += profit;
    //         }
    //     });
    // });

    // console.log("itemStatsCancel",itemStatsCancel)
    // Thống kê mã giảm giá đã dùng
    const discountStats = {};
    invoicesData.filter(i=>i.status !="deleted").forEach(inv => {
        if (inv.promotionCode || inv.promotionName) {
            const code = inv.promotionCode || inv.promotionName;
            if (!discountStats[code]) {
                discountStats[code] = {
                    code,
                    count: 0,
                    totalDiscount: 0,
                    totalOrder: 0,
                    lastUsed: inv.createdAt,
                    promotionType: inv.promotionType,
                    promotionValue: inv.promotionValue
                };
            }
            discountStats[code].count += 1;
            discountStats[code].totalDiscount += inv.discount || 0;
            discountStats[code].totalOrder += inv.finalTotal || inv.total || 0;
            if (inv.createdAt && (!discountStats[code].lastUsed || inv.createdAt > discountStats[code].lastUsed)) {
                discountStats[code].lastUsed = inv.createdAt;
            }
        }
    });

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
        customerRetention: { current: 0, previous: 0, growth: 0 },
        itemStats,
        discountStats,
        // itemStatsCancel
    });
};
