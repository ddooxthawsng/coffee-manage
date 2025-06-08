import React, { useEffect } from "react";
import { Button, Modal, notification, Select } from "antd";
import { getVietQRUrl } from "../../../utils/vietqr";

const QRModal = ({
                     showQR,
                     setShowQR,
                     selectedQr,
                     setSelectedQr,
                     qrList,
                     finalTotal,
                     handleCheckoutQR,
                     loading,
                     cart,
                     promotion,
                     discount,
                     setCart
                 }) => {
    // Auto-select default QR code when modal opens
    useEffect(() => {
        if (showQR && qrList.length > 0 && !selectedQr) {
            const defaultQr = qrList.find(qr => qr.isDefault === true);
            setSelectedQr(defaultQr || qrList[0]);
        }
    }, [showQR, qrList, selectedQr, setSelectedQr]);

    // Xác nhận thanh toán (tạo hóa đơn QR)
    const handlePaymentConfirmation = async () => {
        try {
            await handleCheckoutQR({ promotion, discount, finalTotal });
            notification.success({
                message: 'Thanh toán thành công',
                description: 'Đơn hàng đã được thanh toán và xử lý thành công!',
                placement: 'top',
                duration: 1,
                style: {
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }
            });
            setShowQR(false);
            setCart([])
        } catch (error) {
            notification.error({
                message: 'Lỗi thanh toán',
                description: 'Có lỗi xảy ra khi xác nhận thanh toán. Vui lòng thử lại.',
                placement: 'top',
                duration: 2
            });
        }
    };

    return (
        <Modal
            open={showQR}
            onCancel={() => setShowQR(false)}
            footer={null}
            centered
            width="100%"
            style={{
                maxWidth: 600,
                fontSize: 18,
                fontWeight: "bold",
            }}
            bodyStyle={{
                padding: 16,
                maxHeight: "calc(100vh - 40px)",
                overflowY: "auto",
            }}
        >
            <div className="w-full">
                <div className="mb-3">
                    <span className="font-semibold">Chọn mã QR thanh toán:</span>
                    <Select
                        className="w-full mt-1"
                        placeholder="Chọn mã QR"
                        value={selectedQr?.id}
                        onChange={(id) => setSelectedQr(qrList.find((q) => q.id === id))}
                    >
                        {qrList.map((qr) => (
                            <Select.Option key={qr.id} value={qr.id}>
                                {qr.bankBin} - {qr.accountNumber} ({qr.accountName})
                            </Select.Option>
                        ))}
                    </Select>
                </div>

                {selectedQr && (
                    <div className="flex flex-col md:flex-row gap-4 w-full items-center md:items-start">
                        <div className="flex justify-center md:w-1/2">
                            <img
                                src={getVietQRUrl({
                                    bankBin: selectedQr.bankBin,
                                    accountNumber: selectedQr.accountNumber,
                                    amount: finalTotal,
                                    addInfo: "",
                                })}
                                alt="QR VietQR"
                                width={240}
                                height={240}
                                style={{
                                    border: "6px solid #1890ff",
                                    borderRadius: 16,
                                    background: "#fff",
                                    boxShadow: "0 4px 16px rgba(24, 144, 255, 0.2)",
                                }}
                            />
                        </div>

                        <div className="flex flex-col md:w-1/2 justify-between items-center md:items-start text-center md:text-left">
                            <p className="text-gray-600 mt-2">
                                Quét mã này bằng app ngân hàng để thanh toán đơn hàng.
                            </p>

                            <Button
                                type="primary"
                                className="mt-4"
                                size="large"
                                style={{
                                    background: "#52c41a",
                                    borderColor: "#52c41a",
                                    height: "auto",
                                    padding: "14px 24px",
                                    fontSize: 18,
                                    fontWeight: "bold",
                                    borderRadius: 12,
                                    boxShadow: "0 4px 12px rgba(82, 196, 26, 0.3)",
                                    width: "100%",
                                    maxWidth: 280
                                }}
                                onClick={handlePaymentConfirmation}
                                loading={loading}
                                disabled={!selectedQr || cart?.length === 0}
                            >
                                Xác nhận đã thanh toán
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>

    );
};

export default QRModal;
