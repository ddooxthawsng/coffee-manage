import { db } from "../firebase/config";
import {
    collection,
    doc,
    setDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
} from "firebase/firestore";

// Thêm hóa đơn mới
export const createInvoice = async (data: any) => {
    const docRef = doc(collection(db, "invoices"));
    await setDoc(docRef, data);
    // Nếu muốn trả về id hóa đơn mới tạo:
    return { id: docRef.id, ...data };
};

// Lấy danh sách hóa đơn, có thể lọc theo ngày/tuần/tháng
export const getInvoices = async (filter: { from?: string; to?: string } = {}) => {
    let q = query(collection(db, "invoices"), orderBy("createdAt", "desc"));
    // Nếu có filter ngày
    if (filter.from && filter.to) {
        q = query(
            collection(db, "invoices"),
            where("createdAt", ">=", filter.from),
            where("createdAt", "<=", filter.to),
            orderBy("createdAt", "desc")
        );
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as any[];
};

// Lấy chi tiết hóa đơn
export const getInvoiceById = async (id: string) => {
    const docRef = doc(db, "invoices", id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

// Xóa hóa đơn
export const deleteInvoice = async (id: string) => {
    await deleteDoc(doc(db, "invoices", id));
};

// Cập nhật trạng thái hóa đơn
export const updateInvoiceStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "invoices", id), { status });
};
