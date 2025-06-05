import React, { useEffect, useState } from "react";
import { Form, Input, Button, Select, Space, InputNumber } from "antd";
import { getIngredientsByType } from "../../services/ingredientService";

const { Option } = Select;

interface MenuFormProps {
    initialValues?: any;
    onSubmit: (values: any) => void;
    loading?: boolean;
}

const MenuForm: React.FC<MenuFormProps> = ({
                                               initialValues,
                                               onSubmit,
                                               loading,
                                           }) => {
    const [outputs, setOutputs] = useState<any[]>([]);

    useEffect(() => {
        getIngredientsByType("output").then(setOutputs);
    }, []);

    return (
        <Form
            layout="vertical"
            initialValues={initialValues || { sizes: [{ size: "M", price: 0 }], status: "active" }}
            onFinish={onSubmit}
        >
            <Form.Item
                label="Tên món"
                name="name"
                rules={[{ required: true, message: "Nhập tên món" }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Danh mục"
                name="category"
                rules={[{ required: true, message: "Chọn danh mục" }]}
            >
                <Select>
                    <Option value="Cà phê">Cà phê</Option>
                    <Option value="Trà">Trà</Option>
                    <Option value="Nước ép">Nước ép</Option>
                    <Option value="Khác">Khác</Option>
                </Select>
            </Form.Item>
            <Form.List name="sizes">
                {(fields, { add, remove }) => (
                    <>
                        <label className="block font-medium mb-1">Size & Giá bán</label>
                        {fields.map(({ key, name, ...restField }) => (
                            <Space key={key} className="mb-2 flex" align="baseline">
                                <Form.Item
                                    {...restField}
                                    name={[name, "size"]}
                                    rules={[{ required: true, message: "Nhập size" }]}
                                >
                                    <Input placeholder="Size (S/M/L...)" />
                                </Form.Item>
                                <Form.Item
                                    {...restField}
                                    name={[name, "price"]}
                                    rules={[{ required: true, message: "Nhập giá" }]}
                                >
                                    <InputNumber
                                        min={0}
                                        step={1000}
                                        placeholder="Giá"
                                        className="w-28"
                                    />
                                </Form.Item>
                                {fields.length > 1 && (
                                    <Button type="link" danger onClick={() => remove(name)}>
                                        Xóa
                                    </Button>
                                )}
                            </Space>
                        ))}
                        <Button type="dashed" onClick={() => add()} block>
                            Thêm size
                        </Button>
                    </>
                )}
            </Form.List>
            <Form.Item
                label="Liên kết thành phẩm"
                name="outputId"
                rules={[{ required: true, message: "Chọn thành phẩm" }]}
            >
                <Select placeholder="Chọn thành phẩm (nguyên liệu thành phẩm)">
                    {outputs.map((out) => (
                        <Option key={out.id} value={out.id}>
                            {out.name} ({out.unit})
                        </Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item
                label="Trạng thái"
                name="status"
                rules={[{ required: true, message: "Chọn trạng thái" }]}
            >
                <Select>
                    <Option value="active">Đang bán</Option>
                    <Option value="inactive">Ngừng bán</Option>
                </Select>
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}>
                    {initialValues ? "Cập nhật" : "Tạo mới"}
                </Button>
            </Form.Item>
        </Form>
    );
};

export default MenuForm;
