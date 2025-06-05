import React from "react";
import { Form, Input, Button, DatePicker, InputNumber, Select, Switch } from "antd";
import dayjs from "dayjs";

const { Option } = Select;

interface PromotionFormProps {
    initialValues?: any;
    onSubmit: (values: any) => void;
    loading?: boolean;
}

const PromotionForm: React.FC<PromotionFormProps> = ({
                                                         initialValues,
                                                         onSubmit,
                                                         loading,
                                                     }) => {
    const [form] = Form.useForm();

    // Hiển thị đúng addonAfter theo loại giảm giá
    const valueAddon = Form.useWatch("type", form) === "percent" ? "%" : "VNĐ";

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={{
                ...initialValues,
                startDate: initialValues?.startDate ? dayjs(initialValues.startDate) : undefined,
                endDate: initialValues?.endDate ? dayjs(initialValues.endDate) : undefined,
                type: initialValues?.type || "percent",
                isDefault: initialValues?.isDefault || false,
            }}
            onFinish={(values) => {
                onSubmit({
                    ...values,
                    startDate: values.startDate ? values.startDate.format("YYYY-MM-DD") : null,
                    endDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : null,
                });
            }}
        >
            <Form.Item
                label="Mã khuyến mãi"
                name="code"
                rules={[{ required: true, message: "Nhập mã khuyến mãi" }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Loại giảm giá"
                name="type"
                rules={[{ required: true, message: "Chọn loại giảm giá" }]}
            >
                <Select>
                    <Option value="percent">Giảm phần trăm (%)</Option>
                    <Option value="amount">Giảm số tiền (VNĐ)</Option>
                </Select>
            </Form.Item>
            <Form.Item
                label="Giá trị giảm"
                name="value"
                rules={[
                    { required: true, message: "Nhập giá trị giảm" },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            const type = getFieldValue("type");
                            if (type === "percent" && (value < 1 || value > 100)) {
                                return Promise.reject("Phần trăm giảm phải từ 1 đến 100");
                            }
                            if (type === "amount" && value < 1) {
                                return Promise.reject("Số tiền giảm phải lớn hơn 0");
                            }
                            return Promise.resolve();
                        },
                    }),
                ]}
            >
                <InputNumber
                    min={1}
                    max={form.getFieldValue("type") === "percent" ? 100 : undefined}
                    className="w-full"
                    addonAfter={valueAddon}
                />
            </Form.Item>
            <Form.Item label="Đặt làm mặc định" name="isDefault" valuePropName="checked">
                <Switch />
            </Form.Item>
            <Form.Item label="Ngày bắt đầu" name="startDate">
                <DatePicker className="w-full" format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item label="Ngày kết thúc" name="endDate">
                <DatePicker className="w-full" format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}>
                    {initialValues ? "Cập nhật" : "Tạo mới"}
                </Button>
            </Form.Item>
        </Form>
    );
};

export default PromotionForm;
