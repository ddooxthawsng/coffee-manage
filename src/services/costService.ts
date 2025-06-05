import { db } from "../firebase/config";
import {
    collection,
    doc,
    setDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    query,
    orderBy,
} from "firebase/firestore";

// Thêm chi phí
export const createCost = async (data: any) => {
    const docRef = doc(collection(db, "costs"));
    await setDoc(docRef, {
        ...data,
        createdAt: serverTimestamp(),
    });
};

// Lấy danh sách chi phí (mới nhất lên đầu)
export const getCosts = async () => {
    const q = query(collection(db, "costs"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as any[];
};

// Cập nhật chi phí
export const updateCost = async (id: string, data: any) => {
    await updateDoc(doc(db, "costs", id), data);
};

// Xóa chi phí
export const deleteCost = async (id: string) => {
    await deleteDoc(doc(db, "costs", id));
};
