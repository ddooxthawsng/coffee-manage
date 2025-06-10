import React from "react";
import { Form, Input, InputNumber, Button, Select } from "antd";

const UNIT_OPTIONS = [
    { value: "g", label: "Gram (g)" },
    { value: "kg", label: "Kilogram (kg)" },
    { value: "ml", label: "Mililít (ml)" },
    { value: "l", label: "Lít (l)" },
    { value: "cái", label: "Cái" },
    { value: "hộp", label: "Hộp" },
    { value: "gói", label: "Gói" },
    { value: "chai", label: "Chai" },
    { value: "bình", label: "Bình" },
    { value: "ly", label: "Ly" },
    { value: "tách", label: "Tách" },
];

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
    // Hàm filter tùy chỉnh để tìm kiếm cả value và label
    const filterOption = (input: string, option?: { label: string; value: string }) => {
        if (!option) return false;
        const searchText = input.toLowerCase();
        return (
            option.label.toLowerCase().includes(searchText) ||
            option.value.toLowerCase().includes(searchText)
        );
    };

    return (
        <Form
            layout="vertical"
            initialValues={initialValues || { unit: "g", price: 0, quantity: 1, quantityUnit: "g" }}
            onFinish={onSubmit}
        >
            <Form.Item
                label="Tên nguyên liệu"
                name="name"
                rules={[{ required: true, message: "Nhập tên nguyên liệu" }]}
            >
                <Input placeholder="Nhập tên nguyên liệu..." />
            </Form.Item>

            <Form.Item
                label="Đơn vị tính"
                name="unit"
                rules={[{ required: true, message: "Chọn đơn vị" }]}
            >
                <Select
                    placeholder="Tìm kiếm và chọn đơn vị..."
                    showSearch
                    allowClear
                    filterOption={filterOption}
                    options={UNIT_OPTIONS}
                />
            </Form.Item>

            <Form.Item
                label="Giá cost (VNĐ)"
                name="price"
                rules={[{ required: true, message: "Nhập giá nguyên liệu" }]}
            >
                <InputNumber
                    min={0}
                    className="w-full"
                    placeholder="Nhập giá cost..."
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                />
            </Form.Item>

            <Form.Item label="Định lượng áp dụng cho giá cost (Giá bán nguyên liệu)" required>
                <Input.Group compact>
                    <Form.Item
                        name="quantity"
                        noStyle
                        rules={[{ required: true, message: "Nhập định lượng" }]}
                    >
                        <InputNumber
                            min={0.01}
                            step={0.01}
                            placeholder="Định lượng"
                            style={{ width: 120 }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="quantityUnit"
                        noStyle
                        rules={[{ required: true, message: "Chọn đơn vị định lượng" }]}
                    >
                        <Select
                            placeholder="Đơn vị"
                            style={{ width: 100 }}
                            showSearch
                            allowClear
                            filterOption={filterOption}
                            options={UNIT_OPTIONS}
                        />
                    </Form.Item>
                </Input.Group>
                <div style={{ color: "#888", fontSize: 13, marginTop: 4 }}>
                    💡 VD: Giá cost này áp dụng cho 0.5 kg, 100g, 1 lít, 1 cái, v.v.
                </div>
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
