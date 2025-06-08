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

// Tạo công thức mới
export const createRecipe = async (
    data: {
        name: string;
        type: string;
        ingredients: { name: string; size?: string; amount: string; unit?: string; note?: string }[];
        steps: string[];
        note?: string;
    }
) => {
    const ref = doc(collection(db, "recipes"));
    await setDoc(ref, {
        ...data,
        createdAt: serverTimestamp(),
    });
    return ref.id;
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
export const updateRecipe = async (
    id: string,
    data: Partial<{
        name: string;
        type: string;
        ingredients: { name: string; size?: string; amount: string; unit?: string; note?: string }[];
        steps: string[];
        note?: string;
    }>
) => {
    await updateDoc(doc(db, "recipes", id), data);
};

// Xóa công thức
export const deleteRecipe = async (id: string) => {
    await deleteDoc(doc(db, "recipes", id));
};
