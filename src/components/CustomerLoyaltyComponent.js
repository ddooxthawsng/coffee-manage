import React, { useState, useEffect } from 'react';
import {
    Card, Form, Input, Button, Table, Modal, Select, InputNumber,
    Space, Tag, Typography, message, Row, Col, Statistic, Progress,
    DatePicker, Alert, Divider, Badge, Avatar, Tooltip
} from 'antd';
import {
    UserOutlined, GiftOutlined, CrownOutlined, StarOutlined,
    TrophyOutlined, PlusOutlined, EditOutlined, DeleteOutlined
} from '@ant-design/icons';
import { addCustomer, getCustomers, updateCustomer, addLoyaltyTransaction } from '../firebase/customer_service';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const CustomerLoyalty = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [form] = Form.useForm();

    // Cấp độ thành viên
    const membershipTiers = [
        { level: 'Bronze', minPoints: 0, discount: 5, color: '#CD7F32', icon: '🥉' },
        { level: 'Silver', minPoints: 500, discount: 10, color: '#C0C0C0', icon: '🥈' },
        { level: 'Gold', minPoints: 1000, discount: 15, color: '#FFD700', icon: '🥇' },
        { level: 'Platinum', minPoints: 2000, discount: 20, color: '#E5E4E2', icon: '💎' }
    ];

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const customerList = await getCustomers();
            setCustomers(customerList);
        } catch (error) {
            message.error('Không thể tải danh sách khách hàng');
        } finally {
            setLoading(false);
        }
    };

    const getMembershipTier = (points) => {
        for (let i = membershipTiers.length - 1; i >= 0; i--) {
            if (points >= membershipTiers[i].minPoints) {
                return membershipTiers[i];
            }
        }
        return membershipTiers[0];
    };

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            const customerData = {
                ...values,
                loyaltyPoints: values.loyaltyPoints || 0,
                totalSpent: values.totalSpent || 0,
                visitCount: values.visitCount || 0,
                lastVisit: new Date(),
                createdAt: new Date()
            };

            if (editingCustomer) {
                await updateCustomer(editingCustomer.id, customerData);
                message.success('Cập nhật khách hàng thành công!');
            } else {
                await addCustomer(customerData);
                message.success('Thêm khách hàng thành công!');
            }

            setModalVisible(false);
            form.resetFields();
            setEditingCustomer(null);
            fetchCustomers();
        } catch (error) {
            message.error('Có lỗi xảy ra!');
        } finally {
            setLoading(false);
        }
    };

    const addPoints = async (customerId, points, reason) => {
        try {
            const customer = customers.find(c => c.id === customerId);
            const newPoints = (customer.loyaltyPoints || 0) + points;

            await updateCustomer(customerId, {
                loyaltyPoints: newPoints,
                lastVisit: new Date()
            });

            await addLoyaltyTransaction({
                customerId,
                points,
                type: 'earn',
                reason,
                timestamp: new Date()
            });

            message.success(`Đã cộng ${points} điểm cho khách hàng!`);
            fetchCustomers();
        } catch (error) {
            message.error('Có lỗi khi cộng điểm!');
        }
    };

    const columns = [
        {
            title: 'Khách hàng',
            key: 'customer',
            render: (_, record) => (
                <Space>
                    <Avatar icon={<UserOutlined />} />
                    <div>
                        <div style={{ fontWeight: 600 }}>{record.name}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>{record.phone}</div>
                    </div>
                </Space>
            )
        },
        {
            title: 'Hạng thành viên',
            key: 'tier',
            render: (_, record) => {
                const tier = getMembershipTier(record.loyaltyPoints || 0);
                return (
                    <Tag color={tier.color} style={{ color: '#fff', fontWeight: 600 }}>
                        {tier.icon} {tier.level}
                    </Tag>
                );
            }
        },
        {
            title: 'Điểm tích lũy',
            dataIndex: 'loyaltyPoints',
            key: 'points',
            render: (points) => (
                <Badge count={points || 0} style={{ backgroundColor: '#52c41a' }} />
            )
        },
        {
            title: 'Tổng chi tiêu',
            dataIndex: 'totalSpent',
            key: 'spent',
            render: (amount) => `${(amount || 0).toLocaleString()}đ`
        },
        {
            title: 'Số lần ghé thăm',
            dataIndex: 'visitCount',
            key: 'visits'
        },
        {
            title: 'Lần cuối ghé thăm',
            dataIndex: 'lastVisit',
            key: 'lastVisit',
            render: (date) => date ? dayjs(date.toDate()).format('DD/MM/YYYY') : 'Chưa có'
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        onClick={() => addPoints(record.id, 50, 'Thưởng thủ công')}
                    >
                        +50 điểm
                    </Button>
                    <Button
                        size="small"
                        onClick={() => {
                            setEditingCustomer(record);
                            form.setFieldsValue(record);
                            setModalVisible(true);
                        }}
                    >
                        Sửa
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>
                <CrownOutlined /> Chương trình khách hàng thân thiết
            </Title>

            {/* Thống kê tổng quan */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng khách hàng"
                            value={customers.length}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Khách VIP (Gold+)"
                            value={customers.filter(c => (c.loyaltyPoints || 0) >= 1000).length}
                            prefix={<CrownOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng điểm đã phát"
                            value={customers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0)}
                            prefix={<GiftOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng doanh thu từ VIP"
                            value={customers.filter(c => (c.loyaltyPoints || 0) >= 1000)
                                .reduce((sum, c) => sum + (c.totalSpent || 0), 0)}
                            suffix="đ"
                            prefix={<TrophyOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Bảng hạng thành viên */}
            <Card title="Các hạng thành viên" style={{ marginBottom: 24 }}>
                <Row gutter={16}>
                    {membershipTiers.map(tier => (
                        <Col span={6} key={tier.level}>
                            <Card size="small" style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 24, marginBottom: 8 }}>{tier.icon}</div>
                                <Title level={5}>{tier.level}</Title>
                                <Text>Từ {tier.minPoints} điểm</Text><br />
                                <Text strong style={{ color: '#52c41a' }}>
                                    Giảm {tier.discount}%
                                </Text>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Card>

            {/* Danh sách khách hàng */}
            <Card
                title="Danh sách khách hàng thân thiết"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setModalVisible(true)}
                    >
                        Thêm khách hàng
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={customers}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            {/* Modal thêm/sửa khách hàng */}
            <Modal
                title={editingCustomer ? 'Sửa thông tin khách hàng' : 'Thêm khách hàng mới'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingCustomer(null);
                }}
                footer={null}
            >
                <Form form={form} onFinish={handleSubmit} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Tên khách hàng"
                        rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="phone"
                        label="Số điện thoại"
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email">
                        <Input type="email" />
                    </Form.Item>
                    <Form.Item name="birthday" label="Ngày sinh">
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="loyaltyPoints" label="Điểm tích lũy">
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="totalSpent" label="Tổng chi tiêu">
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {editingCustomer ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                            <Button onClick={() => setModalVisible(false)}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CustomerLoyalty;
