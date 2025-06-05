import { db } from "../firebase/config";
import {
    collection, doc, setDoc, getDocs, updateDoc, deleteDoc, serverTimestamp, getDoc
} from "firebase/firestore";

// Thêm món mới (liên kết thành phẩm)
export const createMenu = async (data: any) => {
    const docRef = doc(collection(db, "menu"));
    await setDoc(docRef, {
        ...data,
        createdAt: serverTimestamp(),
    });
};

// Lấy danh sách món, bao gồm liên kết thành phẩm
export const getMenus = async () => {
    const querySnapshot = await getDocs(collection(db, "menu"));
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as any[];
};

// Cập nhật món
export const updateMenu = async (id: string, data: any) => {
    await updateDoc(doc(db, "menu", id), data);
};

// Xóa món
export const deleteMenu = async (id: string) => {
    await deleteDoc(doc(db, "menu", id));
};

// Lấy chi tiết 1 món (để kiểm tra tồn kho thành phẩm khi order)
export const getMenuById = async (id: string) => {
    const docRef = doc(db, "menu", id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};
