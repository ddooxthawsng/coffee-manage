import React from 'react';
import {
    Row,
    Col,
    Select,
    InputNumber,
    Input,
    Button,
    Divider,
    Alert,
    Space,
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    DollarOutlined
} from '@ant-design/icons';

const { Option } = Select;

const DrinkRecipeForm = ({
                             selectedIngredients,
                             setSelectedIngredients,
                             processedIngredients,
                             calculateTotalCost,
                             calculateProfitMargin,
                             form
                         }) => {
    const addIngredientToRecipe = () => {
        setSelectedIngredients([
            ...selectedIngredients,
            {
                ingredientId: '',
                ingredientName: '',
                quantity: 0,
                unit: '',
                unitPrice: 0
            }
        ]);
    };

    const updateIngredientInRecipe = (index, field, value) => {
        const newIngredients = [...selectedIngredients];
        if (field === 'ingredientId') {
            const selectedIngredient = processedIngredients.find(ing => ing.id === value);
            if (selectedIngredient) {
                newIngredients[index] = {
                    ...newIngredients[index],
                    ingredientId: value,
                    ingredientName: selectedIngredient.name,
                    unit: selectedIngredient.unit,
                    unitPrice: selectedIngredient.unitPrice
                };
            }
        } else {
            newIngredients[index] = {
                ...newIngredients[index],
                [field]: field === 'quantity' ? parseFloat(value) || 0 : value
            };
        }
        setSelectedIngredients(newIngredients);
    };

    const removeIngredientFromRecipe = (index) => {
        setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
    };

    return (
        <>
            <Divider>Công thức (Nguyên liệu thành phẩm)</Divider>

            {selectedIngredients.map((ingredient, index) => (
                <Row key={index} gutter={8} style={{ marginBottom: 8 }}>
                    <Col span={8}>
                        <Select
                            placeholder="Chọn nguyên liệu thành phẩm"
                            value={ingredient.ingredientId}
                            onChange={(value) => updateIngredientInRecipe(index, 'ingredientId', value)}
                            style={{ width: '100%' }}
                        >
                            {processedIngredients.map(processed => (
                                <Option key={processed.id} value={processed.id}>
                                    {processed.name} ({processed.unit})
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={6}>
                        <InputNumber
                            placeholder="Số lượng"
                            value={ingredient.quantity}
                            onChange={(value) => updateIngredientInRecipe(index, 'quantity', value)}
                            style={{ width: '100%' }}
                            min={0}
                            step={0.1}
                        />
                    </Col>
                    <Col span={6}>
                        <Input
                            placeholder="Đơn vị"
                            value={ingredient.unit}
                            disabled
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col span={4}>
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => removeIngredientFromRecipe(index)}
                        />
                    </Col>
                </Row>
            ))}

            <Button
                type="dashed"
                onClick={addIngredientToRecipe}
                icon={<PlusOutlined />}
                style={{ width: '100%', marginBottom: 16 }}
            >
                Thêm nguyên liệu thành phẩm
            </Button>

            {selectedIngredients.length > 0 && (
                <Alert
                    message={
                        <div>
                            <Space direction="vertical" size="small">
                                <Input strong>
                                    <DollarOutlined /> Tổng chi phí: {calculateTotalCost().toLocaleString()}đ
                                </Input>
                                <Input>
                                    Lợi nhuận ước tính: {calculateProfitMargin(form.getFieldsValue()).toFixed(1)}%
                                </Input>
                            </Space>
                        </div>
                    }
                    type="info"
                    style={{ marginBottom: 16 }}
                />
            )}
        </>
    );
};

export default DrinkRecipeForm;
