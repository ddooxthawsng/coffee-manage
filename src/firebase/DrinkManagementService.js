import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from './FirebaseConfigSetup';

// Collection references
const drinksCollection = collection(db, 'drinks');
const salesCollection = collection(db, 'sales');

// Thêm đồ uống mới
export const addDrink = async (drinkData) => {
  try {
    const docRef = await addDoc(drinksCollection, {
      ...drinkData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Thêm đồ uống thành công với ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Lỗi khi thêm đồ uống: ', error);
    throw error;
  }
};

// Lấy danh sách đồ uống
export const getDrinks = async () => {
  try {
    const querySnapshot = await getDocs(drinksCollection);
    const drinks = [];
    querySnapshot.forEach((doc) => {
      drinks.push({ id: doc.id, ...doc.data() });
    });
    return drinks;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đồ uống: ', error);
    throw error;
  }
};

// Cập nhật đồ uống
export const updateDrink = async (drinkId, updatedData) => {
  try {
    const drinkDoc = doc(db, 'drinks', drinkId);
    await updateDoc(drinkDoc, {
      ...updatedData,
      updatedAt: new Date()
    });
    console.log('Cập nhật đồ uống thành công');
  } catch (error) {
    console.error('Lỗi khi cập nhật đồ uống: ', error);
    throw error;
  }
};

// Xóa đồ uống
export const deleteDrink = async (drinkId) => {
  try {
    const drinkDoc = doc(db, 'drinks', drinkId);
    await deleteDoc(drinkDoc);
    console.log('Xóa đồ uống thành công');
  } catch (error) {
    console.error('Lỗi khi xóa đồ uống: ', error);
    throw error;
  }
};

// Ghi nhận bán hàng
export const recordSale = async (saleData) => {
  try {
    const docRef = await addDoc(salesCollection, {
      ...saleData,
      timestamp: new Date()
    });
    console.log('Ghi nhận bán hàng thành công với ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Lỗi khi ghi nhận bán hàng: ', error);
    throw error;
  }
};

// ❌ BỎ FUNCTION updateDrinkInventory

// Lấy dữ liệu bán hàng theo ngày
export const getSalesForDate = async (date) => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
        salesCollection,
        where('timestamp', '>=', startOfDay),
        where('timestamp', '<=', endOfDay)
    );

    const querySnapshot = await getDocs(q);
    const sales = [];
    querySnapshot.forEach((doc) => {
      sales.push({ id: doc.id, ...doc.data() });
    });

    return sales;
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu bán hàng: ', error);
    throw error;
  }
};