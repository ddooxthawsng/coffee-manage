import React, { useEffect, useState } from "react";
import { Form, Input, Button, Select, Space, InputNumber, Tooltip, Divider } from "antd";
import { DeleteOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons";
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
    const [form] = Form.useForm();

    useEffect(() => {
        getIngredientsByType("output").then(setOutputs);
    }, []);

    const getUnitByOutputId = (id: string) => {
        const found = outputs.find((item) => item.id === id);
        return found?.unit || "";
    };

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={
                initialValues || {
                    sizes: [
                        {
                            size: "M",
                            price: 0,
                            outputs: [{ outputId: undefined, quantity: 0 }],
                        },
                    ],
                    status: "active",
                }
            }
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
                    <Option value="Cà phê">Coffee</Option>
                    <Option value="Trà">Tea</Option>
                    <Option value="Matcha">Matcha</Option>
                    <Option value="Snack">Snack</Option>
                    <Option value="Topping">Topping</Option>
                    <Option value="Cacao">Cacao</Option>
                    <Option value="Yogourt">Yogourt</Option>
                    <Option value="Khác">Other</Option>
                </Select>
            </Form.Item>
            <Form.List name="sizes">
                {(fields, { add, remove }) => (
                    <>
                        <label className="block font-medium mb-1">Size, Giá bán & Thành phẩm</label>
                        {fields.map(({ key, name, ...restField }) => (
                            <div key={key} className="mb-4 border p-2 rounded-md">
                                <Space align="baseline" className="flex flex-wrap">
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
                                        <Tooltip title="Xóa size">
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => remove(name)}
                                            />
                                        </Tooltip>
                                    )}
                                </Space>
                                <Divider className="my-2" />
                                <Form.List name={[name, "outputs"]}>
                                    {(outputFields, { add: addOutput, remove: removeOutput }) => (
                                        <>
                                            <label className="block font-normal mb-1">Thành phẩm sử dụng</label>
                                            {outputFields.map((of) => {
                                                const currentOutputId = form.getFieldValue([
                                                    "sizes",
                                                    name,
                                                    "outputs",
                                                    of.name,
                                                    "outputId",
                                                ]);
                                                const unit = getUnitByOutputId(currentOutputId);

                                                return (
                                                    <div key={of.key} className="flex flex-wrap items-end gap-2 mb-2 w-full">
                                                        <Form.Item
                                                            {...of}
                                                            name={[of.name, "outputId"]}
                                                            rules={[{ required: true, message: "Chọn thành phẩm" }]}
                                                            style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}
                                                        >
                                                            <Select
                                                                placeholder="Chọn thành phẩm"
                                                                showSearch
                                                                optionFilterProp="children"
                                                                style={{ width: '100%' }}
                                                            >
                                                                {outputs.map((out) => (
                                                                    <Option key={out.id} value={out.id}>
                                                                        {out.name} ({out.unit})
                                                                    </Option>
                                                                ))}
                                                            </Select>
                                                        </Form.Item>
                                                        <Form.Item
                                                            {...of}
                                                            name={[of.name, "quantity"]}
                                                            rules={[{ required: true, message: "Nhập định lượng" }]}
                                                            style={{ width: '120px', marginBottom: 0 }}
                                                        >
                                                            <InputNumber
                                                                min={0}
                                                                placeholder="Định lượng"
                                                                style={{ width: '100%' }}
                                                                addonAfter={unit}
                                                            />
                                                        </Form.Item>
                                                        {outputFields.length > 1 && (
                                                            <Tooltip title="Xóa thành phẩm">
                                                                <Button
                                                                    type="text"
                                                                    danger
                                                                    icon={<DeleteOutlined />}
                                                                    onClick={() => removeOutput(of.name)}
                                                                    style={{ marginBottom: 0 }}
                                                                />
                                                            </Tooltip>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            <Button
                                                type="dashed"
                                                icon={<PlusOutlined />}
                                                onClick={() => addOutput({ outputId: undefined, quantity: 0 })}
                                                size="small"
                                                className="mt-1"
                                            >
                                                Thêm thành phẩm
                                            </Button>
                                        </>
                                    )}
                                </Form.List>

                            </div>
                        ))}
                        <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={() => add({ outputs: [{ outputId: undefined, quantity: 0 }] })}
                            block
                        >
                            Thêm size
                        </Button>
                    </>
                )}
            </Form.List>
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
                <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                    icon={initialValues ? <EditOutlined /> : <PlusOutlined />}
                >
                    {initialValues ? "Cập nhật" : "Tạo mới"}
                </Button>
            </Form.Item>
        </Form>
    );
};

export default MenuForm;
