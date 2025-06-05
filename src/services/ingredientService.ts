import { db } from "../firebase/config";
import {
    collection,
    doc,
    setDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    serverTimestamp, getDoc,
} from "firebase/firestore";

// Thêm mới nguyên liệu (thô hoặc thành phẩm, phân biệt bằng trường type)
export const createIngredient = async (data: any) => {
    const docRef = doc(collection(db, "ingredients"));
    await setDoc(docRef, {
        ...data,
        createdAt: serverTimestamp(),
    });
};

// Lấy tất cả nguyên liệu (dùng cho các chức năng tổng hợp, liên kết công thức, menu, chế biến, v.v.)
export const getIngredients = async () => {
    const querySnapshot = await getDocs(collection(db, "ingredients"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as any[];
};

// Lấy danh sách nguyên liệu theo loại: "input" (nguyên liệu thô) hoặc "output" (thành phẩm)
export const getIngredientsByType = async (type: "input" | "output") => {
    const all = await getIngredients();
    return all.filter((item) => item.type === type);
};

// Cập nhật nguyên liệu theo id
export const updateIngredient = async (id: string, data: any) => {
    await updateDoc(doc(db, "ingredients", id), data);
};

// Xóa nguyên liệu theo id
export const deleteIngredient = async (id: string) => {
    await deleteDoc(doc(db, "ingredients", id));
};
export const processOutput = async ({
                                        outputId,
                                        quantity,
                                    }: {
    outputId: string;
    quantity: number;
}) => {
    // Lấy thông tin thành phẩm (output)
    const outputRef = doc(db, "ingredients", outputId);
    const outputSnap = await getDoc(outputRef);
    if (!outputSnap.exists()) throw new Error("Không tìm thấy thành phẩm!");
    const output = outputSnap.data();
    if (!output.recipe || !Array.isArray(output.recipe) || output.recipe.length === 0)
        throw new Error("Thành phẩm chưa khai báo công thức!");

    // Kiểm tra tồn kho nguyên liệu thô
    for (const item of output.recipe) {
        const inputRef = doc(db, "ingredients", item.ingredientId);
        const inputSnap = await getDoc(inputRef);
        if (!inputSnap.exists()) throw new Error(`Không tìm thấy nguyên liệu thô với id ${item.ingredientId}`);
        const input = inputSnap.data();
        const used = item.quantity * quantity;
        if ((input.stock ?? 0) < used)
            throw new Error(`Nguyên liệu "${input.name}" không đủ tồn kho! Cần ${used} ${input.unit}, còn ${input.stock} ${input.unit}`);
    }

    // Nếu đủ, trừ kho nguyên liệu thô
    for (const item of output.recipe) {
        const inputRef = doc(db, "ingredients", item.ingredientId);
        const inputSnap = await getDoc(inputRef);
        const input = inputSnap.data();
        const used = item.quantity * quantity;
        await updateDoc(inputRef, { stock: (input?.stock ?? 0) - used });
    }

    // Cộng kho thành phẩm
    await updateDoc(outputRef, {
        stock: (output.stock ?? 0) + quantity,
        lastProcessedAt: serverTimestamp(),
    });
};

export const getIngredientById = async (id: string) => {
    const ref = doc(db, "ingredients", id);
    const snap = await getDoc(ref);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};