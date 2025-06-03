import React, { useState, useEffect } from 'react';
import {
    Card,
    DatePicker,
    Row,
    Col,
    Statistic,
    Table,
    Typography,
    Spin,
    Empty,
    Space,
    Tag,
    Divider,
    Tabs,
    Select,
    Button,
    Modal,
    message,
    Popconfirm,
    Alert,
    Tooltip
} from 'antd';
import {
    BarChartOutlined,
    DollarOutlined,
    CoffeeOutlined,
    ShoppingCartOutlined,
    CalendarOutlined,
    TrophyOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    UndoOutlined,
    FileTextOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import { getSalesForDate, cancelInvoice, getInvoices } from '../firebase/DrinkManagementService';
import { getRevenueStatsByPeriod } from '../firebase/revenue_service';
import { updateProcessedIngredientInventory } from '../firebase/ingredient_service';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const SalesStatistics = () => {
    const [invoices, setInvoices] = useState([]);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [loading, setLoading] = useState(false);
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    // States cho Revenue Statistics
    const [revenueData, setRevenueData] = useState([]);
    const [revenueTotal, setRevenueTotal] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [filterType, setFilterType] = useState('month');
    const [selectedYear, setSelectedYear] = useState(dayjs().year());
    const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);
    const [activeTab, setActiveTab] = useState('invoices');

    useEffect(() => {
        if (activeTab === 'invoices') {
            fetchInvoices();
        } else {
            fetchRevenueData();
        }
    }, [selectedDate, activeTab, filterType, selectedYear, selectedMonth]);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const dateString = selectedDate.format('YYYY-MM-DD');
            const invoicesData = await getInvoices();

            const filteredInvoices = invoicesData.filter(invoice => {
                let invoiceDate;
                if (invoice.timestamp && invoice.timestamp.seconds) {
                    invoiceDate = new Date(invoice.timestamp.seconds * 1000);
                } else if (invoice.timestamp instanceof Date) {
                    invoiceDate = invoice.timestamp;
                } else {
                    invoiceDate = new Date(invoice.timestamp);
                }

                const formattedDate = dayjs(invoiceDate).format('YYYY-MM-DD');
                return formattedDate === dateString;
            }).sort((a, b) => {
                const dateA = a.timestamp.seconds ? new Date(a.timestamp.seconds * 1000) : new Date(a.timestamp);
                const dateB = b.timestamp.seconds ? new Date(b.timestamp.seconds * 1000) : new Date(b.timestamp);
                return dateB - dateA;
            });

            setInvoices(filteredInvoices);
        } catch (error) {
            message.error('Lỗi khi tải dữ liệu hóa đơn');
        } finally {
            setLoading(false);
        }
    };

    const fetchRevenueData = async () => {
        setLoading(true);
        try {
            const month = filterType === 'month' ? selectedMonth : null;
            const result = await getRevenueStatsByPeriod(selectedYear, month);
            setRevenueData(result.data);
            setRevenueTotal(result.totalRevenue);
            setTotalOrders(result.totalOrders);
        } catch (error) {
            message.error('Lỗi khi lấy dữ liệu doanh thu');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelInvoice = async (invoice) => {
        try {
            setLoading(true);

            for (const item of invoice.items) {
                const requiredAmount = item.quantity;
                await updateProcessedIngredientInventory(item.drinkId, -requiredAmount);
            }

            await cancelInvoice(invoice.id, {
                cancelledAt: new Date(),
                cancelReason: 'Thanh toán nhầm',
                originalAmount: invoice.totalAmount,
                status: 'cancelled'
            });

            message.success(`Đã hủy hóa đơn ${invoice.invoiceNumber} thành công!`);
            setCancelModalVisible(false);
            fetchInvoices();
        } catch (error) {
            message.error('Có lỗi xảy ra khi hủy hóa đơn!');
        } finally {
            setLoading(false);
        }
    };

    const openCancelModal = (invoice) => {
        setSelectedInvoice(invoice);
        setCancelModalVisible(true);
    };

    // Function mở modal chi tiết hóa đơn - ĐÃ SỬA
    const openDetailModal = (invoice) => {
        console.log('Chi tiết hóa đơn:', invoice); // Debug log
        setSelectedInvoice(invoice);
        setDetailModalVisible(true);
    };

    const invoiceColumns = [
        {
            title: 'Số HĐ',
            dataIndex: 'invoiceNumber',
            key: 'invoiceNumber',
            render: (text, record) => (
                <Space direction="vertical" size="small">
                    <Text strong style={{ color: '#1890ff' }}>{text}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {(() => {
                            let date;
                            if (record.timestamp && record.timestamp.seconds) {
                                date = new Date(record.timestamp.seconds * 1000);
                            } else {
                                date = new Date(record.timestamp);
                            }
                            return dayjs(date).format('HH:mm:ss');
                        })()}
                    </Text>
                </Space>
            ),
            width: 120
        },
        {
            title: 'Thời gian',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (timestamp) => {
                let date;
                if (timestamp && timestamp.seconds) {
                    date = new Date(timestamp.seconds * 1000);
                } else {
                    date = new Date(timestamp);
                }

                return (
                    <Space direction="vertical" size="small">
                        <Text>{dayjs(date).format('DD/MM/YYYY')}</Text>
                        <Text type="secondary">{dayjs(date).format('HH:mm')}</Text>
                    </Space>
                );
            },
            width: 120
        },
        {
            title: 'Món đã order',
            dataIndex: 'items',
            key: 'items',
            render: (items) => (
                <div style={{ maxWidth: 250 }}>
                    {Array.isArray(items) && items.length > 0 ? (
                        items.map((item, index) => (
                            <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
                                {item.drinkName} ({item.size}): {item.quantity}x
                            </Tag>
                        ))
                    ) : (
                        <Text type="secondary">Không có dữ liệu</Text>
                    )}
                </div>
            ),
            width: 280
        },
        {
            title: 'Số lượng',
            dataIndex: 'totalQuantity',
            key: 'totalQuantity',
            render: (quantity) => (
                <Tag color="green">{quantity || 0} món</Tag>
            ),
            width: 100
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (amount) => (
                <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                    {(amount || 0).toLocaleString()}đ
                </Text>
            ),
            width: 120
        },
        {
            title: 'Thanh toán',
            key: 'payment',
            render: (_, record) => (
                <Space direction="vertical" size="small">
                    <Tag color="blue">{record.paymentMethod || 'N/A'}</Tag>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {record.qrCodeUsed || 'N/A'}
                    </Text>
                </Space>
            ),
            width: 120
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const statusConfig = {
                    completed: { color: 'green', text: 'Hoàn thành' },
                    cancelled: { color: 'red', text: 'Đã hủy' },
                    pending: { color: 'orange', text: 'Chờ xử lý' }
                };
                const config = statusConfig[status] || statusConfig.completed;
                return <Tag color={config.color}>{config.text}</Tag>;
            },
            width: 100
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    {record.status !== 'cancelled' && (
                        <Tooltip title="Hủy hóa đơn">
                            <Button
                                type="text"
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={() => openCancelModal(record)}
                            />
                        </Tooltip>
                    )}
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<FileTextOutlined />}
                            onClick={() => openDetailModal(record)} // Sử dụng function riêng
                        />
                    </Tooltip>
                </Space>
            ),
            width: 100,
            fixed: 'right'
        }
    ];

    const revenueColumns = [
        {
            title: filterType === 'month' ? 'Ngày' : 'Tháng',
            dataIndex: 'period',
            key: 'period',
            render: (text) => {
                if (filterType === 'month') {
                    return dayjs(text).format('DD/MM/YYYY');
                } else {
                    return dayjs(text).format('MM/YYYY');
                }
            }
        },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (value) => (
                <Text className="revenue-amount">{value.toLocaleString()}đ</Text>
            ),
            sorter: (a, b) => a.revenue - b.revenue,
        },
        {
            title: 'Số đơn hàng',
            dataIndex: 'orderCount',
            key: 'orderCount',
            sorter: (a, b) => a.orderCount - b.orderCount,
        },
        {
            title: 'Trung bình/đơn',
            key: 'average',
            render: (_, record) => (
                <Text>{Math.round(record.revenue / record.orderCount).toLocaleString()}đ</Text>
            )
        }
    ];

    const todayStats = {
        totalInvoices: invoices.length,
        totalRevenue: invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0),
        totalItems: invoices.reduce((sum, inv) => sum + (inv.totalQuantity || 0), 0),
        cancelledInvoices: invoices.filter(inv => inv.status === 'cancelled').length
    };

    return (
        <div className="drink-management-container">
            <Title level={2} className="page-title">
                <BarChartOutlined /> Thống Kê Bán Hàng & Doanh Thu
            </Title>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className="custom-tabs"
            >
                <TabPane
                    tab={
                        <Space>
                            <FileTextOutlined />
                            Quản lý hóa đơn
                        </Space>
                    }
                    key="invoices"
                >
                    {/* Statistics Cards */}
                    <Row gutter={[24, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} sm={12} md={6}>
                            <Card className="stats-card">
                                <Statistic
                                    title="Tổng hóa đơn"
                                    value={todayStats.totalInvoices}
                                    prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card className="stats-card">
                                <Statistic
                                    title="Doanh thu"
                                    value={todayStats.totalRevenue}
                                    precision={0}
                                    suffix="đ"
                                    prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card className="stats-card">
                                <Statistic
                                    title="Tổng món"
                                    value={todayStats.totalItems}
                                    prefix={<CoffeeOutlined style={{ color: '#faad14' }} />}
                                    valueStyle={{ color: '#faad14' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card className="stats-card">
                                <Statistic
                                    title="Hóa đơn hủy"
                                    value={todayStats.cancelledInvoices}
                                    prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                                    valueStyle={{ color: '#ff4d4f' }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* Date Picker */}
                    <Card className="glass-card" style={{ marginBottom: 24 }}>
                        <Space>
                            <CalendarOutlined />
                            <Text strong>Chọn ngày:</Text>
                            <DatePicker
                                value={selectedDate}
                                onChange={setSelectedDate}
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày"
                            />
                        </Space>
                    </Card>

                    {/* Invoice Table */}
                    <Card className="glass-card">
                        <Table
                            columns={invoiceColumns}
                            dataSource={invoices}
                            rowKey="id"
                            loading={loading}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total) => `Tổng ${total} hóa đơn`
                            }}
                            scroll={{ x: 1200 }}
                            locale={{
                                emptyText: (
                                    <Empty
                                        description="Không có hóa đơn nào trong ngày này"
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                )
                            }}
                        />
                    </Card>
                </TabPane>

                <TabPane
                    tab={
                        <Space>
                            <BarChartOutlined />
                            Thống kê doanh thu
                        </Space>
                    }
                    key="revenue"
                >
                    {/* Revenue Statistics */}
                    <Row gutter={[24, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} sm={12} md={8}>
                            <Card className="stats-card">
                                <Statistic
                                    title="Tổng doanh thu"
                                    value={revenueTotal}
                                    precision={0}
                                    suffix="đ"
                                    prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Card className="stats-card">
                                <Statistic
                                    title="Tổng đơn hàng"
                                    value={totalOrders}
                                    prefix={<ShoppingCartOutlined style={{ color: '#1890ff' }} />}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Card className="stats-card">
                                <Statistic
                                    title="Trung bình/đơn"
                                    value={totalOrders > 0 ? Math.round(revenueTotal / totalOrders) : 0}
                                    precision={0}
                                    suffix="đ"
                                    prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
                                    valueStyle={{ color: '#faad14' }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* Filters */}
                    <Card className="glass-card" style={{ marginBottom: 24 }}>
                        <Row gutter={16}>
                            <Col>
                                <Space>
                                    <Text strong>Loại thống kê:</Text>
                                    <Select value={filterType} onChange={setFilterType} style={{ width: 120 }}>
                                        <Option value="month">Theo tháng</Option>
                                        <Option value="year">Theo năm</Option>
                                    </Select>
                                </Space>
                            </Col>
                            <Col>
                                <Space>
                                    <Text strong>Năm:</Text>
                                    <Select value={selectedYear} onChange={setSelectedYear} style={{ width: 100 }}>
                                        {[2023, 2024, 2025, 2026].map(year => (
                                            <Option key={year} value={year}>{year}</Option>
                                        ))}
                                    </Select>
                                </Space>
                            </Col>
                            {filterType === 'month' && (
                                <Col>
                                    <Space>
                                        <Text strong>Tháng:</Text>
                                        <Select value={selectedMonth} onChange={setSelectedMonth} style={{ width: 100 }}>
                                            {Array.from({length: 12}, (_, i) => (
                                                <Option key={i + 1} value={i + 1}>Tháng {i + 1}</Option>
                                            ))}
                                        </Select>
                                    </Space>
                                </Col>
                            )}
                        </Row>
                    </Card>

                    {/* Revenue Table */}
                    <Card className="glass-card">
                        <Table
                            columns={revenueColumns}
                            dataSource={revenueData}
                            rowKey="period"
                            loading={loading}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true
                            }}
                            locale={{
                                emptyText: (
                                    <Empty
                                        description="Không có dữ liệu doanh thu"
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                )
                            }}
                        />
                    </Card>
                </TabPane>
            </Tabs>

            {/* Modal chi tiết hóa đơn - ĐÃ SỬA */}
            <Modal
                title={
                    <Space>
                        <FileTextOutlined />
                        Chi tiết hóa đơn {selectedInvoice?.invoiceNumber}
                    </Space>
                }
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={700}
            >
                {selectedInvoice && (
                    <div>
                        {/* Thông tin hóa đơn */}
                        <Card style={{ marginBottom: 16 }}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Text strong>Số hóa đơn:</Text> {selectedInvoice.invoiceNumber}
                                </Col>
                                <Col span={12}>
                                    <Text strong>Thời gian:</Text> {(() => {
                                    let date;
                                    if (selectedInvoice.timestamp && selectedInvoice.timestamp.seconds) {
                                        date = new Date(selectedInvoice.timestamp.seconds * 1000);
                                    } else {
                                        date = new Date(selectedInvoice.timestamp);
                                    }
                                    return dayjs(date).format('DD/MM/YYYY HH:mm:ss');
                                })()}
                                </Col>
                                <Col span={12}>
                                    <Text strong>Phương thức thanh toán:</Text> {selectedInvoice.paymentMethod || 'N/A'}
                                </Col>
                                <Col span={12}>
                                    <Text strong>QR Code:</Text> {selectedInvoice.qrCodeUsed || 'N/A'}
                                </Col>
                                <Col span={12}>
                                    <Text strong>Trạng thái:</Text>
                                    <Tag color={selectedInvoice.status === 'completed' ? 'green' : 'red'} style={{ marginLeft: 8 }}>
                                        {selectedInvoice.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                                    </Tag>
                                </Col>
                                <Col span={12}>
                                    <Text strong>Tổng số món:</Text> {selectedInvoice.totalQuantity || 0}
                                </Col>
                            </Row>
                        </Card>

                        <Divider />

                        {/* Chi tiết món */}
                        <Title level={4}>Chi tiết món đã order:</Title>
                        {Array.isArray(selectedInvoice.items) && selectedInvoice.items.length > 0 ? (
                            <Table
                                dataSource={selectedInvoice.items}
                                pagination={false}
                                size="small"
                                columns={[
                                    {
                                        title: 'Tên món',
                                        dataIndex: 'drinkName',
                                        key: 'drinkName'
                                    },
                                    {
                                        title: 'Size',
                                        dataIndex: 'size',
                                        key: 'size',
                                        render: (size) => <Tag color="blue">{size}</Tag>
                                    },
                                    {
                                        title: 'Số lượng',
                                        dataIndex: 'quantity',
                                        key: 'quantity',
                                        render: (quantity) => <Text strong>{quantity}</Text>
                                    },
                                    {
                                        title: 'Đơn giá',
                                        dataIndex: 'price',
                                        key: 'price',
                                        render: (price) => <Text>{(price || 0).toLocaleString()}đ</Text>
                                    },
                                    {
                                        title: 'Thành tiền',
                                        dataIndex: 'total',
                                        key: 'total',
                                        render: (total) => <Text strong style={{ color: '#52c41a' }}>{(total || 0).toLocaleString()}đ</Text>
                                    }
                                ]}
                            />
                        ) : (
                            <Empty description="Không có dữ liệu món" />
                        )}

                        <Divider />

                        {/* Tổng cộng */}
                        <div style={{ textAlign: 'right' }}>
                            <Title level={3} style={{ color: '#52c41a', margin: 0 }}>
                                Tổng cộng: {(selectedInvoice.totalAmount || 0).toLocaleString()}đ
                            </Title>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Cancel Invoice Modal */}
            <Modal
                title={
                    <Space>
                        <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                        Xác nhận hủy hóa đơn
                    </Space>
                }
                open={cancelModalVisible}
                onCancel={() => setCancelModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setCancelModalVisible(false)}>
                        Hủy bỏ
                    </Button>,
                    <Button
                        key="confirm"
                        type="primary"
                        danger
                        loading={loading}
                        onClick={() => handleCancelInvoice(selectedInvoice)}
                        icon={<CloseCircleOutlined />}
                    >
                        Xác nhận hủy hóa đơn
                    </Button>
                ]}
                width={600}
            >
                {selectedInvoice && (
                    <div>
                        <Alert
                            message="Cảnh báo"
                            description="Việc hủy hóa đơn sẽ hoàn trả nguyên liệu về kho và không thể hoàn tác!"
                            type="warning"
                            style={{ marginBottom: 16 }}
                        />

                        <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Text strong>Số hóa đơn:</Text> {selectedInvoice.invoiceNumber}
                                </Col>
                                <Col span={12}>
                                    <Text strong>Thời gian:</Text> {(() => {
                                    let date;
                                    if (selectedInvoice.timestamp && selectedInvoice.timestamp.seconds) {
                                        date = new Date(selectedInvoice.timestamp.seconds * 1000);
                                    } else {
                                        date = new Date(selectedInvoice.timestamp);
                                    }
                                    return dayjs(date).format('DD/MM/YYYY HH:mm');
                                })()}
                                </Col>
                                <Col span={12}>
                                    <Text strong>Tổng tiền:</Text>
                                    <Text style={{ color: '#f5222d', fontWeight: 'bold' }}>
                                        {(selectedInvoice.totalAmount || 0).toLocaleString()}đ
                                    </Text>
                                </Col>
                                <Col span={12}>
                                    <Text strong>Số món:</Text> {selectedInvoice.totalQuantity || 0}
                                </Col>
                            </Row>

                            <Divider />

                            <Text strong>Chi tiết món:</Text>
                            <div style={{ marginTop: 8 }}>
                                {Array.isArray(selectedInvoice.items) && selectedInvoice.items.map((item, index) => (
                                    <div key={index} style={{ marginBottom: 4 }}>
                                        <Text>{item.drinkName} ({item.size}): {item.quantity}x - {(item.total || 0).toLocaleString()}đ</Text>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SalesStatistics;
