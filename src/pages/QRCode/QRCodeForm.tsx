import React from "react";
import { Form, Input, InputNumber, Button, Switch } from "antd";

interface QRCodeFormProps {
    initialValues?: any;
    onSubmit: (values: any) => void;
    loading?: boolean;
}

const QRCodeForm: React.FC<QRCodeFormProps> = ({
                                                   initialValues,
                                                   onSubmit,
                                                   loading,
                                               }) => {
    return (
        <Form
            layout="vertical"
            initialValues={{
                ...initialValues,
                isDefault: initialValues?.isDefault ?? false,
            }}
            onFinish={onSubmit}
        >
            <Form.Item label="Ngân hàng" name="bank" rules={[{ required: true, message: "Nhập tên ngân hàng" }]}>
                <Input />
            </Form.Item>
            <Form.Item label="Số tài khoản" name="account" rules={[{ required: true, message: "Nhập số tài khoản" }]}>
                <Input />
            </Form.Item>
            <Form.Item label="Tên người nhận" name="name" rules={[{ required: true, message: "Nhập tên người nhận" }]}>
                <Input />
            </Form.Item>
            <Form.Item label="Số tiền mẫu (VNĐ)" name="amount">
                <InputNumber min={0} className="w-full" step={1000} />
            </Form.Item>
            <Form.Item label="Nội dung chuyển khoản" name="note">
                <Input />
            </Form.Item>
            <Form.Item label="Đặt làm mặc định" name="isDefault" valuePropName="checked">
                <Switch />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}>
                    {initialValues ? "Cập nhật" : "Tạo mới"}
                </Button>
            </Form.Item>
        </Form>
    );
};

export default QRCodeForm;
