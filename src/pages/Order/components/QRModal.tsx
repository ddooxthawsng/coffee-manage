import React from "react";
import { Modal, Button, Select } from "antd";
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
                                  }) => (
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
                        onClick={async () => {
                            if (!selectedQr) return;
                            if (!invoiceId) {
                                await handleCheckoutQR();
                            } else {
                                await handleConfirmPaid();
                            }
                        }}
                        loading={loading}
                    >
                        {invoiceId ? "Xác nhận đã thanh toán" : "Tạo hóa đơn & hiển thị QR"}
                    </Button>
                </>
            )}
        </div>
    </Modal>
);
export default QRModal;
