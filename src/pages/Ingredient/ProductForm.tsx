import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Button, Select, Divider, Space } from "antd";
import {DeleteOutlined} from "@ant-design/icons";

// Định nghĩa các đơn vị chuyển đổi và hệ số
const UNIT_GROUPS = [
    { group: "mass", units: [{ value: "g", label: "Gram (g)", factor: 1 }, { value: "kg", label: "Kilogram (kg)", factor: 1000 }] },
    { group: "volume", units: [{ value: "ml", label: "Mililít (ml)", factor: 1 }, { value: "l", label: "Lít (l)", factor: 1000 }] },
    { group: "piece", units: [{ value: "cái", label: "Cái", factor: 1 }] },
    { group: "box", units: [{ value: "hộp", label: "Hộp", factor: 1 }] },
    { group: "pack", units: [{ value: "gói", label: "Gói", factor: 1 }] },
    { group: "bottle", units: [{ value: "chai", label: "Chai", factor: 1 }] },
    { group: "can", units: [{ value: "bình", label: "Bình", factor: 1 }] },
    { group: "cup", units: [{ value: "ly", label: "Ly", factor: 1 }, { value: "tách", label: "Tách", factor: 1 }] },
];

function findUnitGroup(unit: string) {
    return UNIT_GROUPS.find(g => g.units.some(u => u.value === unit));
}

function getUnitOptions(unit: string) {
    const group = findUnitGroup(unit);
    return group ? group.units : [{ value: unit, label: unit, factor: 1 }];
}

function convertToBase(value: number, fromUnit: string, baseUnit: string) {
    const group = findUnitGroup(fromUnit);
    if (!group) return value;
    const from = group.units.find(u => u.value === fromUnit);
    const base = group.units.find(u => u.value === baseUnit);
    if (!from || !base) return value;
    return value * (from.factor / base.factor);
}

interface Ingredient {
    id: string;
    name: string;
    unit: string; // đơn vị gốc
    price: number;
}

interface ProductFormProps {
    rawIngredients: Ingredient[];
    initialValues?: any;
    onSubmit: (values: any) => void;
    loading?: boolean;
}

const PRODUCT_UNIT_OPTIONS = [
    { value: "cái", label: "Cái" },
    { value: "ly", label: "Ly" },
    { value: "hộp", label: "Hộp" },
    { value: "chai", label: "Chai" },
    { value: "phần", label: "Phần" },
    { value: "tách", label: "Tách" },
    { value: "gói", label: "Gói" },
    { value: "bình", label: "Bình" },
    { value: "g", label: "Gram (g)" },
    { value: "kg", label: "Kilogram (kg)" },
    { value: "ml", label: "Mililít (ml)" },
    { value: "l", label: "Lít (l)" },
];

const ProductForm: React.FC<ProductFormProps> = ({
                                                     rawIngredients,
                                                     initialValues,
                                                     onSubmit,
                                                     loading,
                                                 }) => {
    const [form] = Form.useForm();
    const [costMin, setCostMin] = useState(0);
    const [costMax, setCostMax] = useState(0);

    // Hàm filter cho search
    const filterOption = (input: string, option?: { label: string; value: string }) => {
        if (!option) return false;
        const searchText = input.toLowerCase();
        return (
            option.label.toLowerCase().includes(searchText) ||
            option.value.toLowerCase().includes(searchText)
        );
    };

    // Tính cost nhỏ nhất theo khoảng định lượng thành phẩm
    const calcCost = (allValues: any) => {
        const recipe = allValues.recipe || [];
        let total = 0;
        recipe.forEach((item: any) => {
            const ing: any = rawIngredients.find((r) => r.id === item.ingredientId);
            if (ing) {
                const pricePerUnit = ing.price / convertToBase(ing.quantity || 1, ing.quantityUnit || ing.unit, ing.unit);
                const qtyBase = convertToBase(item.quantity || 0, item.unit || ing.unit, ing.unit);
                total += qtyBase * pricePerUnit;
            }
        });

        const outputMin = allValues.outputMinQuantity;
        const outputMax = allValues.outputMaxQuantity;
        const outputUnit = allValues.outputUnit;

        let perUnitCostMin = 0;
        let perUnitCostMax = 0;

        if (outputMin && outputUnit) {
            const outputMinBase = convertToBase(outputMin, outputUnit, outputUnit);
            if (outputMinBase > 0) {
                perUnitCostMin = total / outputMinBase;
            }
        }
        if (outputMax && outputUnit) {
            const outputMaxBase = convertToBase(outputMax, outputUnit, outputUnit);
            if (outputMaxBase > 0) {
                perUnitCostMax = total / outputMaxBase;
            }
        }

        setCostMin(Math.ceil(perUnitCostMin));
        setCostMax(Math.ceil(perUnitCostMax));
    };

    const handleValuesChange = (_: any, all: any) => {
        calcCost(all);
    };

    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue(initialValues);
            calcCost(initialValues);
        }
    }, [initialValues, rawIngredients]);

    const handleFinish = (values: any) => {
        const data = {
            ...values,
            costMin: costMin,
            costMax: costMax,
        };
        onSubmit(data);
    };

    // Xử lý khi chọn nguyên liệu - tự động set đơn vị mặc định
    const handleIngredientChange = (ingredientId: string, fieldName: number) => {
        const ingredient = rawIngredients.find(r => r.id === ingredientId);
        if (ingredient) {
            const unitOptions = getUnitOptions(ingredient.unit);
            // Tự động set đơn vị đầu tiên (thường là đơn vị gốc)
            form.setFields([
                {
                    name: ["recipe", fieldName, "unit"],
                    value: unitOptions[0]?.value || ingredient.unit
                }
            ]);
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={initialValues || { unit: "cái", recipe: [] }}
            onFinish={handleFinish}
            onValuesChange={handleValuesChange}
        >
            <Form.Item
                label="Tên thành phẩm"
                name="name"
                rules={[{ required: true, message: "Nhập tên thành phẩm" }]}
            >
                <Input placeholder="Nhập tên thành phẩm..." />
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
                    options={PRODUCT_UNIT_OPTIONS}
                />
            </Form.Item>

            <Divider>Công thức phối trộn</Divider>

            <Form.List name="recipe">
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(({ key, name, ...rest }) => {
                            const selectedIngId = form.getFieldValue(["recipe", name, "ingredientId"]);
                            const ing = rawIngredients.find(r => r.id === selectedIngId);
                            const unitOptions = ing ? getUnitOptions(ing.unit) : [];

                            return (
                                <div
                                    key={key}
                                    className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3 p-3 bg-gray-50 rounded-lg border"
                                >
                                    {/* Nguyên liệu */}
                                    <Form.Item
                                        {...rest}
                                        name={[name, "ingredientId"]}
                                        rules={[{ required: true, message: "Chọn nguyên liệu" }]}
                                        className="mb-0 flex-1 min-w-0"
                                    >
                                        <Select
                                            placeholder="Tìm kiếm nguyên liệu..."
                                            showSearch
                                            allowClear
                                            filterOption={(input, option) => {
                                                const ingredient = rawIngredients.find(r => r.id === option?.value);
                                                if (!ingredient) return false;
                                                const searchText = input.toLowerCase();
                                                return ingredient.name.toLowerCase().includes(searchText);
                                            }}
                                            onChange={(value) => handleIngredientChange(value, name)}
                                        >
                                            {rawIngredients.map((r) => (
                                                <Select.Option key={r.id} value={r.id}>
                                                    {r.name} ({r.unit})
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>

                                    {/* Số lượng và Đơn vị */}
                                    <div className="flex gap-2 flex-shrink-0">
                                        <Form.Item
                                            {...rest}
                                            name={[name, "quantity"]}
                                            rules={[{ required: true, message: "Số lượng" }]}
                                            className="mb-0 w-24"
                                        >
                                            <InputNumber
                                                min={0.01}
                                                step={0.01}
                                                placeholder="Số lượng"
                                                className="w-full"
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            {...rest}
                                            name={[name, "unit"]}
                                            rules={[{ required: true, message: "Chọn đơn vị" }]}
                                            className="mb-0 w-28"
                                        >
                                            <Select
                                                key={`unit-${selectedIngId}-${key}`}
                                                placeholder="Đơn vị"
                                                disabled={!ing}
                                                showSearch
                                                allowClear={false}
                                                filterOption={filterOption}
                                                options={unitOptions.map(u => ({
                                                    value: u.value,
                                                    label: u.label
                                                }))}
                                                notFoundContent={!ing ? "Chọn nguyên liệu trước" : "Không có đơn vị"}
                                            />
                                        </Form.Item>
                                    </div>

                                    {/* Nút xóa - Cải thiện style */}
                                    <Button
                                        type="primary"
                                        danger
                                        size="small"
                                        icon={<DeleteOutlined />}
                                        onClick={() => remove(name)}
                                        className="flex-shrink-0"
                                        title="Xóa nguyên liệu"
                                    >
                                        <span className="hidden sm:inline ml-1">Xóa</span>
                                    </Button>
                                </div>
                            );
                        })}
                        <Button type="dashed" onClick={() => add()} block>
                            Thêm nguyên liệu thô
                        </Button>
                    </>
                )}
            </Form.List>

            <Form.Item label="Thành phẩm (Sau khi phối trộn) (Nhập theo khoảng)" required>
                <Input.Group compact>
                    <Form.Item
                        name="outputMinQuantity"
                        noStyle
                        rules={[{ required: true, message: "Nhập định lượng tối thiểu" }]}
                    >
                        <InputNumber min={0.01} step={0.01} placeholder="Tối thiểu" style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item
                        name="outputMaxQuantity"
                        noStyle
                        rules={[{ required: true, message: "Nhập định lượng tối đa" }]}
                    >
                        <InputNumber min={0.01} step={0.01} placeholder="Tối đa" style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item
                        name="outputUnit"
                        noStyle
                        rules={[{ required: true, message: "Chọn đơn vị" }]}
                    >
                        <Select
                            placeholder="Đơn vị"
                            style={{ width: 120 }}
                            showSearch
                            allowClear
                            filterOption={filterOption}
                            options={PRODUCT_UNIT_OPTIONS}
                        />
                    </Form.Item>
                </Input.Group>
            </Form.Item>

            <div className="my-4 font-semibold">
                Giá cost nhỏ nhất (ước tính):{" "}
                <span className="text-blue-600">
                    {costMin > 0 && costMax > 0
                        ? `${costMin.toLocaleString()} - ${costMax.toLocaleString()} đ/${form.getFieldValue("outputUnit") || ""}`
                        : "-"}
                </span>
            </div>

            <Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}>
                    {initialValues ? "Cập nhật" : "Tạo mới"}
                </Button>
            </Form.Item>
        </Form>
    );
};

export default ProductForm;
