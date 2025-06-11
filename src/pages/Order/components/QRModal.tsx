import React, {useEffect} from "react";
import {Button, Modal, notification, Select} from "antd";
import {getVietQRUrl} from "../../../utils/vietqr";

const QRModal = ({
                     showQR,
                     setShowQR,
                     selectedQr,
                     setSelectedQr,
                     qrList,
                     loading,
                     cart,
                     // Props cho luồng thanh toán QR
                     checkoutPayload,
                     setCheckoutPayload,
                     handleConfirmPaid
                 }) => {
    // Auto-select default QR code when modal opens
    useEffect(() => {
        if (showQR && qrList.length > 0 && !selectedQr) {
            const defaultQr = qrList.find(qr => qr.isDefault === true);
            setSelectedQr(defaultQr || qrList[0]);
        }
    }, [showQR, qrList, selectedQr, setSelectedQr]);

    // Kiểm tra xem có đang trong trạng thái chờ thanh toán không
    const isWaitingForPayment = checkoutPayload && checkoutPayload.tableNumber;
    const finalTotal = checkoutPayload?.finalTotal || 0;

    // Đóng modal
    const handleCloseQR = () => {
        setShowQR(false);
        // Reset checkout payload nếu chưa hoàn thành
        if (checkoutPayload) {
            setCheckoutPayload(null);
        }
    };

    // Xác nhận thanh toán
    const handlePaymentConfirmation = async () => {
        try {
            await handleConfirmPaid();
        } catch (error) {
            console.error('Payment confirmation error:', error);
        }
    };

    return (
        <Modal
            open={showQR}
            onCancel={handleCloseQR}
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
            title={isWaitingForPayment ? `Thanh toán QR - Bàn ${checkoutPayload.tableNumber}` : "Thanh toán QR"}
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

                {/* Hiển thị thông tin đơn hàng */}
                {isWaitingForPayment && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="font-semibold text-blue-700 mb-2">
                            Thông tin đơn hàng:
                        </div>
                        <div className="text-sm space-y-1">
                            <div>Bàn số: <span className="font-semibold">{checkoutPayload.tableNumber}</span></div>
                            <div>Loại: <span className="font-semibold">{checkoutPayload.orderTypeText}</span></div>
                            <div>Tổng tiền: <span className="font-semibold text-blue-600">{finalTotal.toLocaleString()}đ</span></div>
                            {checkoutPayload.promotion && (
                                <div>Khuyến mãi: <span className="font-semibold text-green-600">{checkoutPayload.promotion.code}</span></div>
                            )}
                            {checkoutPayload.discount > 0 && (
                                <div>Giảm giá: <span className="font-semibold text-orange-600">-{checkoutPayload.discount.toLocaleString()}đ</span></div>
                            )}
                        </div>
                    </div>
                )}

                {selectedQr && (
                    <div className="flex flex-col md:flex-row gap-4 w-full items-center md:items-start">
                        <div className="flex justify-center md:w-1/2">
                            <img
                                src={getVietQRUrl({
                                    bankBin: selectedQr.bankBin,
                                    accountNumber: selectedQr.accountNumber,
                                    amount: finalTotal,
                                    addInfo: isWaitingForPayment ?
                                        `Ban ${checkoutPayload?.tableNumber || ''}` :
                                        "",
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
                            <p className="text-gray-600 mt-2 mb-4">
                                {isWaitingForPayment
                                    ? "Khách hàng quét mã QR này để thanh toán. Sau khi khách thanh toán xong, nhấn nút xác nhận bên dưới."
                                    : "Quét mã này bằng app ngân hàng để thanh toán đơn hàng."
                                }
                            </p>

                            <Button
                                type="primary"
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
                                disabled={!selectedQr || !isWaitingForPayment}
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
