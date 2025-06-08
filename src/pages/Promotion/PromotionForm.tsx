import React, { useEffect, useMemo } from "react";
import { Form, Input, Button, DatePicker, InputNumber, Select, Switch, Tooltip } from "antd";
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

    // Theo dõi loại giảm giá để hiển thị addonAfter
    const valueAddon = Form.useWatch("type", form) === "percent" ? "%" : "VNĐ";

    // Theo dõi ngày bắt đầu để kiểm soát switch mặc định
    const startDate = Form.useWatch("startDate", form);

    // Kiểm tra ngày bắt đầu có lớn hơn hiện tại không
    const isFutureStart = useMemo(() => {
        if (!startDate) return false;
        return dayjs(startDate).isAfter(dayjs().startOf("day"));
    }, [startDate]);

    // Nếu ngày bắt đầu > hiện tại, luôn set isDefault = false
    useEffect(() => {
        if (isFutureStart) {
            form.setFieldValue("isDefault", false);
        }
    }, [isFutureStart, form]);

    // Xử lý submit
    const handleFinish = (values: any) => {
        // Nếu ngày bắt đầu > hiện tại, luôn gửi isDefault = false
        const isDefault = values.startDate && dayjs(values.startDate).isAfter(dayjs().startOf("day"))
            ? false
            : values.isDefault || false;
        onSubmit({
            ...values,
            isDefault,
            startDate: values.startDate ? values.startDate.format("YYYY-MM-DD") : null,
            endDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : null,
            minOrder: values.minOrder || 0,
        });
    };

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
                minOrder: initialValues?.minOrder || undefined,
            }}
            onFinish={handleFinish}
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
            <Form.Item
                label={
                    <span>
                        Áp dụng cho đơn từ (VNĐ)&nbsp;
                        <Tooltip title="Nếu để trống, khuyến mãi áp dụng cho mọi đơn hàng">
                            <i style={{ color: "#1890ff" }}>(?)</i>
                        </Tooltip>
                    </span>
                }
                name="minOrder"
                rules={[
                    {
                        type: "number",
                        min: 0,
                        message: "Giá trị phải lớn hơn hoặc bằng 0"
                    }
                ]}
            >
                <InputNumber
                    min={0}
                    className="w-full"
                    placeholder="Để trống nếu áp dụng cho mọi đơn"
                />
            </Form.Item>
            <Form.Item
                label="Đặt làm mặc định"
                name="isDefault"
                valuePropName="checked"
            >
                <Switch disabled={isFutureStart} />
            </Form.Item>
            <Form.Item label="Ngày bắt đầu" name="startDate">
                <DatePicker
                    className="w-full"
                    format="YYYY-MM-DD"
                    minDate={dayjs().startOf("day")}
                />
            </Form.Item>
            <Form.Item label="Ngày kết thúc" name="endDate">
                <DatePicker
                    className="w-full"
                    format="YYYY-MM-DD"
                    minDate={dayjs().startOf("day")}
                />
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
