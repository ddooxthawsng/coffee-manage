import React, { useEffect } from "react";
import { Form, Input, InputNumber, Select, Button, Row, Col, Card } from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";

const { Option } = Select;

interface IngredientFormProps {
    initialValues?: any;
    onSubmit: (values: any) => void;
    loading?: boolean;
    isEdit?: boolean;
}

const UNIT_OPTIONS = [
    "gram", "ml", "cái", "kg", "lít", "hộp", "gói"
];

const TYPE_OPTIONS = [
    { value: "input", label: "Nguyên liệu đầu vào" },
    { value: "output", label: "Thành phẩm" }
];

const IngredientForm: React.FC<IngredientFormProps> = ({
                                                           initialValues,
                                                           onSubmit,
                                                           loading,
                                                           isEdit,
                                                       }) => {
    const [form] = Form.useForm();
    const unit = Form.useWatch("unit", form);

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue(initialValues);
        }
    }, [initialValues, form]);

    return (
        <Card
            title={isEdit ? "Cập nhật nguyên liệu" : "Thêm nguyên liệu mới"}
            bordered={false}
            className="max-w-xl mx-auto my-4"
            bodyStyle={{ padding: 24 }}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    name: "",
                    type: "input",
                    unit: "gram",
                    cost: 0,
                    ...initialValues
                }}
                onFinish={onSubmit}
            >
                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            label="Tên nguyên liệu"
                            name="name"
                            rules={[{ required: true, message: "Nhập tên nguyên liệu" }]}
                        >
                            <Input placeholder="Ví dụ: Cà phê bột, Sữa đặc,..." />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            label="Loại"
                            name="type"
                            rules={[{ required: true, message: "Chọn loại nguyên liệu" }]}
                        >
                            <Select>
                                {TYPE_OPTIONS.map(opt => (
                                    <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            label="Đơn vị nhỏ nhất"
                            name="unit"
                            rules={[{ required: true, message: "Chọn đơn vị" }]}
                        >
                            <Select>
                                {UNIT_OPTIONS.map(u => (
                                    <Option key={u} value={u}>{u}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            label="Giá cost (theo đơn vị nhỏ nhất)"
                            name="cost"
                            rules={[{ required: true, message: "Nhập giá cost!" }]}
                        >
                            <InputNumber
                                min={0}
                                step={100}
                                className="w-full"
                                placeholder="Nhập giá cost"
                                addonAfter={unit || "đơn vị"}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item className="mb-0">
                    <Button
                        type="primary"
                        htmlType="submit"
                        icon={isEdit ? <EditOutlined /> : <PlusOutlined />}
                        loading={loading}
                        block
                    >
                        {isEdit ? "Cập nhật" : "Thêm mới"}
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default IngredientForm;
