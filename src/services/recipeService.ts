import { db } from "../firebase/config";
import {
    collection,
    doc,
    setDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    serverTimestamp,
} from "firebase/firestore";

// Thêm công thức mới
export const createRecipe = async (data: any) => {
    const docRef = doc(collection(db, "recipes"));
    await setDoc(docRef, {
        ...data,
        createdAt: serverTimestamp(),
    });
};

// Lấy danh sách công thức
export const getRecipes = async () => {
    const querySnapshot = await getDocs(collection(db, "recipes"));
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as any[];
};

// Cập nhật công thức
export const updateRecipe = async (id: string, data: any) => {
    await updateDoc(doc(db, "recipes", id), data);
};

// Xóa công thức
export const deleteRecipe = async (id: string) => {
    await deleteDoc(doc(db, "recipes", id));
};
