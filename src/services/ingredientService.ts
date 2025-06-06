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

export const recalculateOutputCost = async (output: any, allInputs: any[]) => {
    let total = 0;
    if (output.recipe && Array.isArray(output.recipe)) {
        output.recipe.forEach((item: any) => {
            const input = allInputs.find((i) => i.id === item.ingredientId);
            if (input) {
                total += (item.quantity || 0) * (input.price || 0);
            }
        });
    }
    // Nếu có định lượng thành phẩm, chia ra costMin theo đơn vị
    let costMin = total;
    if (output.outputMinQuantity && output.outputUnit) {
        if (output.outputMinQuantity > 0) {
            costMin = Math.ceil(total / output.outputMinQuantity);
        }
    }
    // Cập nhật lại trường costMin cho thành phẩm
    await updateIngredient(output.id, { ...output, costMin });
};

const UNIT_GROUPS = [
    { group: "mass", units: [{ value: "g", factor: 1 }, { value: "kg", factor: 1000 }] },
    { group: "volume", units: [{ value: "ml", factor: 1 }, { value: "l", factor: 1000 }] },
    { group: "piece", units: [{ value: "cái", factor: 1 }] },
    { group: "box", units: [{ value: "hộp", factor: 1 }] },
    { group: "pack", units: [{ value: "gói", factor: 1 }] },
    { group: "bottle", units: [{ value: "chai", factor: 1 }] },
    { group: "can", units: [{ value: "bình", factor: 1 }] },
    { group: "cup", units: [{ value: "ly", factor: 1 }, { value: "tách", factor: 1 }] },
];

function findUnitGroup(unit: string) {
    return UNIT_GROUPS.find(g => g.units.some(u => u.value === unit));
}
function convertToBase(value: number, fromUnit: string, baseUnit: string) {
    const group = findUnitGroup(fromUnit);
    if (!group) return value;
    const from = group.units.find(u => u.value === fromUnit);
    const base = group.units.find(u => u.value === baseUnit);
    if (!from || !base) return value;
    return value * (from.factor / base.factor);
}
export const recalculateOutputCostMin = async (output: any, allInputs: any[]) => {
    let total = 0;
    if (output.recipe && Array.isArray(output.recipe)) {
        output.recipe.forEach((item: any) => {
            const input = allInputs.find((i) => i.id === item.ingredientId);
            if (input) {
                // Giá cost thực tế trên 1 đơn vị nhỏ nhất của nguyên liệu thô
                const pricePerUnit = input.price / convertToBase(input.quantity || 1, input.quantityUnit || input.unit, input.unit);
                // Quy đổi số lượng phối trộn về đúng đơn vị gốc của nguyên liệu thô
                const qtyBase = convertToBase(item.quantity || 0, item.unit || input.unit, input.unit);
                total += qtyBase * pricePerUnit;
            }
        });
    }
    let costMin = total;
    if (output.outputMinQuantity && output.outputUnit) {
        if (output.outputMinQuantity > 0) {
            costMin = Math.ceil(total / output.outputMinQuantity);
        }
    }
    await updateIngredient(output.id, { ...output, costMin });
};

// Hàm cập nhật lại costMin cho tất cả thành phẩm dùng nguyên liệu thô này
export const updateAllOutputCostMinByInputId = async (inputId: string) => {
    const allInputs = await getIngredientsByType("input");
    const allOutputs = await getIngredientsByType("output");
    const relatedOutputs = allOutputs.filter((output: any) =>
        output.recipe && output.recipe.some((item: any) => item.ingredientId === inputId)
    );
    for (const output of relatedOutputs) {
        await recalculateOutputCostMin(output, allInputs);
    }
};