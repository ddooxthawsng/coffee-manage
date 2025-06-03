import React from 'react';
import {
    Row,
    Col,
    Select,
    Button,
    Divider,
    Slider,
    Alert,
    Space,
    Typography
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography; // Sửa lại import Text từ Typography

const ComboForm = ({
                       selectedDrinks,
                       setSelectedDrinks,
                       drinks,
                       discountPercent,
                       setDiscountPercent,
                       calculateComboOriginalPrice,
                       availableSizes
                   }) => {
    const addDrinkToCombo = () => {
        setSelectedDrinks([
            ...selectedDrinks,
            {
                drinkId: '',
                drinkName: '',
                size: 'M'
            }
        ]);
    };

    const updateDrinkInCombo = (index, field, value) => {
        const newDrinks = [...selectedDrinks];
        if (field === 'drinkId') {
            const selectedDrink = drinks.find(d => d.id === value);
            if (selectedDrink) {
                newDrinks[index] = {
                    ...newDrinks[index],
                    drinkId: value,
                    drinkName: selectedDrink.name
                };
            }
        } else {
            newDrinks[index] = {
                ...newDrinks[index],
                [field]: value
            };
        }
        setSelectedDrinks(newDrinks);
    };

    const removeDrinkFromCombo = (index) => {
        setSelectedDrinks(selectedDrinks.filter((_, i) => i !== index));
    };

    return (
        <>
            <Divider>Thành phần combo</Divider>

            {selectedDrinks.map((drink, index) => (
                <Row key={index} gutter={8} style={{ marginBottom: 8 }}>
                    <Col span={10}>
                        <Select
                            placeholder="Chọn đồ uống"
                            value={drink.drinkId}
                            onChange={(value) => updateDrinkInCombo(index, 'drinkId', value)}
                            style={{ width: '100%' }}
                        >
                            {drinks.map(d => (
                                <Option key={d.id} value={d.id}>
                                    {d.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={6}>
                        <Select
                            placeholder="Size"
                            value={drink.size}
                            onChange={(value) => updateDrinkInCombo(index, 'size', value)}
                            style={{ width: '100%' }}
                        >
                            <Option value="S">Size S</Option>
                            <Option value="M">Size M</Option>
                            <Option value="L">Size L</Option>
                        </Select>
                    </Col>
                    <Col span={8}>
                        <Text type="secondary">
                            {(() => {
                                const selectedDrink = drinks.find(d => d.id === drink.drinkId);
                                return selectedDrink ? `${selectedDrink.price?.[drink.size]?.toLocaleString()}đ` : '0đ';
                            })()}
                        </Text>
                    </Col>
                    <Col span={4}>
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => removeDrinkFromCombo(index)}
                        />
                    </Col>
                </Row>
            ))}

            <Button
                type="dashed"
                onClick={addDrinkToCombo}
                icon={<PlusOutlined />}
                style={{ width: '100%', marginBottom: 16 }}
            >
                Thêm đồ uống vào combo
            </Button>

            {selectedDrinks.length > 0 && (
                <>
                    <Divider>Thiết lập giảm giá</Divider>
                    <div style={{ marginBottom: 16 }}>
                        <Text strong>Giảm giá: {discountPercent}%</Text>
                        <Slider
                            min={0}
                            max={50}
                            value={discountPercent}
                            onChange={setDiscountPercent}
                            marks={{
                                0: '0%',
                                10: '10%',
                                20: '20%',
                                30: '30%',
                                50: '50%'
                            }}
                            style={{ marginTop: 16 }}
                        />
                    </div>

                    <Alert
                        message={
                            <div>
                                <Space direction="vertical" size="small">
                                    <Text strong>Giá gốc tổng: {(() => {
                                        const original = calculateComboOriginalPrice();
                                        return `S: ${original.S?.toLocaleString()}đ, M: ${original.M?.toLocaleString()}đ, L: ${original.L?.toLocaleString()}đ`;
                                    })()}</Text>
                                    <Text strong style={{ color: '#52c41a' }}>
                                        Giá sau giảm: {(() => {
                                        const original = calculateComboOriginalPrice();
                                        const discounted = {
                                            S: Math.round((original.S || 0) * (1 - discountPercent / 100)),
                                            M: Math.round((original.M || 0) * (1 - discountPercent / 100)),
                                            L: Math.round((original.L || 0) * (1 - discountPercent / 100))
                                        };
                                        return `S: ${discounted.S.toLocaleString()}đ, M: ${discounted.M.toLocaleString()}đ, L: ${discounted.L.toLocaleString()}đ`;
                                    })()}
                                    </Text>
                                    <Text>
                                        Tiết kiệm: {(() => {
                                        const original = calculateComboOriginalPrice();
                                        const savings = Math.round(((original.S || 0) + (original.M || 0) + (original.L || 0)) * discountPercent / 300);
                                        return `${savings.toLocaleString()}đ (trung bình)`;
                                    })()}
                                    </Text>
                                </Space>
                            </div>
                        }
                        type="success"
                        style={{ marginBottom: 16 }}
                    />
                </>
            )}
        </>
    );
};

export default ComboForm;
