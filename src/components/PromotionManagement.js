import React, { useState, useEffect } from 'react';
import {
    Card, Form, Input, Button, Table, Modal, Select, InputNumber,
    Space, Tag, Typography, message, Row, Col, DatePicker,
    Switch, Divider, Alert, Tabs, Progress, Badge
} from 'antd';
import {
    GiftOutlined, PercentageOutlined, ClockCircleOutlined,
    PlusOutlined, EditOutlined, DeleteOutlined, FireOutlined
} from '@ant-design/icons';
import { addPromotion, getPromotions, updatePromotion, deletePromotion } from '../firebase/promotion_service';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const PromotionManagement = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);
    const [form] = Form.useForm();

    const promotionTypes = [
        { value: 'percentage', label: 'Giảm theo %', icon: <PercentageOutlined /> },
        { value: 'fixed', label: 'Giảm cố định', icon: <GiftOutlined /> },
        { value: 'buy_get', label: 'Mua X tặng Y', icon: <FireOutlined /> },
        { value: 'combo', label: 'Combo đặc biệt', icon: <GiftOutlined /> },
        { value: 'happy_hour', label: 'Happy Hour', icon: <ClockCircleOutlined /> }
    ];

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            setLoading(true);
            const promotionList = await getPromotions();
            setPromotions(promotionList);
        } catch (error) {
            message.error('Không thể tải danh sách khuyến mãi');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            const promotionData = {
                ...values,
                startDate: values.dateRange[0].toDate(),
                endDate: values.dateRange[1].toDate(),
                isActive: values.isActive || true,
                usageCount: 0,
                createdAt: new Date()
            };

            delete promotionData.dateRange;

            if (editingPromotion) {
                await updatePromotion(editingPromotion.id, promotionData);
                message.success('Cập nhật khuyến mãi thành công!');
            } else {
                await addPromotion(promotionData);
                message.success('Thêm khuyến mãi thành công!');
            }

            setModalVisible(false);
            form.resetFields();
            setEditingPromotion(null);
            fetchPromotions();
        } catch (error) {
            message.error('Có lỗi xảy ra!');
        } finally {
            setLoading(false);
        }
    };

    const togglePromotionStatus = async (id, isActive) => {
        try {
            await updatePromotion(id, { isActive: !isActive });
            message.success(`${!isActive ? 'Kích hoạt' : 'Tạm dừng'} khuyến mãi thành công!`);
            fetchPromotions();
        } catch (error) {
            message.error('Có lỗi xảy ra!');
        }
    };

    const getPromotionStatus = (promotion) => {
        const now = new Date();
        const start = promotion.startDate.toDate();
        const end = promotion.endDate.toDate();

        if (!promotion.isActive) return { status: 'inactive', color: 'default', text: 'Tạm dừng' };
        if (now < start) return { status: 'upcoming', color: 'blue', text: 'Sắp diễn ra' };
        if (now > end) return { status: 'expired', color: 'red', text: 'Đã hết hạn' };
        return { status: 'active', color: 'green', text: 'Đang hoạt động' };
    };

    const columns = [
        {
            title: 'Tên chương trình',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div>
                    <Text strong>{text}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {record.description}
                    </Text>
                </div>
            )
        },
        {
            title: 'Loại khuyến mãi',
            dataIndex: 'type',
            key: 'type',
            render: (type) => {
                const typeInfo = promotionTypes.find(t => t.value === type);
                return (
                    <Tag icon={typeInfo?.icon}>
                        {typeInfo?.label}
                    </Tag>
                );
            }
        },
        {
            title: 'Giá trị',
            key: 'value',
            render: (_, record) => {
                if (record.type === 'percentage') {
                    return `${record.discountPercent}%`;
                } else if (record.type === 'fixed') {
                    return `${record.discountAmount?.toLocaleString()}đ`;
                } else if (record.type === 'buy_get') {
                    return `Mua ${record.buyQuantity} tặng ${record.getQuantity}`;
                }
                return record.value || 'N/A';
            }
        },
        {
            title: 'Thời gian',
            key: 'duration',
            render: (_, record) => (
                <div>
                    <div>{dayjs(record.startDate.toDate()).format('DD/MM/YYYY')}</div>
                    <div>{dayjs(record.endDate.toDate()).format('DD/MM/YYYY')}</div>
                </div>
            )
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_, record) => {
                const status = getPromotionStatus(record);
                return <Tag color={status.color}>{status.text}</Tag>;
            }
        },
        {
            title: 'Đã sử dụng',
            dataIndex: 'usageCount',
            key: 'usage',
            render: (count, record) => (
                <div>
                    <Badge count={count || 0} />
                    {record.maxUsage && (
                        <Progress
                            percent={Math.round(((count || 0) / record.maxUsage) * 100)}
                            size="small"
                            style={{ marginTop: 4 }}
                        />
                    )}
                </div>
            )
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Switch
                        checked={record.isActive}
                        onChange={() => togglePromotionStatus(record.id, record.isActive)}
                        size="small"
                    />
                    <Button
                        size="small"
                        onClick={() => {
                            setEditingPromotion(record);
                            form.setFieldsValue({
                                ...record,
                                dateRange: [dayjs(record.startDate.toDate()), dayjs(record.endDate.toDate())]
                            });
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
                <GiftOutlined /> Quản lý khuyến mãi & Combo
            </Title>

            <Tabs defaultActiveKey="promotions">
                <TabPane tab="Khuyến mãi" key="promotions">
                    <Card
                        title="Danh sách chương trình khuyến mãi"
                        extra={
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setModalVisible(true)}
                            >
                                Tạo khuyến mãi
                            </Button>
                        }
                    >
                        <Table
                            columns={columns}
                            dataSource={promotions}
                            rowKey="id"
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                        />
                    </Card>
                </TabPane>

                <TabPane tab="Combo đặc biệt" key="combos">
                    <Alert
                        message="Tính năng Combo đặc biệt"
                        description="Tạo các combo đặc biệt với giá ưu đãi cho khách hàng. Ví dụ: Combo sinh viên, Combo cặp đôi, v.v."
                        type="info"
                        style={{ marginBottom: 16 }}
                    />
                    {/* Nội dung combo sẽ được phát triển thêm */}
                </TabPane>

                <TabPane tab="Happy Hour" key="happy-hour">
                    <Alert
                        message="Happy Hour"
                        description="Thiết lập giờ vàng với các ưu đãi đặc biệt theo khung giờ cụ thể trong ngày."
                        type="info"
                        style={{ marginBottom: 16 }}
                    />
                    {/* Nội dung happy hour sẽ được phát triển thêm */}
                </TabPane>
            </Tabs>

            {/* Modal tạo/sửa khuyến mãi */}
            <Modal
                title={editingPromotion ? 'Sửa chương trình khuyến mãi' : 'Tạo chương trình khuyến mãi'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingPromotion(null);
                }}
                footer={null}
                width={600}
            >
                <Form form={form} onFinish={handleSubmit} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Tên chương trình"
                        rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                    >
                        <Input placeholder="VD: Giảm giá cuối tuần" />
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={2} placeholder="Mô tả chi tiết chương trình" />
                    </Form.Item>

                    <Form.Item
                        name="type"
                        label="Loại khuyến mãi"
                        rules={[{ required: true, message: 'Vui lòng chọn loại!' }]}
                    >
                        <Select placeholder="Chọn loại khuyến mãi">
                            {promotionTypes.map(type => (
                                <Option key={type.value} value={type.value}>
                                    {type.icon} {type.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="discountPercent"
                                label="Giảm giá (%)"
                                dependencies={['type']}
                                rules={[
                                    ({ getFieldValue }) => ({
                                        required: getFieldValue('type') === 'percentage',
                                        message: 'Vui lòng nhập % giảm giá!'
                                    })
                                ]}
                            >
                                <InputNumber
                                    min={0}
                                    max={100}
                                    style={{ width: '100%' }}
                                    placeholder="VD: 20"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="discountAmount"
                                label="Giảm cố định (đ)"
                                dependencies={['type']}
                                rules={[
                                    ({ getFieldValue }) => ({
                                        required: getFieldValue('type') === 'fixed',
                                        message: 'Vui lòng nhập số tiền giảm!'
                                    })
                                ]}
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: '100%' }}
                                    placeholder="VD: 50000"
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="dateRange"
                        label="Thời gian áp dụng"
                        rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
                    >
                        <RangePicker
                            style={{ width: '100%' }}
                            showTime
                            format="DD/MM/YYYY HH:mm"
                        />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="minOrderAmount" label="Đơn hàng tối thiểu (đ)">
                                <InputNumber
                                    min={0}
                                    style={{ width: '100%' }}
                                    placeholder="VD: 100000"
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="maxUsage" label="Số lần sử dụng tối đa">
                                <InputNumber
                                    min={1}
                                    style={{ width: '100%' }}
                                    placeholder="VD: 100"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="isActive" valuePropName="checked">
                        <Switch /> Kích hoạt ngay
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {editingPromotion ? 'Cập nhật' : 'Tạo mới'}
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

export default PromotionManagement;
