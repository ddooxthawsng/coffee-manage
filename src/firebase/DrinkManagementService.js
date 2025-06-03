import {collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, getDoc} from 'firebase/firestore';
import { message } from 'antd';
import db from './FirebaseConfigSetup';

// Collection references
const drinksCollection = collection(db, 'drinks');
const salesCollection = collection(db, 'sales');
const invoicesCollection = collection(db, 'invoices');

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
    message.error('Lỗi khi thêm đồ uống: ' + error.message);
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
    message.error('Lỗi khi lấy danh sách đồ uống: ' + error.message);
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
    message.error('Lỗi khi cập nhật đồ uống: ' + error.message);
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
    message.error('Lỗi khi xóa đồ uống: ' + error.message);
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
    message.error('Lỗi khi ghi nhận bán hàng: ' + error.message);
    throw error;
  }
};

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
    message.error('Lỗi khi lấy dữ liệu bán hàng: ' + error.message);
    throw error;
  }
};

// Lấy danh sách hóa đơn
export const getInvoices = async () => {
  try {
    const querySnapshot = await getDocs(invoicesCollection);
    const invoices = [];
    querySnapshot.forEach((doc) => {
      invoices.push({ id: doc.id, ...doc.data() });
    });
    return invoices;
  } catch (error) {
    message.error('Lỗi khi lấy danh sách hóa đơn: ' + error.message);
    throw error;
  }
};

// Thêm hóa đơn mới
export const addInvoice = async (invoiceData) => {
  try {
    const docRef = await addDoc(invoicesCollection, {
      ...invoiceData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Thêm hóa đơn thành công với ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    message.error('Lỗi khi thêm hóa đơn: ' + error.message);
    throw error;
  }
};

// Cập nhật hóa đơn
export const updateInvoice = async (invoiceId, updatedData) => {
  try {
    const invoiceDoc = doc(db, 'invoices', invoiceId);
    await updateDoc(invoiceDoc, {
      ...updatedData,
      updatedAt: new Date()
    });
    console.log('Cập nhật hóa đơn thành công');
  } catch (error) {
    message.error('Lỗi khi cập nhật hóa đơn: ' + error.message);
    throw error;
  }
};

// Lấy hóa đơn theo ID
export const getInvoiceById = async (invoiceId) => {
  try {
    const invoiceDoc = doc(db, 'invoices', invoiceId);
    const docSnap = await getDoc(invoiceDoc);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    message.error('Lỗi khi lấy hóa đơn: ' + error.message);
    throw error;
  }
};

// Lấy doanh thu theo khoảng thời gian
export const getRevenueByDateRange = async (startDate, endDate) => {
  try {
    const q = query(
        salesCollection,
        where('timestamp', '>=', startDate),
        where('timestamp', '<=', endDate),
        where('status', '!=', 'cancelled')
    );

    const querySnapshot = await getDocs(q);
    const sales = [];
    querySnapshot.forEach((doc) => {
      sales.push({ id: doc.id, ...doc.data() });
    });
    return sales;
  } catch (error) {
    message.error('Lỗi khi lấy dữ liệu doanh thu: ' + error.message);
    throw error;
  }
};

// Lấy thống kê bán hàng theo đồ uống
export const getDrinkSalesStats = async (startDate, endDate) => {
  try {
    const sales = await getRevenueByDateRange(startDate, endDate);
    const drinkStats = {};

    sales.forEach(sale => {
      const { drinkId, drinkName, quantity, total } = sale;
      if (!drinkStats[drinkId]) {
        drinkStats[drinkId] = {
          drinkName,
          totalQuantity: 0,
          totalRevenue: 0,
          salesCount: 0
        };
      }
      drinkStats[drinkId].totalQuantity += quantity;
      drinkStats[drinkId].totalRevenue += total;
      drinkStats[drinkId].salesCount += 1;
    });

    return Object.values(drinkStats).sort((a, b) => b.totalQuantity - a.totalQuantity);
  } catch (error) {
    message.error('Lỗi khi lấy thống kê bán hàng: ' + error.message);
    throw error;
  }
};

// Lấy top đồ uống bán chạy
export const getTopSellingDrinks = async (limit = 10) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const now = new Date();

    const stats = await getDrinkSalesStats(thirtyDaysAgo, now);
    return stats.slice(0, limit);
  } catch (error) {
    message.error('Lỗi khi lấy top đồ uống bán chạy: ' + error.message);
    throw error;
  }
};

// Kiểm tra tồn kho trước khi bán
export const checkInventoryBeforeSale = async (drinkId, quantity) => {
  try {
    const drinks = await getDrinks();
    const drink = drinks.find(d => d.id === drinkId);

    if (!drink || !drink.ingredients) {
      return { canSell: true, missingIngredients: [] };
    }

    const missingIngredients = [];
    // Logic kiểm tra tồn kho sẽ được implement dựa trên ingredient service

    return { canSell: missingIngredients.length === 0, missingIngredients };
  } catch (error) {
    message.error('Lỗi khi kiểm tra tồn kho: ' + error.message);
    throw error;
  }
};

// Export function tương thích với code cũ
export const addSale = recordSale;

// Hủy hóa đơn
export const cancelInvoice = async (invoiceId, cancelData) => {
  try {
    const invoiceDoc = doc(db, 'invoices', invoiceId);
    await updateDoc(invoiceDoc, {
      ...cancelData,
      status: 'cancelled',
      updatedAt: new Date()
    });

    // Cập nhật trạng thái các sales liên quan
    const relatedSalesQuery = query(
        salesCollection,
        where('invoiceId', '==', invoiceId)
    );

    const salesSnapshot = await getDocs(relatedSalesQuery);
    const updatePromises = [];

    salesSnapshot.forEach((saleDoc) => {
      const updatePromise = updateDoc(doc(db, 'sales', saleDoc.id), {
        status: 'cancelled',
        cancelledAt: new Date(),
        updatedAt: new Date()
      });
      updatePromises.push(updatePromise);
    });

    await Promise.all(updatePromises);
    console.log('Hủy hóa đơn thành công');
  } catch (error) {
    message.error('Lỗi khi hủy hóa đơn: ' + error.message);
    throw error;
  }
};
