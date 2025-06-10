import {db} from "../firebase/config";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    setDoc,
    Timestamp,
    updateDoc,
    where,
    limit
} from "firebase/firestore";

// Thêm hóa đơn mới
export const createInvoice = async (data: any) => {
    const docRef = doc(collection(db, "invoices"));
    await setDoc(docRef, data);
    return {id: docRef.id, ...data};
};

// Lấy danh sách hóa đơn, lọc theo ngày và/hoặc createdUser (email)
export const getInvoices = async (filter = {}) => {
    try {
        let q = collection(db, "invoices");
        const wheres = [];
        // Lọc theo email người tạo hóa đơn
        if (filter.createdUser) {
            wheres.push(where("createdUser", "==", filter.createdUser));
        }

        // Lọc theo ngày (chuyển sang Timestamp)
        if (filter.from && filter.to) {
            const fromTimestamp = Timestamp.fromDate(new Date(filter.from));
            const toTimestamp = Timestamp.fromDate(new Date(filter.to));
            wheres.push(where("createdAt", ">=", fromTimestamp));
            wheres.push(where("createdAt", "<=", toTimestamp));
        }
        let queryRef;
        if (filter.limit ) {
            queryRef = query(q, ...wheres, orderBy("createdAt", "desc"), limit(filter.limit));
        } else {
            queryRef = query(q, ...wheres, orderBy("createdAt", "desc"));
        }

        const querySnapshot = await getDocs(queryRef);
        console.log("querySnapshot.docs", querySnapshot.docs)
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    }catch (e){
        console.log("EEEE",e)
        return [];
    }
};


// Lấy chi tiết hóa đơn
export const getInvoiceById = async (id: string) => {
    const docRef = doc(db, "invoices", id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? {id: docSnap.id, ...docSnap.data()} : null;
};

// Đổi trạng thái hóa đơn thành "deleted" thay vì xóa bản ghi
export const deleteInvoice = async (id: string) => {
    await updateDoc(doc(db, "invoices", id), {status: "deleted"});
};

// Cập nhật trạng thái hóa đơn
export const updateInvoiceStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "invoices", id), {status});
};
