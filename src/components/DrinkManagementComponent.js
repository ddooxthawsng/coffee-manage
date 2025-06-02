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
  List,
  Tag,
  Typography,
  message,
  Popconfirm,
  Empty,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CoffeeOutlined,
  ExperimentOutlined,
  DollarOutlined,
  InboxOutlined
} from '@ant-design/icons';
import { addDrink, updateDrink, getDrinks, deleteDrink } from '../firebase/DrinkManagementService';
import { getIngredients } from '../firebase/ingredient_service';

const { Title, Text } = Typography;
const { Option } = Select;

const DrinkManagement = () => {
  const [drinks, setDrinks] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [editingDrink, setEditingDrink] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState([]);

  useEffect(() => {
    fetchDrinks();
    fetchIngredients();
  }, []);

  const fetchDrinks = async () => {
    try {
      const drinkList = await getDrinks();
      setDrinks(drinkList);
    } catch (error) {
      console.error('Lỗi khi tải danh sách đồ uống:', error);
      message.error('Không thể tải danh sách đồ uống');
    }
  };

  const fetchIngredients = async () => {
    try {
      const ingredientList = await getIngredients();
      setIngredients(ingredientList);
    } catch (error) {
      console.error('Lỗi khi tải danh sách nguyên liệu:', error);
      message.error('Không thể tải danh sách nguyên liệu');
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const drinkData = {
        name: values.name,
        ingredients: selectedIngredients.map(ing => ({
          id: ing.ingredientId,
          name: ing.ingredientName,
          quantity: ing.quantity,
          unit: ing.unit,
          unitPrice: ing.unitPrice
        })),
        price: values.price
        // Bỏ inventory khỏi đây
      };

      if (editingDrink) {
        await updateDrink(editingDrink.id, drinkData);
        message.success('Cập nhật đồ uống thành công!');
      } else {
        await addDrink(drinkData);
        message.success('Thêm đồ uống mới thành công!');
      }

      resetForm();
      fetchDrinks();
    } catch (error) {
      console.error('Lỗi khi lưu đồ uống:', error);
      message.error('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    form.resetFields();
    setSelectedIngredients([]);
    setEditingDrink(null);
  };

  const editDrink = (drink) => {
    const drinkIngredients = Array.isArray(drink.ingredients) ? drink.ingredients : [];

    form.setFieldsValue({
      name: drink.name,
      price: drink.price
      // Bỏ inventory khỏi đây
    });

    setSelectedIngredients(drinkIngredients.map(ing => ({
      ingredientId: ing.id || '',
      ingredientName: ing.name || '',
      quantity: ing.quantity || 0,
      unit: ing.unit || '',
      unitPrice: ing.unitPrice || 0
    })));

    setEditingDrink(drink);
  };

  const handleDelete = async (drinkId, drinkName) => {
    try {
      await deleteDrink(drinkId);
      message.success('Xóa đồ uống thành công!');
      fetchDrinks();
    } catch (error) {
      console.error('Lỗi khi xóa đồ uống:', error);
      message.error('Có lỗi xảy ra khi xóa. Vui lòng thử lại!');
    }
  };

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
      const selectedIngredient = ingredients.find(ing => ing.id === value);
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

  const calculateTotalCost = () => {
    return selectedIngredients.reduce((total, ing) => {
      return total + (ing.quantity * ing.unitPrice);
    }, 0);
  };

  const renderIngredientsList = (drinkIngredients) => {
    if (!Array.isArray(drinkIngredients) || drinkIngredients.length === 0) {
      return <Text type="secondary" italic>Chưa có công thức nguyên liệu</Text>;
    }

    return (
        <div>
          {drinkIngredients.map((ing, idx) => (
              <Tag key={idx} color="blue" style={{ margin: '2px' }}>
                {ing.name || 'N/A'}: {ing.quantity || 0} {ing.unit || ''}
                ({((ing.quantity || 0) * (ing.unitPrice || 0)).toLocaleString()}đ)
              </Tag>
          ))}
        </div>
    );
  };

  return (
      <div style={{ padding: '0 24px' }}>
        <Title level={2}>
          <CoffeeOutlined style={{ marginRight: 8, color: '#8B4513' }} />
          Quản Lý Đồ Uống
        </Title>

        <Card
            title={
              <span>
            <PlusOutlined style={{ marginRight: 8 }} />
                {editingDrink ? 'Chỉnh Sửa Đồ Uống' : 'Thêm Đồ Uống Mới'}
          </span>
            }
            style={{ marginBottom: 24 }}
        >
          <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                price: { S: 0, M: 0, L: 0 }
                // Bỏ inventory khỏi initialValues
              }}
          >
            <Form.Item
                label="Tên đồ uống"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên đồ uống!' }]}
            >
              <Input
                  prefix={<CoffeeOutlined />}
                  placeholder="Nhập tên đồ uống..."
                  size="large"
              />
            </Form.Item>

            <Card
                title={
                  <span>
                <ExperimentOutlined style={{ marginRight: 8 }} />
                Công Thức (Nguyên Liệu)
              </span>
                }
                size="small"
                style={{ marginBottom: 16 }}
                extra={
                  <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={addIngredientToRecipe}
                  >
                    Thêm Nguyên Liệu
                  </Button>
                }
            >
              {selectedIngredients.length === 0 ? (
                  <Empty
                      description="Chưa có nguyên liệu nào"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
              ) : (
                  selectedIngredients.map((ingredient, index) => (
                      <Card key={index} size="small" style={{ marginBottom: 8 }}>
                        <Row gutter={16} align="middle">
                          <Col span={8}>
                            <Select
                                placeholder="Chọn nguyên liệu"
                                value={ingredient.ingredientId}
                                onChange={(value) => updateIngredientInRecipe(index, 'ingredientId', value)}
                                style={{ width: '100%' }}
                                showSearch
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                              {ingredients.map(ing => (
                                  <Option key={ing.id} value={ing.id}>
                                    {ing.name} ({ing.unitPrice?.toLocaleString()}đ/{ing.unit})
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
                                step={0.1}
                                min={0}
                                addonAfter={ingredient.unit}
                            />
                          </Col>
                          <Col span={6}>
                            <Text strong style={{ color: '#1890ff' }}>
                              {(ingredient.quantity * ingredient.unitPrice).toLocaleString()}đ
                            </Text>
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
                      </Card>
                  ))
              )}

              {selectedIngredients.length > 0 && (
                  <div style={{ textAlign: 'right', marginTop: 16 }}>
                    <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                      <DollarOutlined style={{ marginRight: 4 }} />
                      Tổng chi phí: {calculateTotalCost().toLocaleString()}đ
                    </Text>
                  </div>
              )}
            </Card>

            {/* Chỉ giữ lại phần Giá Bán, bỏ Tồn Kho */}
            <Card title="💰 Giá Bán (VNĐ)" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                {['S', 'M', 'L'].map(size => (
                    <Col span={8} key={size}>
                      <Form.Item
                          label={`Size ${size}`}
                          name={['price', size]}
                          rules={[{ required: true, message: 'Bắt buộc!' }]}
                      >
                        <InputNumber
                            style={{ width: '100%' }}
                            step={1000}
                            min={0}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            addonAfter="đ"
                        />
                      </Form.Item>
                    </Col>
                ))}
              </Row>
            </Card>

            <Form.Item style={{ marginTop: 24 }}>
              <Space>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    icon={editingDrink ? <EditOutlined /> : <PlusOutlined />}
                >
                  {editingDrink ? 'Cập Nhật' : 'Thêm Mới'}
                </Button>
                {editingDrink && (
                    <Button size="large" onClick={resetForm}>
                      Hủy
                    </Button>
                )}
              </Space>
            </Form.Item>
          </Form>
        </Card>

        <Card title={
          <span>
          <InboxOutlined style={{ marginRight: 8 }} />
          Danh Sách Đồ Uống ({drinks.length})
        </span>
        }>
          {drinks.length === 0 ? (
              <Empty description="Chưa có đồ uống nào. Hãy thêm đồ uống đầu tiên!" />
          ) : (
              <List
                  grid={{ gutter: 16, column: 2 }}
                  dataSource={drinks}
                  renderItem={drink => (
                      <List.Item>
                        <Card
                            hoverable
                            actions={[
                              <Tooltip title="Chỉnh sửa">
                                <Button
                                    type="text"
                                    icon={<EditOutlined />}
                                    onClick={() => editDrink(drink)}
                                />
                              </Tooltip>,
                              <Popconfirm
                                  title="Xóa đồ uống"
                                  description={`Bạn có chắc chắn muốn xóa "${drink.name}"?`}
                                  onConfirm={() => handleDelete(drink.id, drink.name)}
                                  okText="Xóa"
                                  cancelText="Hủy"
                                  okType="danger"
                              >
                                <Tooltip title="Xóa">
                                  <Button
                                      type="text"
                                      danger
                                      icon={<DeleteOutlined />}
                                  />
                                </Tooltip>
                              </Popconfirm>
                            ]}
                        >
                          <Card.Meta
                              title={
                                <span>
                        <CoffeeOutlined style={{ marginRight: 8, color: '#8B4513' }} />
                                  {drink.name}
                      </span>
                              }
                              description={
                                <div>
                                  <div style={{ marginBottom: 8 }}>
                                    <Text strong>Nguyên liệu:</Text>
                                    <div style={{ marginTop: 4 }}>
                                      {renderIngredientsList(drink.ingredients)}
                                    </div>
                                  </div>

                                  <Divider style={{ margin: '8px 0' }} />

                                  {/* Chỉ hiển thị giá bán, bỏ tồn kho */}
                                  <div>
                                    <Text strong>💰 Giá bán:</Text>
                                    <div style={{ marginTop: 4 }}>
                                      <Tag color="green">S: {drink.price?.S?.toLocaleString()}đ</Tag>
                                      <Tag color="blue">M: {drink.price?.M?.toLocaleString()}đ</Tag>
                                      <Tag color="red">L: {drink.price?.L?.toLocaleString()}đ</Tag>
                                    </div>
                                  </div>
                                </div>
                              }
                          />
                        </Card>
                      </List.Item>
                  )}
              />
          )}
        </Card>
      </div>
  );
};

export default DrinkManagement;