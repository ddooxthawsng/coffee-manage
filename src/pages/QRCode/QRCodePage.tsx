import React, { useState } from "react";
import { Form, Input, InputNumber, Button, Card, Alert } from "antd";
import QRCode from "qrcode.react";

const QRCodePage: React.FC = () => {
    const [form] = Form.useForm();
    const [qrValue, setQrValue] = useState<string>("");
    const [showAlert, setShowAlert] = useState(false);

    const handleGenerate = (values: any) => {
        // Tạo chuỗi VietQR chuẩn (giả lập, thực tế cần theo chuẩn VietQR)
        const { bank, account, name, amount, note } = values;
        if (!bank || !account || !name || !amount) {
            setShowAlert(true);
            return;
        }
        setShowAlert(false);
        // Ví dụ: Chuỗi định dạng đơn giản, thực tế nên dùng chuẩn VietQR
        const qrStr = `STK:${account}|NH:${bank}|TEN:${name}|SO_TIEN:${amount}|NOI_DUNG:${note || ""}`;
        setQrValue(qrStr);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <Card className="w-full max-w-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-black">Sinh mã QR thanh toán VietQR</h2>
                {showAlert && (
                    <Alert
                        message="Vui lòng nhập đầy đủ thông tin bắt buộc!"
                        type="error"
                        showIcon
                        className="mb-4"
                    />
                )}
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleGenerate}
                    initialValues={{ amount: 0 }}
                >
                    <Form.Item label="Ngân hàng" name="bank" rules={[{ required: true, message: "Nhập tên ngân hàng" }]}>
                        <Input placeholder="Ví dụ: Vietcombank" />
                    </Form.Item>
                    <Form.Item label="Số tài khoản" name="account" rules={[{ required: true, message: "Nhập số tài khoản" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Tên người nhận" name="name" rules={[{ required: true, message: "Nhập tên người nhận" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Số tiền (VNĐ)" name="amount" rules={[{ required: true, message: "Nhập số tiền" }]}>
                        <InputNumber min={0} className="w-full" step={1000} />
                    </Form.Item>
                    <Form.Item label="Nội dung chuyển khoản" name="note">
                        <Input />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Sinh mã QR
                    </Button>
                </Form>
                {qrValue && (
                    <div className="flex flex-col items-center mt-6">
                        <QRCode value={qrValue} size={200} />
                        <div className="mt-2 text-gray-500 text-sm">Quét mã này để thanh toán</div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default QRCodePage;
