import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { message } from 'antd';
import db from './FirebaseConfigSetup';

const promotionsCollection = collection(db, 'promotions');

// Thêm khuyến mãi mới
export const addPromotion = async (promotionData) => {
    try {
        const docRef = await addDoc(promotionsCollection, {
            ...promotionData,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log('Thêm khuyến mãi thành công với ID: ', docRef.id);
        return docRef.id;
    } catch (error) {
        message.error('Lỗi khi thêm khuyến mãi: ' + error.message);
        throw error;
    }
};

// Lấy danh sách khuyến mãi
export const getPromotions = async () => {
    try {
        const q = query(promotionsCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const promotions = [];
        querySnapshot.forEach((doc) => {
            promotions.push({ id: doc.id, ...doc.data() });
        });
        return promotions;
    } catch (error) {
        message.error('Lỗi khi lấy danh sách khuyến mãi: ' + error.message);
        throw error;
    }
};

// Cập nhật khuyến mãi
export const updatePromotion = async (promotionId, updatedData) => {
    try {
        const promotionDoc = doc(db, 'promotions', promotionId);
        await updateDoc(promotionDoc, {
            ...updatedData,
            updatedAt: new Date()
        });
        console.log('Cập nhật khuyến mãi thành công');
    } catch (error) {
        message.error('Lỗi khi cập nhật khuyến mãi: ' + error.message);
        throw error;
    }
};

// Xóa khuyến mãi
export const deletePromotion = async (promotionId) => {
    try {
        const promotionDoc = doc(db, 'promotions', promotionId);
        await deleteDoc(promotionDoc);
        console.log('Xóa khuyến mãi thành công');
    } catch (error) {
        message.error('Lỗi khi xóa khuyến mãi: ' + error.message);
        throw error;
    }
};

// Lấy khuyến mãi đang hoạt động
export const getActivePromotions = async () => {
    try {
        const now = new Date();
        const q = query(
            promotionsCollection,
            where('isActive', '==', true),
            where('startDate', '<=', now),
            where('endDate', '>=', now)
        );
        const querySnapshot = await getDocs(q);
        const activePromotions = [];
        querySnapshot.forEach((doc) => {
            activePromotions.push({ id: doc.id, ...doc.data() });
        });
        return activePromotions;
    } catch (error) {
        message.error('Lỗi khi lấy khuyến mãi đang hoạt động: ' + error.message);
        throw error;
    }
};

// Kiểm tra khuyến mãi có thể áp dụng
export const checkPromotionEligibility = async (promotionId, orderAmount, customerId) => {
    try {
        const promotions = await getPromotions();
        const promotion = promotions.find(p => p.id === promotionId);

        if (!promotion) {
            return { eligible: false, reason: 'Không tìm thấy khuyến mãi' };
        }

        if (!promotion.isActive) {
            return { eligible: false, reason: 'Khuyến mãi không còn hoạt động' };
        }

        const now = new Date();
        if (now < promotion.startDate.toDate() || now > promotion.endDate.toDate()) {
            return { eligible: false, reason: 'Khuyến mãi đã hết hạn' };
        }

        if (promotion.minOrderAmount && orderAmount < promotion.minOrderAmount) {
            return {
                eligible: false,
                reason: `Đơn hàng tối thiểu ${promotion.minOrderAmount.toLocaleString()}đ`
            };
        }

        if (promotion.maxUsage && promotion.usageCount >= promotion.maxUsage) {
            return { eligible: false, reason: 'Khuyến mãi đã hết lượt sử dụng' };
        }

        return { eligible: true, promotion };
    } catch (error) {
        message.error('Lỗi khi kiểm tra khuyến mãi: ' + error.message);
        throw error;
    }
};

// Áp dụng khuyến mãi
export const applyPromotion = async (promotionId, orderAmount) => {
    try {
        const { eligible, promotion, reason } = await checkPromotionEligibility(promotionId, orderAmount);

        if (!eligible) {
            return { success: false, reason };
        }

        let discountAmount = 0;

        switch (promotion.type) {
            case 'percentage':
                discountAmount = Math.round(orderAmount * promotion.discountPercent / 100);
                break;
            case 'fixed':
                discountAmount = promotion.discountAmount;
                break;
            default:
                discountAmount = 0;
        }

        // Cập nhật số lần sử dụng
        await updatePromotion(promotionId, {
            usageCount: (promotion.usageCount || 0) + 1
        });

        return {
            success: true,
            discountAmount,
            finalAmount: orderAmount - discountAmount,
            promotion
        };
    } catch (error) {
        message.error('Lỗi khi áp dụng khuyến mãi: ' + error.message);
        throw error;
    }
};
