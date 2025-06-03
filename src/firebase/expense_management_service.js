import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  Timestamp 
} from 'firebase/firestore';
import db from './FirebaseConfigSetup';

const COLLECTION_NAME = 'expenses';

// Thêm chi phí mới
export const addExpense = async (expenseData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...expenseData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Lỗi khi thêm chi phí:', error);
    throw error;
  }
};

// Lấy danh sách tất cả chi phí
export const getExpenses = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    const expenses = [];
    
    querySnapshot.forEach((doc) => {
      expenses.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return expenses;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách chi phí:', error);
    throw error;
  }
};

// Lấy chi phí theo khoảng thời gian
export const getExpensesByDateRange = async (startDate, endDate) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const expenses = [];
    
    querySnapshot.forEach((doc) => {
      expenses.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return expenses;
  } catch (error) {
    console.error('Lỗi khi lấy chi phí theo thời gian:', error);
    throw error;
  }
};

// Lấy chi phí theo danh mục
export const getExpensesByCategory = async (category) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('category', '==', category),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const expenses = [];
    
    querySnapshot.forEach((doc) => {
      expenses.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return expenses;
  } catch (error) {
    console.error('Lỗi khi lấy chi phí theo danh mục:', error);
    throw error;
  }
};

// Cập nhật chi phí
export const updateExpense = async (expenseId, updatedData) => {
  try {
    const expenseRef = doc(db, COLLECTION_NAME, expenseId);
    await updateDoc(expenseRef, {
      ...updatedData,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật chi phí:', error);
    throw error;
  }
};

// Xóa chi phí
export const deleteExpense = async (expenseId) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, expenseId));
  } catch (error) {
    console.error('Lỗi khi xóa chi phí:', error);
    throw error;
  }
};

// Thống kê chi phí theo tháng
export const getMonthlyExpenseStats = async (year) => {
  try {
    const startOfYear = `${year}-01-01`;
    const endOfYear = `${year}-12-31`;
    
    const expenses = await getExpensesByDateRange(startOfYear, endOfYear);
    
    const monthlyStats = {};
    expenses.forEach(expense => {
      const month = expense.date.substring(5, 7); // Lấy tháng từ YYYY-MM-DD
      if (!monthlyStats[month]) {
        monthlyStats[month] = {
          total: 0,
          count: 0,
          categories: {}
        };
      }
      monthlyStats[month].total += expense.amount;
      monthlyStats[month].count += 1;
      
      if (!monthlyStats[month].categories[expense.category]) {
        monthlyStats[month].categories[expense.category] = 0;
      }
      monthlyStats[month].categories[expense.category] += expense.amount;
    });
    
    return monthlyStats;
  } catch (error) {
    console.error('Lỗi khi thống kê chi phí theo tháng:', error);
    throw error;
  }
};

// Thống kê chi phí theo danh mục
export const getCategoryExpenseStats = async () => {
  try {
    const expenses = await getExpenses();
    
    const categoryStats = {};
    expenses.forEach(expense => {
      if (!categoryStats[expense.category]) {
        categoryStats[expense.category] = {
          total: 0,
          count: 0,
          avgAmount: 0
        };
      }
      categoryStats[expense.category].total += expense.amount;
      categoryStats[expense.category].count += 1;
    });
    
    // Tính trung bình
    Object.keys(categoryStats).forEach(category => {
      categoryStats[category].avgAmount = 
        categoryStats[category].total / categoryStats[category].count;
    });
    
    return categoryStats;
  } catch (error) {
    console.error('Lỗi khi thống kê chi phí theo danh mục:', error);
    throw error;
  }
};