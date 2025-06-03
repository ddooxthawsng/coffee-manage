import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import db from './FirebaseConfigSetup';

// Collection reference
const qrcodesCollection = collection(db, 'qrcodes');

// Thêm QR code mới
export const addQRCode = async (qrcodeData) => {
    try {
        const docRef = await addDoc(qrcodesCollection, {
            ...qrcodeData,
            isDefault: qrcodeData.isDefault || false,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log('Thêm QR code thành công với ID: ', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Lỗi khi thêm QR code: ', error);
        throw error;
    }
};

// Lấy danh sách QR codes
export const getQRCodes = async () => {
    try {
        const querySnapshot = await getDocs(qrcodesCollection);
        const qrcodes = [];
        querySnapshot.forEach((doc) => {
            qrcodes.push({ id: doc.id, ...doc.data() });
        });
        return qrcodes;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách QR codes: ', error);
        throw error;
    }
};

// Lấy QR code theo ID
export const getQRCodeById = async (qrcodeId) => {
    try {
        const qrcodeDoc = doc(db, 'qrcodes', qrcodeId);
        const docSnap = await getDoc(qrcodeDoc);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            console.log('Không tìm thấy QR code!');
            return null;
        }
    } catch (error) {
        console.error('Lỗi khi lấy QR code: ', error);
        throw error;
    }
};

// Cập nhật QR code
export const updateQRCode = async (qrcodeId, updatedData) => {
    try {
        const qrcodeDoc = doc(db, 'qrcodes', qrcodeId);
        await updateDoc(qrcodeDoc, {
            ...updatedData,
            updatedAt: new Date()
        });
        console.log('Cập nhật QR code thành công');
    } catch (error) {
        console.error('Lỗi khi cập nhật QR code: ', error);
        throw error;
    }
};

// Xóa QR code
export const deleteQRCode = async (qrcodeId) => {
    try {
        const qrcodeDoc = doc(db, 'qrcodes', qrcodeId);
        await deleteDoc(qrcodeDoc);
        console.log('Xóa QR code thành công');
    } catch (error) {
        console.error('Lỗi khi xóa QR code: ', error);
        throw error;
    }
};

// Đặt QR code làm mặc định
export const setDefaultQRCode = async (qrcodeId) => {
    try {
        // Đầu tiên, bỏ tất cả QR code khỏi trạng thái mặc định
        const qrcodes = await getQRCodes();
        const updatePromises = qrcodes.map(qr => {
            if (qr.isDefault) {
                return updateQRCode(qr.id, { isDefault: false });
            }
            return Promise.resolve();
        });

        await Promise.all(updatePromises);

        // Sau đó đặt QR code được chọn làm mặc định
        await updateQRCode(qrcodeId, { isDefault: true });

        console.log('Đặt QR code mặc định thành công');
    } catch (error) {
        console.error('Lỗi khi đặt QR code mặc định: ', error);
        throw error;
    }
};

// Lấy QR code mặc định
export const getDefaultQRCode = async () => {
    try {
        const qrcodes = await getQRCodes();
        return qrcodes.find(qr => qr.isDefault) || null;
    } catch (error) {
        console.error('Lỗi khi lấy QR code mặc định: ', error);
        throw error;
    }
};
