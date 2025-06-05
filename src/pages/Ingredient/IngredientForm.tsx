import React from "react";
import { Form, Input, InputNumber, Button } from "antd";

interface IngredientFormProps {
    initialValues?: any;
    onSubmit: (values: any) => void;
    loading?: boolean;
}

const IngredientForm: React.FC<IngredientFormProps> = ({
                                                           initialValues,
                                                           onSubmit,
                                                           loading,
                                                       }) => {
    return (
        <Form
            layout="vertical"
            initialValues={initialValues || { type: "input", unit: "gram", price: 0 }}
            onFinish={onSubmit}
        >
            <Form.Item
                label="Tên nguyên liệu"
                name="name"
                rules={[{ required: true, message: "Nhập tên nguyên liệu" }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Đơn vị tính"
                name="unit"
                rules={[{ required: true, message: "Chọn đơn vị" }]}
            >
                <Input placeholder="gram, ml, cái, ..." />
            </Form.Item>
            <Form.Item
                label="Giá (VNĐ)"
                name="price"
                rules={[{ required: true, message: "Nhập giá nguyên liệu" }]}
            >
                <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item
                label="Số lượng tồn kho"
                name="stock"
                rules={[{ required: true, message: "Nhập số lượng tồn" }]}
            >
                <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item
                label="Ngưỡng cảnh báo"
                name="threshold"
                rules={[{ required: true, message: "Nhập ngưỡng cảnh báo" }]}
            >
                <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}>
                    {initialValues ? "Cập nhật" : "Tạo mới"}
                </Button>
            </Form.Item>
        </Form>
    );
};

export default IngredientForm;
