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

// Thêm QR mới (nếu là mặc định, cập nhật các QR khác về false)
export const createQRCode = async (data: any) => {
    if (data.isDefault) {
        // Đánh dấu các QR khác là không mặc định
        const q = query(collection(db, "qrcodes"));
        const snap = await getDocs(q);
        for (const d of snap.docs) {
            await updateDoc(doc(db, "qrcodes", d.id), { isDefault: false });
        }
    }
    const docRef = doc(collection(db, "qrcodes"));
    await setDoc(docRef, {
        ...data,
        isDefault: !!data.isDefault,
        createdAt: serverTimestamp(),
    });
};

// Lấy danh sách QR
export const getQRCodes = async () => {
    const q = query(collection(db, "qrcodes"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as any[];
};

// Cập nhật QR (nếu set mặc định, cập nhật các QR khác về false)
export const updateQRCode = async (id: string, data: any) => {
    if (data.isDefault) {
        const q = query(collection(db, "qrcodes"));
        const snap = await getDocs(q);
        for (const d of snap.docs) {
            await updateDoc(doc(db, "qrcodes", d.id), { isDefault: false });
        }
    }
    await updateDoc(doc(db, "qrcodes", id), data);
};

// Xóa QR
export const deleteQRCode = async (id: string) => {
    await deleteDoc(doc(db, "qrcodes", id));
};
