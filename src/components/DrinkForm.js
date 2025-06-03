import React, { useState, useEffect } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    Select,
    InputNumber,
    Space,
    Row,
    Col,
    Divider,
    Switch,
    Typography
} from 'antd';
import {
    PlusOutlined,
    EditOutlined
} from '@ant-design/icons';
import { addDrink, updateDrink } from '../firebase/DrinkManagementService';
import { message } from 'antd';
import DrinkPriceForm from './DrinkPriceForm';
import DrinkRecipeForm from './DrinkRecipeForm';
import ComboForm from './ComboForm';

const { Option } = Select;

const DrinkForm = ({ editingDrink, setEditingDrink, processedIngredients, drinks, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [isCombo, setIsCombo] = useState(false);
    const [selectedDrinks, setSelectedDrinks] = useState([]);
    const [discountPercent, setDiscountPercent] = useState(0);
    const [availableSizes, setAvailableSizes] = useState(['S', 'M', 'L']);

    useEffect(() => {
        if (editingDrink) {
            if (editingDrink.isCombo) {
                setIsCombo(true);
                form.setFieldsValue({
                    name: editingDrink.name,
                    description: editingDrink.description
                });
                setSelectedDrinks(editingDrink.comboItems?.map(item => ({
                    drinkId: item.id,
                    drinkName: item.name,
                    size: item.size
                })) || []);
                setDiscountPercent(editingDrink.discountPercent || 0);
            } else {
                setIsCombo(false);
                const drinkIngredients = Array.isArray(editingDrink.ingredients) ? editingDrink.ingredients : [];

                const drinkSizes = Object.keys(editingDrink.price || {});
                setAvailableSizes(drinkSizes.length > 0 ? drinkSizes : ['M']);

                form.setFieldsValue({
                    name: editingDrink.name,
                    description: editingDrink.description,
                    category: editingDrink.category,
                    availableSizes: drinkSizes
                });

                setSelectedIngredients(drinkIngredients.map(ing => ({
                    ingredientId: ing.id || '',
                    ingredientName: ing.name || '',
                    quantity: ing.quantity || 0,
                    unit: ing.unit || '',
                    unitPrice: ing.unitPrice || 0
                })));
            }
        } else {
            resetForm();
        }
    }, [editingDrink, form]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            let drinkData;

            if (isCombo) {
                const originalPrice = calculateComboOriginalPrice();
                const finalPrice = {};

                availableSizes.forEach(size => {
                    finalPrice[size] = Math.round(originalPrice[size] * (1 - discountPercent / 100));
                });

                drinkData = {
                    name: values.name,
                    description: values.description || '',
                    category: 'combo',
                    isCombo: true,
                    comboItems: selectedDrinks.map(drink => ({
                        id: drink.drinkId,
                        name: drink.drinkName,
                        size: drink.size
                    })),
                    originalPrice: originalPrice,
                    discountPercent: discountPercent,
                    price: finalPrice,
                    totalCost: calculateComboTotalCost(),
                    profitMargin: calculateComboProfitMargin(finalPrice),
                    availableSizes: availableSizes
                };
            } else {
                const priceObject = {};
                availableSizes.forEach(size => {
                    const priceField = `price${size}`;
                    if (values[priceField]) {
                        priceObject[size] = values[priceField];
                    }
                });

                drinkData = {
                    name: values.name,
                    description: values.description || '',
                    category: values.category,
                    isCombo: false,
                    ingredients: selectedIngredients.map(ing => ({
                        id: ing.ingredientId,
                        name: ing.ingredientName,
                        quantity: ing.quantity,
                        unit: ing.unit,
                        unitPrice: ing.unitPrice
                    })),
                    price: priceObject,
                    totalCost: calculateTotalCost(),
                    profitMargin: calculateProfitMargin(priceObject),
                    availableSizes: availableSizes
                };
            }

            if (editingDrink) {
                await updateDrink(editingDrink.id, drinkData);
                message.success('Cập nhật đồ uống thành công!');
            } else {
                await addDrink(drinkData);
                message.success('Thêm đồ uống mới thành công!');
            }

            resetForm();
            onSuccess();
        } catch (error) {
            message.error('Có lỗi xảy ra. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        form.resetFields();
        setSelectedIngredients([]);
        setSelectedDrinks([]);
        setEditingDrink(null);
        setIsCombo(false);
        setDiscountPercent(0);
        setAvailableSizes(['M']);
    };

    const calculateTotalCost = () => {
        return selectedIngredients.reduce((total, ing) => {
            return total + (ing.quantity * ing.unitPrice);
        }, 0);
    };

    const calculateProfitMargin = (priceObject) => {
        const totalCost = calculateTotalCost();
        const avgPrice = Object.values(priceObject).reduce((sum, price) => sum + price, 0) / Object.values(priceObject).length;
        return totalCost > 0 ? ((avgPrice - totalCost) / avgPrice * 100) : 0;
    };

    const calculateComboOriginalPrice = () => {
        const priceBySize = {};
        availableSizes.forEach(size => {
            priceBySize[size] = 0;
        });

        selectedDrinks.forEach(comboItem => {
            const drink = drinks.filter(d => !d.isCombo).find(d => d.id === comboItem.drinkId);
            if (drink && drink.price) {
                availableSizes.forEach(size => {
                    if (drink.price[size]) {
                        priceBySize[size] += drink.price[size];
                    }
                });
            }
        });

        return priceBySize;
    };

    const calculateComboTotalCost = () => {
        let totalCost = 0;
        selectedDrinks.forEach(comboItem => {
            const drink = drinks.find(d => d.id === comboItem.drinkId);
            if (drink && drink.totalCost) {
                totalCost += drink.totalCost;
            }
        });
        return totalCost;
    };

    const calculateComboProfitMargin = (finalPrice) => {
        const totalCost = calculateComboTotalCost();
        const avgPrice = Object.values(finalPrice).reduce((sum, price) => sum + price, 0) / Object.values(finalPrice).length;
        return totalCost > 0 ? ((avgPrice - totalCost) / avgPrice * 100) : 0;
    };

    const handleSizeChange = (sizes) => {
        setAvailableSizes(sizes.length > 0 ? sizes : ['M']);
    };

    return (
        <Card
            className="glass-card"
            title={
                <Space>
                    <PlusOutlined />
                    {editingDrink ? 'Chỉnh Sửa' : 'Thêm Mới'}
                    {isCombo ? ' Combo' : ' Đồ Uống'}
                </Space>
            }
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
            >
                <Form.Item>
                    <Space>
                        <span style={{ fontWeight: 600 }}>Loại:</span>
                        <Switch
                            checked={isCombo}
                            onChange={setIsCombo}
                            checkedChildren="Combo"
                            unCheckedChildren="Đồ uống"
                        />
                    </Space>
                </Form.Item>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            label={isCombo ? "Tên combo" : "Tên đồ uống"}
                            name="name"
                            rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                        >
                            <Input placeholder={isCombo ? "VD: Combo cà phê + bánh" : "VD: Cà phê sữa"} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    label="Mô tả"
                    name="description"
                >
                    <Input.TextArea rows={2} placeholder="Mô tả..." />
                </Form.Item>

                {!isCombo && (
                    <>
                        <Form.Item
                            label="Danh mục"
                            name="category"
                            rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                        >
                            <Select placeholder="Chọn danh mục">
                                <Option value="coffee">Cà phê</Option>
                                <Option value="tea">Trà</Option>
                                <Option value="juice">Nước ép</Option>
                                <Option value="smoothie">Sinh tố</Option>
                                <Option value="other">Khác</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Sizes có sẵn"
                            name="availableSizes"
                            rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 size!' }]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Chọn sizes"
                                value={availableSizes}
                                onChange={handleSizeChange}
                            >
                                <Option value="S">Size S</Option>
                                <Option value="M">Size M</Option>
                                <Option value="L">Size L</Option>
                            </Select>
                        </Form.Item>

                        <DrinkPriceForm
                            availableSizes={availableSizes}
                            form={form}
                        />

                        <DrinkRecipeForm
                            selectedIngredients={selectedIngredients}
                            setSelectedIngredients={setSelectedIngredients}
                            processedIngredients={processedIngredients}
                            calculateTotalCost={calculateTotalCost}
                            calculateProfitMargin={calculateProfitMargin}
                            form={form}
                        />
                    </>
                )}

                {isCombo && (
                    <ComboForm
                        selectedDrinks={selectedDrinks}
                        setSelectedDrinks={setSelectedDrinks}
                        drinks={drinks.filter(d => !d.isCombo)}
                        discountPercent={discountPercent}
                        setDiscountPercent={setDiscountPercent}
                        calculateComboOriginalPrice={calculateComboOriginalPrice}
                        availableSizes={availableSizes}
                    />
                )}

                <Form.Item>
                    <Space>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            icon={editingDrink ? <EditOutlined /> : <PlusOutlined />}
                        >
                            {editingDrink ? 'Cập nhật' : 'Thêm mới'}
                        </Button>
                        <Button onClick={resetForm}>
                            Làm mới
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default DrinkForm;
