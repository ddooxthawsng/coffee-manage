import { db } from "../firebase/config";
import {
    collection,
    doc,
    setDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    orderBy,
    query,
} from "firebase/firestore";

// Thêm khuyến mãi
export const createPromotion = async (data: any) => {
    const docRef = doc(collection(db, "promotions"));
    await setDoc(docRef, {
        ...data,
        createdAt: serverTimestamp(),
    });
};

// Lấy danh sách khuyến mãi
export const getPromotions = async () => {
    const q = query(collection(db, "promotions"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as any[];
};

// Cập nhật khuyến mãi
export const updatePromotion = async (id: string, data: any) => {
    await updateDoc(doc(db, "promotions", id), data);
};

// Xóa khuyến mãi
export const deletePromotion = async (id: string) => {
    await deleteDoc(doc(db, "promotions", id));
};


// Lấy mã giảm giá mặc định (nếu có)
export const getDefaultPromotion = async () => {
    const promotions = await getPromotions();
    return promotions.find((promo: any) => promo.isDefault) || null;
};