import React from "react";
import { Form, Input, Button, InputNumber, DatePicker, Select } from "antd";
import dayjs from "dayjs";

const { Option } = Select;

interface CostFormProps {
    initialValues?: any;
    onSubmit: (values: any) => void;
    loading?: boolean;
}

const CostForm: React.FC<CostFormProps> = ({
                                               initialValues,
                                               onSubmit,
                                               loading,
                                           }) => {
    return (
        <Form
            layout="vertical"
            initialValues={{
                ...initialValues,
                date: initialValues?.date ? dayjs(initialValues.date) : dayjs(),
                group: initialValues?.group || "Khác",
            }}
            onFinish={(values) =>
                onSubmit({
                    ...values,
                    date: values.date.format("YYYY-MM-DD"),
                })
            }
        >
            <Form.Item
                label="Tên chi phí"
                name="name"
                rules={[{ required: true, message: "Nhập tên chi phí" }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Nhóm chi phí"
                name="group"
                rules={[{ required: true, message: "Chọn nhóm chi phí" }]}
            >
                <Select>
                    <Option value="Nguyên liệu">Nguyên liệu</Option>
                    <Option value="Nhân sự">Nhân sự</Option>
                    <Option value="Điện nước">Điện nước</Option>
                    <Option value="Khác">Khác</Option>
                </Select>
            </Form.Item>
            <Form.Item
                label="Số tiền (VNĐ)"
                name="amount"
                rules={[{ required: true, message: "Nhập số tiền" }]}
            >
                <InputNumber min={0} className="w-full" step={1000} />
            </Form.Item>
            <Form.Item
                label="Ngày phát sinh"
                name="date"
                rules={[{ required: true, message: "Chọn ngày" }]}
            >
                <DatePicker format="DD/MM/YYYY" className="w-full" />
            </Form.Item>
            <Form.Item
                label="Ghi chú"
                name="note"
            >
                <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}>
                    {initialValues ? "Cập nhật" : "Tạo mới"}
                </Button>
            </Form.Item>
        </Form>
    );
};

export default CostForm;
