import { useEffect, useState } from "react";
import { collection, getFirestore, onSnapshot, query, where } from "firebase/firestore";

export function useIsLandscape() {
    const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
    useEffect(() => {
        const handleResize = () => setIsLandscape(window.innerWidth > window.innerHeight);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    return isLandscape;
}

export function useWindowWidth() {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    return width;
}

export function usePendingOrders() {
    const [pendingOrders, setPendingOrders] = useState([]);
    useEffect(() => {
        const db = getFirestore();
        const q = query(collection(db, "invoices"), where("status", "==", "processing"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            orders.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
            setPendingOrders(orders);
        });
        return () => unsubscribe();
    }, []);
    return pendingOrders;
}
