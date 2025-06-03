import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    where  // Thêm import where
} from 'firebase/firestore';
import { message } from 'antd';
import db from './FirebaseConfigSetup';

const customersCollection = collection(db, 'customers');
const loyaltyTransactionsCollection = collection(db, 'loyalty_transactions');

// Thêm khách hàng mới
export const addCustomer = async (customerData) => {
    try {
        const docRef = await addDoc(customersCollection, {
            ...customerData,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log('Thêm khách hàng thành công với ID: ', docRef.id);
        return docRef.id;
    } catch (error) {
        message.error('Lỗi khi thêm khách hàng: ' + error.message);
        throw error;
    }
};

// Lấy danh sách khách hàng
export const getCustomers = async () => {
    try {
        const q = query(customersCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const customers = [];
        querySnapshot.forEach((doc) => {
            customers.push({ id: doc.id, ...doc.data() });
        });
        return customers;
    } catch (error) {
        message.error('Lỗi khi lấy danh sách khách hàng: ' + error.message);
        throw error;
    }
};

// Cập nhật khách hàng
export const updateCustomer = async (customerId, updatedData) => {
    try {
        const customerDoc = doc(db, 'customers', customerId);
        await updateDoc(customerDoc, {
            ...updatedData,
            updatedAt: new Date()
        });
        console.log('Cập nhật khách hàng thành công');
    } catch (error) {
        message.error('Lỗi khi cập nhật khách hàng: ' + error.message);
        throw error;
    }
};

// Xóa khách hàng
export const deleteCustomer = async (customerId) => {
    try {
        const customerDoc = doc(db, 'customers', customerId);
        await deleteDoc(customerDoc);
        console.log('Xóa khách hàng thành công');
    } catch (error) {
        message.error('Lỗi khi xóa khách hàng: ' + error.message);
        throw error;
    }
};

// Thêm giao dịch điểm thưởng
export const addLoyaltyTransaction = async (transactionData) => {
    try {
        const docRef = await addDoc(loyaltyTransactionsCollection, {
            ...transactionData,
            createdAt: new Date()
        });
        console.log('Thêm giao dịch điểm thưởng thành công với ID: ', docRef.id);
        return docRef.id;
    } catch (error) {
        message.error('Lỗi khi thêm giao dịch điểm thưởng: ' + error.message);
        throw error;
    }
};

// Lấy lịch sử giao dịch điểm thưởng của khách hàng
export const getLoyaltyTransactions = async (customerId) => {
    try {
        const q = query(
            loyaltyTransactionsCollection,
            where('customerId', '==', customerId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const transactions = [];
        querySnapshot.forEach((doc) => {
            transactions.push({ id: doc.id, ...doc.data() });
        });
        return transactions;
    } catch (error) {
        message.error('Lỗi khi lấy lịch sử giao dịch: ' + error.message);
        throw error;
    }
};

// Tìm khách hàng theo số điện thoại
export const findCustomerByPhone = async (phone) => {
    try {
        const q = query(customersCollection, where('phone', '==', phone));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        }
        return null;
    } catch (error) {
        message.error('Lỗi khi tìm khách hàng: ' + error.message);
        throw error;
    }
};

// Cập nhật điểm tích lũy
export const updateLoyaltyPoints = async (customerId, points, reason) => {
    try {
        const customers = await getCustomers();
        const customer = customers.find(c => c.id === customerId);

        if (customer) {
            const newPoints = (customer.loyaltyPoints || 0) + points;
            await updateCustomer(customerId, {
                loyaltyPoints: newPoints,
                lastVisit: new Date()
            });

            // Ghi lại giao dịch
            await addLoyaltyTransaction({
                customerId,
                points,
                type: points > 0 ? 'earn' : 'redeem',
                reason,
                balanceAfter: newPoints
            });

            return newPoints;
        }
        throw new Error('Không tìm thấy khách hàng');
    } catch (error) {
        message.error('Lỗi khi cập nhật điểm tích lũy: ' + error.message);
        throw error;
    }
};
