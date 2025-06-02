
import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  InputNumber,
  Space,
  Row,
  Col,
  List,
  Tag,
  Typography,
  message,
  Empty,
  Divider,
  Badge,
  Statistic,
  Tooltip,
  Alert
} from 'antd';
import {
  ShoppingCartOutlined,
  PlusOutlined,
  MinusOutlined,
  DeleteOutlined,
  CoffeeOutlined,
  DollarOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import { getDrinks, recordSale } from '../firebase/DrinkManagementService';
import { getIngredients, updateIngredientInventory } from '../firebase/ingredient_service';

const { Title, Text } = Typography;

const SalesPage = () => {
  const [drinks, setDrinks] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // Kiểm tra có thể làm được bao nhiêu ly dựa trên nguyên liệu
  const checkDrinkAvailability = (drink) => {
    if (!Array.isArray(drink.ingredients) || drink.ingredients.length === 0) {
      return { canMake: 999, limitingIngredient: null }; // Không có công thức = có thể làm không giới hạn
    }

    let minPossible = 999;
    let limitingIngredient = null;

    for (const recipeIngredient of drink.ingredients) {
      const ingredient = ingredients.find(ing => ing.id === recipeIngredient.id);
      if (ingredient) {
        const availableStock = ingredient.inventory || 0;
        const neededPerDrink = recipeIngredient.quantity || 0;

        if (neededPerDrink > 0) {
          const possibleQuantity = Math.floor(availableStock / neededPerDrink);
          if (possibleQuantity < minPossible) {
            minPossible = possibleQuantity;
            limitingIngredient = ingredient.name;
          }
        }
      } else {
        // Nguyên liệu không tồn tại = không thể làm
        return { canMake: 0, limitingIngredient: recipeIngredient.name };
      }
    }

    return { canMake: Math.max(0, minPossible), limitingIngredient };
  };

  const addToCart = (drink, size) => {
    const availability = checkDrinkAvailability(drink);

    if (availability.canMake <= 0) {
      message.warning(`Không thể làm ${drink.name} do thiếu ${availability.limitingIngredient}`);
      return;
    }

    const cartItem = {
      id: `${drink.id}-${size}`,
      drinkId: drink.id,
      drinkName: drink.name,
      size: size,
      price: drink.price[size],
      quantity: 1,
      maxQuantity: availability.canMake,
      ingredients: drink.ingredients || []
    };

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === cartItem.id);
      if (existingItem) {
        // Kiểm tra lại khả năng làm với số lượng hiện tại
        const totalQuantityInCart = prevCart
            .filter(item => item.drinkId === drink.id)
            .reduce((sum, item) => sum + item.quantity, 0);

        if (totalQuantityInCart < availability.canMake) {
          return prevCart.map(item =>
              item.id === cartItem.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
          );
        } else {
          message.warning(`Không đủ nguyên liệu! Chỉ có thể làm ${availability.canMake} ly`);
          return prevCart;
        }
      } else {
        return [...prevCart, cartItem];
      }
    });
  };

  const updateCartQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    } else {
      setCart(prevCart =>
          prevCart.map(item => {
            if (item.id === itemId) {
              if (newQuantity <= item.maxQuantity) {
                return { ...item, quantity: newQuantity };
              } else {
                message.warning(`Không đủ nguyên liệu! Tối đa ${item.maxQuantity} ly`);
                return item;
              }
            }
            return item;
          })
      );
    }
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const checkout = async () => {
    if (cart.length === 0) {
      message.warning('Giỏ hàng trống!');
      return;
    }

    setLoading(true);
    try {
      // Ghi nhận từng giao dịch và trừ nguyên liệu
      for (const item of cart) {
        // Ghi nhận bán hàng
        await recordSale({
          drinkId: item.drinkId,
          drinkName: item.drinkName,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
          timestamp: new Date()
        });

        // Trừ nguyên liệu theo công thức
        if (Array.isArray(item.ingredients)) {
          for (const ingredient of item.ingredients) {
            const totalUsed = ingredient.quantity * item.quantity;
            await updateIngredientInventory(ingredient.id, totalUsed);
          }
        }
      }

      message.success(`Thanh toán thành công! Tổng tiền: ${getTotalAmount().toLocaleString()}đ`);
      setCart([]);
      fetchDrinks(); // Refresh drinks
      fetchIngredients(); // Refresh ingredients để cập nhật tồn kho
    } catch (error) {
      console.error('Lỗi khi thanh toán:', error);
      message.error('Có lỗi xảy ra khi thanh toán. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const renderIngredientsList = (drinkIngredients) => {
    if (!Array.isArray(drinkIngredients) || drinkIngredients.length === 0) {
      return <Text type="secondary" italic>Chưa có công thức nguyên liệu</Text>;
    }

    return (
        <div>
          {drinkIngredients.slice(0, 3).map((ing, idx) => (
              <Tag key={idx} color="blue" size="small" style={{ margin: '1px' }}>
                {ing.name || 'N/A'}
              </Tag>
          ))}
          {drinkIngredients.length > 3 && (
              <Tag color="default" size="small">+{drinkIngredients.length - 3} khác</Tag>
          )}
        </div>
    );
  };

  const getAvailabilityStatus = (drink) => {
    const availability = checkDrinkAvailability(drink);

    if (availability.canMake <= 0) {
      return {
        status: 'error',
        text: 'Hết nguyên liệu',
        icon: <WarningOutlined />,
        count: 0,
        color: 'red'
      };
    } else if (availability.canMake <= 5) {
      return {
        status: 'warning',
        text: `Còn ${availability.canMake} ly`,
        icon: <WarningOutlined />,
        count: availability.canMake,
        color: 'orange'
      };
    } else {
      return {
        status: 'success',
        text: `Còn ${availability.canMake} ly`,
        icon: <CheckCircleOutlined />,
        count: availability.canMake,
        color: 'green'
      };
    }
  };

  return (
      <div style={{ padding: '0 24px' }}>
        <Title level={2}>
          <ShoppingCartOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Bán Hàng - POS System
        </Title>

        <Row gutter={24}>
          {/* Drinks Section */}
          <Col xs={24} lg={16}>
            <Card
                title={
                  <span>
                <CoffeeOutlined style={{ marginRight: 8 }} />
                Danh Sách Đồ Uống ({drinks.length})
              </span>
                }
                style={{ marginBottom: 24 }}
            >
              {drinks.length === 0 ? (
                  <Empty description="Chưa có đồ uống nào" />
              ) : (
                  <Row gutter={[16, 16]}>
                    {drinks.map(drink => {
                      const availability = getAvailabilityStatus(drink);
                      return (
                          <Col xs={24} sm={12} lg={8} key={drink.id}>
                            <Card
                                hoverable
                                size="small"
                                title={
                                  <Space>
                                    <CoffeeOutlined style={{ color: '#8B4513' }} />
                                    <Text strong>{drink.name}</Text>
                                  </Space>
                                }
                                extra={
                                  <Tooltip title="Nguyên liệu">
                                    {renderIngredientsList(drink.ingredients)}
                                  </Tooltip>
                                }
                            >
                              {/* Hiển thị tình trạng nguyên liệu */}
                              <div style={{ marginBottom: 12 }}>
                                <Alert
                                    message={
                                      <Space>
                                        <ExperimentOutlined />
                                        {availability.text}
                                      </Space>
                                    }
                                    type={availability.status}
                                    showIcon={false}
                                    size="small"
                                />
                              </div>

                              <Space direction="vertical" style={{ width: '100%' }}>
                                {['S', 'M', 'L'].map(size => (
                                    <Card key={size} size="small" style={{ margin: 0 }}>
                                      <Row justify="space-between" align="middle">
                                        <Col>
                                          <Space direction="vertical" size={0}>
                                            <Text strong>Size {size}</Text>
                                            <Text style={{ color: '#1890ff', fontSize: '16px' }}>
                                              {drink.price?.[size]?.toLocaleString()}đ
                                            </Text>
                                          </Space>
                                        </Col>
                                        <Col>
                                          <Space direction="vertical" size={4} align="end">
                                            <Badge
                                                status={availability.status}
                                                text={`${availability.count} ly có thể làm`}
                                            />
                                            <Button
                                                type="primary"
                                                size="small"
                                                icon={<PlusOutlined />}
                                                onClick={() => addToCart(drink, size)}
                                                disabled={availability.count <= 0}
                                            >
                                              {availability.count <= 0 ? 'Hết nguyên liệu' : 'Thêm'}
                                            </Button>
                                          </Space>
                                        </Col>
                                      </Row>
                                    </Card>
                                ))}
                              </Space>
                            </Card>
                          </Col>
                      );
                    })}
                  </Row>
              )}
            </Card>
          </Col>

          {/* Cart Section */}
          <Col xs={24} lg={8}>
            <Card
                title={
                  <Space>
                    <ShoppingCartOutlined />
                    <span>Giỏ Hàng</span>
                    <Badge count={getTotalItems()} showZero />
                  </Space>
                }
                style={{ position: 'sticky', top: '80px' }}
            >
              {cart.length === 0 ? (
                  <Empty
                      description="Giỏ hàng trống"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
              ) : (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <List
                        size="small"
                        dataSource={cart}
                        renderItem={item => (
                            <List.Item>
                              <Card size="small" style={{ width: '100%' }}>
                                <Row justify="space-between" align="top">
                                  <Col span={16}>
                                    <Space direction="vertical" size={0}>
                                      <Text strong>{item.drinkName}</Text>
                                      <Tag color="blue">Size {item.size}</Tag>
                                      <Text type="secondary">
                                        {item.price.toLocaleString()}đ × {item.quantity}
                                      </Text>
                                    </Space>
                                  </Col>
                                  <Col span={8}>
                                    <Space direction="vertical" size={4} align="end">
                                      <Text strong style={{ color: '#1890ff' }}>
                                        {(item.price * item.quantity).toLocaleString()}đ
                                      </Text>
                                      <Space size={0}>
                                        <Button
                                            size="small"
                                            icon={<MinusOutlined />}
                                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                        />
                                        <InputNumber
                                            size="small"
                                            min={1}
                                            max={item.maxQuantity}
                                            value={item.quantity}
                                            onChange={(value) => updateCartQuantity(item.id, value)}
                                            style={{ width: '50px', textAlign: 'center' }}
                                        />
                                        <Button
                                            size="small"
                                            icon={<PlusOutlined />}
                                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                        />
                                      </Space>
                                      <Button
                                          size="small"
                                          danger
                                          icon={<DeleteOutlined />}
                                          onClick={() => removeFromCart(item.id)}
                                      />
                                    </Space>
                                  </Col>
                                </Row>
                              </Card>
                            </List.Item>
                        )}
                    />

                    <Divider />

                    <Card size="small">
                      <Statistic
                          title="Tổng tiền"
                          value={getTotalAmount()}
                          suffix="đ"
                          valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                          prefix={<DollarOutlined />}
                          formatter={value => value.toLocaleString()}
                      />
                    </Card>

                    <Button
                        type="primary"
                        size="large"
                        block
                        icon={<CreditCardOutlined />}
                        onClick={checkout}
                        loading={loading}
                        style={{ height: '50px', fontSize: '16px' }}
                    >
                      {loading ? 'Đang xử lý...' : 'Thanh Toán'}
                    </Button>
                  </Space>
              )}
            </Card>
          </Col>
        </Row>
      </div>
  );
};

export default SalesPage;