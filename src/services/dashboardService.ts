import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";

// Lấy tổng quan doanh thu, số đơn, chi phí, v.v.
export const getDashboardData = async () => {
    const invoicesSnap = await getDocs(collection(db, "invoices"));
    const costsSnap = await getDocs(collection(db, "costs"));

    const invoices = invoicesSnap.docs.map((doc) => doc.data());
    const costs = costsSnap.docs.map((doc) => doc.data());

    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalCost = costs.reduce((sum, c) => sum + (c.amount || 0), 0);

    const revenueByDate: Record<string, number> = {};
    invoices.forEach((inv) => {
        const date = inv.date || inv.createdAt?.toDate?.().toISOString().slice(0, 10) || "";
        revenueByDate[date] = (revenueByDate[date] || 0) + (inv.total || 0);
    });

    return {
        totalRevenue,
        totalCost,
        orderCount: invoices.length,
        costCount: costs.length,
        revenueByDate,
    };
};
