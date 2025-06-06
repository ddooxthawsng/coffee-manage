import {db} from "../firebase/config";
import {
    addDoc,
    collection,
    getDocs,
    limit as firestoreLimit,
    orderBy,
    query,
    Timestamp,
    where
} from "firebase/firestore";
import dayjs from "dayjs";

// Get analytics data for dashboard
export const getAnalyticsData = async (startDate: Date, endDate: Date) => {
    try {
        // Query invoices within date range
        const invoicesQuery = query(
            collection(db, "invoices"),
            where("createdAt", ">=", Timestamp.fromDate(startDate)),
            where("createdAt", "<=", Timestamp.fromDate(endDate)),
            orderBy("createdAt", "desc")
        );

        const invoicesSnapshot = await getDocs(invoicesQuery);
        const invoices = invoicesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        }));

        // Query costs within date range
        const costsQuery = query(
            collection(db, "costs"),
            where("date", ">=", Timestamp.fromDate(startDate)),
            where("date", "<=", Timestamp.fromDate(endDate)),
            orderBy("date", "desc")
        );

        const costsSnapshot = await getDocs(costsQuery);
        const costs = costsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate() || new Date()
        }));

        // Calculate metrics
        const totalRevenue = invoices.reduce((sum, inv:any) => sum + (inv.total || 0), 0);
        const totalCosts = costs.reduce((sum, cost:any) => sum + (cost.amount || 0), 0);
        const profit = totalRevenue - totalCosts;

        // Get unique customers
        const uniqueCustomers = new Set(invoices.map((inv:any) => inv.customerId || inv.userId));

        // Calculate sales by hour of day
        const hourlyData = Array(24).fill(0);
        invoices.forEach(inv => {
            const hour = dayjs(inv.createdAt).hour();
            hourlyData[hour]++;
        });

        // Calculate sales by day of week
        const dayData = Array(7).fill(0);
        invoices.forEach(inv => {
            const day = dayjs(inv.createdAt).day(); // 0 = Sunday
            dayData[day]++;
        });

        return {
            invoiceCount: invoices.length,
            totalRevenue,
            totalCosts,
            profit,
            customerCount: uniqueCustomers.size,
            avgOrderValue: invoices.length ? totalRevenue / invoices.length : 0,
            hourlyDistribution: hourlyData,
            dayDistribution: dayData,
            invoices,
            costs
        };
    } catch (error) {
        console.error("Error getting analytics data:", error);
        throw error;
    }
};

// Save insights to the database
export const saveInsight = async (insightData: any) => {
    try {
        const docRef = await addDoc(collection(db, "insights"), {
            ...insightData,
            createdAt: new Date()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error saving insight:", error);
        throw error;
    }
};

// Get previously saved insights
export const getSavedInsights = async (limitCount = 10) => {
    try {
        const insightsQuery = query(
            collection(db, "insights"),
            orderBy("createdAt", "desc"),
            firestoreLimit(limitCount)
        );

        const insightsSnapshot = await getDocs(insightsQuery);
        return insightsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
    } catch (error) {
        console.error("Error getting saved insights:", error);
        throw error;
    }
};
