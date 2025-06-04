import React, {useEffect, useState} from 'react';
import {
    Alert,
    Avatar,
    Button,
    Card,
    Col,
    InputNumber,
    List,
    message,
    Modal,
    Progress,
    Rate,
    Row,
    Space,
    Statistic,
    Tabs,
    Tag,
    Typography
} from 'antd';
import {
    CalendarOutlined,
    CrownOutlined,
    GiftOutlined,
    HistoryOutlined,
    PhoneOutlined,
    ShoppingCartOutlined,
    StarOutlined,
    UserOutlined,
    WifiOutlined
} from '@ant-design/icons';

const {Title, Text} = Typography;
const {TabPane} = Tabs;

const CustomerMobileApp = () => {
    const [cart, setCart] = useState([]);
    const [customer, setCustomer] = useState(null);
    const [orderHistory, setOrderHistory] = useState([]);
    const [loyaltyPoints, setLoyaltyPoints] = useState(0);
    const [drinks, setDrinks] = useState([]);
    const [activeTab, setActiveTab] = useState('menu');
    const [notifications, setNotifications] = useState([]);

    // Mock data
    useEffect(() => {
        setDrinks([
            {
                id: 1,
                name: 'Cà phê đen',
                price: {S: 20000, M: 25000, L: 30000},
                image: '/api/placeholder/150/150',
                rating: 4.5,
                description: 'Cà phê đen truyền thống'
            },
            {
                id: 2,
                name: 'Cappuccino',
                price: {S: 35000, M: 40000, L: 45000},
                image: '/api/placeholder/150/150',
                rating: 4.8,
                description: 'Cappuccino thơm ngon'
            },
            {
                id: 3,
                name: 'Latte',
                price: {S: 30000, M: 35000, L: 40000},
                image: '/api/placeholder/150/150',
                rating: 4.6,
                description: 'Latte mềm mại'
            }
        ]);

        setCustomer({
            name: 'Nguyễn Văn A',
            phone: '0123456789',
            email: 'customer@example.com',
            membershipLevel: 'Gold',
            joinDate: '2024-01-15'
        });

        setLoyaltyPoints(1250);

        setOrderHistory([
            {
                id: 1,
                date: '2024-12-01',
                items: ['Cà phê đen (M)', 'Bánh croissant'],
                total: 45000,
                status: 'completed'
            },
            {
                id: 2,
                date: '2024-11-28',
                items: ['Cappuccino (L)', 'Bánh mì sandwich'],
                total: 65000,
                status: 'completed'
            }
        ]);

        setNotifications([
            {
                id: 1,
                title: 'Ưu đãi sinh nhật',
                message: 'Giảm 20% cho đơn hàng tiếp theo',
                type: 'promotion',
                date: '2024-12-01'
            },
            {
                id: 2,
                title: 'Điểm thưởng',
                message: 'Bạn đã tích đủ 1000 điểm!',
                type: 'points',
                date: '2024-11-30'
            }
        ]);
    }, []);

    const addToCart = (drink, size) => {
        const cartItem = {
            id: `${drink.id}-${size}`,
            drinkId: drink.id,
            name: drink.name,
            size,
            price: drink.price[size],
            quantity: 1
        };

        setCart(prev => {
            const existing = prev.find(item => item.id === cartItem.id);
            if (existing) {
                return prev.map(item =>
                    item.id === cartItem.id
                        ? {...item, quantity: item.quantity + 1}
                        : item
                );
            }
            return [...prev, cartItem];
        });

        message.success('Đã thêm vào giỏ hàng!');
    };

    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity <= 0) {
            setCart(prev => prev.filter(item => item.id !== itemId));
        } else {
            setCart(prev =>
                prev.map(item =>
                    item.id === itemId
                        ? {...item, quantity: newQuantity}
                        : item
                )
            );
        }
    };

    const getTotalAmount = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const handleOrder = () => {
        if (cart.length === 0) {
            message.warning('Giỏ hàng trống!');
            return;
        }

        Modal.confirm({
            title: 'Xác nhận đặt hàng',
            content: `Tổng tiền: ${getTotalAmount().toLocaleString()}đ`,
            onOk: () => {
                message.success('Đặt hàng thành công! Đơn hàng sẽ được chuẩn bị trong 10-15 phút.');
                setCart([]);
                setLoyaltyPoints(prev => prev + Math.floor(getTotalAmount() / 1000));

                // Thêm vào lịch sử đơn hàng
                const newOrder = {
                    id: orderHistory.length + 1,
                    date: new Date().toISOString().split('T')[0],
                    items: cart.map(item => `${item.name} (${item.size})`),
                    total: getTotalAmount(),
                    status: 'pending'
                };
                setOrderHistory(prev => [newOrder, ...prev]);
            }
        });
    };

    const getMembershipBenefits = () => {
        const benefits = {
            Bronze: {discount: 5, pointMultiplier: 1},
            Silver: {discount: 10, pointMultiplier: 1.2},
            Gold: {discount: 15, pointMultiplier: 1.5},
            Platinum: {discount: 20, pointMultiplier: 2}
        };
        return benefits[customer?.membershipLevel] || benefits.Bronze;
    };

    return (
        <div style={{
            maxWidth: 400,
            margin: '0 auto',
            padding: '16px',
            backgroundColor: '#f5f5f5',
            minHeight: '100vh'
        }}>
            <Card style={{marginBottom: 16, textAlign: 'center'}}>
                <Title level={3}>☕ Cafe XYZ</Title>
                <Text type="secondary">Ứng dụng đặt hàng</Text>
                <div style={{marginTop: 8}}>
                    <Tag color="green">
                        <WifiOutlined/> Online
                    </Tag>
                </div>
            </Card>

            <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
                <TabPane tab="Thực đơn" key="menu">
                    <List
                        dataSource={drinks}
                        renderItem={(drink) => (
                            <Card style={{marginBottom: 12}}>
                                <Row gutter={16}>
                                    <Col span={8}>
                                        <img
                                            src={drink.image}
                                            alt={drink.name}
                                            style={{
                                                width: '100%',
                                                height: 80,
                                                objectFit: 'cover',
                                                borderRadius: 8
                                            }}
                                        />
                                    </Col>
                                    <Col span={16}>
                                        <div>
                                            <Text strong>{drink.name}</Text>
                                            <div>
                                                <Rate disabled defaultValue={drink.rating} size="small"/>
                                                <Text type="secondary"> ({drink.rating})</Text>
                                            </div>
                                            <Text type="secondary" style={{fontSize: 12}}>
                                                {drink.description}
                                            </Text>
                                        </div>
                                        <div style={{marginTop: 8}}>
                                            <Space size="small" wrap>
                                                {Object.entries(drink.price).map(([size, price]) => (
                                                    <Button
                                                        key={size}
                                                        size="small"
                                                        type="primary"
                                                        onClick={() => addToCart(drink, size)}
                                                    >
                                                        {size}: {price.toLocaleString()}đ
                                                    </Button>
                                                ))}
                                            </Space>
                                        </div>
                                    </Col>
                                </Row>
                            </Card>
                        )}
                    />
                </TabPane>

                <TabPane tab={`Giỏ hàng (${cart.length})`} key="cart">
                    {cart.length === 0 ? (
                        <Card style={{textAlign: 'center', padding: 40}}>
                            <ShoppingCartOutlined style={{fontSize: 48, color: '#ccc'}}/>
                            <div style={{marginTop: 16}}>
                                <Text type="secondary">Giỏ hàng trống</Text>
                            </div>
                        </Card>
                    ) : (
                        <>
                            <List
                                dataSource={cart}
                                renderItem={(item) => (
                                    <Card size="small" style={{marginBottom: 8}}>
                                        <Row justify="space-between" align="middle">
                                            <Col span={12}>
                                                <Text strong>{item.name}</Text>
                                                <br/>
                                                <Text type="secondary">Size {item.size}</Text>
                                            </Col>
                                            <Col span={6}>
                                                <InputNumber
                                                    size="small"
                                                    min={0}
                                                    value={item.quantity}
                                                    onChange={(value) => updateQuantity(item.id, value)}
                                                />
                                            </Col>
                                            <Col span={6} style={{textAlign: 'right'}}>
                                                <Text strong>
                                                    {(item.price * item.quantity).toLocaleString()}đ
                                                </Text>
                                            </Col>
                                        </Row>
                                    </Card>
                                )}
                            />

                            <Card style={{marginTop: 16}}>
                                <Row justify="space-between">
                                    <Col>
                                        <Text strong style={{fontSize: 16}}>Tổng cộng:</Text>
                                    </Col>
                                    <Col>
                                        <Text strong style={{fontSize: 16, color: '#52c41a'}}>
                                            {getTotalAmount().toLocaleString()}đ
                                        </Text>
                                    </Col>
                                </Row>

                                {customer?.membershipLevel && (
                                    <Alert
                                        message={`Ưu đãi thành viên ${customer.membershipLevel}`}
                                        description={`Giảm ${getMembershipBenefits().discount}% - Tiết kiệm ${Math.round(getTotalAmount() * getMembershipBenefits().discount / 100).toLocaleString()}đ`}
                                        type="success"
                                        style={{margin: '12px 0'}}
                                        size="small"
                                    />
                                )}

                                <Button
                                    type="primary"
                                    block
                                    size="large"
                                    style={{marginTop: 16}}
                                    onClick={handleOrder}
                                >
                                    Đặt hàng ngay
                                </Button>
                            </Card>
                        </>
                    )}
                </TabPane>

                <TabPane tab="Tài khoản" key="account">
                    <Card style={{marginBottom: 16}}>
                        <Row align="middle" gutter={16}>
                            <Col>
                                <Avatar size={64} icon={<UserOutlined/>}/>
                            </Col>
                            <Col flex={1}>
                                <Title level={4} style={{margin: 0}}>
                                    {customer?.name}
                                </Title>
                                <Tag color="gold" icon={<CrownOutlined/>}>
                                    Thành viên {customer?.membershipLevel}
                                </Tag>
                                <div style={{marginTop: 8}}>
                                    <PhoneOutlined/> {customer?.phone}
                                </div>
                                <div style={{marginTop: 4}}>
                                    <CalendarOutlined/> Tham gia từ {customer?.joinDate}
                                </div>
                            </Col>
                        </Row>
                    </Card>

                    <Card title="Điểm tích lũy" style={{marginBottom: 16}}>
                        <Row justify="space-between" align="middle">
                            <Col>
                                <Statistic
                                    title="Điểm hiện tại"
                                    value={loyaltyPoints}
                                    prefix={<GiftOutlined/>}
                                />
                            </Col>
                            <Col>
                                <Progress
                                    type="circle"
                                    percent={Math.min((loyaltyPoints % 1000) / 10, 100)}
                                    size={80}
                                    format={() => `${1000 - (loyaltyPoints % 1000)}`}
                                />
                                <div style={{textAlign: 'center', marginTop: 8}}>
                                    <Text type="secondary" style={{fontSize: 12}}>
                                        điểm đến ly miễn phí
                                    </Text>
                                </div>
                            </Col>
                        </Row>
                    </Card>

                    <Card title="Ưu đãi dành cho bạn" style={{marginBottom: 16}}>
                        <List
                            dataSource={notifications}
                            renderItem={(notification) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar
                                                icon={notification.type === 'promotion' ? <GiftOutlined/> :
                                                    <StarOutlined/>}
                                                style={{
                                                    backgroundColor: notification.type === 'promotion' ? '#52c41a' : '#1890ff'
                                                }}
                                            />
                                        }
                                        title={notification.title}
                                        description={
                                            <div>
                                                <div>{notification.message}</div>
                                                <Text type="secondary" style={{fontSize: 12}}>
                                                    {notification.date}
                                                </Text>
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>

                    <Card title="Quyền lợi thành viên">
                        <Space direction="vertical" style={{width: '100%'}}>
                            <div>
                                <Text strong>Giảm giá: </Text>
                                <Tag color="green">{getMembershipBenefits().discount}%</Tag>
                            </div>
                            <div>
                                <Text strong>Tích điểm: </Text>
                                <Tag color="blue">x{getMembershipBenefits().pointMultiplier}</Tag>
                            </div>
                            <div>
                                <Text strong>Ưu tiên: </Text>
                                <Tag color="gold">Phục vụ ưu tiên</Tag>
                            </div>
                        </Space>
                    </Card>
                </TabPane>

                <TabPane tab="Lịch sử" key="history">
                    <Card title="Đơn hàng gần đây">
                        {orderHistory.length === 0 ? (
                            <div style={{textAlign: 'center', padding: 40}}>
                                <HistoryOutlined style={{fontSize: 48, color: '#ccc'}}/>
                                <div style={{marginTop: 16}}>
                                    <Text type="secondary">Chưa có đơn hàng nào</Text>
                                </div>
                            </div>
                        ) : (
                            <List
                                dataSource={orderHistory}
                                renderItem={(order) => (
                                    <Card size="small" style={{marginBottom: 12}}>
                                        <Row justify="space-between" align="top">
                                            <Col span={16}>
                                                <Text strong>Đơn hàng #{order.id}</Text>
                                                <br/>
                                                <Text type="secondary">{order.date}</Text>
                                                <div style={{marginTop: 8}}>
                                                    {order.items.map((item, index) => (
                                                        <Tag key={index} style={{marginBottom: 4}}>
                                                            {item}
                                                        </Tag>
                                                    ))}
                                                </div>
                                            </Col>
                                            <Col span={8} style={{textAlign: 'right'}}>
                                                <Text strong style={{color: '#52c41a'}}>
                                                    {order.total.toLocaleString()}đ
                                                </Text>
                                                <br/>
                                                <Tag color={order.status === 'completed' ? 'green' : 'orange'}>
                                                    {order.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                                                </Tag>
                                            </Col>
                                        </Row>
                                    </Card>
                                )}
                            />
                        )}
                    </Card>
                </TabPane>
            </Tabs>
        </div>
    );
};

export default CustomerMobileApp;
