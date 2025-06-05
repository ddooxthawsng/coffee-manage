import React, { useEffect } from "react";
import { Modal, Button, Select, notification } from "antd";
import { getVietQRUrl } from "../../../utils/vietqr";

interface Props {
    showQR: boolean;
    setShowQR: (open: boolean) => void;
    selectedQr: any;
    setSelectedQr: (qr: any) => void;
    qrList: any[];
    finalTotal: number;
    invoiceId: string | null;
    handleCheckoutQR: () => Promise<void>;
    handleConfirmPaid: () => Promise<void>;
    loading: boolean;
}
const QRModal: React.FC<Props> = ({
                                      showQR, setShowQR, selectedQr, setSelectedQr, qrList, finalTotal, invoiceId, handleCheckoutQR, handleConfirmPaid, loading
                                  }) => {
                                      // Auto-select default QR code when modal opens
                                      useEffect(() => {
                                          if (showQR && qrList.length > 0 && !selectedQr) {
                                              // Find default QR code
                                              const defaultQr = qrList.find(qr => qr.isDefault === true);
                                              // If default exists, select it, otherwise select the first one
                                              setSelectedQr(defaultQr || qrList[0]);
                                          }
                                      }, [showQR, qrList, selectedQr, setSelectedQr]);

                                      // Auto-create invoice and show QR when modal opens
                                      useEffect(() => {
                                          const autoCreateInvoice = async () => {
                                              // Only create invoice if modal is open, a QR is selected, and no invoice exists yet
                                              if (showQR && selectedQr && !invoiceId && !loading) {
                                                  await handleCheckoutQR();
                                              }
                                          };

                                          autoCreateInvoice();
                                      }, [showQR, selectedQr, invoiceId, loading, handleCheckoutQR]);

                                      // Handle payment confirmation with notification
                                      const handlePaymentConfirmation = async () => {
                                          try {
                                              await handleConfirmPaid();
                                              notification.success({
                                                  message: 'Thanh toán thành công',
                                                  description: 'Đơn hàng đã được thanh toán và xử lý thành công!',
                                                  placement: 'top',
                                                  duration: 4,
                                                  style: {
                                                      borderRadius: '8px',
                                                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                                                  }
                                              });
                                          } catch (error) {
                                              notification.error({
                                                  message: 'Lỗi thanh toán',
                                                  description: 'Có lỗi xảy ra khi xác nhận thanh toán. Vui lòng thử lại.',
                                                  placement: 'top',
                                                  duration: 4
                                              });
                                          }
                                      };

                                      return (
    <Modal
        open={showQR}
        onCancel={() => setShowQR(false)}
        footer={null}
        centered
        width={440}
        title="Thanh toán bằng mã QR"
        bodyStyle={{ padding: "24px 16px" }}
        style={{ fontSize: 18, fontWeight: "bold" }}
    >
        <div className="flex flex-col items-center gap-3">
            <div className="w-full mb-2">
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
                <>
                    <img
                        src={getVietQRUrl({
                            bankBin: selectedQr.bankBin,
                            accountNumber: selectedQr.accountNumber,
                            amount: finalTotal,
                            addInfo: invoiceId ? `Thanh toan don #${invoiceId}` : "",
                        })}
                        alt="QR VietQR"
                        width={240}
                        height={240}
                        style={{ border: "6px solid #1890ff", borderRadius: 16, background: "#fff", boxShadow: "0 4px 16px rgba(24, 144, 255, 0.2)" }}
                    />
                    <div className="mt-2 text-gray-600 text-center">
                        Quét mã này bằng app ngân hàng để thanh toán đơn hàng.
                    </div>
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
                        disabled={!invoiceId}
                    >
                        Xác nhận đã thanh toán
                    </Button>
                </>
            )}
        </div>
    </Modal>
    );
};
export default QRModal;
