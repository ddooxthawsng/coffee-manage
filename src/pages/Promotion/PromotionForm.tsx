import React, { useEffect, useMemo } from "react";
import { Form, Input, Button, DatePicker, InputNumber, Select, Switch, Tooltip, Row, Col } from "antd";
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

    // Theo dõi loại khuyến mãi
    const promotionType = Form.useWatch("promotionType", form);

    // Theo dõi loại giảm giá để hiển thị addonAfter (chỉ cho discount type)
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

    // Reset form khi thay đổi loại khuyến mãi
    useEffect(() => {
        if (promotionType) {
            // Reset các field không liên quan
            if (promotionType === "buyXGetY") {
                form.setFieldsValue({
                    type: undefined,
                    value: undefined,
                    minOrder: undefined
                });
            } else {
                form.setFieldsValue({
                    buyQuantity: undefined,
                    freeQuantity: undefined
                });
            }
        }
    }, [promotionType, form]);

    // Xử lý submit
    const handleFinish = (values: any) => {
        // Nếu ngày bắt đầu > hiện tại, luôn gửi isDefault = false
        const isDefault = values.startDate && dayjs(values.startDate).isAfter(dayjs().startOf("day"))
            ? false
            : values.isDefault || false;

        const submitData = {
            ...values,
            isDefault,
            startDate: values.startDate ? values.startDate.format("YYYY-MM-DD") : null,
            endDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : null,
            // Xử lý maxDiscount - SỬA ĐÂY
            maxDiscount: values.maxDiscount && values.maxDiscount > 0 ? Number(values.maxDiscount) : null,
            // Xử lý buyQuantity và freeQuantity
            buyQuantity: values.promotionType === "buyXGetY" ? Number(values.buyQuantity) : null,
            freeQuantity: values.promotionType === "buyXGetY" ? Number(values.freeQuantity) : null,
            isAccumulative: values.promotionType === "buyXGetY" ? (values.isAccumulative ?? true) : null,
        };

        onSubmit(submitData);
    };

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={{
                ...initialValues,
                startDate: initialValues?.startDate ? dayjs(initialValues.startDate) : undefined,
                endDate: initialValues?.endDate ? dayjs(initialValues.endDate) : undefined,
                promotionType: initialValues?.promotionType || "discount",
                type: initialValues?.type || "percent",
                isDefault: initialValues?.isDefault || false,
                minOrder: initialValues?.minOrder || undefined,
                maxDiscount: initialValues?.maxDiscount || undefined,
                buyQuantity: initialValues?.buyQuantity || undefined,
                freeQuantity: initialValues?.freeQuantity || undefined,
                isAccumulative: initialValues?.isAccumulative !== undefined ? initialValues.isAccumulative : true,
            }}
            onFinish={handleFinish}
        >
            <Form.Item
                label="Mã khuyến mãi"
                name="code"
                rules={[{ required: true, message: "Nhập mã khuyến mãi" }]}
            >
                <Input placeholder="Ví dụ: SUMMER2025" />
            </Form.Item>

            <Form.Item
                label="Loại khuyến mãi"
                name="promotionType"
                rules={[{ required: true, message: "Chọn loại khuyến mãi" }]}
            >
                <Select placeholder="Chọn loại khuyến mãi">
                    <Option value="discount">Giảm giá theo đơn hàng</Option>
                    <Option value="buyXGetY">Mua X tặng Y</Option>
                </Select>
            </Form.Item>

            {/* Form fields cho loại giảm giá */}
            {promotionType === "discount" && (
                <>
                    <Form.Item
                        label="Loại giảm giá"
                        name="type"
                        rules={[{ required: true, message: "Chọn loại giảm giá" }]}
                    >
                        <Select placeholder="Chọn loại giảm giá">
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
                            placeholder="Nhập giá trị"
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
                        label={
                            <span>
                    Giảm tối đa (VNĐ)&nbsp;
                                <Tooltip title="Giới hạn số tiền giảm tối đa cho đơn hàng. Để trống nếu không giới hạn">
                        <i style={{ color: "#1890ff" }}>(?)</i>
                    </Tooltip>
                </span>
                        }
                        name="maxDiscount"
                        rules={[
                            {
                                type: "number",
                                min: 1,
                                message: "Giá trị phải lớn hơn 0"
                            }
                        ]}
                    >
                        <InputNumber
                            min={1}
                            className="w-full"
                            placeholder="Để trống nếu không giới hạn"
                        />
                    </Form.Item>
                </>
            )}

            {/* Form fields cho loại mua X tặng Y */}
            {promotionType === "buyXGetY" && (
                <>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label={
                                <span>
                                    Mua (số lượng)&nbsp;
                                    <Tooltip title="Số lượng sản phẩm khách hàng cần mua">
                                        <i style={{ color: "#1890ff" }}>(?)</i>
                                    </Tooltip>
                                </span>
                            }
                            name="buyQuantity"
                            rules={[
                                { required: true, message: "Nhập số lượng cần mua" },
                                { type: "number", min: 1, message: "Số lượng phải lớn hơn 0" }
                            ]}
                        >
                            <InputNumber
                                min={1}
                                className="w-full"
                                placeholder="Ví dụ: 2"
                                addonAfter="cốc"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label={
                                <span>
                                    Tặng (số lượng)&nbsp;
                                    <Tooltip title="Số lượng sản phẩm được tặng miễn phí">
                                        <i style={{ color: "#1890ff" }}>(?)</i>
                                    </Tooltip>
                                </span>
                            }
                            name="freeQuantity"
                            rules={[
                                { required: true, message: "Nhập số lượng được tặng" },
                                { type: "number", min: 1, message: "Số lượng phải lớn hơn 0" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const buyQuantity = getFieldValue("buyQuantity");
                                        if (buyQuantity && value >= buyQuantity) {
                                            return Promise.reject("Số lượng tặng phải nhỏ hơn số lượng mua");
                                        }
                                        return Promise.resolve();
                                    },
                                }),
                            ]}
                        >
                            <InputNumber
                                min={1}
                                className="w-full"
                                placeholder="Ví dụ: 1"
                                addonAfter="cốc"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label={
                                    <span>
                            Tính lũy kế&nbsp;
                                        <Tooltip title="Nếu bật, khuyến mãi sẽ áp dụng nhiều lần. VD: Mua 2 tặng 1, có 6 cốc sẽ tặng 2 cốc">
                                <i style={{ color: "#1890ff" }}>(?)</i>
                            </Tooltip>
                        </span>
                                }
                                name="isAccumulative"
                                valuePropName="checked"
                            >
                                <Switch />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={
                                    <span>
                            Giảm tối đa (VNĐ)&nbsp;
                                        <Tooltip title="Giới hạn số tiền giảm tối đa cho đơn hàng. Để trống nếu không giới hạn">
                                <i style={{ color: "#1890ff" }}>(?)</i>
                            </Tooltip>
                        </span>
                                }
                                name="maxDiscount"
                                rules={[
                                    {
                                        type: "number",
                                        min: 1,
                                        message: "Giá trị phải lớn hơn 0"
                                    }
                                ]}
                            >
                                <InputNumber
                                    min={1}
                                    className="w-full"
                                    placeholder="Để trống nếu không giới hạn"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </>
            )}

            <Form.Item
                label="Đặt làm mặc định"
                name="isDefault"
                valuePropName="checked"
            >
                <Switch disabled={isFutureStart} />
            </Form.Item>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label="Ngày bắt đầu" name="startDate">
                        <DatePicker
                            className="w-full"
                            format="YYYY-MM-DD"
                            minDate={dayjs().startOf("day")}
                            placeholder="Chọn ngày bắt đầu"
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        label="Ngày kết thúc"
                        name="endDate"
                        rules={[
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    const startDate = getFieldValue("startDate");
                                    if (startDate && value && dayjs(value).isBefore(dayjs(startDate))) {
                                        return Promise.reject("Ngày kết thúc phải sau ngày bắt đầu");
                                    }
                                    return Promise.resolve();
                                },
                            }),
                        ]}
                    >
                        <DatePicker
                            className="w-full"
                            format="YYYY-MM-DD"
                            minDate={dayjs().startOf("day")}
                            placeholder="Chọn ngày kết thúc"
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}>
                    {initialValues ? "Cập nhật khuyến mãi" : "Tạo khuyến mãi mới"}
                </Button>
            </Form.Item>
        </Form>
    );
};

export default PromotionForm;
