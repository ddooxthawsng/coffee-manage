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

    // Invalidate cache by removing the timestamp
    localStorage.removeItem('menu_cache_timestamp');
};

// Lấy danh sách món với cache để tối ưu hiệu suất
export const getMenus = async () => {
    // Check if we have cached data and when it was last updated
    const cachedData = localStorage.getItem('menu_cache');
    const lastUpdated = localStorage.getItem('menu_cache_timestamp');

    // If we have cached data and it's less than 6 hours old, use it
    if (cachedData && lastUpdated) {
        const parsedData = JSON.parse(cachedData);
        const cacheTime = parseInt(lastUpdated);
        const currentTime = Date.now();
        const sixHoursInMs = 6 * 60 * 60 * 1000;

        // If cache is still valid (less than 6 hours old)
        if (currentTime - cacheTime < sixHoursInMs) {
            console.log('Using cached menu data');
            return parsedData;
        }
    }

    // If no cache or cache is expired, fetch from server
    console.log('Fetching fresh menu data from server');
    const querySnapshot = await getDocs(collection(db, "menu"));
    const menuData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as any[];

    // Cache the new data
    localStorage.setItem('menu_cache', JSON.stringify(menuData));
    localStorage.setItem('menu_cache_timestamp', Date.now().toString());

    return menuData;
};

// Cập nhật bộ nhớ cache khi có thay đổi menu
const updateMenuCache = (menuData: any[]) => {
    localStorage.setItem('menu_cache', JSON.stringify(menuData));
    localStorage.setItem('menu_cache_timestamp', Date.now().toString());
};

// Cập nhật món
export const updateMenu = async (id: string, data: any) => {
    await updateDoc(doc(db, "menu", id), data);

    // Invalidate cache by removing the timestamp
    localStorage.removeItem('menu_cache_timestamp');
};

// Xóa món
export const deleteMenu = async (id: string) => {
    await deleteDoc(doc(db, "menu", id));

    // Invalidate cache by removing the timestamp
    localStorage.removeItem('menu_cache_timestamp');
};

// Lấy chi tiết 1 món (để kiểm tra tồn kho thành phẩm khi order)
export const getMenuById = async (id: string) => {
    const docRef = doc(db, "menu", id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

// Hàm xóa cache và bắt buộc tải lại dữ liệu từ server
export const refreshMenuCache = async () => {
    // Clear the cache
    localStorage.removeItem('menu_cache');
    localStorage.removeItem('menu_cache_timestamp');

    // Fetch fresh data
    return await getMenus();
};
