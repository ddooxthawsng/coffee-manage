import { auth, db } from "../firebase/config";
import {
    createUserWithEmailAndPassword,
} from "firebase/auth";
import {
    collection,
    doc,
    setDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    serverTimestamp,
} from "firebase/firestore";

// Tạo user mới
export const createUser = async (
    email: string,
    password: string,
    data: { name: string; role: string }
) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", res.user.uid), {
        ...data,
        email,
        createdAt: serverTimestamp(),
    });
};

// Lấy danh sách user
export const getUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as any[];
};

// Cập nhật user
export const updateUser = async (
    uid: string,
    data: { name?: string; role?: string }
) => {
    await updateDoc(doc(db, "users", uid), data);
};

// Xóa user
export const deleteUser = async (uid: string) => {
    await deleteDoc(doc(db, "users", uid));
    // Nếu muốn xóa luôn trên Auth, cần dùng Admin SDK phía backend
};
